import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter, MemoryWindowStore } from "@/lib/ratelimit";

describe("RateLimiter", () => {
  let store: MemoryWindowStore;
  let now: number;

  beforeEach(() => {
    store = new MemoryWindowStore();
    now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
  });

  it("allows under limit", async () => {
    const rl = new RateLimiter(store, { windowMs: 60_000, max: 3 });
    expect(await rl.check("ip:1.1.1.1")).toBe(true);
    expect(await rl.check("ip:1.1.1.1")).toBe(true);
    expect(await rl.check("ip:1.1.1.1")).toBe(true);
  });

  it("blocks at limit", async () => {
    const rl = new RateLimiter(store, { windowMs: 60_000, max: 3 });
    await rl.check("ip:x"); await rl.check("ip:x"); await rl.check("ip:x");
    expect(await rl.check("ip:x")).toBe(false);
  });

  it("expires old hits outside window", async () => {
    const rl = new RateLimiter(store, { windowMs: 60_000, max: 2 });
    await rl.check("ip:y");
    now += 30_000;
    await rl.check("ip:y");
    expect(await rl.check("ip:y")).toBe(false);
    now += 31_000;
    expect(await rl.check("ip:y")).toBe(true);
  });
});
