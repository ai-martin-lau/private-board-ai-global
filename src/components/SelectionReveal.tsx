"use client";
import { useEffect, useState } from "react";
import { advisorSummaries } from "@/lib/advisors";
import { advisorName, advisorTagline } from "@/lib/advisor-display";
import { text } from "@/lib/i18n";
import type { AppLanguage, SelectionResult } from "@/lib/types";

export function SelectionReveal({
  result, onDone, language = "zh",
}: { result: SelectionResult; onDone: () => void; language?: AppLanguage }) {
  const [shown, setShown] = useState(0);
  const t = text(language);

  useEffect(() => {
    if (shown < result.selected.length) {
      const t = setTimeout(() => setShown(shown + 1), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, [shown, result.selected.length, onDone]);

  return (
    <div className="card text-center">
      <p className="text-sm text-neutral-500">{t.selectedIntro as string}</p>
      <ul className="mt-4 space-y-3">
        {result.selected.slice(0, shown).map((id) => {
          const a = advisorSummaries.find((x) => x.id === id);
          if (!a) return null;
          return (
            <li
              key={id}
              className="flex items-center justify-center gap-3 text-base font-medium opacity-0 animate-fade-in"
              style={{ animationFillMode: "forwards" }}
            >
              <span className="text-2xl">🪑</span>
              <span>{advisorName(a, language)}</span>
              <span className="text-xs font-normal text-neutral-500">· {advisorTagline(a, language)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
