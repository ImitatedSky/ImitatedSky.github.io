import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSkipForward,
} from "react-icons/fi";
import type { ArrayView, Frame } from "../types";
import { groupPointers } from "../views/shared";

/**
 * Give every array view the same pointer-row and bracket-row height in every
 * frame (the tallest it ever needs), so the stage doesn't jump as pointers
 * and windows come and go.
 */
export function stabilize(frames: Frame[]): Frame[] {
  const rows = new Map<string, number>();
  const ranged = new Set<string>();
  const key = (v: ArrayView) => v.label ?? "";
  for (const f of frames)
    for (const v of f.views) {
      if (v.type !== "array") continue;
      const stack = Math.max(0, ...[...groupPointers<number>(v.pointers).values()].map((g) => g.length));
      rows.set(key(v), Math.max(rows.get(key(v)) ?? 0, stack));
      if (v.ranges !== undefined) ranged.add(key(v));
    }
  return frames.map((f) => ({
    ...f,
    views: f.views.map((v) =>
      v.type === "array"
        ? { ...v, pointerRows: rows.get(key(v)) || undefined, ranges: v.ranges ?? (ranged.has(key(v)) ? [] : undefined) }
        : v,
    ),
  }));
}
import { ViewRenderer } from "../views";
import { fmt, rich } from "../views/shared";
import CodePanel from "./CodePanel";

const SPEEDS = [0.5, 1, 2, 4];
const BASE_MS = 1200;

/**
 * Steps through `frames`, drawing each frame's views and highlighting the
 * matching line(s) of `code`. The parent should pass a `key` that changes
 * with the input so playback restarts.
 */
export default function Player({
  frames: rawFrames,
  code,
  toolbar,
  autoPlay = false,
}: {
  frames: Frame[];
  code: string;
  toolbar?: ReactNode;
  autoPlay?: boolean;
}) {
  const frames = useMemo(() => stabilize(rawFrames), [rawFrames]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  // New input → restart, without remounting (a remount would kill a drag in the toolbar)
  const [shown, setShown] = useState(rawFrames);
  if (shown !== rawFrames) {
    setShown(rawFrames);
    setIdx(0);
    setPlaying(false);
  }
  const last = frames.length - 1;
  const frame = frames[Math.min(idx, last)];

  const go = useCallback(
    (to: number) => {
      setIdx(Math.max(0, Math.min(last, to)));
    },
    [last],
  );

  useEffect(() => {
    if (!playing) return;
    if (idx >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => Math.min(last, i + 1)), BASE_MS / speed);
    return () => clearTimeout(t);
  }, [playing, idx, last, speed]);

  const toggle = useCallback(() => {
    if (idx >= last) {
      setIdx(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  }, [idx, last]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        setPlaying(false);
        go(idx + 1);
      } else if (e.key === "ArrowLeft") {
        setPlaying(false);
        go(idx - 1);
      } else if (e.key === " " && el?.tagName !== "BUTTON" && el?.tagName !== "A") {
        e.preventDefault();
        toggle();
      } else return;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, idx, toggle]);

  if (!frame) return null;
  const activeLines = frame.line === undefined ? [] : Array.isArray(frame.line) ? frame.line : [frame.line];
  const vars = Object.entries(frame.vars ?? {});

  return (
    <div className="algo-player">
      <div className="algo-player-stage">
        {toolbar && <div className="algo-player-toolbar">{toolbar}</div>}

        <div className="algo-player-views">
          {frame.views.map((v, i) => (
            <div key={`${v.type}-${v.label ?? i}`} className={`algo-view-slot is-${v.type}`}>
              <ViewRenderer view={v} />
            </div>
          ))}
        </div>

        <div className="algo-player-dock">
        <div className={`algo-note ${frame.result !== undefined ? "is-result" : ""}`} aria-live="polite">
          <span className="algo-note-step">
            {idx + 1}
            <i>/{frames.length}</i>
          </span>
          <p>
            {rich(frame.note)}
            {frame.result !== undefined && <span className="algo-result">回傳 {frame.result}</span>}
          </p>
        </div>

        <div className="algo-controls">
          <button onClick={() => { setPlaying(false); go(0); }} aria-label="回到開頭" title="回到開頭">
            <FiRotateCcw />
          </button>
          <button onClick={() => { setPlaying(false); go(idx - 1); }} disabled={idx === 0} aria-label="上一步" title="上一步 (←)">
            <FiChevronLeft />
          </button>
          <button className="is-primary" onClick={toggle} aria-label={playing ? "暫停" : "播放"} title="播放 / 暫停 (Space)">
            {playing ? <FiPause /> : <FiPlay />}
          </button>
          <button onClick={() => { setPlaying(false); go(idx + 1); }} disabled={idx >= last} aria-label="下一步" title="下一步 (→)">
            <FiChevronRight />
          </button>
          <button onClick={() => { setPlaying(false); go(last); }} disabled={idx >= last} aria-label="跳到結尾" title="跳到結尾">
            <FiSkipForward />
          </button>
          <input
            className="algo-scrub"
            type="range"
            min={0}
            max={last}
            value={idx}
            onChange={(e) => { setPlaying(false); go(Number(e.target.value)); }}
            aria-label="進度"
            style={{ "--p": `${last ? (idx / last) * 100 : 100}%` } as React.CSSProperties}
          />
          <button
            className="algo-speed"
            onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
            title="播放速度"
          >
            {speed}×
          </button>
        </div>
        </div>
      </div>

      <div className="algo-player-side">
        <div className="algo-side-title">Python</div>
        <CodePanel code={code} activeLines={activeLines} maxHeight={520} />
        {vars.length > 0 && (
          <div className="algo-vars">
            {vars.map(([k, v]) => (
              <div key={k} className="algo-var">
                <span>{k}</span>
                <b>{typeof v === "string" ? v : fmt(v).replace("∅", "None").replace(/^T$/, "True").replace(/^F$/, "False")}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
