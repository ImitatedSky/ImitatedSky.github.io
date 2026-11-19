import { defineProblem } from "../types";
import type { Cell, Tone, View } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        shift = 0
        while left < right:
            left >>= 1   # 兩邊一起砍掉最低位
            right >>= 1
            shift += 1
        return left << shift  # 共同前綴，後面補回 0`;

const MAIN = "left 與 right（右邊是最低位）";
const RANGE = "[left, right] 範圍內的每個數";

export default defineProblem<{ left: number; right: number }>({
  id: 201,
  summary:
    "給兩個整數 `left ≤ right`，把閉區間 `[left, right]` 裡**所有整數全部做位元 AND**，回傳結果。\n\n範圍可能很大（到 2³¹ − 1），不能真的一個一個 AND 過去。",
  summaryEn:
    "Given two integers `left ≤ right`, take the **bitwise AND of every integer** in the closed range `[left, right]` and return the result.\n\nThe range can be huge (up to 2³¹ − 1), so you can't actually AND them one by one.",
  examples: [
    { input: "left = 5, right = 7", output: "4", note: "101 & 110 & 111 = 100", noteEn: "101 & 110 & 111 = 100" },
    { input: "left = 0, right = 0", output: "0" },
    { input: "left = 1, right = 2147483647", output: "0" },
  ],
  constraints: ["0 ≤ left ≤ right ≤ 2³¹ − 1"],
  constraintsEn: ["0 ≤ left ≤ right ≤ 2³¹ − 1"],
  idea:
    "答案就是 `left` 和 `right` 的**二進位共同前綴**，後面全部補 0。AND 的結果某一位要是 1，範圍內每個數那一位都得是 1；但只要 `left < right`，數字連續遞增的過程中最低位一定同時出現過 0 和 1，所以那一位必為 0。把兩邊一起右移砍掉這一位，同樣的道理可以重複用，直到兩邊相等 —— 剩下的就是從頭到尾沒變過的前綴。",
  steps: [
    "`shift = 0`，記錄砍掉了幾位。",
    "只要 `left < right`：兩邊都右移一位，`shift += 1`。",
    "`left == right` 時，剩下的值就是共同前綴。",
    "把前綴左移 `shift` 位補回 0，就是答案。",
  ],
  pitfalls: [
    "直接從 `left` AND 到 `right` 會超時（最多 2³¹ 個數）。",
    "別忘了最後要 `<< shift` 把位置移回去。",
    "另一種等價寫法：`while left < right: right &= right - 1`，不斷消掉 `right` 最低位的 1，最後回傳 `right`。",
  ],
  complexity: { time: "O(log n)（最多 32 次）", space: "O(1)" },
  code,
  starter: `class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        `,
  presets: [
    { label: "5, 7", input: { left: 5, right: 7 }, expected: "4" },
    { label: "26, 30", input: { left: 26, right: 30 }, expected: "24" },
    { label: "3, 4", input: { left: 3, right: 4 }, expected: "0" },
  ],
  trace({ left: L, right: R }) {
    const t = tracer();
    const W = Math.max(4, R.toString(2).length);
    const bits = (x: number): Cell[] => Array.from({ length: W }, (_, k) => Math.floor(x / 2 ** (W - 1 - k)) % 2);
    const blank: Cell[] = Array.from({ length: W }, () => "");
    const colLabels = Array.from({ length: W }, (_, k) => W - 1 - k);
    const bin = (x: number, w: number) => (w <= 0 ? "" : x.toString(2).padStart(w, "0"));
    const showRange = R - L + 1 <= 8;
    const rangeNums = showRange ? Array.from({ length: R - L + 1 }, (_, k) => L + k) : [];

    let left = L;
    let right = R;
    let shift = 0;

    const views = (o: { chopping?: boolean; done?: boolean }): View[] => {
      const marks: Record<string, Tone> = {};
      const rMarks: Record<string, Tone> = {};
      const firstCut = W - shift; // 這一欄（含）往右都已經被砍掉
      for (let c = firstCut; c < W; c++) {
        const tone: Tone = o.chopping && c === firstCut ? "bad" : "muted";
        marks[`0,${c}`] = tone;
        marks[`1,${c}`] = tone;
        if (o.done) marks[`2,${c}`] = "muted";
        rangeNums.forEach((_, r) => (rMarks[`${r},${c}`] = "muted"));
        if (o.done) rMarks[`${rangeNums.length},${c}`] = "muted";
      }
      if (o.chopping) {
        // 被砍的那一欄：範圍內只要有一個 0，AND 起來就是 0
        rangeNums.forEach((x, r) => {
          rMarks[`${r},${firstCut}`] = Math.floor(x / 2 ** (shift - 1)) % 2 === 0 ? "bad" : "compare";
        });
      }
      if (o.done) {
        for (let c = 0; c < firstCut; c++) {
          marks[`0,${c}`] = "good";
          marks[`1,${c}`] = "good";
          marks[`2,${c}`] = "good";
          rangeNums.forEach((_, r) => (rMarks[`${r},${c}`] = "good"));
          rMarks[`${rangeNums.length},${c}`] = "good";
        }
      } else if (!o.chopping) {
        // 還沒砍的部分：標出兩邊不同的位元
        const lb = bits(L);
        const rb = bits(R);
        for (let c = 0; c < firstCut; c++) {
          if (lb[c] !== rb[c]) {
            marks[`0,${c}`] = "compare";
            marks[`1,${c}`] = "compare";
          }
        }
      }
      const answer = left * 2 ** shift;
      const out: View[] = [
        V.grid(MAIN, [bits(L), bits(R), o.done ? bits(answer) : blank], {
          rowLabels: [
            shift ? `left >> ${shift} = ${left}` : `left = ${left}`,
            shift ? `right >> ${shift} = ${right}` : `right = ${right}`,
            o.done ? `答案 = ${answer}` : "答案",
          ],
          colLabels,
          marks,
        }),
      ];
      if (showRange) {
        const andAll = rangeNums.reduce<number[]>(
          (acc, x) => acc.map((b, c) => (b && bits(x)[c] === 1 ? 1 : 0)),
          Array.from({ length: W }, () => 1),
        );
        out.push(
          V.grid(RANGE, [...rangeNums.map(bits), o.done ? andAll : blank], {
            rowLabels: [...rangeNums.map(String), "全部 AND"],
            colLabels,
            marks: rMarks,
          }),
        );
      }
      return out;
    };

    t.push({
      line: 3,
      note:
        `把 \`left = ${L}\`（\`${bin(L, W)}\`）和 \`right = ${R}\`（\`${bin(R, W)}\`）上下對齊。` +
        "AND 的某一位要是 1，範圍內**每一個數**的那一位都必須是 1。我們要找的是兩者從最高位開始完全相同的那一段（共同前綴）。",
      views: views({}),
      vars: { left, right, shift },
    });

    while (left < right) {
      const pl = left;
      const pr = right;
      left = Math.floor(left / 2);
      right = Math.floor(right / 2);
      shift++;
      t.push({
        line: [4, 5, 6, 7],
        note:
          `\`${pl} < ${pr}\`：範圍內至少有兩個連續的數，而連續的數最低位一定是一個 0、一個 1，所以**第 ${shift - 1} 位 AND 起來必為 0**。` +
          `把兩邊都右移砍掉這一位：\`left = ${left}\`、\`right = ${right}\`，\`shift = ${shift}\`。`,
        views: views({ chopping: true }),
        vars: { left, right, shift, "left（二進位）": bin(left, W - shift), "right（二進位）": bin(right, W - shift) },
      });
    }

    const answer = left * 2 ** shift;
    t.push({
      line: [4, 8],
      note:
        (shift === 0
          ? `\`left == right\`，範圍裡只有一個數，答案就是它自己。`
          : `現在 \`left == right == ${left}\`${left === 0 ? "（連最高位都不一樣，沒有共同前綴）" : `，剩下的 \`${bin(left, W - shift)}\` 就是**共同前綴**：範圍內每個數的這幾位都一樣，AND 之後原樣保留`}。`) +
        `被砍掉的 ${shift} 位全是 0，左移補回去：\`${left} << ${shift} = ${answer}\`。`,
      views: views({ done: true }),
      vars: { left, right, shift },
      result: py(answer),
    });
    return t.frames;
  },
});
