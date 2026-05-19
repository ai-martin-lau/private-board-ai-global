"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadLanguage, loadProfile, loadUserKey, saveLanguage } from "@/lib/storage";
import { getVisibleSummaries } from "@/lib/advisors";
import { ExampleChips } from "./ExampleChips";
import { ProfileBadge } from "./ProfileBadge";
import { KeyManager } from "./KeyManager";
import { BudgetExhaustedModal } from "./BudgetExhaustedModal";
import { AdvisorAdjuster } from "./AdvisorAdjuster";
import { useToast } from "./Toast";
import { LanguageToggle } from "./LanguageToggle";
import { text } from "@/lib/i18n";
import type { AppLanguage, Profile, SelectionResult } from "@/lib/types";

export function AskPage() {
  const router = useRouter();
  const { push } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [hasUserKey, setHasUserKey] = useState(false);
  const [recommendation, setRecommendation] = useState<SelectionResult | null>(null);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [language, setLanguage] = useState<AppLanguage>("zh");
  const t = text(language);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const p = loadProfile();
      if (!p) { router.replace("/"); return; }
      setLanguage(loadLanguage());
      setProfile(p);
    }, 0);
    return () => window.clearTimeout(id);
  }, [router]);

  // Re-read key state on mount and whenever the KeyManager modal closes,
  // so the badge reflects the latest save/clear action.
  useEffect(() => {
    if (keyOpen) return;
    const id = window.setTimeout(() => setHasUserKey(!!loadUserKey()), 0);
    return () => window.clearTimeout(id);
  }, [keyOpen]);

  if (!profile) return null;

  const changeLanguage = (next: AppLanguage) => {
    saveLanguage(next);
    setLanguage(next);
    const visibleIds = new Set(getVisibleSummaries(next).map((advisor) => advisor.id));
    setSelectedAdvisors((ids) => ids.filter((id) => visibleIds.has(id)));
    setRecommendation(null);
  };

  const submit = async () => {
    if (!question.trim()) { push(language === "en" ? "Write your question first" : "请先写下你的问题", "error"); return; }
    setLoading(true);
    try {
      const userKey = loadUserKey() ?? undefined;
      const res = await fetch("/api/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, profile, userKey, language }),
      });
      if (res.status === 429) {
        const j = await res.json();
        if (j.error === "budget_exhausted") {
          setBudgetModal(true);
        } else {
          push(j.message ?? (language === "en" ? "Too many requests" : "操作太频繁"), "error");
        }
        return;
      }
      if (res.status === 401 || res.status === 403) {
        push(language === "en" ? "Invalid key. Please enter it again." : "Key 无效，请重新输入", "error");
        setKeyOpen(true);
        return;
      }
      if (!res.ok) { push(language === "en" ? "Something went wrong. Try again." : "出错了，请重试", "error"); return; }
      const result = (await res.json()) as SelectionResult;
      setRecommendation(result);
      setSelectedAdvisors(result.selected);
    } catch (e) {
      push(`${t.networkError as string}: ${(e as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const startDebate = () => {
    if (!recommendation) return;
    sessionStorage.setItem(
      "pb.selection",
      JSON.stringify({ ...recommendation, selected: selectedAdvisors } satisfies SelectionResult)
    );
    sessionStorage.setItem("pb.question", question);
    sessionStorage.setItem("pb.language", language);
    sessionStorage.removeItem("pb.debateSegments");
    sessionStorage.removeItem("pb.debatePhase");
    sessionStorage.removeItem("pb.debateRound");
    router.push("/debate");
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t.askTitle as string}</h1>
        <div className="flex items-center gap-2">
          <LanguageToggle language={language} onChange={changeLanguage} />
          <ProfileBadge lifeStage={profile.lifeStage} language={language} />
          {hasUserKey ? (
            <button
              className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
              onClick={() => setKeyOpen(true)}
              title={language === "en" ? "Using your own API key" : "正在使用你自己的 API key（点击管理或清除）"}
            >
              {t.ownKey as string}
            </button>
          ) : (
            <button
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
              onClick={() => setKeyOpen(true)}
              title={language === "en" ? "Using the built-in free quota" : "正在使用网站提供的免费额度（点击切换为自己的 key）"}
            >
              {t.freeQuota as string}
            </button>
          )}
        </div>
      </div>

      {recommendation ? (
        <AdvisorAdjuster
          result={recommendation}
          selected={selectedAdvisors}
          onChange={setSelectedAdvisors}
          onConfirm={startDebate}
          onBack={() => setRecommendation(null)}
          language={language}
        />
      ) : (
        <div className="card">
          <label className="text-sm font-medium text-neutral-700">{t.askLabel as string}</label>
          <textarea
            className="input mt-2 min-h-[120px]"
            placeholder={t.askPlaceholder as string}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <ExampleChips onPick={setQuestion} language={language} />
          <div className="mt-5 flex justify-end">
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? t.callingBoard as string : t.callBoard as string}
            </button>
          </div>
        </div>
      )}

      <KeyManager open={keyOpen} onClose={() => setKeyOpen(false)} />
      <BudgetExhaustedModal
        open={budgetModal}
        onUseKey={() => { setBudgetModal(false); setKeyOpen(true); }}
        onCancel={() => setBudgetModal(false)}
      />
    </main>
  );
}
