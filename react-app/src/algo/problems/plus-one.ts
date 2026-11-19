import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0  # 9 + 1 = 10：這一位歸零，進位繼續往左
        return [1] + digits  # 全部都是 9`;

export default defineProblem<{ digits: number[] }>({
  id: 66,
  summary:
    "一個很大的非負整數被拆成陣列 `digits`，每格放一位數字，最高位在最前面、沒有前導零。把這個整數**加 1**，用同樣的陣列形式回傳。",
  summaryEn:
    "A large non-negative integer is stored digit by digit in the array `digits`, most significant digit first, with no leading zeros. **Add 1** to it and return the result in the same array form.",
  examples: [
    { input: "digits = [1,2,3]", output: "[1,2,4]" },
    { input: "digits = [4,3,2,1]", output: "[4,3,2,2]" },
    { input: "digits = [9]", output: "[1,0]" },
  ],
  constraints: ["1 ≤ digits.length ≤ 100", "0 ≤ digits[i] ≤ 9"],
  constraintsEn: ["1 ≤ digits.length ≤ 100", "0 ≤ digits[i] ≤ 9"],
  idea:
    "加 1 只會從最低位開始往左「傳進位」，而且進位只有在遇到 **9** 時才會繼續傳。所以從右往左找：遇到 9 就把它變 0、繼續往左；遇到第一個不是 9 的數字，加 1 之後就可以**直接收工**。如果整串都是 9，全部歸零後在最前面補一個 1。",
  steps: [
    "`i` 從最後一位往前走。",
    "`digits[i] < 9`：加 1 後不會再進位，直接回傳。",
    "否則這一位是 9：設成 0，進位帶到左邊一位。",
    "迴圈走完都沒回傳，代表原本全是 9，答案是 `[1] + digits`（此時 `digits` 全是 0）。",
  ],
  pitfalls: [
    "別把陣列轉成整數再加 1 —— 在有整數上限的語言裡 100 位數一定溢位，這題考的就是模擬進位。",
    "全是 9 的情況（`[9,9,9]` → `[1,0,0,0]`）陣列會變長，要記得處理。",
  ],
  complexity: { time: "O(n)", space: "O(1)（全是 9 時需要 O(n) 建新陣列）" },
  code,
  starter: `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        `,
  presets: [
    { label: "[1,2,9,9]", input: { digits: [1, 2, 9, 9] }, expected: "[1, 3, 0, 0]" },
    { label: "[9,9,9]", input: { digits: [9, 9, 9] }, expected: "[1, 0, 0, 0]" },
    { label: "[4,3,2,1]", input: { digits: [4, 3, 2, 1] }, expected: "[4, 3, 2, 2]" },
  ],
  trace({ digits: input }) {
    const t = tracer();
    const digits = [...input];
    const n = digits.length;
    const ids = digits.map((_, k) => `d${k}`);
    const zeroed = (from: number) => {
      const m: Record<number, Tone> = {};
      for (let k = from; k < n; k++) m[k] = "visited";
      return m;
    };

    t.push({
      line: 3,
      note: `要把 \`${input.join("")}\` 加 1。加法從**最低位**（最右邊）開始，所以 \`i\` 從最後一格往左走。`,
      views: [V.array("digits", digits, { ids, pointers: { i: n - 1 } })],
      vars: { i: n - 1 },
    });

    for (let i = n - 1; i >= 0; i--) {
      if (digits[i] < 9) {
        const old = digits[i];
        t.push({
          line: [3, 4],
          note: `\`digits[${i}] = ${old}\` 小於 9，加 1 之後不會超過 9，**進位到這裡就停了**。`,
          views: [V.array("digits", digits, { ids, pointers: { i }, marks: { ...zeroed(i + 1), [i]: "compare" } })],
          vars: { i, "digits[i]": old },
        });
        digits[i] += 1;
        t.push({
          line: [5, 6],
          note: `把它改成 \`${old} + 1 = ${digits[i]}\`。左邊更高位的數字完全不受影響，直接回傳。`,
          views: [V.array("digits", digits, { ids, pointers: { i }, marks: { ...zeroed(i + 1), [i]: "good" } })],
          vars: { i, "digits[i]": digits[i] },
          result: py(digits),
        });
        return t.frames;
      }

      t.push({
        line: [3, 4],
        note: `\`digits[${i}] = 9\`，不小於 9：加 1 會變成 10，這一位放不下。`,
        views: [V.array("digits", digits, { ids, pointers: { i }, marks: { ...zeroed(i + 1), [i]: "compare" } })],
        vars: { i, "digits[i]": 9 },
      });
      digits[i] = 0;
      t.push({
        line: 7,
        note:
          `這一位歸零，**進位 1 帶到左邊**` +
          (i > 0 ? `，交給 \`digits[${i - 1}]\` 處理。` : "—— 但左邊已經沒有位數了。"),
        views: [V.array("digits", digits, { ids, pointers: { i }, marks: { ...zeroed(i + 1), [i]: "active" } })],
        vars: { i, "digits[i]": 0 },
      });
    }

    const out = [1, ...digits];
    const marks: Record<number, Tone> = { 0: "good" };
    for (let k = 1; k <= n; k++) marks[k] = "visited";
    t.push({
      line: 8,
      note: `迴圈走完都沒有回傳，代表原本每一位都是 9，現在全變成 0，還剩一個進位沒地方放。在最前面補上 \`1\`，位數多一位。`,
      views: [V.array("digits", out, { ids: ["new", ...ids], marks })],
      result: py(out),
    });
    return t.frames;
  },
});
