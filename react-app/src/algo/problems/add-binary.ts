import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def addBinary(self, a: str, b: str) -> str:
        res = []
        i, j, carry = len(a) - 1, len(b) - 1, 0
        while i >= 0 or j >= 0 or carry:
            total = carry
            if i >= 0:
                total += int(a[i])
                i -= 1
            if j >= 0:
                total += int(b[j])
                j -= 1
            res.append(str(total % 2))  # 這一位寫下的數字
            carry = total // 2          # 逢二進一
        return "".join(reversed(res))`;

export default defineProblem<{ a: string; b: string }>({
  id: 67,
  summary:
    "給兩個只含 `0`、`1` 的字串 `a` 和 `b`，各代表一個二進位數。把它們**相加**，結果一樣用二進位字串回傳。\n\n字串可能很長，不能指望直接轉成一般整數來算。",
  examples: [
    { input: 'a = "11", b = "1"', output: '"100"', note: "3 + 1 = 4" },
    { input: 'a = "1010", b = "1011"', output: '"10101"', note: "10 + 11 = 21" },
  ],
  constraints: ["1 ≤ a.length, b.length ≤ 10⁴", "除了 \"0\" 本身以外沒有前導零"],
  idea:
    "就是小學的**直式加法**，只是逢二進一。兩個指標從最右邊（最低位）一起往左走，每一欄把「`a` 的位元 + `b` 的位元 + 進位」加起來：`total % 2` 是這一欄要寫下的數字，`total // 2` 是帶到下一欄的進位。",
  steps: [
    "`i`、`j` 分別指向 `a`、`b` 的最後一個字元，`carry = 0`。",
    "只要還有任何一邊沒走完、或還有進位沒處理，就繼續算下一欄。",
    "`total = carry + a[i] + b[j]`（走完的那一邊當作 0），然後指標往左移。",
    "把 `total % 2` 接到 `res` 後面，`carry = total // 2`。",
    "`res` 是從低位開始存的，最後反轉再接成字串。",
  ],
  pitfalls: [
    "迴圈條件別漏了 `or carry`：`\"1\" + \"1\"` 兩邊都走完時還有一個進位要寫下來。",
    "`res` 是低位在前，忘記反轉答案就會顛倒。",
    "在其他語言裡不能直接轉成整數相加（長度可到 10⁴ 位，會溢位）。",
  ],
  complexity: { time: "O(max(m, n))", space: "O(max(m, n))" },
  code,
  starter: `class Solution:
    def addBinary(self, a: str, b: str) -> str:
        `,
  presets: [
    { label: '"1010" + "1011"', input: { a: "1010", b: "1011" }, expected: '"10101"' },
    { label: '"11" + "1"', input: { a: "11", b: "1" }, expected: '"100"' },
    { label: '"0" + "0"', input: { a: "0", b: "0" }, expected: '"0"' },
  ],
  trace({ a, b }) {
    const t = tracer();
    const W = Math.max(a.length, b.length) + 1;
    const blank = (): Cell[] => Array.from({ length: W }, () => "");
    const carryRow = blank();
    const aRow = blank();
    const bRow = blank();
    const resRow = blank();
    [...a].forEach((ch, k) => (aRow[W - a.length + k] = ch));
    [...b].forEach((ch, k) => (bRow[W - b.length + k] = ch));
    const colA = (i: number) => W - a.length + i;
    const colB = (j: number) => W - b.length + j;

    const view = (marks: Record<string, Tone>, i: number, j: number) => {
      const pointers: Record<string, [number, number]> = {};
      if (i >= 0) pointers.i = [1, colA(i)];
      if (j >= 0) pointers.j = [2, colB(j)];
      return V.grid("直式加法（右邊是最低位）", [carryRow, aRow, bRow, resRow], {
        rowLabels: ["進位", "a", "b", "res"],
        marks,
        pointers,
      });
    };

    const res: string[] = [];
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;

    t.push({
      line: [3, 4],
      note: "像直式加法一樣把兩個數**靠右對齊**。`i`、`j` 從最低位（最右邊）出發，`carry` 一開始是 0。",
      views: [view({}, i, j)],
      vars: { i, j, carry, res: py(res.join("")) },
    });

    let col = W - 1;
    while (i >= 0 || j >= 0 || carry) {
      const carryIn = carry;
      let total = carry;
      const parts: string[] = [`進位 ${carryIn}`];
      const lines = [5, 6];
      const marks: Record<string, Tone> = { [`0,${col}`]: "compare" };
      const pi = i;
      const pj = j;
      if (i >= 0) {
        total += Number(a[i]);
        parts.push(`a 的 ${a[i]}`);
        marks[`1,${col}`] = "active";
        lines.push(7, 8, 9);
        i--;
      }
      if (j >= 0) {
        total += Number(b[j]);
        parts.push(`b 的 ${b[j]}`);
        marks[`2,${col}`] = "active";
        lines.push(10, 11, 12);
        j--;
      }
      if (carryIn && carryRow[col] === "") carryRow[col] = carryIn;
      t.push({
        line: lines,
        note:
          `算這一欄：${parts.join(" + ")} = \`${total}\`。` +
          (pi < 0 && pj < 0
            ? "兩個字串都走完了，但還有進位沒寫下來，所以迴圈還要再跑一輪。"
            : pi < 0
              ? "`a` 已經走完，這一欄當作 0。"
              : pj < 0
                ? "`b` 已經走完，這一欄當作 0。"
                : ""),
        views: [view(marks, pi, pj)],
        vars: { i: pi, j: pj, carry: carryIn, total, res: py(res.join("")) },
      });

      const digit = total % 2;
      carry = Math.floor(total / 2);
      res.push(String(digit));
      resRow[col] = digit;
      const marks2: Record<string, Tone> = { [`3,${col}`]: "good" };
      if (carry && col > 0) {
        carryRow[col - 1] = carry;
        marks2[`0,${col - 1}`] = "compare";
      }
      t.push({
        line: [13, 14],
        note:
          `\`${total}\` 的二進位是 \`${total.toString(2).padStart(2, "0")}\`：這一欄寫下 \`${total} % 2 = ${digit}\`，` +
          (carry ? `進位 \`${total} // 2 = 1\` 帶到左邊下一欄。` : "沒有進位（`carry = 0`）。"),
        views: [view(marks2, i, j)],
        vars: { i, j, carry, total, res: py(res.join("")) },
      });
      col--;
    }

    const answer = [...res].reverse().join("");
    const done: Record<string, Tone> = {};
    resRow.forEach((v, c) => {
      if (v !== "") done[`3,${c}`] = "good";
    });
    t.push({
      line: 15,
      note: `兩邊都走完、進位也是 0，迴圈結束。\`res\` 是從低位開始存的（\`${py(res.join(""))}\`），反轉後得到答案 \`${py(answer)}\`。`,
      views: [view(done, -1, -1)],
      vars: { carry, res: py(res.join("")) },
      result: py(answer),
    });
    return t.frames;
  },
});
