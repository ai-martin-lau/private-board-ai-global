"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearProfile } from "@/lib/storage";
import { text } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/types";

export function ProfileBadge({ lifeStage, language = "zh" }: { lifeStage: string; language?: AppLanguage }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const t = text(language);

  const reset = () => {
    clearProfile();
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
        onClick={() => setConfirm(!confirm)}
        title={lifeStage}
      >
        {t.profile as string} · {lifeStage.slice(0, 8)}{lifeStage.length > 8 ? "..." : ""}
      </button>
      {confirm && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg bg-white p-3 shadow-lg ring-1 ring-neutral-200">
          <p className="text-xs text-neutral-600">{t.resetProfileHelp as string}</p>
          <div className="mt-2 flex justify-end gap-2">
            <button className="text-xs text-neutral-500" onClick={() => setConfirm(false)}>{t.cancel as string}</button>
            <button className="text-xs font-medium text-red-600" onClick={reset}>{t.reset as string}</button>
          </div>
        </div>
      )}
    </div>
  );
}
