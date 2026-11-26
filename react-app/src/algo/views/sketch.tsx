/**
 * Hand-drawn strokes for the "board" style, built on roughjs' generator
 * (pure path maths, no DOM — so react-dom/server renders it too).
 *
 * Every shape takes a small integer `seed`, so the same element keeps the same
 * wobble from frame to frame. Results are cached: a 9×9 grid or a 40-node tree
 * re-renders from the cache instead of re-generating strokes on every step.
 */
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

const gen = rough.generator();
const cache = new Map<string, Sketch>();

export interface Sketch {
  /** outline strokes */
  line: string;
  /** hachure fill strokes ("" if the shape has no fill) */
  hatch: string;
}

const BASE: Options = {
  roughness: 1.1,
  bowing: 0.8,
  strokeWidth: 1,
  hachureAngle: -41,
  hachureGap: 4.5,
  fillWeight: 1.2,
  fillStyle: "hachure",
};

type Shape =
  | { k: "rect"; x?: number; y?: number; w: number; h: number }
  | { k: "ellipse"; x?: number; y?: number; w: number; h: number }
  | { k: "line"; x1: number; y1: number; x2: number; y2: number }
  | { k: "path"; d: string };

export function sketch(shape: Shape, seed: number, opts: Options & { fill?: string } = {}): Sketch {
  const key = `${JSON.stringify(shape)}|${seed}|${JSON.stringify(opts)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  // Shapes change when layouts change; a bounded cache is plenty for the hot set
  if (cache.size > 6000) cache.clear();
  const o: Options = { ...BASE, ...opts, seed: (seed % 997) + 1 };
  const r = (v: number) => Math.round(v * 10) / 10;
  const d =
    shape.k === "rect"
      ? gen.rectangle(r(shape.x ?? 0), r(shape.y ?? 0), r(shape.w), r(shape.h), o)
      : shape.k === "ellipse"
        ? gen.ellipse(r(shape.x ?? 0), r(shape.y ?? 0), r(shape.w), r(shape.h), o)
        : shape.k === "line"
          ? gen.line(r(shape.x1), r(shape.y1), r(shape.x2), r(shape.y2), o)
          : gen.path(shape.d, o);
  const out: Sketch = { line: "", hatch: "" };
  for (const set of d.sets) {
    if (set.type === "path") out.line += gen.opsToPath(set, 1);
    else if (set.type === "fillSketch") out.hatch += gen.opsToPath(set, 1);
  }
  cache.set(key, out);
  return out;
}

/** Small stable seed from an id */
export function seedOf(id: string | number): number {
  const s = String(id);
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 61;
}

/** Shape → <path>s, in the caller's SVG coordinates */
export function SketchPaths({
  shape,
  seed,
  fill = false,
  opts,
}: {
  shape: Shape;
  seed: number;
  fill?: boolean;
  opts?: Options;
}) {
  const s = sketch(shape, seed, fill ? { ...opts, fill: "x" } : opts);
  return (
    <>
      {s.hatch && <path className="sk-hatch" d={s.hatch} />}
      <path className="sk-line" d={s.line} pathLength={1} />
    </>
  );
}

/**
 * A sketched outline (and hachure) that stretches over its positioned parent.
 * `w`×`h` is the nominal size the wobble is generated at — pass the real size
 * when it is known (array cells) so nothing is distorted.
 */
export function SketchBox({
  w,
  h,
  seed,
  shape = "rect",
  fill = true,
  className = "",
}: {
  w: number;
  h: number;
  seed: number;
  shape?: "rect" | "ellipse" | "u" | "tube" | "hline";
  fill?: boolean;
  className?: string;
}) {
  const p = 1.5; // keep strokes inside the viewBox
  // Small boxes get a steadier hand, or the wobble swamps the value inside
  const o = { roughness: Math.max(0.45, Math.min(1.1, Math.min(w, h) / 36)), ...(fill ? { fill: "x" } : {}) };
  let s: Sketch;
  if (shape === "u") s = sketch({ k: "path", d: `M${p} ${p} L${p} ${h - p} L${w - p} ${h - p} L${w - p} ${p}` }, seed);
  else if (shape === "tube")
    s = sketch({ k: "path", d: `M${p} ${p} L${w - p} ${p} M${p} ${h - p} L${w - p} ${h - p}` }, seed);
  else if (shape === "hline") s = sketch({ k: "line", x1: 0, y1: h / 2, x2: w, y2: h / 2 }, seed);
  else
    s = sketch({ k: shape, x: shape === "ellipse" ? w / 2 : p, y: shape === "ellipse" ? h / 2 : p, w: w - 2 * p, h: h - 2 * p }, seed, o);
  return (
    <svg className={`sk-box ${className}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      {s.hatch && <path className="sk-hatch" d={s.hatch} />}
      <path className="sk-line" d={s.line} pathLength={1} />
    </svg>
  );
}

/** A little hand-drawn curly arrow pointing down (pointer name → cell) */
export function CurlyArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg className="sk-curly" viewBox="0 0 16 18" width={16} height={18} aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M10 1.5 C 3 4, 4 9, 8 10.5 C 11.5 12, 9 14.5, 8 16.5 M4.6 12.8 L8 16.6 L11.2 13.4" />
    </svg>
  );
}

/** Hand-drawn curly brace under a range, `w` wide */
export function Brace({ w, seed }: { w: number; seed: number }) {
  const m = w / 2;
  const d =
    w < 24
      ? `M1 1 Q1 6 ${m} 6 Q${w - 1} 6 ${w - 1} 1`
      : `M1 1 Q1 6 7 6 L${m - 6} 6 Q${m} 6 ${m} 11 Q${m} 6 ${m + 6} 6 L${w - 7} 6 Q${w - 1} 6 ${w - 1} 1`;
  const s = sketch({ k: "path", d }, seed, { roughness: 0.7, bowing: 0.4 });
  return (
    <svg className="sk-brace" width={w} height={13} viewBox={`0 0 ${w} 13`} aria-hidden="true">
      <path className="sk-line" d={s.line} pathLength={1} />
    </svg>
  );
}
