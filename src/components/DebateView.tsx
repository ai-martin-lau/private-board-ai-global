"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadLanguage, loadProfile, loadUserKey } from "@/lib/storage";
import { SelectionReveal } from "./SelectionReveal";
import { SpeakerBubble } from "./SpeakerBubble";
import { ActionBar } from "./ActionBar";
import { useToast } from "./Toast";
import { buildAssignment } from "@/lib/advisor-style";
import { text } from "@/lib/i18n";
import type { AppLanguage, Profile, SelectionResult, DebateEvent, DebateTurn } from "@/lib/types";

type DebatePhase = "idle" | "streaming" | "waiting" | "finished";

const SEGMENTS_KEY = "pb.debateSegments";
const PHASE_KEY = "pb.debatePhase";
const ROUND_KEY = "pb.debateRound";

function isDebatePhase(value: string | null): value is DebatePhase {
  return value === "idle" || value === "streaming" || value === "waiting" || value === "finished";
}

function loadStoredSegments(): DebateTurn[] {
  const raw = sessionStorage.getItem(SEGMENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DebateTurn[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) =>
        Number.isInteger(x.round) &&
        typeof x.speaker === "string" &&
        typeof x.content === "string"
    );
  } catch {
    return [];
  }
}

export function DebateView() {
  const router = useRouter();
  const { push } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selection, setSelection] = useState<SelectionResult | null>(null);
  const [question, setQuestion] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [segments, setSegments] = useState<DebateTurn[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [phase, setPhase] = useState<DebatePhase>("idle");
  const [currentRound, setCurrentRound] = useState(0);
  const [userFeedback, setUserFeedback] = useState("");
  const [language, setLanguage] = useState<AppLanguage>("zh");
  const startedRef = useRef(false);
  const segmentsRef = useRef<DebateTurn[]>([]);
  const t = text(language);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const p = loadProfile();
      if (!p) { router.replace("/"); return; }
      const sel = sessionStorage.getItem("pb.selection");
      const q = sessionStorage.getItem("pb.question");
      const lang = sessionStorage.getItem("pb.language") === "en" ? "en" : loadLanguage();
      if (!sel || !q) { router.replace("/ask"); return; }
      const storedSegments = loadStoredSegments();
      const storedPhase = sessionStorage.getItem(PHASE_KEY);
      const storedRound = Number(sessionStorage.getItem(ROUND_KEY));
      setProfile(p);
      setSelection(JSON.parse(sel));
      setQuestion(q);
      setLanguage(lang);
      setSegments(storedSegments);
      segmentsRef.current = storedSegments;
      if (storedSegments.length > 0) {
        setCurrentRound(Number.isInteger(storedRound) && storedRound > 0 ? storedRound : storedSegments.at(-1)?.round ?? 0);
        setPhase(isDebatePhase(storedPhase) && storedPhase !== "streaming" ? storedPhase : "waiting");
        startedRef.current = true;
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [router]);

  useEffect(() => {
    sessionStorage.setItem(SEGMENTS_KEY, JSON.stringify(segments));
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    sessionStorage.setItem(PHASE_KEY, phase);
  }, [phase]);

  useEffect(() => {
    sessionStorage.setItem(ROUND_KEY, String(currentRound));
  }, [currentRound]);

  const buildTranscript = useCallback((items: DebateTurn[]) => {
    return items
      .map((s) => `${language === "en" ? `Round ${s.round}` : `第 ${s.round} 轮`} ${s.speaker}: ${s.content}`)
      .join("\n\n");
  }, [language]);

  const appendDelta = useCallback((round: number, parsed: DebateEvent) => {
    setSegments((prev) => {
      const last = prev[prev.length - 1];
      const next = last && last.round === round && last.speaker === parsed.speaker
        ? [
            ...prev.slice(0, -1),
            { ...last, content: last.content + parsed.delta },
          ]
        : [...prev, { round, speaker: parsed.speaker, content: parsed.delta }];
      segmentsRef.current = next;
      return next;
    });
  }, []);

  const streamDebate = useCallback(async (round: number, feedback?: string) => {
    if (!profile || !selection) return;
    setPhase("streaming");
    setStreaming(true);
    setCurrentRound(round);
    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          profile,
          selected: selection.selected,
          round,
          transcript: buildTranscript(segmentsRef.current),
          userFeedback: feedback,
          language,
          userKey: loadUserKey() ?? undefined,
        }),
      });
      if (!res.ok || !res.body) {
        push(t.failedStart as string, "error");
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: rdone, value } = await reader.read();
        if (rdone) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          if (!evt.startsWith("data:")) continue;
          const payload = evt.slice(5).trim();
          if (payload === "[DONE]") {
            continue;
          }
          try {
            const parsed = JSON.parse(payload) as DebateEvent | { error: string };
            if ("error" in parsed) {
              push(`错误: ${parsed.error}`, "error");
              continue;
            }
            appendDelta(round, parsed);
          } catch {
            // ignore non-JSON heartbeat
          }
        }
      }
    } catch (e) {
      push(`${t.networkError as string}: ${(e as Error).message}`, "error");
    } finally {
      setStreaming(false);
    }
  }, [appendDelta, buildTranscript, language, profile, push, question, selection, t.failedStart, t.networkError]);

  useEffect(() => {
    if (!revealed || !profile || !selection || startedRef.current) return;
    startedRef.current = true;
    void (async () => {
      await streamDebate(1);
      await streamDebate(2);
      setPhase("waiting");
    })();
  }, [revealed, profile, selection, streamDebate]);

  const continueDebate = async () => {
    const feedback = userFeedback.trim();
    setUserFeedback("");
    await streamDebate(currentRound + 1, feedback || undefined);
    setPhase("waiting");
  };

  const finishDebate = () => setPhase("finished");

  if (!selection || !profile) return null;

  if (!revealed) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <SelectionReveal result={selection} onDone={() => setRevealed(true)} language={language} />
      </main>
    );
  }

  const assignment = buildAssignment(selection.selected);
  const transcript = buildTranscript(segments);
  const rounds = Array.from(new Set(segments.map((s) => s.round))).sort((a, b) => a - b);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs text-neutral-500">{t.debateQuestion as string}</p>
        <h1 className="mt-1 text-lg font-semibold">{question}</h1>
      </div>
      <div className="space-y-3">
        {rounds.map((round) => (
          <div key={round} className="space-y-3">
            <RoundDivider label={roundLabel(round, language)} />
            {segments.filter((seg) => seg.round === round).map((seg, i) => (
              <SpeakerBubble
                key={`${round}-${i}`}
                speaker={seg.speaker}
                content={seg.content}
                streaming={streaming && round === currentRound && i === segments.filter((s) => s.round === round).length - 1}
                assignment={assignment}
                language={language}
              />
            ))}
          </div>
        ))}
        {phase === "waiting" && (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm font-medium text-neutral-800">{t.yourTake as string}</p>
            <textarea
              className="input mt-3 min-h-[96px]"
              placeholder={t.feedbackPlaceholder as string}
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button className="btn-ghost" onClick={finishDebate}>{t.stopHere as string}</button>
              <button className="btn-primary" onClick={continueDebate}>{t.continueRound as string}</button>
            </div>
          </div>
        )}
        {phase === "finished" && (
          <div className="mt-6">
            <ActionBar transcript={transcript} language={language} />
          </div>
        )}
        {streaming && segments.filter((s) => s.round === currentRound).length === 0 && (
          <p className="text-center text-sm text-neutral-500">{t.thinking as string}</p>
        )}
      </div>
      {phase !== "finished" && phase !== "waiting" && !streaming && segments.length === 0 && (
        <p className="mt-6 text-center text-sm text-red-600">{t.failedStart as string}</p>
      )}
    </main>
  );
}

function roundLabel(round: number, language: AppLanguage) {
  const t = text(language);
  if (round === 1) return t.round1 as string;
  if (round === 2) return t.round2 as string;
  return (t.roundN as (round: number) => string)(round);
}

function RoundDivider({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3 px-1" aria-hidden>
      <div className="h-px flex-1 bg-neutral-300/70" />
      <span className="text-xs font-medium tracking-wider text-neutral-500">{label}</span>
      <div className="h-px flex-1 bg-neutral-300/70" />
    </div>
  );
}
