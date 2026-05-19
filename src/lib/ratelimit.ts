export interface WindowStore {
  push(key: string, ts: number): Promise<void>;
  trimAndCount(key: string, beforeTs: number): Promise<number>;
}

export class MemoryWindowStore implements WindowStore {
  private hits = new Map<string, number[]>();
  async push(key: string, ts: number) {
    const arr = this.hits.get(key) ?? [];
    arr.push(ts);
    this.hits.set(key, arr);
  }
  async trimAndCount(key: string, beforeTs: number) {
    const arr = (this.hits.get(key) ?? []).filter((t) => t >= beforeTs);
    this.hits.set(key, arr);
    return arr.length;
  }
}

export class RateLimiter {
  constructor(
    private store: WindowStore,
    private opts: { windowMs: number; max: number }
  ) {}

  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const cutoff = now - this.opts.windowMs;
    const count = await this.store.trimAndCount(key, cutoff);
    if (count >= this.opts.max) return false;
    await this.store.push(key, now);
    return true;
  }
}

export async function createKvWindowStore(): Promise<WindowStore> {
  const { kv } = await import("@vercel/kv");
  return {
    async push(key, ts) {
      await kv.zadd(key, { score: ts, member: `${ts}:${Math.random()}` });
      await kv.expire(key, 120);
    },
    async trimAndCount(key, beforeTs) {
      await kv.zremrangebyscore(key, 0, beforeTs - 1);
      return await kv.zcard(key);
    },
  };
}
