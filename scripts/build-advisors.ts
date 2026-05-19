import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { glob } from "glob";
import matter from "gray-matter";
import type { AdvisorSummary, AdvisorFull } from "../src/lib/types";

export const KEEP_SECTIONS = [
  "角色扮演规则",
  "身份卡",
  "核心心智模型",
  "决策启发式",
  "表达DNA",
  "表达 DNA",
  "价值观与反模式",
  "示例对话",
  "擅长与局限",
];

export const DROP_SECTIONS = [
  "使用说明",
  "回答工作流",
  "示例：Agentic vs 非Agentic",
];

/**
 * Extract personality-relevant sections from a perspective SKILL.md.
 * Walks H2 headings; for each, decides keep vs drop based on title.
 */
export function extractPersonalitySections(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let keeping = false;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const title = h2Match[1].trim().replace(/[（(].*$/, "").trim();
      const isKeep = KEEP_SECTIONS.some((k) => title.includes(k));
      const isDrop = DROP_SECTIONS.some((d) => title.includes(d));
      keeping = isKeep && !isDrop;
      if (keeping) out.push(line);
      continue;
    }
    if (keeping) out.push(line);
  }

  return out.join("\n").trim();
}

// Map directory id → display names. Hand-curated.
export const NAME_MAP: Record<string, { id: string; nameZh: string; nameEn?: string; tagline: string }> = {
  "munger-perspective":            { id: "munger",       nameZh: "查理·芒格",     nameEn: "Charlie Munger",    tagline: "多元思维模型 · 投资判断 · 反愚蠢" },
  "naval-perspective":             { id: "naval",        nameZh: "纳瓦尔",         nameEn: "Naval Ravikant",    tagline: "杠杆 · 特定知识 · 长期主义" },
  "taleb-perspective":             { id: "taleb",        nameZh: "塔勒布",         nameEn: "Nassim Taleb",      tagline: "反脆弱 · 黑天鹅 · 不对称风险" },
  "feynman-perspective":           { id: "feynman",      nameZh: "费曼",           nameEn: "Richard Feynman",   tagline: "第一性原理 · 学习方法 · 简化复杂" },
  "andrej-karpathy-perspective":   { id: "karpathy",     nameZh: "卡帕西",         nameEn: "Andrej Karpathy",   tagline: "AI 工程实用主义 · 学习方法" },
  "ilya-sutskever-perspective":    { id: "ilya",         nameZh: "伊利亚",         nameEn: "Ilya Sutskever",    tagline: "AI 哲学思辨 · 长程视角" },
  "elon-musk-perspective":         { id: "musk",         nameZh: "马斯克",         nameEn: "Elon Musk",         tagline: "第一性原理 · 大胆下注 · 物理直觉" },
  "steve-jobs-perspective":        { id: "jobs",         nameZh: "乔布斯",         nameEn: "Steve Jobs",        tagline: "产品克制 · 美学 · 直觉" },
  "paul-graham-perspective":       { id: "pg",           nameZh: "保罗·格雷厄姆", nameEn: "Paul Graham",       tagline: "创业第一性原理 · 写作 · 黑客气质" },
  "zhang-yiming-perspective":      { id: "zhang-yiming", nameZh: "张一鸣",         tagline: "字节系工程师创业 · 延迟满足 · 系统思维" },
  "duan-yongping-perspective":     { id: "duan-yongping",nameZh: "段永平",         tagline: "本分 · 不做清单 · 平常心" },
  "sun-yuchen-perspective":        { id: "sun-yuchen",   nameZh: "孙宇晨",         tagline: "营销直觉 · 加密 · 高敢度" },
  "zhangxuefeng-perspective":      { id: "zhangxuefeng", nameZh: "张雪峰",         tagline: "实用主义 · 教育/职业选择 · 反鸡汤" },
  "lidan-perspective":             { id: "lidan",        nameZh: "李诞",           tagline: "钝感 · 解构 · 人间不值得" },
  "trump-perspective":             { id: "trump",        nameZh: "特朗普",         nameEn: "Donald Trump",      tagline: "强势叙事 · 谈判 · 注意力" },
  "tony-robbins-perspective":      { id: "robbins",      nameZh: "托尼·罗宾斯",    nameEn: "Tony Robbins",      tagline: "心理动力 · 行动驱动 · 情绪管理" },
  "jl-collins-perspective":        { id: "collins",      nameZh: "柯林斯",         nameEn: "JL Collins",        tagline: "简单理财 · 指数基金 · 自由储备金" },
  "david-bach-perspective":        { id: "bach",         nameZh: "大卫·巴赫",      nameEn: "David Bach",        tagline: "自动化理财 · 拿铁因素 · 习惯" },
  "mrbeast-perspective":           { id: "mrbeast",      nameZh: "野兽先生",       nameEn: "Jimmy Donaldson",   tagline: "内容创造 · 注意力工程 · 极致投入" },
};

/**
 * Build summary card from extracted personality text.
 * Looks for H3 headings under known H2s and pulls their titles.
 */
export function buildSummary(extracted: string, meta: { id: string; nameZh: string; nameEn?: string; tagline: string }): AdvisorSummary {
  const mentalModels = extractH3Titles(extracted, ["核心心智模型"]).slice(0, 6);
  const heuristics   = extractH3Titles(extracted, ["决策启发式"]).slice(0, 8);
  return {
    id: meta.id,
    nameZh: meta.nameZh,
    nameEn: meta.nameEn,
    tagline: meta.tagline,
    mentalModels,
    heuristics,
  };
}

function extractH3Titles(markdown: string, parentH2: string[]): string[] {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let inside = false;
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      inside = parentH2.some((p) => h2[1].includes(p));
      continue;
    }
    if (!inside) continue;
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const cleaned = h3[1]
        .replace(/^模型\d+[:：]\s*/, "")
        .replace(/^\d+[\.、]\s*/, "")
        .trim();
      out.push(cleaned);
    }
  }
  return out;
}

async function main() {
  const skillsDir = path.join(os.homedir(), ".claude", "skills");
  const dirs = await glob("*-perspective", { cwd: skillsDir });

  const summaries: AdvisorSummary[] = [];
  const fulls: AdvisorFull[] = [];

  for (const dir of dirs) {
    const meta = NAME_MAP[dir];
    if (!meta) {
      console.warn(`[skip] no NAME_MAP entry for ${dir}`);
      continue;
    }
    const skillPath = path.join(skillsDir, dir, "SKILL.md");
    const raw = fs.readFileSync(skillPath, "utf-8");
    const { content } = matter(raw);
    const extracted = extractPersonalitySections(content);

    summaries.push(buildSummary(extracted, meta));
    fulls.push({
      id: meta.id,
      nameZh: meta.nameZh,
      nameEn: meta.nameEn,
      tagline: meta.tagline,
      fullText: extracted,
    });
  }

  summaries.sort((a, b) => a.id.localeCompare(b.id));
  fulls.sort((a, b) => a.id.localeCompare(b.id));

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/advisors-summary.json", JSON.stringify(summaries, null, 2));
  fs.writeFileSync("data/advisors-full.json", JSON.stringify(fulls, null, 2));

  console.log(`✓ wrote ${summaries.length} advisors to data/`);
  console.log(`  summary: ${(fs.statSync("data/advisors-summary.json").size / 1024).toFixed(1)}KB`);
  console.log(`  full:    ${(fs.statSync("data/advisors-full.json").size / 1024).toFixed(1)}KB`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
