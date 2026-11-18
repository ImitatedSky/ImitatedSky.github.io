import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        i = j = 0
        while i < len(s) and j < len(t):
            if s[i] == t[j]:
                i += 1  # 配對成功，s 換下一個字元
            j += 1      # t 不管有沒有配對都往前
        return i == len(s)`;

export default defineProblem<{ s: string; t: string }>({
  id: 392,
  summary:
    "給兩個字串 `s` 和 `t`，判斷 `s` 是不是 `t` 的**子序列**。\n\n子序列的意思是：從 `t` 裡刪掉若干個字元（也可以不刪），剩下的字元**維持原本的先後順序**，剛好拼成 `s`。",
  examples: [
    { input: 's = "abc", t = "ahbgdc"', output: "true" },
    { input: 's = "axc", t = "ahbgdc"', output: "false" },
  ],
  constraints: ["0 ≤ s.length ≤ 100", "0 ≤ t.length ≤ 10⁴", "兩個字串都只有小寫英文字母"],
  idea:
    "**貪心 + 雙指標**：`s` 目前要找的字元，在 `t` 裡越早配到越好 —— 越早配到，後面留給剩下字元的空間就越多，絕對不會吃虧。所以只要由左到右掃 `t`，遇到相同的字元就配對。",
  steps: [
    "`i` 指向 `s` 中「下一個要找的字元」，`j` 用來掃描 `t`。",
    "如果 `s[i] == t[j]`，配對成功，`i` 前進一格。",
    "不管有沒有配對，`j` 都前進一格（`t` 的每個字元只能用一次）。",
    "迴圈結束後，`i == len(s)` 代表 `s` 的每個字元都依序找到了。",
  ],
  pitfalls: [
    "`s` 是空字串時一定是子序列，`i == len(s)` 一開始就成立，不需要特判。",
    "最後要檢查的是 `i` 有沒有走完 `s`，而不是 `j` 有沒有走完 `t`。",
  ],
  complexity: { time: "O(n + m)", space: "O(1)" },
  code,
  starter: `class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        `,
  presets: [
    { label: '"abc", "ahbgdc"', input: { s: "abc", t: "ahbgdc" }, expected: "True" },
    { label: '"axc", "ahbgdc"', input: { s: "axc", t: "ahbgdc" }, expected: "False" },
    { label: '"ace", "abcde"', input: { s: "ace", t: "abcde" }, expected: "True" },
  ],
  trace({ s, t }) {
    const tr = tracer();
    let i = 0;
    let j = 0;
    const sMarks: Record<number, Tone> = {};
    const tMarks: Record<number, Tone> = {};
    const views = (sExtra: Record<number, Tone> = {}, tExtra: Record<number, Tone> = {}) => [
      V.chars("s", s, { pointers: { i }, marks: { ...sMarks, ...sExtra } }),
      V.chars("t", t, { pointers: { j }, marks: { ...tMarks, ...tExtra } }),
    ];

    tr.push({
      line: 3,
      note: "`i` 指著 `s` 裡下一個要找的字元，`j` 負責由左到右掃描 `t`。",
      views: views(),
      vars: { i, j },
    });

    while (i < s.length && j < t.length) {
      if (s[i] === t[j]) {
        tr.push({
          line: [5, 6, 7],
          note: `\`s[${i}] = ${s[i]}\` 和 \`t[${j}] = ${t[j]}\` 相同，配對成功！越早配到越好，所以直接收下，\`i\` 和 \`j\` 都前進。`,
          views: views({ [i]: "good" }, { [j]: "good" }),
          vars: { i, j },
        });
        sMarks[i] = "good";
        tMarks[j] = "good";
        i++;
      } else {
        tr.push({
          line: [5, 7],
          note: `要找 \`${s[i]}\`，但 \`t[${j}] = ${t[j]}\` 不是。這個字元等於被「刪掉」，只有 \`j\` 前進，\`i\` 留在原地繼續等。`,
          views: views({ [i]: "compare" }, { [j]: "bad" }),
          vars: { i, j },
        });
        tMarks[j] = "muted";
      }
      j++;
    }

    const ok = i === s.length;
    for (let k = j; k < t.length; k++) tMarks[k] = "muted";
    tr.push({
      line: [4, 8],
      note: ok
        ? `\`i = ${i}\` 已經等於 \`len(s)\`，\`s\` 的每個字元都依序在 \`t\` 裡找到了，是子序列。`
        : `\`t\` 已經掃完，但 \`i = ${i}\` 還沒走到 \`len(s) = ${s.length}\`：\`${s[i]}\` 找不到可以配對的位置，不是子序列。`,
      views: views(ok ? {} : { [i]: "bad" }),
      vars: { i, j },
      result: py(ok),
    });
    return tr.frames;
  },
});
