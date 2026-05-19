import OpenAI from "openai";

export const BASE_URL = "https://api.deepseek.com";
export const SELECT_MODEL = "deepseek-v4-flash";
export const DEBATE_MODEL = "deepseek-v4-flash";

const USD_TO_CNY = 7.25;

const PRICING_USD_PER_1M_TOKENS: Record<string, { input: number; output: number }> = {
  "deepseek-v4-flash": { input: 0.14, output: 0.28 },
  "deepseek-v4-pro": { input: 0.435, output: 0.87 },
};

export function createDeepseek(opts: { apiKey?: string }) {
  const key = opts.apiKey ?? process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("No DeepSeek API key available");

  const client = new OpenAI({ apiKey: key, baseURL: BASE_URL });
  (client as unknown as { apiKey: string }).apiKey = key;
  return client as OpenAI & { apiKey: string };
}

export function estimateCostCny(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const p = PRICING_USD_PER_1M_TOKENS[model];
  if (!p) return 0;
  const usd = (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
  return usd * USD_TO_CNY;
}
