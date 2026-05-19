import { describe, it, expect } from "vitest";
import { encodeSseEvent, parseSpeakerStream } from "@/lib/sse";

describe("encodeSseEvent", () => {
  it("formats as SSE", () => {
    const out = encodeSseEvent({ speaker: "munger", delta: "hello" });
    expect(out).toBe(`data: {"speaker":"munger","delta":"hello"}\n\n`);
  });
});

describe("parseSpeakerStream", () => {
  it("splits a stream by [SPEAKER:xxx] markers into events", () => {
    const chunks = ["[SPEAKER:munger]Stop ", "doing list[SPEAKER:naval]Leverage."];
    const events: { speaker: string; delta: string }[] = [];
    const consumer = parseSpeakerStream((evt) => events.push(evt));
    for (const c of chunks) consumer(c);
    expect(events).toEqual([
      { speaker: "munger", delta: "Stop " },
      { speaker: "munger", delta: "doing list" },
      { speaker: "naval", delta: "Leverage." },
    ]);
  });

  it("falls back to 'host' speaker if no marker present", () => {
    const events: { speaker: string; delta: string }[] = [];
    const consumer = parseSpeakerStream((evt) => events.push(evt));
    consumer("plain text without marker");
    expect(events).toEqual([{ speaker: "host", delta: "plain text without marker" }]);
  });

  it("handles markers split across chunks", () => {
    const events: { speaker: string; delta: string }[] = [];
    const consumer = parseSpeakerStream((evt) => events.push(evt));
    consumer("[SPEAK");
    consumer("ER:munger]hi");
    expect(events).toEqual([{ speaker: "munger", delta: "hi" }]);
  });
});
