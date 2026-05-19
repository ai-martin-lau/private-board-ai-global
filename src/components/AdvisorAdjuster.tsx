"use client";
import { getVisibleSummaries } from "@/lib/advisors";
import { advisorName, advisorTagline } from "@/lib/advisor-display";
import { text } from "@/lib/i18n";
import type { AppLanguage, SelectionResult } from "@/lib/types";

const MIN_ADVISORS = 1;

export function AdvisorAdjuster({
  result,
  selected,
  onChange,
  onConfirm,
  onBack,
  language,
}: {
  result: SelectionResult;
  selected: string[];
  onChange: (ids: string[]) => void;
  onConfirm: () => void;
  onBack: () => void;
  language: AppLanguage;
}) {
  const t = text(language);
  const selectedSet = new Set(selected);
  const canConfirm = selected.length >= MIN_ADVISORS;
  const advisors = getVisibleSummaries(language);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      if (selected.length <= MIN_ADVISORS) return;
      onChange(selected.filter((x) => x !== id));
      return;
    }
    onChange([...selected, id]);
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.adjustTitle as string}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {t.adjustHelp as string}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
          {(t.selectedCount as (count: number) => string)(selected.length)}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {advisors.map((advisor) => {
          const isSelected = selectedSet.has(advisor.id);
          const reason = result.reasons[advisor.id];

          return (
            <button
              key={advisor.id}
              type="button"
              className={[
                "w-full rounded-lg border p-3 text-left transition",
                isSelected
                  ? "border-neutral-900 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400",
              ].join(" ")}
              onClick={() => toggle(advisor.id)}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {advisorName(advisor, language)}
                  </p>
                  <p className={isSelected ? "mt-1 text-xs text-neutral-300" : "mt-1 text-xs text-neutral-500"}>
                    {advisorTagline(advisor, language)}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-2 py-1 text-xs",
                    isSelected ? "bg-white text-neutral-950" : "bg-neutral-100 text-neutral-600",
                  ].join(" ")}
                >
                  {isSelected ? t.seated as string : t.add as string}
                </span>
              </div>
              {reason && (
                <p className={isSelected ? "mt-2 text-xs text-neutral-300" : "mt-2 text-xs text-neutral-600"}>
                  {t.recommendedReason as string}{reason}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button className="btn-ghost" onClick={onBack}>{t.backToQuestion as string}</button>
        <button className="btn-primary" onClick={onConfirm} disabled={!canConfirm}>
          {t.confirmBoard as string}
        </button>
      </div>
    </div>
  );
}
