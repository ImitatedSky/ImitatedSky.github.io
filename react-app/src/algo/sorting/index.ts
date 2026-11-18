import type { SortAlgo } from "../types";

const modules = import.meta.glob<{ default: SortAlgo }>("./algos/*.ts", { eager: true });

/** Display order: simple → efficient → non-comparison */
export const SORT_ORDER = [
  "bubble",
  "selection",
  "insertion",
  "shell",
  "merge",
  "quick",
  "heap",
  "counting",
  "bucket",
  "radix",
];

const all = Object.values(modules).map((m) => m.default);

export const SORTS: SortAlgo[] = [
  ...SORT_ORDER.flatMap((id) => all.filter((a) => a.id === id)),
  ...all.filter((a) => !SORT_ORDER.includes(a.id)),
];

export const SORT_BY_ID = new Map(SORTS.map((a) => [a.id, a]));
