import type { AdvisorSummary, AppLanguage } from "./types";

const EN_TAGLINES: Record<string, string> = {
  bach: "Automated finance · Latte factor · Habits",
  collins: "Simple investing · Index funds · Financial independence",
  feynman: "First principles · Learning · Simplifying complexity",
  ilya: "AI philosophy · Long-range thinking",
  jobs: "Product taste · Focus · Integrated experience",
  karpathy: "AI engineering · Learning systems · Builder mindset",
  mrbeast: "Creator strategy · Distribution · Relentless testing",
  munger: "Multidisciplinary thinking · Inversion · Practical judgment",
  musk: "First principles · Engineering scale · Extreme execution",
  naval: "Leverage · Wealth · Long-term games",
  pg: "Startups · Writing · Founder judgment",
  robbins: "State management · Personal change · Energy",
  taleb: "Risk · Antifragility · Tail events",
  trump: "Negotiation · Media instincts · Power dynamics",
};

export function advisorName(advisor: AdvisorSummary, language: AppLanguage): string {
  return language === "en" ? advisor.nameEn ?? advisor.nameZh : advisor.nameZh;
}

export function advisorTagline(advisor: AdvisorSummary, language: AppLanguage): string {
  return language === "en" ? EN_TAGLINES[advisor.id] ?? advisor.tagline : advisor.tagline;
}
