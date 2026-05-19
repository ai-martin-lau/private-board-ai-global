import { NextResponse } from "next/server";
import { getVisibleSummaries } from "@/lib/advisors";
import { buildSelectMessages, parseSelectionResponse } from "@/lib/prompts/select";
import { createDeepseek, estimateCostCny, SELECT_MODEL } from "@/lib/deepseek";
import { getBudget, getRateLimiter, getClientIp } from "@/lib/server-helpers";

export const runtime = "edge";

const BUDGET_CNY = Number(process.env.BUDGET_CNY_PER_MONTH ?? 200);
const RATE_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 5);

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const rl = await getRateLimiter(RATE_PER_MIN);
  if (!(await rl.check(`select:${ip}`))) {
    return NextResponse.json(
      { error: "rate_limited", message: "操作太频繁，请稍后再试" },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.question || !body?.profile) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const userKey: string | undefined = typeof body.userKey === "string" ? body.userKey : undefined;
  const language = body.language === "en" ? "en" : "zh";
  const advisors = getVisibleSummaries(language);

  if (!userKey) {
    const budget = await getBudget(BUDGET_CNY);
    if (!(await budget.canAfford(0.01))) {
      return NextResponse.json(
        { error: "budget_exhausted", message: "本月试用额度已用完，请输入你自己的 key 继续" },
        { status: 429 }
      );
    }
  }

  const messages = buildSelectMessages({
    advisors,
    profile: body.profile,
    question: body.question,
    language,
  });

  let client;
  try {
    client = createDeepseek({ apiKey: userKey });
  } catch {
    return NextResponse.json({ error: "no_key" }, { status: 500 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: SELECT_MODEL,
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 1200,
      // DeepSeek thinking mode defaults to enabled; disable it so JSON output stays clean.
      ...({ thinking: { type: "disabled" } } as Record<string, unknown>),
    });

    const usage = completion.usage;
    if (!userKey && usage) {
      const cost = estimateCostCny(SELECT_MODEL, usage.prompt_tokens, usage.completion_tokens);
      const budget = await getBudget(BUDGET_CNY);
      await budget.add(cost);
    }

    const raw = completion.choices[0]?.message?.content ?? "";
    const result = parseSelectionResponse(raw, language);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status ?? 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "invalid_key" }, { status });
    }
    return NextResponse.json({ error: "upstream", detail: String(err) }, { status: 502 });
  }
}
