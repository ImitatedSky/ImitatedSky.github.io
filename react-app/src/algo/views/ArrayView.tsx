import type { ArrayView as ArrayViewT } from "../types";
import { ViewFrame, fmt, groupPointers, pointerClass, toneClass } from "./shared";

const BAR_MAX = 132;

export default function ArrayView({ view }: { view: ArrayViewT }) {
  const n = view.values.length;
  const size = n <= 12 ? 46 : n <= 18 ? 38 : n <= 26 ? 30 : 24;
  const gap = n <= 18 ? 6 : 4;
  const step = size + gap;

  const pointerEntries = Object.entries(view.pointers ?? {});
  const outside = pointerEntries.some(([, i]) => i < 0 || i >= n);
  const pad = outside ? 1 : 0;
  const x = (i: number) => (Math.max(-1, Math.min(n, i)) + pad) * step;
  const width = Math.max(1, n + pad * 2) * step - gap;

  const groups = groupPointers<number>(view.pointers);
  const maxStack = Math.max(0, ...[...groups.values()].map((g) => g.length));
  const slot = new Map<string, number>();
  for (const names of groups.values()) names.forEach((name, k) => slot.set(name, k));

  const nums = view.bars ? view.values.map((v) => (typeof v === "number" ? v : 0)) : [];
  const fill = view.fill ?? [];
  const max = view.bars ? Math.max(1, ...nums.map((v, i) => v + (fill[i] ?? 0))) : 1;
  const cellH = view.bars ? BAR_MAX + 22 : size;
  const hasRanges = !!view.ranges?.length;

  return (
    <ViewFrame label={view.label}>
      <div className="algo-scroll-x">
        <div className="algo-array" style={{ width }}>
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
                    width: size,
                    height: size,
                    transform: `translateX(${x(i)}px)`,
                    fontSize: text.length > 3 ? size * 0.26 : size * 0.36,
                  }}
                >
                  {text}
                </div>
              );
            })}
          </div>

          <div className="algo-array-indices">
            {view.values.map((_, i) => (
              <span key={i} style={{ width: size, transform: `translateX(${x(i)}px)` }}>
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
                    width: size,
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
