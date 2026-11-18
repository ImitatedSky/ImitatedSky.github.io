import type { ReactNode } from "react";
import type { Cell, Tone } from "../types";

export function fmt(c: Cell | undefined): string {
  if (c === null || c === undefined) return "∅";
  if (c === true) return "T";
  if (c === false) return "F";
  if (c === " ") return "␣";
  return String(c);
}

export const toneClass = (t?: Tone) => (t ? `tone-${t}` : "");

const POINTER_TONES = ["p0", "p1", "p2", "p3", "p4"];

/** Stable colour slot for a pointer name, so `l` keeps its colour across frames */
export function pointerClass(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return POINTER_TONES[h % POINTER_TONES.length];
}

/** Group pointer names by what they point at */
export function groupPointers<T extends string | number>(
  pointers: Record<string, T | null> | undefined,
): Map<T | null, string[]> {
  const out = new Map<T | null, string[]>();
  for (const [name, target] of Object.entries(pointers ?? {})) {
    const list = out.get(target) ?? [];
    list.push(name);
    out.set(target, list);
  }
  return out;
}

export function ViewFrame({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className="algo-view">
      {label && <div className="algo-view-label">{label}</div>}
      <div className="algo-view-body">{children}</div>
    </section>
  );
}

/** Inline `code` and **bold** → React nodes */
export function rich(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
      return (
        <code key={i} className="algo-code-inline">
          {p.slice(1, -1)}
        </code>
      );
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4)
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    return p;
  });
}
