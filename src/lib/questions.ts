import type { AppLanguage, Profile } from "./types";

export interface Question {
  id: keyof Profile;
  prompt: string;
  helper?: string;
  type: "text" | "textarea" | "tags" | "radio";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "lifeStage",
    prompt: "这次决策的背景是什么？",
    helper: "写职业、家庭、财务、地点、身份变化和主要约束。让董事会先理解你的处境。",
    type: "textarea",
    placeholder: "例：32 岁产品经理，已婚无孩，在上海，有 18 个月现金储备，正考虑离职创业 ...",
  },
  {
    id: "topThreeValues",
    prompt: "你到底在什么选项之间选择？",
    helper: "把选项写清楚。如果不止两个，也都列出来。",
    type: "textarea",
    placeholder: "例：继续留在大厂 / 加入朋友的创业公司 / 先休息 3 个月再找方向 ...",
  },
  {
    id: "biggestFear",
    prompt: "哪些东西是这次不能牺牲的？",
    helper: "这是董事会判断边界。可以是钱、健康、关系、声誉、自由、成长速度。",
    type: "textarea",
    placeholder: "例：不能影响家庭现金流；不能长期牺牲健康；不能搬离现在的城市 ...",
  },
  {
    id: "riskAppetite",
    prompt: "在这件事上，你能承受多大风险？",
    type: "radio",
    options: [
      { value: "conservative", label: "保守 — 先守住现金流、关系和下限" },
      { value: "balanced",     label: "平衡 — 愿意试，但要有止损和回撤方案" },
      { value: "aggressive",   label: "激进 — 可以承受明显波动，优先追求上行空间" },
    ],
  },
  {
    id: "importantPeople",
    prompt: "谁会被这个决定影响？",
    helper: "包括利益相关者，以及谁的看法会影响你的执行。",
    type: "text",
    placeholder: "例：伴侣、父母、孩子、合伙人、老板、客户、投资人 ...",
  },
  {
    id: "recentImpact",
    prompt: "最近有什么事实改变了你的判断？",
    helper: "写具体事件、数据、反馈或新信息，不必写感受。",
    type: "textarea",
    placeholder: "例：绩效没有晋升；副业连续 3 个月有收入；伴侣明确反对搬家 ...",
  },
  {
    id: "decisionStyle",
    prompt: "你希望董事会重点挑战你哪里？",
    helper: "告诉董事会你最需要被追问的地方：假设、盲点、情绪、执行难点或外部压力。",
    type: "textarea",
    placeholder: "例：我可能低估了现金流压力；也可能因为父母期待而不敢选自己真正想要的路 ...",
  },
];

export const QUESTIONS_EN: Question[] = [
  {
    id: "lifeStage",
    prompt: "What context should the board know?",
    helper: "Include career, family, finances, location, recent transitions, and hard constraints.",
    type: "textarea",
    placeholder: "Example: 32, product manager in London, married, 18 months of savings, considering leaving to start a company ...",
  },
  {
    id: "topThreeValues",
    prompt: "What options are you choosing between?",
    helper: "Name the concrete alternatives. If there are more than two, list them all.",
    type: "textarea",
    placeholder: "Example: stay at my current job / join a friend's startup / take 3 months off and reassess ...",
  },
  {
    id: "biggestFear",
    prompt: "What must not be sacrificed?",
    helper: "These are the decision boundaries: money, health, relationships, reputation, freedom, growth, or anything else.",
    type: "textarea",
    placeholder: "Example: I cannot put family cash flow at risk; I cannot move cities; I cannot burn out again ...",
  },
  {
    id: "riskAppetite",
    prompt: "How much risk can you take in this decision?",
    type: "radio",
    options: [
      { value: "conservative", label: "Conservative — protect cash flow, relationships, and downside first" },
      { value: "balanced", label: "Balanced — willing to try, but with a stop-loss and fallback plan" },
      { value: "aggressive", label: "Aggressive — I can tolerate volatility and want more upside" },
    ],
  },
  {
    id: "importantPeople",
    prompt: "Who are the stakeholders?",
    helper: "Who will be affected, and whose opinion could shape your execution?",
    type: "text",
    placeholder: "Example: partner, parents, children, cofounder, manager, customers, investors ...",
  },
  {
    id: "recentImpact",
    prompt: "What recent fact changed your view?",
    helper: "Use concrete events, data, feedback, or new information.",
    type: "textarea",
    placeholder: "Example: I missed promotion; my side project earned revenue for 3 months; my partner pushed back on moving ...",
  },
  {
    id: "decisionStyle",
    prompt: "Where should the board challenge you most?",
    helper: "Tell the board what to pressure-test: assumptions, blind spots, emotions, execution risks, or outside pressure.",
    type: "textarea",
    placeholder: "Example: I may be underestimating cash-flow risk; I may also be avoiding the option I actually want because of family expectations ...",
  },
];

export function getQuestions(language: AppLanguage) {
  return language === "en" ? QUESTIONS_EN : QUESTIONS;
}
