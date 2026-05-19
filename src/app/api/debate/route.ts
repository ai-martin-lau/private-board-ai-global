import { getVisibleFulls } from "@/lib/advisors";
import { buildDebateMessages } from "@/lib/prompts/debate";
import { createDeepseek, DEBATE_MODEL, estimateCostCny } from "@/lib/deepseek";
import { encodeSseEvent, parseSpeakerStream } from "@/lib/sse";
import { getBudget, getRateLimiter, getClientIp } from "@/lib/server-helpers";

export const runtime = "edge";

const BUDGET_CNY = Number(process.env.BUDGET_CNY_PER_MONTH ?? 200);
const RATE_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 5);

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const rl = await getRateLimiter(RATE_PER_MIN);
  if (!(await rl.check(`debate:${ip}`))) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => null);
  if (!body?.question || !body?.profile || !Array.isArray(body?.selected)) {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userKey: string | undefined = typeof body.userKey === "string" ? body.userKey : undefined;
  const round = Number.isInteger(body.round) && body.round > 0 ? body.round : 1;
  const transcript = typeof body.transcript === "string" ? body.transcript : undefined;
  const userFeedback = typeof body.userFeedback === "string" ? body.userFeedback : undefined;
  const language = body.language === "en" ? "en" : "zh";

  if (!userKey) {
    const budget = await getBudget(BUDGET_CNY);
    if (!(await budget.canAfford(0.5))) {
      return new Response(JSON.stringify({ error: "budget_exhausted" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const advisors = getVisibleFulls(body.selected, language);
  if (advisors.length === 0) {
    return new Response(JSON.stringify({ error: "no_advisors_resolved" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = buildDebateMessages({
    advisors,
    profile: body.profile,
    question: body.question,
    round,
    transcript,
    userFeedback,
    language,
  });

  let client;
  try {
    client = createDeepseek({ apiKey: userKey });
  } catch {
    return new Response(JSON.stringify({ error: "no_key" }), { status: 500 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: DEBATE_MODEL,
          messages,
          stream: true,
          stream_options: { include_usage: true },
          temperature: 0.85,
          max_tokens: 2500,
          ...({ thinking: { type: "disabled" } } as Record<string, unknown>),
        });

        const consumer = parseSpeakerStream((evt) => {
          controller.enqueue(encoder.encode(encodeSseEvent(evt)));
        });

        let promptTokens = 0, completionTokens = 0;
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) consumer(delta);
          if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens ?? promptTokens;
            completionTokens = chunk.usage.completion_tokens ?? completionTokens;
          }
        }

        // Flush trailing buffer
        consumer("");

        if (!userKey && promptTokens > 0) {
          const cost = estimateCostCny(DEBATE_MODEL, promptTokens, completionTokens);
          const budget = await getBudget(BUDGET_CNY);
          await budget.add(cost);
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = JSON.stringify({ error: "upstream", detail: String(err) });
        controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
