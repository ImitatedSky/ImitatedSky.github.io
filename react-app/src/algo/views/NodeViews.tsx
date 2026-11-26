/** SVG views for pointer-based structures: linked list, tree, graph */
import type {
  GraphView as GraphViewT,
  ListView as ListViewT,
  TreeNodeSpec,
  TreeView as TreeViewT,
} from "../types";
import { ViewFrame, fmt, groupPointers, pointerClass, toneClass } from "./shared";
import { SketchPaths, seedOf } from "./sketch";

/** Open "V" arrowhead with its tip at (x, y), drawn like a pen stroke */
function vhead(x: number, y: number, angle: number, size = 8): string {
  const a1 = angle + Math.PI - 0.5;
  const a2 = angle + Math.PI + 0.45;
  return `M${x + size * Math.cos(a1)} ${y + size * Math.sin(a1)} L${x} ${y} L${x + size * Math.cos(a2)} ${y + size * Math.sin(a2)}`;
}

const fontFor = (text: string, base: number) =>
  text.length <= 2 ? base : text.length === 3 ? base * 0.82 : base * 0.66;

// ── linked list ──────────────────────────────────────────────────────────────

const LW = 52;
const LH = 42;
const LGAP = 36;

export function ListView({ view }: { view: ListViewT }) {
  const { nodes } = view;
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const groups = groupPointers<string>(view.pointers);
  const maxStack = Math.max(0, ...[...groups.values()].map((g) => g.length));
  const nullNames = groups.get(null);

  const top = maxStack * 19 + 28;
  const xOf = (i: number) => 8 + i * (LW + LGAP);
  const cy = top + LH / 2;

  // Resolve each node's `next`: omitted = the following node
  const nextOf = (i: number): string | null => {
    const n = nodes[i];
    if (n.next !== undefined) return n.next;
    return i + 1 < nodes.length ? nodes[i + 1].id : null;
  };

  let depth = 0; // how far arcs dip below the row
  const arcs: { d: string; tip: [number, number, number]; cls: string }[] = [];
  const straight: { x1: number; x2: number }[] = [];

  nodes.forEach((n, i) => {
    const targets: [string | null | undefined, string][] = [
      [nextOf(i), "algo-link"],
      [n.random, "algo-link algo-link-alt"],
    ];
    for (const [target, cls] of targets) {
      if (target === null || target === undefined) continue;
      const j = index.get(target);
      if (j === undefined) continue;
      const isRandom = cls.includes("alt");
      if (!isRandom && j === i + 1) {
        straight.push({ x1: xOf(i) + LW, x2: xOf(j) });
        continue;
      }
      const sx = xOf(i) + LW / 2 + (isRandom ? 8 : -8);
      const ex = xOf(j) + LW / 2 + (isRandom ? -8 : 8);
      const y = top + LH;
      const h = (j === i ? 26 : Math.min(64, 20 + 12 * Math.abs(j - i))) + (isRandom ? 8 : 0);
      depth = Math.max(depth, h);
      const d =
        j === i
          ? `M ${sx - 6} ${y} C ${sx - 16} ${y + h}, ${sx + 16} ${y + h}, ${sx + 6} ${y}`
          : `M ${sx} ${y} C ${sx} ${y + h}, ${ex} ${y + h}, ${ex} ${y + 5}`;
      arcs.push({ d, tip: [j === i ? sx + 6 : ex, y + 1, -Math.PI / 2], cls });
    }
  });

  const showNull = !!nullNames;
  const count = nodes.length + (showNull ? 1 : 0);
  const width = Math.max(60, 16 + count * LW + Math.max(0, count - 1) * LGAP);
  const height = top + LH + Math.max(10, depth * 0.78 + 8);

  const pointerLabels = (names: string[] | undefined, cx: number) =>
    names?.map((name, k) => (
      <g key={name} className={`algo-svg-pointer ${pointerClass(name)}`}>
        <text x={cx} y={top - 23 - (names.length - 1 - k) * 19} textAnchor="middle">
          {name}
        </text>
      </g>
    ));

  return (
    <ViewFrame label={view.label}>
      <div className="algo-scroll-x">
        {nodes.length === 0 && !showNull ? (
          // Same height as a one-node list, so the stage doesn't jump when a list empties
          <div className="algo-empty" style={{ height: top + LH + 10, display: "grid", placeItems: "center" }}>
            空串列
          </div>
        ) : (
          <svg className="algo-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {straight.map((s, k) => (
              <g key={`s${k}`} className="algo-link">
                <SketchPaths shape={{ k: "line", x1: s.x1 + 2, y1: cy, x2: s.x2 - 3, y2: cy }} seed={k} opts={{ roughness: 0.8 }} />
                <path className="sk-head" d={vhead(s.x2 - 2, cy, 0)} />
              </g>
            ))}
            {arcs.map((a, k) => (
              <g key={`a${k}`} className={a.cls}>
                <SketchPaths shape={{ k: "path", d: a.d }} seed={k} opts={{ roughness: 0.7 }} />
                <path className="sk-head" d={vhead(...a.tip)} />
              </g>
            ))}
            {nodes.map((n, i) => {
              const text = fmt(n.val);
              return (
                <g key={n.id} className={`algo-node ${toneClass(view.marks?.[n.id])}`} style={{ transform: `translateX(${xOf(i)}px)` }}>
                  <rect className="sk-under" x={2} y={top + 2} width={LW - 4} height={LH - 4} />
                  <SketchPaths shape={{ k: "rect", x: 1, y: top + 1, w: LW - 2, h: LH - 2 }} seed={seedOf(n.id)} fill />
                  <text x={LW / 2} y={cy} fontSize={fontFor(text, 15)}>
                    {text}
                  </text>
                  {pointerLabels(groups.get(n.id), LW / 2)}
                  {groups.has(n.id) && (
                    <path
                      className={`sk-head algo-svg-pointer-tip ${pointerClass(groups.get(n.id)![groups.get(n.id)!.length - 1])}`}
                      d={`M${LW / 2 + 5} ${top - 16} C${LW / 2 - 7} ${top - 13} ${LW / 2 + 4} ${top - 8} ${LW / 2} ${top - 2} ` + vhead(LW / 2, top - 2, Math.PI / 2, 6)}
                    />
                  )}
                </g>
              );
            })}
            {showNull && (
              <g className="algo-node tone-muted">
                <text x={xOf(nodes.length) + LW / 2} y={cy} fontSize={15}>
                  ∅
                </text>
                {pointerLabels(nullNames, xOf(nodes.length) + LW / 2)}
              </g>
            )}
          </svg>
        )}
      </div>
    </ViewFrame>
  );
}

