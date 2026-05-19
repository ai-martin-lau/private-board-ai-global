"use client";
import type { AppLanguage } from "@/lib/types";

export function LanguageToggle({
  language,
  onChange,
}: {
  language: AppLanguage;
  onChange: (language: AppLanguage) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-neutral-100 p-1 text-xs">
      {(["zh", "en"] as const).map((lang) => (
        <button
          key={lang}
          className={[
            "rounded-full px-3 py-1 transition",
            language === lang ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-200",
          ].join(" ")}
          onClick={() => onChange(lang)}
          type="button"
        >
          {lang === "zh" ? "中文" : "English"}
        </button>
      ))}
    </div>
  );
}
