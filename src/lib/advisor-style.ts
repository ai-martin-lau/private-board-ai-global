const PALETTE = [
  { bg: "bg-amber-50",   ring: "ring-amber-200",   text: "text-amber-900" },
  { bg: "bg-sky-50",     ring: "ring-sky-200",     text: "text-sky-900" },
  { bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-900" },
  { bg: "bg-violet-50",  ring: "ring-violet-200",  text: "text-violet-900" },
  { bg: "bg-rose-50",    ring: "ring-rose-200",    text: "text-rose-900" },
  { bg: "bg-stone-50",   ring: "ring-stone-300",   text: "text-stone-900" },
  { bg: "bg-cyan-50",    ring: "ring-cyan-200",    text: "text-cyan-900" },
  { bg: "bg-lime-50",    ring: "ring-lime-200",    text: "text-lime-900" },
];

export type Style = (typeof PALETTE)[number];

const HOST: Style = { bg: "bg-neutral-100", ring: "ring-neutral-300", text: "text-neutral-700" };

/**
 * Build a per-debate color assignment so no two selected advisors share a color
 * (as long as the count fits the palette). Order matters — assignment follows
 * the order ids appear in the input array.
 */
export function buildAssignment(orderedIds: string[]): Map<string, Style> {
  const m = new Map<string, Style>();
  let i = 0;
  for (const id of orderedIds) {
    if (m.has(id) || id === "host") continue;
    m.set(id, PALETTE[i % PALETTE.length]);
    i++;
  }
  return m;
}

export function styleFor(advisorId: string, assignment?: Map<string, Style>): Style {
  if (advisorId === "host") return HOST;
  if (assignment?.has(advisorId)) return assignment.get(advisorId)!;
  // Fallback for unexpected speakers (model emitted an id not in selection):
  // stable hash so at least the same renegade id is always the same color.
  let h = 0;
  for (let i = 0; i < advisorId.length; i++) h = (h * 31 + advisorId.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
