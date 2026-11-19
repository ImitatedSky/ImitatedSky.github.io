/**
 * Data model for the /algo practice area.
 *
 * A problem's animation is a list of `Frame`s produced by `trace(input)`.
 * Each frame is a full snapshot — views never share mutable state between
 * frames (use the `V.*` helpers in `./trace`, which copy their inputs).
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

/** Semantic highlight colours shared by every view */
export type Tone =
  | "active" // the element being processed right now
  | "compare" // being compared / candidate
  | "good" // settled, matched, part of the answer
  | "bad" // rejected, conflict
  | "muted" // out of consideration
  | "alt" // a second role (e.g. the other pointer / other list)
  | "visited"; // seen earlier

export type Cell = string | number | boolean | null;

export interface ArrayView {
  type: "array";
  label?: string;
  values: Cell[];
  /** Stable identity per element, so swaps / moves animate. Defaults to index. */
  ids?: (string | number)[];
  /** index → tone */
  marks?: Record<number, Tone>;
  /** pointer name → index (−1 and values.length are allowed: "just outside") */
  pointers?: Record<string, number>;
  /** Inclusive index ranges drawn as a bracket (sliding window, subarray…) */
  ranges?: { from: number; to: number; tone?: Tone; label?: string }[];
  /** Draw non-negative numbers as a bar chart */
  bars?: boolean;
  /** Set by the player: pointer rows to reserve so the view keeps one height for the whole trace */
  pointerRows?: number;
  /** bars only: extra amount stacked on top of each bar (e.g. trapped water) */
  fill?: number[];
}

export interface GridView {
  type: "grid";
  label?: string;
  cells: Cell[][];
  /** "r,c" → tone */
  marks?: Record<string, Tone>;
  /** pointer name → [row, col] */
  pointers?: Record<string, [number, number]>;
  rowLabels?: Cell[];
  /** Draw a thicker gap every `rows` rows and `cols` columns (sudoku boxes: [3, 3]) */
  blocks?: [number, number];
  colLabels?: Cell[];
}

export interface MapView {
  type: "map";
  label?: string;
  /** [key, value]; omit the value for a set */
  entries: [Cell, Cell?][];
  /** String(key) → tone */
  marks?: Record<string, Tone>;
}

export interface StackView {
  type: "stack";
  label?: string;
  /** bottom → top */
  items: Cell[];
  marks?: Record<number, Tone>;
}

export interface QueueView {
  type: "queue";
  label?: string;
  /** front → back */
  items: Cell[];
  marks?: Record<number, Tone>;
}

export interface ListNodeSpec {
  id: string;
  val: Cell;
  /** id of the next node; `null` = no next. Omitted = the following node in `nodes`. */
  next?: string | null;
  /** random pointer (LC 138) */
  random?: string | null;
}

export interface ListView {
  type: "list";
  label?: string;
  /** Drawn left → right in this order */
  nodes: ListNodeSpec[];
  marks?: Record<string, Tone>;
  /** pointer name → node id (`null` = points at null) */
  pointers?: Record<string, string | null>;
}

export interface TreeNodeSpec {
  id: string;
  val: Cell;
  /** Binary tree: [left, right] with `null` holes. N-ary / trie: any length. */
  children?: (string | null)[];
}

export interface TreeView {
  type: "tree";
  label?: string;
  nodes: TreeNodeSpec[];
  root: string | null;
  marks?: Record<string, Tone>;
  pointers?: Record<string, string | null>;
  /** "parentId>childId" → tone */
  edgeMarks?: Record<string, Tone>;
  /** "parentId>childId" → label drawn on the edge (trie letters, choices…) */
  edgeLabels?: Record<string, string>;
  /** Extra non-tree links (e.g. `next` pointers in LC 117) */
  links?: { from: string; to: string; tone?: Tone }[];
}

export interface GraphView {
  type: "graph";
  label?: string;
  /** x / y in 0…1; omitted = auto circular layout */
  nodes: { id: string; label?: Cell; x?: number; y?: number }[];
  edges: { from: string; to: string; label?: Cell }[];
  directed?: boolean;
  marks?: Record<string, Tone>;
  /** "from>to" → tone */
  edgeMarks?: Record<string, Tone>;
  pointers?: Record<string, string | null>;
}

export interface IntervalsView {
  type: "intervals";
  label?: string;
  items: { start: number; end: number; label?: string; tone?: Tone }[];
  /** Vertical markers on the number line (e.g. an arrow position) */
  points?: { at: number; label?: string; tone?: Tone }[];
}

export type View =
  | ArrayView
  | GridView
  | MapView
  | StackView
  | QueueView
  | ListView
  | TreeView
  | GraphView
  | IntervalsView;

export interface Frame {
  /** 1-based line number(s) of `code` executing in this step */
  line?: number | number[];
  /** 繁體中文 narration; supports `code` and **bold** */
  note: string;
  views: View[];
  /** Variable watch panel */
  vars?: Record<string, Cell>;
  /** Set on the last frame: the returned answer */
  result?: string;
}

export interface Preset<I> {
  label: string;
  input: I;
  /** Must equal the `result` of the last frame of `trace(input)` */
  expected: string;
}

export interface Problem<I = unknown> {
  /** LeetCode problem number — must exist in catalog.ts */
  id: number;
  /** Own-words 繁中 summary. Paragraphs separated by a blank line; `code` and **bold** allowed. */
  summary: string;
  /** English statement, own words (never LeetCode's text). Same paragraph / markup rules as `summary`. */
  summaryEn?: string;
  /** `note` is 繁中, `noteEn` its English counterpart */
  examples: { input: string; output: string; note?: string; noteEn?: string }[];
  constraints?: string[];
  /** English counterpart of `constraints`, same order */
  constraintsEn?: string[];
  /** The key insight, 1–3 sentences */
  idea: string;
  /** The approach as ordered steps */
  steps: string[];
  pitfalls?: string[];
  complexity: { time: string; space: string };
  /** Python 3 reference solution (LeetCode style) */
  code: string;
  /** Signature-only stub for practice mode */
  starter: string;
  presets: Preset<I>[];
  trace: (input: I) => Frame[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProblem = Problem<any>;

export function defineProblem<I>(p: Problem<I>): AnyProblem {
  return p;
}

// ── sorting ──────────────────────────────────────────────────────────────────

export interface SortAlgo {
  id: string;
  name: string;
  nameZh: string;
  /** One-line tagline */
  tagline: string;
  idea: string;
  steps: string[];
  complexity: { best: string; avg: string; worst: string; space: string; stable: boolean };
  code: string;
  /** Must not mutate `input`. Last frame has `result`. */
  trace: (input: number[]) => Frame[];
  /** Constraint on inputs, e.g. counting/radix need small non-negative ints */
  maxValue?: number;
  /** Input shown when this algorithm is opened (default: a small mixed array) */
  sample?: number[];
}
