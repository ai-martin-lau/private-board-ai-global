import type { AdvisorFull, AppLanguage, Profile } from "../types";

export function buildDebateMessages(args: {
  advisors: AdvisorFull[];
  profile: Profile;
  question: string;
  round: number;
  transcript?: string;
  userFeedback?: string;
  language: AppLanguage;
}) {
  const cards = args.advisors
    .map((a) => `=== ${a.id} (${a.nameZh}) ===\n${a.fullText}`)
    .join("\n\n");

  const ids = args.advisors.map((a) => a.id);
  const speakerIds = ids.join(" / ");
  const n = ids.length;

  // Explicit ID → Chinese name mapping table — model uses this when @-mentioning peers
  const idToName = args.advisors
    .map((a) => `[SPEAKER:${a.id}] = ${a.nameZh}`)
    .join("，");

  const roundOrder = ids.map((id) => `[SPEAKER:${id}]`).join(" → ");

  // Few-shot uses Chinese names for cross-references (the very thing we want to enforce)
  const exA = ids[0] ?? "x";
  const exB = ids[1] ?? "y";
  const exNameA = args.advisors[0]?.nameZh ?? "甲";
  const exNameB = args.advisors[1]?.nameZh ?? "乙";

  const roundInstructionZh = args.round === 1
    ? "这是第一轮。每位董事只提出自己的核心立场和判断依据，不要回应其他董事。"
    : args.round === 2
      ? "这是第二轮。每位董事必须明确回应、反驳或补充第一轮中至少一位其他董事的观点。"
      : "这是续辩轮。每位董事必须同时回应前面辩论中的关键分歧，并认真吸收用户刚刚给出的观点；可以修正自己立场，也可以指出用户观点里的盲点。";
  const roundInstructionEn = args.round === 1
    ? "This is round 1. Each board member should state their core position and reasoning. Do not respond to other board members yet."
    : args.round === 2
      ? "This is round 2. Each board member must explicitly respond to, challenge, or build on at least one claim from round 1."
      : "This is a continuation round. Each board member must address the key disagreements from the prior transcript and seriously incorporate the user's latest view. They may revise their position or point out blind spots in the user's view.";

  const englishSystem = `You are hosting a "Private Board" debate. Below are the full persona files for ${n} board members. Each member must speak according to their own mental models, decision heuristics, and voice.

# Output protocol

Output exactly ${n} speaking turns. Every turn must start with \`[SPEAKER:xxx]\`, where xxx must be one of: ${speakerIds}.

Fixed order: ${roundOrder}

${roundInstructionEn}

When referring to another board member, use their readable name, not the speaker id. Name map: ${idToName}.

# Do not output

- Section headings or round labels
- Numbered lists
- Markdown formatting
- Meta-commentary about the speaking rules
- Polite filler or final summary

Write in natural English. Keep each turn concise and debate-like. Make disagreement concrete by referencing specific prior claims when transcript exists.

[Board member persona files]
${cards}`;

  const chineseSystem = `你将主持一场「私人董事会」辞论。下面是 ${n} 位董事的完整人格档案。每位董事必须严格按其档案中的心智模型、决策启发式、表达 DNA 发言。

# 输出协议

你只能输出 ${n} 段发言，**每段且仅每段**以 \`[SPEAKER:xxx]\` 开头（xxx 必须是: ${speakerIds}）。

发言顺序固定：${roundOrder}

${roundInstructionZh}

回应或提到别人时只能用中文译名，绝不允许用英文 ID。译名映射：${idToName}。例如要回应 ${exA}，写"${exNameA}说得对，但..."而不是"${exA} 说..."。

# 严禁输出的内容

- 任何标题文字（如「第一轮」「立场陈述」「Round 1」「---」「===」等）—— 直接说话，不要分章
- 任何编号（如 \`1.\` \`2.\` \`(1)\` \`一、\`）
- 任何 markdown 符号（\`**\` \`*\` \`__\` \`#\` \`-\` 列表、\`>\` 引用、反引号）
- 任何对说话规则的元评论（如「我先说立场」「下面我回应」）
- 任何总结陈词、客套话、互称"老师"
- **任何英文字符**（包括下文译表里的招牌短语、SPEAKER ID、人名）

# 中文锁

**任何一个英文单词都视为违规**。以下招牌短语在董事档案里频繁出现，输出时必须无条件替换，**绝不允许保留英文原文**：

| 原英文 | 必须替换为 |
|---|---|
| F-you money / FU money / fuck you money | 自由储备金 / 滚蛋金 |
| insanely great | 极致动人 / 好得不像话 |
| Stay Hungry, Stay Foolish | 求知若饥，虚心若愚 |
| Think Different | 不同凡想 |
| Toughen up, bucko / Toughen up | 硬气点 / 别怂 |
| skin in the game | 切身利害 / 真金白银押注 |
| stop doing list | 不做清单 |
| first principles | 第一性原理 |
| leverage | 杠杆 |
| specific knowledge | 特定知识 |
| antifragile | 反脆弱 |
| black swan | 黑天鹅 |
| PMF / product-market fit | 产品市场契合 |
| MVP | 最小可行产品 |
| 10x | 十倍 |
| OKR / KPI | 目标 / 指标 |
| VTSAX / S&P 500 | 美股大盘指数基金 |
| K-12 | 中小学 |

**通用兜底规则**：如果遇到译表里没有的英文短语（包括某董事的招牌口头禅），**直接用中文意译，绝对不准保留英文原文**。宁可意译略损 flavor，也不要英文残留。

**唯一可保留的英文**（已被中文世界通用为日常词汇）：AI、GPT、ChatGPT、OpenAI、API、URL、CEO、CTO、PhD、MBA。除此以外的英文一律违规。

引用人物用中文译名（已在上面 ID→译名表给出）。引号用 \`「」\` 或 \`""\`。

**写完一段后自检：这段话里有没有任何拉丁字母？有就重写。**

# 正确格式示例（只看格式不要抄内容，单段 ≤ 150 字）

[SPEAKER:${exA}]我看法是这样：...（一段简短观点，语气符合该董事档案）
[SPEAKER:${exB}]从另一个角度看：...
（...其余董事第一轮发言...）
[SPEAKER:${exA}]${exNameB}说的我不同意，理由是...（用中文名回应，禁止用英文 ID）
[SPEAKER:${exB}]${exNameA}你忽略了一点...
（...其余董事第二轮回应...）

[董事人格档案]
${cards}`;

  const transcriptBlock = args.transcript?.trim()
    ? `\n\n${args.language === "en" ? "Existing debate transcript" : "已有辩论记录"}:\n${args.transcript.trim()}`
    : "";
  const feedbackBlock = args.userFeedback?.trim()
    ? `\n\n${args.language === "en" ? "User's latest view" : "用户刚刚补充的观点"}:\n${args.userFeedback.trim()}`
    : "";

  const user = args.language === "en"
    ? `Decision context:
- Background: ${args.profile.lifeStage}
- Options: ${args.profile.topThreeValues}
- Non-negotiables: ${args.profile.biggestFear}
- Risk capacity: ${args.profile.riskAppetite}
- Stakeholders: ${args.profile.importantPeople}
- Recent facts: ${args.profile.recentImpact}
- Where to challenge the user: ${args.profile.decisionStyle}

Question: ${args.question}
${transcriptBlock}${feedbackBlock}

Now output round ${args.round}, exactly ${n} speaking turns. The first turn must start with \`[SPEAKER:${ids[0]}]\`.`
    : `决策上下文:
- 背景处境: ${args.profile.lifeStage}
- 正在比较的选项: ${args.profile.topThreeValues}
- 不可牺牲项: ${args.profile.biggestFear}
- 风险承受度: ${args.profile.riskAppetite}
- 利益相关者: ${args.profile.importantPeople}
- 最近改变判断的事实: ${args.profile.recentImpact}
- 希望董事会重点挑战的地方: ${args.profile.decisionStyle}

问题: ${args.question}
${transcriptBlock}${feedbackBlock}

现在直接输出第 ${args.round} 轮的 ${n} 段发言，第一段以 \`[SPEAKER:${ids[0]}]\` 开头。**严禁任何编号、章节标题、英文单词，@别人时用中文名。**`;

  return [
    { role: "system" as const, content: args.language === "en" ? englishSystem : chineseSystem },
    { role: "user" as const, content: user },
  ];
}
