"use client";
import { advisorSummaries } from "@/lib/advisors";
import { advisorName } from "@/lib/advisor-display";
import { styleFor, type Style } from "@/lib/advisor-style";
import type { AppLanguage } from "@/lib/types";

export function SpeakerBubble({
  speaker, content, streaming, assignment, language = "zh",
}: {
  speaker: string;
  content: string;
  streaming: boolean;
  assignment?: Map<string, Style>;
  language?: AppLanguage;
}) {
  const a = advisorSummaries.find((x) => x.id === speaker);
  const name = a ? advisorName(a, language) : (speaker === "host" ? (language === "en" ? "Host" : "主持人") : speaker);
  const s = styleFor(speaker, assignment);

  // Strip stray markdown emphasis the model occasionally leaks through (**, __, *, _).
  // We render plain text via whitespace-pre-wrap, so unprocessed markers look like noise.
  // Also trim leading/trailing whitespace — model often emits trailing \n\n that
  // shows up as a blank gap at the bottom of the bubble.
  const cleaned = content
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(?<!\*)\*(?!\*)([^*\n]+?)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_(?!_)([^_\n]+?)_(?!_)/g, "$1")
    .trim();

  return (
    <div className={`rounded-xl ${s.bg} px-4 py-3 ring-1 ${s.ring}`}>
      <div className={`text-xs font-medium ${s.text}`}>{name}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
        {cleaned}
        {streaming && <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-neutral-500 align-middle" />}
      </div>
    </div>
  );
}
