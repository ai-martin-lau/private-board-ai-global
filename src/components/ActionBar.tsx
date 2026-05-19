"use client";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { text } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/types";

export function ActionBar({ transcript, language = "zh" }: { transcript: string; language?: AppLanguage }) {
  const router = useRouter();
  const { push } = useToast();
  const t = text(language);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      push(t.copied as string, "success");
    } catch {
      push(t.copyFailed as string, "error");
    }
  };

  return (
    <div className="mt-6 flex justify-center gap-3">
      <button className="btn-ghost" onClick={copy}>{t.copyAll as string}</button>
      <button className="btn-primary" onClick={() => router.push("/ask")}>{t.askAgain as string}</button>
    </div>
  );
}
