import type { PostMeta } from "../types";

export const LEETCODE_CATEGORY = "Leetcode";

/** Difficulty labels as they appear in front-matter tags, easiest first */
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Tags that describe status or stack rather than an algorithm technique */
const NON_ALGO_TAGS = new Set<string>([
  LEETCODE_CATEGORY,
  "Python",
  "💡",
  "施工中",
  ...DIFFICULTIES,
]);

/** Marks a note the author flagged as unfinished */
export const WIP_TAG = "施工中";

export function isLeetcode(post: PostMeta): boolean {
  return post.categories.includes(LEETCODE_CATEGORY);
}

/**
 * Problem number from "Leetcode#100. Same Tree" or the slug fallback
 * "Leetcode-100-Same-Tree". Returns null when neither parses, so callers can
 * still list the post instead of dropping it.
 */
export function problemNumber(post: PostMeta): number | null {
  for (const s of [post.title, post.slug]) {
    const m = /^leetcode[#\s_-]*(\d+)/i.exec(s);
    if (m) return Number(m[1]);
  }
  return null;
}

/**
 * All difficulties tagged on the post. Usually one, but a post may carry two
 * (e.g. #300 is tagged both medium and hard) — reporting both is truer to the
 * author's marking than silently picking one.
 */
export function difficulties(post: PostMeta): Difficulty[] {
  return DIFFICULTIES.filter((d) =>
    post.tags.some((t) => t.toLowerCase() === d),
  );
}

/** Rank for sorting: easiest first, untagged last */
export function difficultyRank(post: PostMeta): number {
  const d = difficulties(post);
  return d.length ? DIFFICULTIES.indexOf(d[0]) : DIFFICULTIES.length;
}

export function algoTags(post: PostMeta): string[] {
  return post.tags.filter((t) => !NON_ALGO_TAGS.has(t));
}

export function isWip(post: PostMeta): boolean {
  return post.tags.includes(WIP_TAG);
}

export const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  hard: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};
