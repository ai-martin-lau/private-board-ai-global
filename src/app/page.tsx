"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadLanguage, loadProfile, saveLanguage } from "@/lib/storage";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { LanguageToggle } from "@/components/LanguageToggle";
import { text } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>("zh");
  const t = text(language);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLanguage(loadLanguage());
      if (loadProfile()) router.replace("/ask");
    }, 0);
    return () => window.clearTimeout(id);
  }, [router]);

  const changeLanguage = (next: AppLanguage) => {
    saveLanguage(next);
    setLanguage(next);
  };

  return (
    <main>
      <header className="mx-auto max-w-2xl px-4 pt-12 text-center">
        <div className="mb-5 flex justify-center">
          <LanguageToggle language={language} onChange={changeLanguage} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t.appName as string}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {t.tagline as string}
        </p>
      </header>
      <OnboardingWizard language={language} />
    </main>
  );
}
