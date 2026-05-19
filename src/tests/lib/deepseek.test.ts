import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BASE_URL,
  DEBATE_MODEL,
  SELECT_MODEL,
  createDeepseek,
  estimateCostCny,
} from "@/lib/deepseek";

describe("createDeepseek", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.DEEPSEEK_API_KEY;
  });

  it("uses provided key over env key", () => {
    process.env.DEEPSEEK_API_KEY = "env-key";
    const client = createDeepseek({ apiKey: "user-key" });
    expect(client.apiKey).toBe("user-key");
  });

  it("falls back to DEEPSEEK_API_KEY env if no key provided", () => {
    process.env.DEEPSEEK_API_KEY = "env-key";
    const client = createDeepseek({});
    expect(client.apiKey).toBe("env-key");
  });

  it("throws if no key available", () => {
    expect(() => createDeepseek({})).toThrow(/no.*key/i);
  });
});

describe("DeepSeek config", () => {
  it("uses the official OpenAI-compatible base URL", () => {
    expect(BASE_URL).toBe("https://api.deepseek.com");
  });

  it("uses deepseek-v4-flash for current testing", () => {
    expect(SELECT_MODEL).toBe("deepseek-v4-flash");
    expect(DEBATE_MODEL).toBe("deepseek-v4-flash");
  });
});

describe("estimateCostCny", () => {
  it("computes deepseek-v4-flash cost", () => {
    const cost = estimateCostCny("deepseek-v4-flash", 1_000_000, 500_000);
    expect(cost).toBeCloseTo((0.14 + 0.14) * 7.25, 4);
  });

  it("returns 0 for unknown models", () => {
    expect(estimateCostCny("unknown", 1000, 1000)).toBe(0);
  });
});
