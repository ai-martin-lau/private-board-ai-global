"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions } from "@/lib/questions";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { saveProfile, loadProfile } from "@/lib/storage";
import type { AppLanguage, Profile } from "@/lib/types";
import { text } from "@/lib/i18n";

export function OnboardingWizard({ language }: { language: AppLanguage }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState<Partial<Profile>>(() => loadProfile() ?? {});
  const questions = getQuestions(language);
  const t = text(language);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;
  const questionCount = t.questionCount as (current: number, total: number) => string;

  const next = (value: unknown) => {
    const merged = { ...draft, [q.id]: value } as Partial<Profile>;
    setDraft(merged);
    if (isLast) {
      saveProfile(merged as Profile);
      router.push("/ask");
    } else {
      setIdx(idx + 1);
    }
  };

  const back = idx > 0 ? () => setIdx(idx - 1) : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <ProgressBar current={idx + 1} total={questions.length} />
      <p className="mt-3 text-sm text-neutral-500">
        {questionCount(idx + 1, questions.length)}
      </p>
      <div className="mt-6">
        <QuestionCard
          key={q.id}
          question={q}
          initialValue={(draft as Record<string, unknown>)[q.id]}
          onSubmit={next}
          onBack={back}
          isLast={isLast}
          language={language}
        />
      </div>
    </div>
  );
}
