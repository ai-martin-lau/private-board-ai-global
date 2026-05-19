"use client";
import { useState } from "react";
import type { Question } from "@/lib/questions";
import type { AppLanguage } from "@/lib/types";
import { text } from "@/lib/i18n";

interface Props {
  question: Question;
  initialValue: unknown;
  onSubmit: (value: unknown) => void;
  onBack?: () => void;
  isLast?: boolean;
  language: AppLanguage;
}

export function QuestionCard({ question, initialValue, onSubmit, onBack, isLast, language }: Props) {
  const t = text(language);
  const backLabel = t.back as string;
  const nextLabel = t.next as string;
  const finishLabel = t.finishProfile as string;
  // State is initialized once per mount. The parent must use key={question.id}
  // so that switching questions remounts this component with a clean slate —
  // otherwise stale state from a previous question type would leak through
  // and crash the renderer (e.g. a string passed where TagInput expects an array).
  const [value, setValue] = useState<unknown>(() => {
    if (question.type === "tags") return Array.isArray(initialValue) ? initialValue : [];
    return typeof initialValue === "string" ? initialValue : "";
  });

  const valid = (() => {
    if (question.type === "tags") return Array.isArray(value) && value.length > 0;
    if (question.type === "radio") return typeof value === "string" && value.length > 0;
    return typeof value === "string" && value.trim().length > 0;
  })();

  return (
    <div className="card">
      <h2 className="text-xl font-semibold tracking-tight">{question.prompt}</h2>
      {question.helper && <p className="mt-1 text-sm text-neutral-500">{question.helper}</p>}

      <div className="mt-5">
        {question.type === "text" && (
          <input
            className="input"
            value={value as string}
            placeholder={question.placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
        {question.type === "textarea" && (
          <textarea
            className="input min-h-[100px]"
            value={value as string}
            placeholder={question.placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
        {question.type === "tags" && (
          <TagInput
            value={value as string[]}
            onChange={(v) => setValue(v)}
            placeholder={question.placeholder}
            language={language}
          />
        )}
        {question.type === "radio" && (
          <div className="flex flex-col gap-2">
            {question.options!.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                  value === opt.value ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <input
                  type="radio"
                  className="accent-neutral-900"
                  checked={value === opt.value}
                  onChange={() => setValue(opt.value)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-ghost" onClick={onBack} disabled={!onBack}>{backLabel}</button>
        <button className="btn-primary" disabled={!valid} onClick={() => onSubmit(value)}>
          {isLast ? finishLabel : nextLabel}
        </button>
      </div>
    </div>
  );
}

function TagInput({
  value, onChange, placeholder, language,
}: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; language: AppLanguage }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm">
            {t}
            <button className="text-neutral-400 hover:text-neutral-700" onClick={() => onChange(value.filter((x) => x !== t))}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="input"
          value={draft}
          placeholder={placeholder ?? (language === "en" ? "Type and press Enter" : "输入后回车添加")}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button className="btn-ghost" onClick={add}>{language === "en" ? "Add" : "添加"}</button>
      </div>
    </div>
  );
}
