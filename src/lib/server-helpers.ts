import { Budget, MemoryStore, createKvStore, type KVLike } from "./budget";
import { RateLimiter, MemoryWindowStore, createKvWindowStore, type WindowStore } from "./ratelimit";

let cachedKvStore: KVLike | null = null;
let cachedKvWindow: WindowStore | null = null;

export async function getBudget(monthlyCny: number): Promise<Budget> {
  if (process.env.KV_REST_API_URL) {
    cachedKvStore ??= await createKvStore();
    return new Budget(cachedKvStore, { monthlyCny });
  }
  return new Budget(new MemoryStore(), { monthlyCny });
}

export async function getRateLimiter(perMin: number) {
  if (process.env.KV_REST_API_URL) {
    cachedKvWindow ??= await createKvWindowStore();
    return new RateLimiter(cachedKvWindow, { windowMs: 60_000, max: perMin });
  }
  return new RateLimiter(new MemoryWindowStore(), { windowMs: 60_000, max: perMin });
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
