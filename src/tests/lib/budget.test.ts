import { describe, it, expect, beforeEach } from "vitest";
import { Budget, MemoryStore } from "@/lib/budget";

describe("Budget", () => {
  let store: MemoryStore;
  let budget: Budget;

  beforeEach(() => {
    store = new MemoryStore();
    budget = new Budget(store, { monthlyCny: 10 });
  });

  it("starts with full remaining", async () => {
    const state = await budget.read();
    expect(state.remainingCny).toBe(10);
    expect(state.percentUsed).toBe(0);
  });

  it("adds usage and reports decreased remaining", async () => {
    await budget.add(3);
    const state = await budget.read();
    expect(state.remainingCny).toBe(7);
    expect(state.percentUsed).toBeCloseTo(0.3, 5);
  });

  it("can check if a projected cost is affordable", async () => {
    await budget.add(8);
    expect(await budget.canAfford(1)).toBe(true);
    expect(await budget.canAfford(3)).toBe(false);
  });

  it("isolates by month key", async () => {
    await budget.add(5);
    const stateA = await budget.read();
    expect(stateA.remainingCny).toBe(5);
    const next = new Budget(store, { monthlyCny: 10, monthKey: "2099-01" });
    const stateB = await next.read();
    expect(stateB.remainingCny).toBe(10);
  });
});
