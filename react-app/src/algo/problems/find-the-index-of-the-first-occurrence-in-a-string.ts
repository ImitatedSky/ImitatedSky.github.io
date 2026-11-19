import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        for i in range(n - m + 1):      # i：needle 對齊 haystack 的起點
            j = 0
            while j < m and haystack[i + j] == needle[j]:
                j += 1
            if j == m:                  # needle 的每個字元都對上了
                return i
        return -1`;

export default defineProblem<{ haystack: string; needle: string }>({
  id: 28,
  summary:
    "給兩個字串 `haystack` 和 `needle`，找出 `needle` 在 `haystack` 裡**第一次出現的起始索引**。如果 `needle` 不是 `haystack` 的一部分，回傳 `-1`。",
  summaryEn:
    "Given two strings `haystack` and `needle`, find **the starting index of the first place `needle` appears** in `haystack`. If `needle` is not part of `haystack`, return `-1`.",
  examples: [
    { input: 'haystack = "sadbutsad", needle = "sad"', output: "0", note: "索引 0 和 6 都有，回傳最前面的", noteEn: "It appears at index 0 and 6; return the earliest one" },
    { input: 'haystack = "leetcode", needle = "leeto"', output: "-1" },
  ],
  constraints: ["1 ≤ haystack.length, needle.length ≤ 10⁴", "只包含小寫英文字母"],
  constraintsEn: ["1 ≤ haystack.length, needle.length ≤ 10⁴", "Only lowercase English letters"],
  idea:
    "把 `needle` 想成一把尺，貼在 `haystack` 上**從左往右一格一格滑**。每滑到一個位置 `i`，就從頭逐字比對；全部對上就是答案，只要有一個字元不合就放棄這個位置、往右滑一格重來。",
  steps: [
    "起點 `i` 只需要試 `0 ~ n − m`：再往右 `needle` 就會超出 `haystack`。",
    "對每個 `i`，用 `j` 從 0 開始比 `haystack[i + j]` 和 `needle[j]`，相同就 `j += 1`。",
    "如果 `j` 走到 `m`，代表整個 `needle` 都對上，回傳 `i`。",
    "所有起點都失敗就回傳 `-1`。",
  ],
  pitfalls: [
    "起點的上限是 `n - m`（含），所以是 `range(n - m + 1)`；少了 `+ 1` 會漏掉貼齊結尾的那一次。",
    "`needle` 比 `haystack` 長時 `range` 是空的，會直接回傳 `-1`，不需要另外判斷。",
    "失敗後 `i` 只能前進**一格**，不能直接跳過已經比對過的部分（那是 KMP 才能做的事）。",
  ],
  complexity: {
    time: "O(n · m)（這裡選擇最直觀的逐位滑動比對；KMP 可以做到 O(n + m)，但面試通常寫這個版本就夠）",
    space: "O(1)",
  },
  code,
  starter: `class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        `,
  presets: [
    { label: '"mississippi", "issip"', input: { haystack: "mississippi", needle: "issip" }, expected: "4" },
    { label: '"hello", "ll"', input: { haystack: "hello", needle: "ll" }, expected: "2" },
    { label: '"banana", "nab"（找不到）', input: { haystack: "banana", needle: "nab" }, expected: "-1" },
  ],
  trace({ haystack, needle }) {
    const t = tracer();
    const n = haystack.length;
    const m = needle.length;
    const width = Math.max(n, m);
    const NEEDLE = "needle（對齊在位置 i）";

    // needle 畫成和 haystack 一樣寬的一列，前面補空格，這樣上下會對齊，滑動時格子會跟著移動
    const needleView = (i: number, j: number, cur?: Tone) => {
      const values: Cell[] = [];
      const ids: string[] = [];
      const marks: Record<number, Tone> = {};
      for (let p = 0; p < width; p++) {
        const k = p - i;
        if (k >= 0 && k < m) {
          values.push(needle[k]);
          ids.push(`n${k}`);
          if (k < j) marks[p] = "good";
          else if (k === j && cur) marks[p] = cur;
        } else {
          values.push("");
          ids.push(`b${p < i ? p : p - m}`);
        }
      }
      return V.array(NEEDLE, values, { ids, marks, pointers: j < m ? { j: i + j } : {} });
    };
    const hayView = (i: number, j: number, cur?: Tone, windowTone: Tone = "active") => {
      const marks: Record<number, Tone> = {};
      for (let k = 0; k < j; k++) marks[i + k] = "good";
      if (cur && j < m) marks[i + j] = cur;
      const pointers: Record<string, number> = { i };
      if (j < m) pointers["i+j"] = i + j;
      return V.chars("haystack", haystack, {
        marks,
        pointers,
        ranges: [{ from: i, to: i + m - 1, tone: windowTone }],
      });
    };

    if (m > n) {
      t.push({
        line: 3,
        note: `\`n = ${n}\`、\`m = ${m}\`：\`needle\` 比 \`haystack\` 還長。`,
        views: [V.chars("haystack", haystack, { ranges: [] }), needleView(0, 0)],
        vars: { n, m },
      });
      t.push({
        line: [4, 10],
        note: `\`range(n - m + 1) = range(${n - m + 1})\` 是空的，一個起點都不用試，直接回傳 \`-1\`。`,
        views: [V.chars("haystack", haystack, { ranges: [] }), needleView(0, 0)],
        vars: { n, m },
        result: py(-1),
      });
      return t.frames;
    }

    t.push({
      line: 3,
      note: `\`n = ${n}\`、\`m = ${m}\`。把 \`needle\` 貼在 \`haystack\` 下面，起點 \`i\` 只需要試 0 ~ ${n - m}（\`n − m\`），再往右就超出去了。`,
      views: [V.chars("haystack", haystack, { ranges: [] }), needleView(0, 0)],
      vars: { n, m },
    });

    for (let i = 0; i <= n - m; i++) {
      let j = 0;
      t.push({
        line: [4, 5],
        note:
          i === 0
            ? "先把 `needle` 對齊在 `i = 0`，`j = 0` 從 `needle` 的第一個字元開始比。"
            : `\`needle\` 往右滑一格，對齊在 \`i = ${i}\`。\`j\` 歸零，**整個重新比**。`,
        views: [hayView(i, 0), needleView(i, 0)],
        vars: { i, j },
      });

      while (j < m && haystack[i + j] === needle[j]) {
        t.push({
          line: [6, 7],
          note: `\`haystack[${i + j}] = "${haystack[i + j]}"\` 和 \`needle[${j}] = "${needle[j]}"\` 相同，\`j\` 前進到 ${j + 1}${j + 1 < m ? "，繼續比下一個字元" : ""}。`,
          views: [hayView(i, j, "compare"), needleView(i, j, "compare")],
          vars: { i, j },
        });
        j++;
      }

      if (j === m) {
        t.push({
          line: [8, 9],
          note: `\`j == m = ${m}\`，\`needle\` 的每個字元都對上了！因為 \`i\` 是由小到大試的，這就是**第一次**出現的位置，回傳 \`i = ${i}\`。`,
          views: [hayView(i, j, undefined, "good"), needleView(i, j)],
          vars: { i, j },
          result: py(i),
        });
        return t.frames;
      }

      t.push({
        line: [6, 8],
        note:
          `\`haystack[${i + j}] = "${haystack[i + j]}"\` 和 \`needle[${j}] = "${needle[j]}"\` **不同**` +
          (j > 0 ? `，雖然前面已經對上 ${j} 個字元也沒用` : "") +
          `。\`j = ${j}\` 沒走到 \`m\`，起點 ${i} 失敗。`,
        views: [hayView(i, j, "bad", "bad"), needleView(i, j, "bad")],
        vars: { i, j },
      });
    }

    t.push({
      line: 10,
      note: `0 ~ ${n - m} 每個起點都試過了，沒有一個能完整對上，\`needle\` 不在 \`haystack\` 裡，回傳 \`-1\`。`,
      views: [V.chars("haystack", haystack, { ranges: [] }), needleView(n - m, 0)],
      vars: { n, m },
      result: py(-1),
    });
    return t.frames;
  },
});
