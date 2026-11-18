import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        words = s.split()
        if len(pattern) != len(words):
            return False
        p2w, w2p = {}, {}  # 字母 -> 單字、單字 -> 字母
        for p, w in zip(pattern, words):
            if p in p2w and p2w[p] != w:
                return False
            if w in w2p and w2p[w] != p:
                return False
            p2w[p] = w
            w2p[w] = p
        return True`;

export default defineProblem<{ pattern: string; s: string }>({
  id: 290,
  summary:
    "給一個由小寫字母組成的 `pattern`，和一個用空白分隔單字的字串 `s`。判斷 `s` 是否**遵循同樣的規律**。\n\n也就是 `pattern` 的每個字母和 `s` 的每個單字之間要是**一對一**的對應：同一個字母永遠配同一個單字，不同的字母不能配到同一個單字。",
  examples: [
    { input: 'pattern = "abba", s = "dog cat cat dog"', output: "true" },
    { input: 'pattern = "abba", s = "dog cat cat fish"', output: "false" },
    { input: 'pattern = "aaaa", s = "dog cat cat dog"', output: "false" },
  ],
  constraints: ["1 ≤ pattern.length ≤ 300", "s 的單字之間恰好一個空白，沒有前後多餘的空白"],
  idea:
    "和「同構字串」是同一題，只是其中一邊從字元換成了單字。先把 `s` 切成單字、確認數量和 `pattern` 一樣長，再用**兩張雜湊表**（字母→單字、單字→字母）檢查雙向的一對一對應。",
  steps: [
    "`words = s.split()` 把字串切成單字。",
    "字母數和單字數不同，直接回傳 `False`。",
    "同時走訪字母 `p` 和單字 `w`：`p` 已有對應卻不是 `w`，或 `w` 已有對應卻不是 `p`，都是衝突。",
    "沒衝突就把 `p ↔ w` 記進兩張表，走完回傳 `True`。",
  ],
  pitfalls: [
    "**忘記檢查長度**：`zip` 遇到長度不同會默默在短的那邊停下來，`\"aaa\"` 配 `\"dog dog\"` 會被誤判成 `True`。",
    "只用一張表（字母→單字）會漏掉 `\"abba\"` 配 `\"dog dog dog dog\"` 這種兩個字母搶同一個單字的情況。",
  ],
  complexity: { time: "O(n + m)（m 為 s 的長度）", space: "O(n + m)" },
  code,
  starter: `class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        `,
  presets: [
    { label: '"abba" / dog cat cat dog', input: { pattern: "abba", s: "dog cat cat dog" }, expected: "True" },
    { label: '"abba" / dog dog dog dog', input: { pattern: "abba", s: "dog dog dog dog" }, expected: "False" },
    { label: '"aaa" / dog dog（長度不同）', input: { pattern: "aaa", s: "dog dog" }, expected: "False" },
  ],
  trace({ pattern, s }) {
    const t = tracer();
    const words = s.split(/\s+/).filter(Boolean);
    const p2w = new Map<string, string>();
    const w2p = new Map<string, string>();
    const done: Record<number, Tone> = {};

    const views = (
      i: number | null,
      cur: Tone | null,
      m1: Record<string, Tone> = {},
      m2: Record<string, Tone> = {},
    ) => {
      const marks = i !== null && cur ? { ...done, [i]: cur } : { ...done };
      const pointers: Record<string, number> = i !== null ? { i } : {};
      return [
        V.chars("pattern", pattern, { pointers, marks }),
        V.array("words", words, { pointers, marks }),
        V.map("p2w（字母 → 單字）", p2w, { marks: m1 }),
        V.map("w2p（單字 → 字母）", w2p, { marks: m2 }),
      ];
    };

    t.push({
      line: 3,
      note: `先用 \`split()\` 把 \`"${s}"\` 依空白切成 ${words.length} 個單字，這樣就能和 \`pattern\` 的字母一格對一格比較。`,
      views: views(null, null),
      vars: { "len(pattern)": pattern.length, "len(words)": words.length },
    });

    if (pattern.length !== words.length) {
      t.push({
        line: [4, 5],
        note: `\`pattern\` 有 ${pattern.length} 個字母，卻只有 ${words.length} 個單字 —— 數量不同就不可能一對一，直接回傳 \`False\`。（不先檢查的話，\`zip\` 會在短的那邊悄悄停下來。）`,
        views: views(null, null),
        vars: { "len(pattern)": pattern.length, "len(words)": words.length },
        result: py(false),
      });
      return t.frames;
    }

    t.push({
      line: [4, 6],
      note: `數量相同（都是 ${words.length}）。準備兩張對照表：\`p2w\` 記每個字母配哪個單字，\`w2p\` 記每個單字配哪個字母。`,
      views: views(null, null),
      vars: { "len(pattern)": pattern.length, "len(words)": words.length },
    });

    for (let i = 0; i < words.length; i++) {
      const p = pattern[i];
      const w = words[i];
      const vars = { i, p, w };

      if (p2w.has(p) && p2w.get(p) !== w) {
        t.push({
          line: [7, 8, 9],
          note: `位置 ${i}：字母 \`${p}\` 配單字 \`${w}\`。但 \`p2w\` 記得 \`${p}\` 之前配的是 \`${p2w.get(p)}\` —— 同一個字母不能配兩個不同的單字，衝突！`,
          views: views(i, "bad", { [p]: "bad" }),
          vars,
          result: py(false),
        });
        return t.frames;
      }
      if (w2p.has(w) && w2p.get(w) !== p) {
        t.push({
          line: [7, 8, 10, 11],
          note: `位置 ${i}：字母 \`${p}\` 配單字 \`${w}\`。\`p2w\` 沒問題，但 \`w2p\` 記得 \`${w}\` 已經配給 \`${w2p.get(w)}\` 了 —— 兩個不同的字母不能搶同一個單字，衝突！`,
          views: views(i, "bad", {}, { [w]: "bad" }),
          vars,
          result: py(false),
        });
        return t.frames;
      }

      const known = p2w.has(p);
      t.push({
        line: [7, 8, 10],
        note: known
          ? `位置 ${i}：字母 \`${p}\` 配單字 \`${w}\`。兩張表都查得到，而且和之前的紀錄一致，沒有衝突。`
          : `位置 ${i}：字母 \`${p}\` 配單字 \`${w}\`。\`${p}\` 是新字母，\`${w}\` 也是新單字，兩個方向都沒有衝突。`,
        views: views(i, "active", known ? { [p]: "compare" } : {}, known ? { [w]: "compare" } : {}),
        vars,
      });

      p2w.set(p, w);
      w2p.set(w, p);
      done[i] = "good";
      t.push({
        line: [12, 13],
        note: known
          ? "配對沒有變，照樣寫回兩張表。"
          : `記下這組配對：\`p2w["${p}"] = "${w}"\`、\`w2p["${w}"] = "${p}"\`。`,
        views: views(i, "good", { [p]: "active" }, { [w]: "active" }),
        vars,
      });
    }

    t.push({
      line: 14,
      note: "全部走完都沒有衝突，字母和單字是一對一對應，符合規律。",
      views: views(null, null),
      result: py(true),
    });
    return t.frames;
  },
});
