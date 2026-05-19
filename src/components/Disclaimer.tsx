"use client";
import { useEffect, useState } from "react";
import { text } from "@/lib/i18n";
import { LANGUAGE_CHANGED_EVENT, loadLanguage } from "@/lib/storage";
import type { AppLanguage } from "@/lib/types";

export function Disclaimer() {
  const [language, setLanguage] = useState<AppLanguage>("zh");
  useEffect(() => {
    const id = window.setTimeout(() => setLanguage(loadLanguage()), 0);
    const onLanguageChanged = (event: Event) => {
      const next = (event as CustomEvent<AppLanguage>).detail;
      setLanguage(next === "en" ? "en" : "zh");
    };
    window.addEventListener(LANGUAGE_CHANGED_EVENT, onLanguageChanged);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(LANGUAGE_CHANGED_EVENT, onLanguageChanged);
    };
  }, []);
  const t = text(language);
  return (
    <footer className="mt-16 border-t border-neutral-200 px-4 py-6 text-center text-xs text-neutral-400">
      <p>{t.disclaimer as string}</p>
    </footer>
  );
}
