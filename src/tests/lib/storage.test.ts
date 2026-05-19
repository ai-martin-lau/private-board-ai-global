/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { loadProfile, saveProfile, clearProfile, loadUserKey, saveUserKey } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when profile not set", () => {
    expect(loadProfile()).toBeNull();
  });

  it("round-trips profile", () => {
    const p = {
      lifeStage: "30岁打工人",
      topThreeValues: "自由、成长、家人",
      biggestFear: "平庸",
      riskAppetite: "balanced" as const,
      importantPeople: "父母 + 老婆",
      recentImpact: "看了一本书",
      decisionStyle: "理性分析",
    };
    saveProfile(p);
    expect(loadProfile()).toEqual(p);
  });

  it("clears profile", () => {
    saveProfile({ lifeStage: "x", topThreeValues: "", biggestFear: "", riskAppetite: "balanced", importantPeople: "", recentImpact: "", decisionStyle: "" });
    clearProfile();
    expect(loadProfile()).toBeNull();
  });

  it("round-trips user API key", () => {
    expect(loadUserKey()).toBeNull();
    saveUserKey("sk-abc");
    expect(loadUserKey()).toBe("sk-abc");
  });
});
