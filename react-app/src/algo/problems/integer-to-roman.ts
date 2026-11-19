import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def intToRoman(self, num: int) -> str:
        symbols = [
            (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
            (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
            (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
        ]
        res = []
        for value, symbol in symbols:
            while num >= value:         # 還塞得下就一直拿這個符號
                res.append(symbol)
                num -= value
        return "".join(res)`;

const SYMBOLS: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export default defineProblem<{ num: number }>({
  id: 12,
  summary:
    "把一個 1 ~ 3999 的整數轉成羅馬數字。符號有 `I=1`、`V=5`、`X=10`、`L=50`、`C=100`、`D=500`、`M=1000`，由大到小排列。\n\n遇到 4 和 9 開頭的位數要用「減法」寫法：`IV=4`、`IX=9`、`XL=40`、`XC=90`、`CD=400`、`CM=900`，而不是把同一個符號連寫四次。",
  summaryEn:
    "Convert an integer between 1 and 3999 into a Roman numeral. The symbols are `I=1`, `V=5`, `X=10`, `L=50`, `C=100`, `D=500`, `M=1000`, written from largest to smallest.\n\nDigits starting with 4 or 9 use the \"subtractive\" forms `IV=4`, `IX=9`, `XL=40`, `XC=90`, `CD=400`, `CM=900` instead of repeating one symbol four times.",
  examples: [
    { input: "num = 58", output: '"LVIII"', note: "50 + 5 + 3", noteEn: "50 + 5 + 3" },
    { input: "num = 1994", output: '"MCMXCIV"', note: "1000 + 900 + 90 + 4", noteEn: "1000 + 900 + 90 + 4" },
    { input: "num = 3749", output: '"MMMDCCXLIX"' },
  ],
  constraints: ["1 ≤ num ≤ 3999"],
  constraintsEn: ["1 ≤ num ≤ 3999"],
  idea:
    "把六種減法組合（`CM`、`CD`、`XC`、`XL`、`IX`、`IV`）也當成**獨立的符號**，和原本七個一起由大到小排成 13 個。接下來就是單純的貪心：每次都拿「還塞得下的最大符號」，像用最少的鈔票湊金額一樣。",
  steps: [
    "準備由大到小的 13 組（數值, 符號）。",
    "依序看每一組：只要 `num >= value`，就把符號接到答案後面，並把 `num` 減掉 `value`。",
    "塞不下了就換下一組更小的。",
    "`num` 減到 0 時，把收集到的符號接起來。",
  ],
  pitfalls: [
    "表一定要**由大到小**，而且要包含六組減法符號，否則 4 會變成 `IIII`、9 會變成 `VIIII`。",
    "內層要用 `while` 不是 `if`：同一個符號可能連續用好幾次（例如 3000 → `MMM`）。",
  ],
  complexity: { time: "O(1)（符號表固定 13 組，輸出長度最多 15）", space: "O(1)" },
  code,
  starter: `class Solution:
    def intToRoman(self, num: int) -> str:
        `,
  presets: [
    { label: "1994", input: { num: 1994 }, expected: '"MCMXCIV"' },
    { label: "3749", input: { num: 3749 }, expected: '"MMMDCCXLIX"' },
    { label: "58", input: { num: 58 }, expected: '"LVIII"' },
  ],
  trace({ num: input }) {
    const t = tracer();
    let num = input;
    const res: string[] = [];
    const entries: [Cell, Cell][] = SYMBOLS.map(([v, sym]) => [v, sym]);
    const state: Record<string, Tone> = {};
    const table = (extra: Record<string, Tone> = {}) =>
      V.map("symbols（由大到小）", entries, { marks: { ...state, ...extra } });
    const out = (last?: Tone) =>
      V.array("res", res, { marks: last && res.length ? { [res.length - 1]: last } : {} });

    t.push({
      line: [3, 4, 5, 6, 7, 8],
      note: `把六種減法寫法也當成符號，和原本七個一起由大到小排好。接下來從最大的開始，能拿就拿，把 \`num = ${num}\` 一路減到 0。`,
      views: [table(), out()],
      vars: { num },
    });

    for (const [value, symbol] of SYMBOLS) {
      const key = String(value);
      if (num < value) {
        t.push({
          line: [9, 10],
          note:
            num === 0
              ? `\`num\` 已經是 0，\`${symbol}\`（${value}）當然也用不到。`
              : `\`${symbol}\` 是 ${value}，但 \`num = ${num}\` 比它小，塞不下，換下一個更小的符號。`,
          views: [table({ [key]: "compare" }), out()],
          vars: { num, value, symbol },
        });
        state[key] = "muted";
        continue;
      }
      let used = 0;
      while (num >= value) {
        const before = num;
        res.push(symbol);
        num -= value;
        used++;
        t.push({
          line: [9, 10, 11, 12],
          note:
            `\`num = ${before}\` ≥ ${value}，塞得下 \`${symbol}\`${used > 1 ? `（第 ${used} 次）` : ""}：接到答案後面，\`num = ${before} − ${value} = ${num}\`。` +
            (num >= value ? "還夠再拿一次。" : ""),
          views: [table({ [key]: "active" }), out("active")],
          vars: { num, value, symbol },
        });
      }
      state[key] = "good";
    }

    const answer = res.join("");
    const all: Record<number, Tone> = {};
    res.forEach((_, k) => (all[k] = "good"));
    t.push({
      line: 13,
      note: `\`num\` 減到 0 了。把收集到的符號接起來：\`${res.join(" + ")}\` → \`${answer}\`。`,
      views: [table(), V.array("res", res, { marks: all })],
      vars: { num },
      result: py(answer),
    });
    return t.frames;
  },
});
