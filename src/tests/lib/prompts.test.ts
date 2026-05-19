import { describe, it, expect } from "vitest";
import { buildSelectMessages, parseSelectionResponse } from "@/lib/prompts/select";
import { buildDebateMessages } from "@/lib/prompts/debate";
import type { AdvisorSummary, Profile, AdvisorFull } from "@/lib/types";

const SAMPLE_ADVISORS: AdvisorSummary[] = [
  { id: "munger", nameZh: "芒格", tagline: "x", mentalModels: ["逆向"], heuristics: ["三筐"] },
  { id: "naval",  nameZh: "Naval", tagline: "y", mentalModels: ["杠杆"], heuristics: ["日历"] },
];
const SAMPLE_PROFILE: Profile = {
  lifeStage: "30岁",
  topThreeValues: "自由",
  biggestFear: "平庸",
  riskAppetite: "balanced",
  importantPeople: "父母",
  recentImpact: "x",
  decisionStyle: "理性",
};

const SAMPLE_FULLS: AdvisorFull[] = [
  { id: "munger", nameZh: "芒格", tagline: "x", fullText: "芒格的人格全文..." },
  { id: "naval",  nameZh: "Naval", tagline: "y", fullText: "Naval的人格全文..." },
  { id: "lidan",  nameZh: "李诞", tagline: "z", fullText: "李诞的人格全文..." },
];

describe("buildSelectMessages", () => {
  it("includes all advisor summaries in system prompt", () => {
    const msgs = buildSelectMessages({ advisors: SAMPLE_ADVISORS, profile: SAMPLE_PROFILE, question: "我该跳槽吗？", language: "zh" });
    const sys = msgs[0].content as string;
    expect(sys).toContain("munger");
    expect(sys).toContain("naval");
    expect(sys).toContain("逆向");
  });

  it("includes question and profile in user message", () => {
    const msgs = buildSelectMessages({ advisors: SAMPLE_ADVISORS, profile: SAMPLE_PROFILE, question: "我该跳槽吗？", language: "zh" });
    const user = msgs[1].content as string;
    expect(user).toContain("我该跳槽吗？");
    expect(user).toContain("30岁");
  });
});

describe("parseSelectionResponse", () => {
  it("parses well-formed JSON", () => {
    const r = parseSelectionResponse('{"selected":["munger","naval"],"reasons":{"munger":"a","naval":"b"}}');
    expect(r.selected).toEqual(["munger", "naval"]);
    expect(r.reasons.munger).toBe("a");
  });

  it("strips ```json fences", () => {
    const r = parseSelectionResponse('```json\n{"selected":["munger"],"reasons":{"munger":"x"}}\n```');
    expect(r.selected).toEqual(["munger"]);
  });

  it("returns fallback on garbage", () => {
    const r = parseSelectionResponse("not json at all");
    expect(r.selected.length).toBeGreaterThanOrEqual(3);
    expect(r.selected.length).toBeLessThanOrEqual(5);
  });

  it("clamps over-large selection to 5", () => {
    const r = parseSelectionResponse('{"selected":["a","b","c","d","e","f","g"],"reasons":{}}');
    expect(r.selected).toHaveLength(5);
  });
});

describe("buildDebateMessages", () => {
  it("includes all selected advisor full texts", () => {
    const msgs = buildDebateMessages({
      advisors: SAMPLE_FULLS,
      profile: SAMPLE_PROFILE,
      question: "我该跳槽吗？",
      round: 1,
      language: "zh",
    });
    const sys = msgs[0].content as string;
    expect(sys).toContain("芒格的人格全文");
    expect(sys).toContain("Naval的人格全文");
    expect(sys).toContain("李诞的人格全文");
  });

  it("specifies SPEAKER protocol", () => {
    const msgs = buildDebateMessages({
      advisors: SAMPLE_FULLS,
      profile: SAMPLE_PROFILE,
      question: "x",
      round: 1,
      language: "zh",
    });
    expect(msgs[0].content).toContain("[SPEAKER:");
  });

  it("includes few-shot example with SPEAKER tags", () => {
    const msgs = buildDebateMessages({
      advisors: SAMPLE_FULLS,
      profile: SAMPLE_PROFILE,
      question: "x",
      round: 1,
      language: "zh",
    });
    const sys = msgs[0].content as string;
    expect(sys.match(/\[SPEAKER:\w+\]/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
