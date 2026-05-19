import type { AdvisorSummary, AppLanguage, Profile, SelectionResult } from "../types";

const FALLBACK_SELECTION_ZH: SelectionResult = {
  selected: ["munger", "naval", "lidan"],
  reasons: {
    munger: "经典多元思维框架，应对大多数决策",
    naval: "长期主义视角，平衡短期焦虑",
    lidan: "钝感降噪，避免过度严肃",
  },
};

const FALLBACK_SELECTION_EN: SelectionResult = {
  selected: ["munger", "naval", "taleb"],
  reasons: {
    munger: "A rigorous multidisciplinary lens for practical judgment.",
    naval: "A long-term lens on leverage, independence, and compounding.",
    taleb: "A contrarian risk lens focused on fragility and hidden downside.",
  },
};

export function buildSelectMessages(args: {
  advisors: AdvisorSummary[];
  profile: Profile;
  question: string;
  language: AppLanguage;
}) {
  const advisorCards = args.advisors
    .map(
      (a) =>
        `- ${a.id} (${a.nameZh}): ${a.tagline}\n  心智模型: ${a.mentalModels.join("、")}\n  决策启发式: ${a.heuristics.join("、")}`
    )
    .join("\n");

  const system = args.language === "en"
    ? `You are the curator of a "Private Board." Given the user's profile and question, select the thinkers who can provide the most useful and complementary perspectives. The user may later adjust your lineup.

Requirements:
1. Perspectives must be complementary.
2. Include at least one contrarian voice when useful.
3. Match the user's cultural context and language.
4. Output strict JSON: {"selected": ["id1","id2",...], "reasons": {"id1": "why this person was selected", ...}}
5. Reasons must be in English.
6. Output JSON only. No explanations, no markdown fences.

[${args.advisors.length} board member cards]
${advisorCards}`
    : `你是「私人董事会」的总管家。给定用户画像和问题，从下面 ${args.advisors.length} 位思想家中选出最适合给该问题提供视角的人，用户后续可以自行调整阵容。

要求：
1. 视角必须互补（不要全选投资类）
2. 至少 1 位会与大多数人意见相反
3. 中文用户优先匹配文化语境
4. 输出严格 JSON：{"selected": ["id1","id2",...], "reasons": {"id1": "选 ta 的原因", ...}}
5. reasons 必须使用中文
6. 只输出 JSON，不要任何解释、不要 markdown 围栏

[${args.advisors.length} 位董事名片]
${advisorCards}`;

  const user = args.language === "en"
    ? `Decision context:
- Background: ${args.profile.lifeStage}
- Options: ${args.profile.topThreeValues}
- Non-negotiables: ${args.profile.biggestFear}
- Risk capacity: ${args.profile.riskAppetite}
- Stakeholders: ${args.profile.importantPeople}
- Recent facts: ${args.profile.recentImpact}
- Where to challenge the user: ${args.profile.decisionStyle}

Question: ${args.question}`
    : `决策上下文:
- 背景处境: ${args.profile.lifeStage}
- 正在比较的选项: ${args.profile.topThreeValues}
- 不可牺牲项: ${args.profile.biggestFear}
- 风险承受度: ${args.profile.riskAppetite}
- 利益相关者: ${args.profile.importantPeople}
- 最近改变判断的事实: ${args.profile.recentImpact}
- 希望董事会重点挑战的地方: ${args.profile.decisionStyle}

问题: ${args.question}`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

export function parseSelectionResponse(raw: string, language: AppLanguage = "zh"): SelectionResult {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.selected)) throw new Error("no selected array");
    const selected = parsed.selected.slice(0, 5).filter((s: unknown) => typeof s === "string");
    if (selected.length < 1) throw new Error("empty");
    const reasons = (typeof parsed.reasons === "object" && parsed.reasons) ? parsed.reasons : {};
    return { selected, reasons };
  } catch {
    return language === "en" ? FALLBACK_SELECTION_EN : FALLBACK_SELECTION_ZH;
  }
}

export const FALLBACK_SELECTION = FALLBACK_SELECTION_ZH;