// ── tree ─────────────────────────────────────────────────────────────────────

const TR = 20;
const TX0 = 50;
const TY = 68;

function layoutTree(nodes: TreeNodeSpec[], root: string | null) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const pos = new Map<string, { x: number; y: number }>();
  let cursor = 0;
  let maxDepth = 0;

  const place = (id: string, depth: number): number => {
    const node = byId.get(id);
    if (!node || pos.has(id)) return cursor;
    pos.set(id, { x: 0, y: depth }); // reserve — guards against cycles
    maxDepth = Math.max(maxDepth, depth);
    const kids = node.children ?? [];
    const real = kids.filter((k) => k !== null && byId.has(k) && !pos.has(k));
    let x: number;
    if (real.length === 0) {
      x = cursor;
      cursor += 1;
    } else {
      const slots: number[] = [];
      for (const k of kids) {
        if (k !== null && byId.has(k) && !pos.has(k)) slots.push(place(k, depth + 1));
        else if (k === null) {
          // An empty left/right slot still takes room so orientation is visible
          slots.push(cursor);
          cursor += 0.6;
        }
      }
      x = (slots[0] + slots[slots.length - 1]) / 2;
    }
    pos.set(id, { x, y: depth });
    return x;
  };

  if (root !== null) place(root, 0);
  // Detached nodes (e.g. while a tree is being built) sit in their own row
  const loose = nodes.filter((n) => !pos.has(n.id));
  if (loose.length) {
    const y = pos.size ? maxDepth + 1.2 : 0;
    let lx = 0;
    for (const n of loose) {
      if (pos.has(n.id)) continue;
      const before = cursor;
      cursor = lx;
      place(n.id, 0);
      lx = cursor;
      cursor = Math.max(before, cursor);
      // shift the subtree just placed down to the loose row
      const shift = (id: string, seen = new Set<string>()) => {
        if (seen.has(id)) return;
        seen.add(id);
        const p = pos.get(id);
        if (p) p.y += y;
        for (const k of byId.get(id)?.children ?? []) if (k) shift(k, seen);
      };
      shift(n.id);
    }
    maxDepth = Math.max(...[...pos.values()].map((p) => p.y));
  }
  return { pos, width: Math.max(1, cursor), depth: maxDepth };
}

