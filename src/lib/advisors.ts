import summaryData from "../../data/advisors-summary.json";
import fullData from "../../data/advisors-full.json";
import type { AdvisorSummary, AdvisorFull, AppLanguage } from "./types";

export const advisorSummaries: AdvisorSummary[] = summaryData as AdvisorSummary[];
export const advisorFulls: AdvisorFull[] = fullData as AdvisorFull[];

const summaryById = new Map(advisorSummaries.map((a) => [a.id, a]));
const fullById = new Map(advisorFulls.map((a) => [a.id, a]));

export function getSummary(id: string): AdvisorSummary | undefined {
  return summaryById.get(id);
}

export function getFull(id: string): AdvisorFull | undefined {
  return fullById.get(id);
}

export function getFulls(ids: string[]): AdvisorFull[] {
  return ids.map(getFull).filter((a): a is AdvisorFull => !!a);
}

export function getVisibleSummaries(language: AppLanguage): AdvisorSummary[] {
  if (language === "zh") return advisorSummaries;
  return advisorSummaries.filter((a) => !!a.nameEn);
}

export function getVisibleFulls(ids: string[], language: AppLanguage): AdvisorFull[] {
  const visibleIds = new Set(getVisibleSummaries(language).map((a) => a.id));
  return getFulls(ids).filter((a) => language === "zh" || visibleIds.has(a.id));
}
