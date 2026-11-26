import type {
  GridView as GridViewT,
  IntervalsView as IntervalsViewT,
  MapView as MapViewT,
  QueueView as QueueViewT,
  StackView as StackViewT,
} from "../types";
import { ViewFrame, fmt, pointerClass, toneClass, useWidth } from "./shared";
import { SketchBox, seedOf } from "./sketch";

export function GridView({ view }: { view: GridViewT }) {
  const [boxRef, boxWidth, measured] = useWidth<HTMLDivElement>();
  const rows = view.cells.length;
  const cols = Math.max(0, ...view.cells.map((r) => r.length));
  if (rows === 0 || cols === 0) {
    return (
      <ViewFrame label={view.label}>
        <span className="algo-empty">空</span>
      </ViewFrame>
    );
  }
  const preferred = cols <= 6 ? 46 : cols <= 10 ? 38 : cols <= 14 ? 32 : 26;
  // Shrink to fit narrow stages (phones) rather than scroll, down to a legible minimum
  // row labels sit in an auto-width column; estimate it from the longest label (hand font ≈ 10px/char + padding)
  const labelW = view.rowLabels ? Math.max(22, Math.max(0, ...view.rowLabels.map((l) => fmt(l).length)) * 10 + 8) : 0;
  const fit = Math.floor((boxWidth - 8 - labelW - (view.blocks ? 10 : 0)) / cols);
  const size = Math.max(16, Math.min(preferred, fit));

  const pointersAt = new Map<string, string[]>();
  for (const [name, [r, c]] of Object.entries(view.pointers ?? {})) {
    const k = `${r},${c}`;
    pointersAt.set(k, [...(pointersAt.get(k) ?? []), name]);
  }
  const hasRowLabels = !!view.rowLabels;

  return (
    <ViewFrame label={view.label}>
      <div className="algo-scroll-x" ref={boxRef}>
        <div
          key={String(measured)}
          className="algo-grid"
          style={{
            gridTemplateColumns: `${hasRowLabels ? "auto " : ""}repeat(${cols}, ${size}px)`,
          }}
        >
          {view.colLabels && (
            <>
              {hasRowLabels && <span />}
              {Array.from({ length: cols }, (_, c) => (
                <span key={c} className="algo-grid-label">
                  {c < view.colLabels!.length ? fmt(view.colLabels![c]) : ""}
                </span>
              ))}
            </>
          )}
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} style={{ display: "contents" }}>
              {hasRowLabels && (
                <span className="algo-grid-label algo-grid-label-row">
                  {r < view.rowLabels!.length ? fmt(view.rowLabels![r]) : ""}
                </span>
              )}
              {Array.from({ length: cols }, (_, c) => {
                const k = `${r},${c}`;
                const v = view.cells[r][c];
                const text = v === undefined ? "" : fmt(v);
                const names = pointersAt.get(k);
                return (
                  <div
                    key={c}
                    className={`algo-cell algo-grid-cell ${toneClass(view.marks?.[k])} ${names ? "has-pointer" : ""} ${text === "" ? "is-blank" : ""}`}
                    style={{
                      width: size,
                      height: size,
                      fontSize: text.length > 3 ? size * 0.26 : size * 0.36,
                      marginRight: view.blocks && (c + 1) % view.blocks[1] === 0 && c < cols - 1 ? 5 : undefined,
                      marginBottom: view.blocks && (r + 1) % view.blocks[0] === 0 && r < rows - 1 ? 5 : undefined,
                    }}
                  >
                    {view.marks?.[k] && <SketchBox w={size} h={size} seed={r * 7 + c} />}
                    {names && (
                      <SketchBox w={size} h={size} seed={r * 3 + c + 1} shape="ellipse" fill={false} className={`algo-grid-ring ${pointerClass(names[0])}`} />
                    )}
                    <b>{text}</b>
                    {names && (
                      <span className={`algo-grid-pointer ${pointerClass(names[0])}`}>
                        {names.join(",")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </ViewFrame>
  );
}

export function MapView({ view }: { view: MapViewT }) {
  return (
    <ViewFrame label={view.label}>
      <div className="algo-map">
        {view.entries.length === 0 && <span className="algo-empty">空</span>}
        {view.entries.map(([k, v]) => (
          <div key={String(k)} className={`algo-map-entry ${toneClass(view.marks?.[String(k)])} ${v === undefined ? "is-set" : ""}`}>
            <SketchBox
              w={v === undefined ? 44 : 84}
              h={32}
              seed={seedOf(String(k))}
              shape={v === undefined && fmt(k).length <= 4 ? "ellipse" : "rect"}
            />
            <span className="algo-map-key">{fmt(k)}</span>
            {v !== undefined && (
              <>
                <span className="algo-map-arrow" />
                <span className="algo-map-val">{fmt(v)}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </ViewFrame>
  );
}

export function StackView({ view }: { view: StackViewT }) {
  const top = view.items.length - 1;
  return (
    <ViewFrame label={view.label}>
      <div className="algo-stack">
        <SketchBox w={110} h={160} seed={11} shape="u" fill={false} className="algo-stack-walls" />
        {view.items.length === 0 && <span className="algo-empty">空</span>}
        {view.items.map((v, i) => (
          <div key={i} className={`algo-stack-item ${toneClass(view.marks?.[i])}`}>
            <SketchBox w={76} h={32} seed={i} />
            <b>{fmt(v)}</b>
            {i === top && <span className="algo-tag">top</span>}
          </div>
        ))}
      </div>
    </ViewFrame>
  );
}

export function QueueView({ view }: { view: QueueViewT }) {
  const last = view.items.length - 1;
  return (
    <ViewFrame label={view.label}>
      <div className="algo-queue">
        <SketchBox w={300} h={56} seed={13} shape="tube" fill={false} className="algo-queue-walls" />
        <span className="algo-queue-end">出 ←</span>
        {view.items.length === 0 && <span className="algo-empty">空</span>}
        {view.items.map((v, i) => (
          <div key={i} className={`algo-queue-item ${toneClass(view.marks?.[i])}`}>
            <SketchBox w={44} h={32} seed={i} />
            <b>{fmt(v)}</b>
            {i === 0 && <span className="algo-tag">front</span>}
            {i === last && i !== 0 && <span className="algo-tag">back</span>}
          </div>
        ))}
        <span className="algo-queue-end">← 入</span>
      </div>
    </ViewFrame>
  );
}

export function IntervalsView({ view }: { view: IntervalsViewT }) {
  const nums = [
    ...view.items.flatMap((it) => [it.start, it.end]),
    ...(view.points ?? []).map((p) => p.at),
  ];
  const lo = nums.length ? Math.min(...nums) : 0;
  const hi = nums.length ? Math.max(...nums) : 1;
  const span = Math.max(1, hi - lo);
  const pct = (v: number) => ((v - lo) / span) * 100;

  // Greedy lane packing, in the given order, so overlapping intervals stack
  const laneEnds: number[] = [];
  const lanes = view.items.map((it) => {
    let lane = laneEnds.findIndex((end) => end < it.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = it.end;
    return lane;
  });
  const laneCount = Math.max(1, laneEnds.length);
  const ticks = [...new Set(nums)].sort((a, b) => a - b);

  return (
    <ViewFrame label={view.label}>
      <div className="algo-intervals">
        <div className="algo-intervals-lanes" style={{ height: laneCount * 30, marginTop: view.points?.some((p) => p.label) ? 18 : 0 }}>
          {view.items.map((it, i) => (
            <div
              key={i}
              className={`algo-interval ${toneClass(it.tone)}`}
              style={{
                left: `${pct(it.start)}%`,
                width: `max(${pct(it.end) - pct(it.start)}%, 10px)`,
                top: lanes[i] * 30,
              }}
            >
              <SketchBox w={90} h={24} seed={i} />
              <span>{it.label ?? `[${it.start}, ${it.end}]`}</span>
            </div>
          ))}
          {(view.points ?? []).map((p, i) => (
            <div
              key={`p${i}`}
              className={`algo-interval-point ${toneClass(p.tone ?? "bad")}`}
              style={{ left: `${pct(p.at)}%` }}
            >
              {p.label && <span>{p.label}</span>}
            </div>
          ))}
        </div>
        <div className="algo-intervals-axis">
          <SketchBox w={400} h={6} seed={17} shape="hline" fill={false} className="algo-axis-line" />
          {ticks.map((t) => (
            <span key={t} style={{ left: `${pct(t)}%` }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </ViewFrame>
  );
}
