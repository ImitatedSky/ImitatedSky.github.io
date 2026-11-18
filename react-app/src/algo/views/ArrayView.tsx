import type { ArrayView as ArrayViewT } from "../types";
import { ViewFrame, fmt, groupPointers, pointerClass, toneClass, useWidth } from "./shared";

const BAR_MAX = 132;

export default function ArrayView({ view }: { view: ArrayViewT }) {
  const n = view.values.length;
  const [boxRef, boxWidth] = useWidth<HTMLDivElement>();
  const pointerEntries = Object.entries(view.pointers ?? {});
  const outside = pointerEntries.some(([, i]) => i < 0 || i >= n);
  const pad = outside ? 1 : 0;

  // Long values (words, tuples) get wider cells instead of overflowing
  const longest = view.bars ? 0 : Math.max(0, ...view.values.map((v) => fmt(v).length));
  const wide = longest > 4;
  // Otherwise shrink the cells until the whole array fits the stage (down to a readable minimum)
  const preferred = n <= 12 ? 46 : n <= 18 ? 38 : n <= 26 ? 30 : 24;
  const fit = Math.floor((boxWidth - 8) / Math.max(1, n + pad * 2));
  const size = wide ? preferred : Math.max(16, Math.min(preferred, fit - (fit < 30 ? 3 : 6)));
  const gap = size < 24 ? 3 : n <= 18 ? 6 : 4;
  const cellW = wide ? Math.min(150, Math.round(longest * 8.2 + 16)) : size;
  const step = cellW + gap;

  // Room for "just outside" pointers is symmetric padding on the (centred) container
  // rather than an offset on every cell, so cells don't slide when a pointer steps out
  const x = (i: number) => Math.max(-1, Math.min(n, i)) * step;
  const width = Math.max(1, n) * step - gap;

  const groups = groupPointers<number>(view.pointers);
  const maxStack = Math.max(0, ...[...groups.values()].map((g) => g.length));
  const slot = new Map<string, number>();
  for (const names of groups.values()) names.forEach((name, k) => slot.set(name, k));

  const nums = view.bars ? view.values.map((v) => (typeof v === "number" ? v : 0)) : [];
  const fill = view.fill ?? [];
  const max = view.bars ? Math.max(1, ...nums.map((v, i) => v + (fill[i] ?? 0))) : 1;
  const cellH = view.bars ? BAR_MAX + 22 : size;
  // `ranges: []` still reserves the row, so the layout does not jump when a window closes
  const hasRanges = view.ranges !== undefined;

  return (
    <ViewFrame label={view.label}>
      <div className="algo-scroll-x" ref={boxRef}>
        <div className="algo-array" style={{ width, margin: `0 ${pad * step}px`, boxSizing: "content-box" }}>
          {hasRanges && (
            <div className="algo-array-ranges">
              {view.ranges!.map((r, k) => (
                <div
                  key={k}
                  className={`algo-range ${toneClass(r.tone ?? "active")}`}
                  style={{
                    transform: `translateX(${x(r.from) - 3}px)`,
                    width: Math.max(0, (r.to - r.from + 1) * step - gap + 6),
                    opacity: r.to < r.from ? 0 : 1,
                  }}
                >
                  {r.label && <span>{r.label}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="algo-array-cells" style={{ height: cellH }}>
            {n === 0 && <span className="algo-empty">空</span>}
            {view.values.map((v, i) => {
              const key = view.ids?.[i] ?? i;
              const tone = toneClass(view.marks?.[i]);
              if (view.bars) {
                const h = (nums[i] / max) * BAR_MAX;
                const fh = ((fill[i] ?? 0) / max) * BAR_MAX;
                return (
                  <div
                    key={key}
                    className={`algo-bar-slot ${tone}`}
                    style={{ width: size, height: cellH, transform: `translateX(${x(i)}px)` }}
                  >
                    <span className="algo-bar-value" style={{ fontSize: size < 30 ? 10 : 12 }}>
                      {fmt(v)}
                    </span>
                    {fh > 0 && <div className="algo-bar-fill" style={{ height: fh }} />}
                    <div className="algo-bar" style={{ height: Math.max(2, h) }} />
                  </div>
                );
              }
              const text = fmt(v);
              return (
                <div
                  key={key}
                  className={`algo-cell ${tone}`}
                  style={{
                    width: cellW,
                    height: size,
                    transform: `translateX(${x(i)}px)`,
                    fontSize: wide ? 13 : Math.max(9, text.length > 3 ? size * 0.26 : size * 0.36),
                  }}
                >
                  {text}
                </div>
              );
            })}
          </div>

          <div className="algo-array-indices">
            {view.values.map((_, i) => (
              <span key={i} style={{ width: cellW, transform: `translateX(${x(i)}px)`, opacity: size < 20 && i % 2 ? 0 : 1 }}>
                {i}
              </span>
            ))}
          </div>

          {maxStack > 0 && (
            <div className="algo-array-pointers" style={{ height: maxStack * 22 + 8 }}>
              {pointerEntries.map(([name, i]) => (
                <div
                  key={name}
                  className={`algo-pointer ${pointerClass(name)}`}
                  style={{
                    width: cellW,
                    transform: `translate(${x(i)}px, ${(slot.get(name) ?? 0) * 22}px)`,
                  }}
                >
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ViewFrame>
  );
}
