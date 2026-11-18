/**
 * Helpers for writing `trace()` functions.
 *
 * Every `V.*` constructor deep-copies what it is given, so a trace can keep
 * mutating its working arrays after pushing a frame.
 */
import type {
  ArrayView,
  Cell,
  Frame,
  GraphView,
  GridView,
  IntervalsView,
  ListNodeSpec,
  ListView,
  MapView,
  QueueView,
  StackView,
  TreeNodeSpec,
  TreeView,
} from "./types";

type Opts<T, K extends keyof T> = Partial<Omit<T, "type" | K>>;

const clone = <T>(x: T): T => structuredClone(x);

export const V = {
  array(label: string, values: Cell[], o: Opts<ArrayView, "values" | "label"> = {}): ArrayView {
    return clone({ type: "array", label, values, ...o });
  },
  /** Bar-chart array (heights, sorting…) */
  bars(label: string, values: number[], o: Opts<ArrayView, "values" | "label" | "bars"> = {}): ArrayView {
    return clone({ type: "array", label, values, bars: true, ...o });
  },
  /** A string shown as an array of characters */
  chars(label: string, s: string, o: Opts<ArrayView, "values" | "label"> = {}): ArrayView {
    return clone({ type: "array", label, values: [...s], ...o });
  },
  grid(label: string, cells: Cell[][], o: Opts<GridView, "cells" | "label"> = {}): GridView {
    return clone({ type: "grid", label, cells, ...o });
  },
  map(
    label: string,
    entries: Map<Cell, Cell> | Record<string, Cell> | [Cell, Cell?][],
    o: Opts<MapView, "entries" | "label"> = {},
  ): MapView {
    const list: [Cell, Cell?][] =
      entries instanceof Map
        ? [...entries.entries()]
        : Array.isArray(entries)
          ? entries
          : Object.entries(entries);
    return clone({ type: "map", label, entries: list, ...o });
  },
  set(label: string, items: Iterable<Cell>, o: Opts<MapView, "entries" | "label"> = {}): MapView {
    return clone({ type: "map", label, entries: [...items].map((k) => [k] as [Cell]), ...o });
  },
  stack(label: string, items: Cell[], o: Opts<StackView, "items" | "label"> = {}): StackView {
    return clone({ type: "stack", label, items, ...o });
  },
  queue(label: string, items: Cell[], o: Opts<QueueView, "items" | "label"> = {}): QueueView {
    return clone({ type: "queue", label, items, ...o });
  },
  /**
   * Linked list. Pass plain values for a simple chain (ids become "0","1",…),
   * or full node specs when `next` pointers are being rewired.
   */
  list(label: string, nodes: Cell[] | ListNodeSpec[], o: Opts<ListView, "nodes" | "label"> = {}): ListView {
    const specs: ListNodeSpec[] = nodes.map((n, i) =>
      n !== null && typeof n === "object" ? n : { id: String(i), val: n },
    );
    return clone({ type: "list", label, nodes: specs, ...o });
  },
  tree(label: string, t: { nodes: TreeNodeSpec[]; root: string | null }, o: Opts<TreeView, "nodes" | "root" | "label"> = {}): TreeView {
    return clone({ type: "tree", label, nodes: t.nodes, root: t.root, ...o });
  },
  graph(label: string, g: Pick<GraphView, "nodes" | "edges">, o: Opts<GraphView, "nodes" | "edges" | "label"> = {}): GraphView {
    return clone({ type: "graph", label, nodes: g.nodes, edges: g.edges, ...o });
  },
  intervals(label: string, items: IntervalsView["items"], o: Opts<IntervalsView, "items" | "label"> = {}): IntervalsView {
    return clone({ type: "intervals", label, items, ...o });
  },
};

/** Collects frames. `t.push({...})` then `return t.frames`. */
export function tracer() {
  const frames: Frame[] = [];
  return {
    frames,
    push(f: Frame) {
      frames.push(f);
    },
  };
}

// ── binary tree helpers ──────────────────────────────────────────────────────

export interface BTNode {
  id: string;
  val: number;
  left: BTNode | null;
  right: BTNode | null;
}

/**
 * Build a binary tree from LeetCode's level-order array
 * (`[3,9,20,null,null,15,7]`). Node ids are `n<index in the array>`.
 */
export function buildTree(level: (number | null)[]): BTNode | null {
  if (level.length === 0 || level[0] === null) return null;
  const root: BTNode = { id: "n0", val: level[0], left: null, right: null };
  const q: BTNode[] = [root];
  let i = 1;
  while (q.length && i < level.length) {
    const node = q.shift()!;
    for (const side of ["left", "right"] as const) {
      if (i >= level.length) break;
      const v = level[i];
      if (v !== null) {
        const child: BTNode = { id: `n${i}`, val: v, left: null, right: null };
        node[side] = child;
        q.push(child);
      }
      i++;
    }
  }
  return root;
}

/** Convert a BTNode tree into the `{nodes, root}` shape `V.tree` takes */
export function treeSpec(root: BTNode | null): { nodes: TreeNodeSpec[]; root: string | null } {
  const nodes: TreeNodeSpec[] = [];
  const seen = new Set<string>();
  const walk = (n: BTNode | null) => {
    if (!n || seen.has(n.id)) return;
    seen.add(n.id);
    nodes.push({
      id: n.id,
      val: n.val,
      children: n.left || n.right ? [n.left?.id ?? null, n.right?.id ?? null] : [],
    });
    walk(n.left);
    walk(n.right);
  };
  walk(root);
  return { nodes, root: root?.id ?? null };
}

/** Shorthand: level-order array → `{nodes, root}` */
export function treeFromLevel(level: (number | null)[]) {
  return treeSpec(buildTree(level));
}

/** Heap stored in an array → tree spec (ids are `h<index>`) */
export function heapSpec(heap: Cell[]): { nodes: TreeNodeSpec[]; root: string | null } {
  const nodes: TreeNodeSpec[] = heap.map((val, i) => {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    const children: (string | null)[] = [];
    if (l < heap.length) children.push(`h${l}`, r < heap.length ? `h${r}` : null);
    return { id: `h${i}`, val, children };
  });
  return { nodes, root: heap.length ? "h0" : null };
}

/** Format a value the way Python would print it (for `result` / `expected`) */
export function py(x: unknown): string {
  if (x === null || x === undefined) return "None";
  if (x === true) return "True";
  if (x === false) return "False";
  if (typeof x === "string") return `"${x}"`;
  if (Array.isArray(x)) return `[${x.map(py).join(", ")}]`;
  return String(x);
}