export function TreeView({ view }: { view: TreeViewT }) {
  const { pos, width: slots, depth } = layoutTree(view.nodes, view.root);
  // Values too long for a circle (tuples, words) are drawn as pills, with wider spacing
  const longest = Math.max(0, ...view.nodes.map((n) => fmt(n.val).length));
  const halfW = longest > 4 ? Math.min(60, longest * 3.9 + 8) : TR;
  const TX = Math.max(TX0, halfW * 2 + 10);
  const ptrStack = Math.max(0, ...[...groupPointers<string>(view.pointers).values()].map((g) => g.length));
  const sideLabels = !!view.edgeLabels && Object.keys(view.edgeLabels).length > 0;
  const pad = halfW + 26;
  const extraTop = sideLabels ? 0 : Math.max(0, ptrStack - 1) * 17;
  const X = (id: string) => pad + pos.get(id)!.x * TX;
  const Y = (id: string) => pad - 6 + extraTop + pos.get(id)!.y * TY;
  const width = pad * 2 + (slots - 1) * TX;
  const height = pad * 2 - 12 + extraTop + depth * TY;
  const groups = groupPointers<string>(view.pointers);
  const nullNames = groups.get(null);

  if (view.nodes.length === 0) {
    return (
      <ViewFrame label={view.label}>
        <div className="algo-empty" style={{ minHeight: 90, display: "grid", placeItems: "center" }}>
          空樹
        </div>
      </ViewFrame>
    );
  }

  return (
    <ViewFrame label={view.label}>
      <div className="algo-scroll-x">
        <svg className="algo-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {view.nodes.flatMap((n) =>
            (n.children ?? []).map((c) => {
              if (c === null || !pos.has(c) || !pos.has(n.id)) return null;
              if (pos.get(c)!.y <= pos.get(n.id)!.y) return null;
              const key = `${n.id}>${c}`;
              const label = view.edgeLabels?.[key];
              const mx = (X(n.id) + X(c)) / 2;
              const my = (Y(n.id) + Y(c)) / 2;
              return (
                <g key={key} className={`algo-edge ${toneClass(view.edgeMarks?.[key])}`}>
                  <SketchPaths shape={{ k: "line", x1: X(n.id), y1: Y(n.id), x2: X(c), y2: Y(c) }} seed={seedOf(key)} opts={{ roughness: 0.8 }} />
                  {label !== undefined && (
                    <>
                      <rect
                        x={mx - Math.max(9, label.length * 3.6 + 5)}
                        y={my - 9}
                        width={Math.max(18, label.length * 7.2 + 10)}
                        height={18}
                        rx={5}
                      />
                      <text x={mx} y={my}>
                        {label}
                      </text>
                    </>
                  )}
                </g>
              );
            }),
          )}
          {(view.links ?? []).map((l, k) => {
            if (!pos.has(l.from) || !pos.has(l.to)) return null;
            const x1 = X(l.from);
            const y1 = Y(l.from);
            const x2 = X(l.to);
            const y2 = Y(l.to);
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            // bow the link slightly so it doesn't sit on top of tree edges
            const cx = (x1 + x2) / 2 + uy * 14;
            const cyy = (y1 + y2) / 2 - ux * 14 - 6;
            const ex = x2 - ux * (TR + 2);
            const ey = y2 - uy * (TR + 2);
            return (
              <g key={`l${k}`} className={`algo-link algo-link-dashed ${toneClass(l.tone ?? "alt")}`}>
                <path d={`M ${x1 + ux * TR} ${y1 + uy * TR} Q ${cx} ${cyy} ${ex} ${ey}`} fill="none" />
                <path className="sk-head" d={vhead(ex, ey, Math.atan2(ey - cyy, ex - cx))} />
              </g>
            );
          })}
          {view.nodes.map((n) => {
            if (!pos.has(n.id)) return null;
            const text = fmt(n.val);
            const names = groups.get(n.id);
            return (
              <g key={n.id} className={`algo-node ${toneClass(view.marks?.[n.id])}`} style={{ transform: `translate(${X(n.id)}px, ${Y(n.id)}px)` }}>
                {halfW > TR ? (
                  <>
                    <rect className="sk-under" x={-halfW} y={-TR} width={halfW * 2} height={TR * 2} rx={TR} />
                    <SketchPaths shape={{ k: "rect", x: -halfW, y: -TR, w: halfW * 2, h: TR * 2 }} seed={seedOf(n.id)} fill />
                  </>
                ) : (
                  <>
                    <circle className="sk-under" r={TR} />
                    <SketchPaths shape={{ k: "ellipse", w: TR * 2 + 1, h: TR * 2 - 1 }} seed={seedOf(n.id)} fill />
                  </>
                )}
                <text fontSize={halfW > TR ? 11.5 : fontFor(text, 15)}>
                  {text}
                </text>
                {names?.map((name, k) => (
                  <g key={name} className={`algo-svg-pointer ${pointerClass(name)}`}>
                    <text
                      x={sideLabels ? halfW + 5 : 0}
                      y={sideLabels ? (k - (names.length - 1) / 2) * 15 : -TR - 12 - k * 17}
                      style={sideLabels ? { textAnchor: "start" } : undefined}
                    >
                      {name}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      {view.pointers && Object.keys(view.pointers).length > 0 && (
        <div className="algo-null-pointers">
          {!nullNames && <span className="algo-pointer-pill" style={{ visibility: "hidden" }}>·</span>}
          {(nullNames ?? []).map((n) => (
            <span key={n} className={`algo-pointer-pill ${pointerClass(n)}`}>
              {n} = None
            </span>
          ))}
        </div>
      )}
    </ViewFrame>
  );
}

// ── graph ────────────────────────────────────────────────────────────────────

const GW = 520;
const GH = 340;
const GR = 21;

export function GraphView({ view }: { view: GraphViewT }) {
  const n = view.nodes.length;
  const pos = new Map(
    view.nodes.map((node, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n);
      const x = node.x !== undefined ? 44 + node.x * (GW - 88) : GW / 2 + (GW / 2 - 56) * Math.cos(a);
      const y = node.y !== undefined ? 40 + node.y * (GH - 80) : GH / 2 + (GH / 2 - 46) * Math.sin(a);
      return [node.id, { x: n === 1 ? GW / 2 : x, y: n === 1 ? GH / 2 : y }];
    }),
  );
  const edgeSet = new Set(view.edges.map((e) => `${e.from}>${e.to}`));
  const groups = groupPointers<string>(view.pointers);

  if (n === 0) {
    return (
      <ViewFrame label={view.label}>
        <span className="algo-empty">空圖</span>
      </ViewFrame>
    );
  }

  return (
    <ViewFrame label={view.label}>
      <div className="algo-scroll-x">
        <svg className="algo-svg" width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`}>
          {view.edges.map((e, k) => {
            const a = pos.get(e.from);
            const b = pos.get(e.to);
            if (!a || !b) return null;
            const key = `${e.from}>${e.to}`;
            const tone = view.edgeMarks?.[key] ?? (view.directed ? undefined : view.edgeMarks?.[`${e.to}>${e.from}`]);
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            // Two opposite directed edges would overlap — bow each one outward
            const bow = view.directed && edgeSet.has(`${e.to}>${e.from}`) ? 16 : 0;
            const mx = (a.x + b.x) / 2 + uy * bow;
            const my = (a.y + b.y) / 2 - ux * bow;
            const sx = a.x + ux * GR;
            const sy = a.y + uy * GR;
            const ex = b.x - ux * (GR + (view.directed ? 3 : 0));
            const ey = b.y - uy * (GR + (view.directed ? 3 : 0));
            const text = e.label === undefined ? undefined : fmt(e.label);
            return (
              <g key={k} className={`algo-edge ${toneClass(tone)}`}>
                <SketchPaths shape={{ k: "path", d: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}` }} seed={seedOf(key)} opts={{ roughness: 0.8 }} />
                {view.directed && <path className="sk-head" d={vhead(ex, ey, Math.atan2(ey - my, ex - mx))} />}
                {text !== undefined && (
                  <>
                    <rect x={mx - 4 - text.length * 3.6} y={my - 9} width={8 + text.length * 7.2} height={18} rx={5} />
                    <text x={mx} y={my}>
                      {text}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          {view.nodes.map((node) => {
            const p = pos.get(node.id)!;
            const text = fmt(node.label ?? node.id);
            const names = groups.get(node.id);
            const pw = Math.min(56, text.length * 3.9 + 8);
            return (
              <g key={node.id} className={`algo-node ${toneClass(view.marks?.[node.id])}`} style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
                {text.length > 4 ? (
                  <>
                    <rect className="sk-under" x={-pw} y={-GR} width={pw * 2} height={GR * 2} rx={GR} />
                    <SketchPaths shape={{ k: "rect", x: -pw, y: -GR, w: pw * 2, h: GR * 2 }} seed={seedOf(node.id)} fill />
                  </>
                ) : (
                  <>
                    <circle className="sk-under" r={GR} />
                    <SketchPaths shape={{ k: "ellipse", w: GR * 2 + 1, h: GR * 2 - 1 }} seed={seedOf(node.id)} fill />
                  </>
                )}
                <text fontSize={text.length > 4 ? 11 : fontFor(text, 15)}>
                  {text}
                </text>
                {names?.map((name, k) => (
                  <g key={name} className={`algo-svg-pointer ${pointerClass(name)}`}>
                    <text y={-GR - 13 - k * 17} textAnchor="middle">
                      {name}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </ViewFrame>
  );
}
