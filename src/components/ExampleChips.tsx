import type { AppLanguage } from "@/lib/types";

const EXAMPLES = [
  "我该继续留在大厂稳定拿薪水，还是加入朋友的创业公司？",
  "我和伴侣要不要现在买房？首付够，但月供会吃掉一半家庭收入。",
  "孩子明年上小学，要不要为了学区换房或转去私立？",
  "我该考公上岸求稳定，还是继续在互联网行业卷机会？",
  "父母希望我回老家发展，但我在一线城市还有职业上升空间，怎么选？",
  "对象家里催婚催生，但我对关系和现金流都还没准备好，要不要推进？",
  "副业连续 6 个月有收入了，我该不该辞职全职做？",
];

const EXAMPLES_EN = [
  "Should I stay in a stable corporate job or take a startup offer with more upside?",
  "Should we buy a house now if the mortgage would take 45% of our monthly income?",
  "Should I go back to school and take on debt to switch careers?",
  "Should I move to another city for a better job if my partner wants to stay?",
  "Should I keep bootstrapping my startup or raise money and grow faster?",
  "Should we have a child now, or wait until our finances and careers are more stable?",
  "Should I quit my job to work full-time on a side project that has 6 months of revenue?",
];

export function ExampleChips({ onPick, language }: { onPick: (s: string) => void; language: AppLanguage }) {
  const examples = language === "en" ? EXAMPLES_EN : EXAMPLES;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {examples.map((e) => (
        <button
          key={e}
          className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
          onClick={() => onPick(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
