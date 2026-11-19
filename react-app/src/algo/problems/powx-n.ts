import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, tracer } from "../trace";

const code = `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n  # x^(-n) = (1/x)^n
        res = 1.0
        while n:
            if n & 1:   # 這一位是 1：把目前的 x 乘進答案
                res *= x
            x *= x      # x 依序變成原本的 1、2、4、8… 次方
            n >>= 1
        return res`;

const GRID = "n 的二進位，以及每一位對應的次方";
const TERMS = "已經乘進 res 的項";

/** 浮點數照 Python 的方式印出（整數值要帶 .0） */
const pf = (v: number) => (Number.isInteger(v) ? v.toFixed(1) : String(v));

export default defineProblem<{ x: number; n: number }>({
  id: 50,
  summary:
    "實作 `pow(x, n)`：計算浮點數 `x` 的整數 `n` 次方。`n` 可以是負數，而且絕對值可以大到 2³¹，所以一個一個乘一定太慢。",
  summaryEn:
    "Implement `pow(x, n)`: raise the floating-point number `x` to the integer power `n`. `n` can be negative and its magnitude can reach 2³¹, so multiplying one step at a time is far too slow.",
  examples: [
    { input: "x = 2.00000, n = 10", output: "1024.00000" },
    { input: "x = 2.10000, n = 3", output: "9.26100" },
    { input: "x = 2.00000, n = -2", output: "0.25000", note: "2⁻² = 1 / 2² = 0.25", noteEn: "2⁻² = 1 / 2² = 0.25" },
  ],
  constraints: ["−100.0 < x < 100.0", "−2³¹ ≤ n ≤ 2³¹ − 1", "x 不為 0，或 n > 0"],
  constraintsEn: ["−100.0 < x < 100.0", "−2³¹ ≤ n ≤ 2³¹ − 1", "Either x is not 0, or n > 0"],
  idea:
    "**快速冪**：把指數 `n` 寫成二進位，例如 `10 = 1010₂ = 8 + 2`，那 `x¹⁰ = x⁸ × x²`。而 `x¹, x², x⁴, x⁸ …` 只要不斷**自己乘自己**就能依序得到。所以從 `n` 的最低位開始看，每一位讓 `x` 平方一次；遇到位元是 1，就把當下的 `x` 乘進答案。只需要 log n 次乘法。",
  steps: [
    "`n` 是負數時，改算 `(1/x)` 的 `-n` 次方。",
    "`res = 1.0`。",
    "`n` 還不是 0 時：若最低位是 1（`n & 1`），`res *= x`。",
    "`x *= x`（準備下一位對應的次方），`n >>= 1`（看下一位）。",
    "`n` 變成 0 就回傳 `res`。",
  ],
  pitfalls: [
    "直接乘 `n` 次是 O(n)，`n` 到 2³¹ 會超時。",
    "負指數別忘了取倒數；在 C++ / Java 裡 `-n` 在 `n = −2³¹` 時會溢位，要先轉成 64 位元。",
    "`n = 0` 時答案是 1（迴圈一次都不會進去）。",
  ],
  complexity: { time: "O(log n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        `,
  presets: [
    { label: "x = 2.0, n = 10", input: { x: 2, n: 10 }, expected: "1024.0" },
    { label: "x = 3.0, n = 5", input: { x: 3, n: 5 }, expected: "243.0" },
    { label: "x = 2.0, n = -2", input: { x: 2, n: -2 }, expected: "0.25" },
  ],
  trace({ x: x0, n: n0 }) {
    const t = tracer();
    let x = x0;
    let n = n0;
    const absN = Math.abs(n0);
    const W = Math.max(1, absN.toString(2).length);
    const bitRow: Cell[] = Array.from({ length: W }, (_, c) => Math.floor(absN / 2 ** (W - 1 - c)) % 2);
    const powRow: Cell[] = Array.from({ length: W }, () => "");
    const colLabels = Array.from({ length: W }, (_, c) => `x^${2 ** (W - 1 - c)}`);
    const terms: [Cell, Cell][] = [];
    const tones: Record<number, Tone> = {}; // 欄 → 處理結果
    const bin = (v: number) => v.toString(2);

    const views = (cur: number | null, curTone: Tone = "active") => {
      const marks: Record<string, Tone> = {};
      Object.entries(tones).forEach(([c, tone]) => {
        marks[`0,${c}`] = tone;
        marks[`1,${c}`] = tone;
      });
      if (cur !== null) {
        marks[`0,${cur}`] = curTone;
        marks[`1,${cur}`] = curTone;
      }
      return [
        V.grid(GRID, [bitRow, powRow], {
          rowLabels: [`|n| = ${absN} 的位元`, "x 的這個次方"],
          colLabels,
          marks,
          pointers: cur !== null ? { "n&1": [0, cur] } : {},
        }),
        V.map(TERMS, terms),
      ];
    };

    if (n < 0) {
      x = 1 / x;
      n = -n;
      t.push({
        line: [3, 4],
        note: `\`n = ${n0}\` 是負數。負次方就是倒數的正次方：\`${pf(x0)}^(${n0}) = (1/${pf(x0)})^${n}\`，所以把 \`x\` 換成 \`${pf(x)}\`、\`n\` 換成 \`${n}\`。`,
        views: views(null),
        vars: { x: pf(x), n },
      });
    }

    let res = 1;
    powRow[W - 1] = pf(x);
    t.push({
      line: 5,
      note:
        `\`res\` 從 \`1.0\` 開始。把 \`n = ${n}\` 寫成二進位 \`${bin(n)}\`：每一欄代表一個次方（${colLabels.join("、")}），` +
        `位元是 1 的欄位乘起來就是 \`x^${n}\`。現在手上的 \`x\` 是最右邊那一欄的 \`x^1 = ${pf(x)}\`。`,
      views: views(null),
      vars: { x: pf(x), n, "n（二進位）": bin(n), res: pf(res) },
    });

    let k = 0; // 目前在看第幾位
    while (n) {
      const col = W - 1 - k;
      const bit = n % 2;
      if (bit) {
        const prev = res;
        res *= x;
        terms.push([`x^${2 ** k}`, pf(x)]);
        tones[col] = "good";
        t.push({
          line: [6, 7, 8],
          note: `\`n = ${n}\`（\`${bin(n)}\`）的最低位是 **1**：答案的拆解裡有 \`x^${2 ** k}\` 這一項。把目前的 \`x = ${pf(x)}\` 乘進答案：\`res = ${pf(prev)} × ${pf(x)} = ${pf(res)}\`。`,
          views: views(col, "good"),
          vars: { x: pf(x), n, "n（二進位）": bin(n), res: pf(res) },
        });
      } else {
        tones[col] = "muted";
        t.push({
          line: [6, 7],
          note: `\`n = ${n}\`（\`${bin(n)}\`）的最低位是 **0**：答案不需要 \`x^${2 ** k}\` 這一項，\`res\` 不動（仍是 \`${pf(res)}\`）。`,
          views: views(col, "compare"),
          vars: { x: pf(x), n, "n（二進位）": bin(n), res: pf(res) },
        });
      }

      const px = x;
      x *= x;
      n = Math.floor(n / 2);
      k++;
      if (W - 1 - k >= 0) powRow[W - 1 - k] = pf(x);
      t.push({
        line: [9, 10],
        note:
          `\`x\` 自己乘自己：\`${pf(px)} × ${pf(px)} = ${pf(x)}\`，` +
          (n
            ? `這就是 \`x^${2 ** k}\`，剛好對應下一位。\`n >>= 1\` 丟掉看完的最低位，剩下 \`${n}\`（\`${bin(n)}\`）。`
            : `不過 \`n >>= 1\` 之後 \`n\` 已經是 0，所有位元都看完了，這次平方用不到。`),
        views: views(n ? W - 1 - k : null),
        vars: { x: pf(x), n, "n（二進位）": bin(n), res: pf(res) },
      });
    }

    const shown = terms.length ? terms.map(([name]) => name).join(" × ") : "1";
    t.push({
      line: [6, 11],
      note:
        `\`n\` 是 0，迴圈結束。\`res = ${shown} = ${pf(res)}\`。` +
        (absN > k ? `指數有幾個二進位位元就跑幾輪：這裡只跑了 ${k} 輪，而不是乘 ${absN} 次。` : ""),
      views: views(null),
      vars: { n: 0, res: pf(res) },
      result: pf(res),
    });
    return t.frames;
  },
});
