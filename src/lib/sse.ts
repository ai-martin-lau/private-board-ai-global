import type { DebateEvent } from "./types";

export function encodeSseEvent(event: DebateEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

const SPEAKER_RE = /\[SPEAKER:([\w-]+)\]/g;

/**
 * Returns a function you call with each text chunk as it streams in.
 * Buffers across chunks so a marker split between chunks still parses.
 */
export function parseSpeakerStream(emit: (evt: DebateEvent) => void) {
  let buffer = "";
  let currentSpeaker = "host";

  return (chunk: string) => {
    buffer += chunk;
    while (true) {
      // If buffer might end with a partial marker like "[SPEAK", stop early
      const partialIdx = buffer.lastIndexOf("[");
      const safeEnd = partialIdx >= 0 && !buffer.slice(partialIdx).includes("]")
        ? partialIdx
        : buffer.length;

      const slice = buffer.slice(0, safeEnd);
      SPEAKER_RE.lastIndex = 0;
      const match = SPEAKER_RE.exec(slice);
      if (!match) {
        if (slice.length > 0) {
          emit({ speaker: currentSpeaker, delta: slice });
          buffer = buffer.slice(safeEnd);
        }
        return;
      }
      // Emit text before marker (if any) under current speaker
      if (match.index > 0) {
        emit({ speaker: currentSpeaker, delta: slice.slice(0, match.index) });
      }
      currentSpeaker = match[1];
      buffer = buffer.slice(match.index + match[0].length);
    }
  };
}
