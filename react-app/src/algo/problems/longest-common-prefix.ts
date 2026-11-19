import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        first = strs[0]
        for i in range(len(first)):        # 一欄一欄往右檢查
            for s in strs[1:]:
                # 這個字串已經用完，或這一欄的字元不一樣
                if i == len(s) or s[i] != first[i]:
                    return first[:i]
        return first`;

export default defineProblem<{ strs: string[] }>({
  id: 14,
  summary:
    "給一個字串陣列 `strs`，找出**所有字串共同的最長開頭**（前綴）。如果連第一個字元都不一樣，就回傳空字串。",
  summaryEn:
    "Given an array of strings `strs`, find **the longest prefix shared by every string**. If even the first characters differ, return an empty string.",
  examples: [
    { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
    { input: 'strs = ["dog","racecar","car"]', output: '""' },
  ],
  constraints: ["1 ≤ strs.length ≤ 200", "0 ≤ strs[i].length ≤ 200", "只包含小寫英文字母"],
  constraintsEn: ["1 ≤ strs.length ≤ 200", "0 ≤ strs[i].length ≤ 200", "Only lowercase English letters"],
  idea:
    "把字串**一列一列疊起來**，共同前綴就是「從左邊數起，整欄字元都相同」的那幾欄。所以用**直向掃描**：拿第一個字串當基準，一欄一欄往右比，只要有任何一個字串在這一欄不同（或已經沒有字元），前面那幾欄就是答案。",
  steps: [
    "拿 `strs[0]` 當基準 `first`。",
    "對 `first` 的每個位置 `i`，檢查其他每個字串的第 `i` 個字元。",
    "如果某個字串長度剛好只有 `i`（沒有第 `i` 個字元），或 `s[i] != first[i]` → 回傳 `first[:i]`。",
    "整個 `first` 都比完還沒出事，代表 `first` 本身就是共同前綴。",
  ],
  pitfalls: [
    "先檢查 `i == len(s)` 再讀 `s[i]`，否則較短的字串會超出範圍。",
    "共同前綴不會比最短的字串長，但不需要先找最短的 —— 直向掃描碰到字串結尾自然會停。",
  ],
  complexity: { time: "O(S)，S 為所有字元總數（最壞情況）", space: "O(1)" },
  code,
  starter: `class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        `,
  presets: [
    {
      label: '["interview","internet","interval","into"]',
      input: { strs: ["interview", "internet", "interval", "into"] },
      expected: '"int"',
    },
    { label: '["apple","app","apply"]', input: { strs: ["apple", "app", "apply"] }, expected: '"app"' },
    { label: '["cat","dog","bird"]', input: { strs: ["cat", "dog", "bird"] }, expected: '""' },
  ],
  trace({ strs }) {
    const t = tracer();
    const first = strs[0];
    const cols = Math.max(1, ...strs.map((s) => s.length));
    const cells: Cell[][] = strs.map((s) => Array.from({ length: cols }, (_, c) => s[c] ?? ""));
    const rowLabels = strs.map((_, r) => (r === 0 ? "first" : `strs[${r}]`));
    const colLabels = Array.from({ length: cols }, (_, c) => c);
    const LABEL = "strs（一列一個字串）";

    // 已確認整欄相同的欄位
    const colMarks = (upto: number, tone: Tone = "good") => {
      const m: Record<string, Tone> = {};
      for (let c = 0; c < upto; c++) for (let r = 0; r < strs.length; r++) m[`${r},${c}`] = tone;
      return m;
    };
    const grid = (marks: Record<string, Tone>, pointers: Record<string, [number, number]> = {}) =>
      V.grid(LABEL, cells, { marks, pointers, rowLabels, colLabels });

    t.push({
      line: 3,
      note: `把字串一列一列疊起來，拿第一個 \`"${first}"\` 當基準 \`first\`。共同前綴就是從左邊數起「整欄都一樣」的部分。`,
      views: [grid({})],
      vars: { first: py(first) },
    });

    for (let i = 0; i < first.length; i++) {
      const m = colMarks(i);
      m[`0,${i}`] = "active";
      t.push({
        line: 4,
        note: `看第 ${i} 欄：基準字元是 \`first[${i}] = "${first[i]}"\`，其他每個字串的這一格都要跟它一樣才行。`,
        views: [grid(m)],
        vars: { i, 前綴: py(first.slice(0, i)) },
      });

      for (let r = 1; r < strs.length; r++) {
        const s = strs[r];
        const ended = i === s.length;
        const ok = !ended && s[i] === first[i];
        for (let k = 1; k < r; k++) m[`${k},${i}`] = "good";
        m[`${r},${i}`] = ok ? "compare" : "bad";

        if (ok) {
          t.push({
            line: [5, 7],
            note: `\`strs[${r}][${i}] = "${s[i]}"\`，和基準的 \`"${first[i]}"\` 相同，這個字串過關。`,
            views: [grid(m, { s: [r, i] })],
            vars: { i, s: py(s), 前綴: py(first.slice(0, i)) },
          });
          continue;
        }

        const ans = first.slice(0, i);
        t.push({
          line: [5, 7],
          note: ended
            ? `\`"${s}"\` 的長度只有 ${s.length}，根本沒有第 ${i} 個字元（\`i == len(s)\`）。共同前綴不可能比它更長。`
            : `\`strs[${r}][${i}] = "${s[i]}"\`，但基準是 \`"${first[i]}"\`，**不一樣**！第 ${i} 欄不屬於共同前綴。`,
          views: [grid(m, { s: [r, i] })],
          vars: { i, s: py(s), 前綴: py(ans) },
        });
        const done = colMarks(i);
        for (let k = 0; k < strs.length; k++) done[`${k},${i}`] = "bad";
        t.push({
          line: 8,
          note:
            i === 0
              ? "連第 0 欄都不一致，沒有任何共同前綴，回傳空字串 `first[:0]`。"
              : `前面 ${i} 欄都整欄相同，所以答案是 \`first[:${i}] = "${ans}"\`。`,
          views: [grid(done)],
          vars: { i, 前綴: py(ans) },
          result: py(ans),
        });
        return t.frames;
      }
    }

    t.push({
      line: 9,
      note: `\`first\` 的每一欄都通過檢查，所以整個 \`"${first}"\` 就是共同前綴。`,
      views: [grid(colMarks(first.length))],
      vars: { 前綴: py(first) },
      result: py(first),
    });
    return t.frames;
  },
});
