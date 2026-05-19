import type { BudgetState } from "./types";

export interface KVLike {
  get(key: string): Promise<number | null>;
  set(key: string, value: number): Promise<void>;
  incrbyfloat(key: string, delta: number): Promise<number>;
}

export class MemoryStore implements KVLike {
  private data = new Map<string, number>();
  async get(key: string) { return this.data.get(key) ?? null; }
  async set(key: string, value: number) { this.data.set(key, value); }
  async incrbyfloat(key: string, delta: number) {
    const next = (this.data.get(key) ?? 0) + delta;
    this.data.set(key, next);
    return next;
  }
}

function defaultMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function nextMonthIso(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString();
}

export class Budget {
  private monthKey: string;
  constructor(
    private store: KVLike,
    private opts: { monthlyCny: number; monthKey?: string }
  ) {
    this.monthKey = opts.monthKey ?? defaultMonthKey();
  }

  private get key() {
    return `budget:${this.monthKey}`;
  }

  async read(): Promise<BudgetState> {
    const used = (await this.store.get(this.key)) ?? 0;
    const remaining = Math.max(0, this.opts.monthlyCny - used);
    return {
      remainingCny: remaining,
      percentUsed: used / this.opts.monthlyCny,
      resetAt: nextMonthIso(this.monthKey),
    };
  }

  async add(cny: number): Promise<void> {
    await this.store.incrbyfloat(this.key, cny);
  }

  async canAfford(cny: number): Promise<boolean> {
    const state = await this.read();
    return state.remainingCny >= cny;
  }
}

export async function createKvStore(): Promise<KVLike> {
  const { kv } = await import("@vercel/kv");
  return {
    async get(key) {
      const v = await kv.get<number>(key);
      return typeof v === "number" ? v : null;
    },
    async set(key, value) { await kv.set(key, value); },
    async incrbyfloat(key, delta) {
      return await kv.incrbyfloat(key, delta);
    },
  };
}
