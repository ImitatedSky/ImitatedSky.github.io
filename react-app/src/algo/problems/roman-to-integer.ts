import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def romanToInt(self, s: str) -> int:
        value = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total = 0
        for i in range(len(s)):
            if i + 1 < len(s) and value[s[i]] < value[s[i + 1]]:
                total -= value[s[i]]    # 小的在大的左邊 → 要減掉
            else:
                total += value[s[i]]
        return total`;

const VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

export default defineProblem<{ s: string }>({
  id: 13,
  summary:
    "把一個羅馬數字字串轉成整數。七個符號的值是 `I=1`、`V=5`、`X=10`、`L=50`、`C=100`、`D=500`、`M=1000`。\n\n通常符號由大到小排列、直接相加；但有六種「減法」寫法：`IV=4`、`IX=9`、`XL=40`、`XC=90`、`CD=400`、`CM=900` —— 小的符號放在大的符號**左邊**，代表要減掉它。",
  examples: [
    { input: 's = "III"', output: "3" },
    { input: 's = "LVIII"', output: "58", note: "L = 50, V = 5, III = 3" },
    { input: 's = "MCMXCIV"', output: "1994", note: "M = 1000, CM = 900, XC = 90, IV = 4" },
  ],
  constraints: ["1 ≤ s.length ≤ 15", "s 是 1 ~ 3999 之間的合法羅馬數字"],
  idea:
    "不需要特別記那六種減法組合，只要一條規則：**如果一個符號比它右邊的符號小，就減掉它；否則加上它**。所以每個字元只要往右偷看一格就能決定正負號。",
  steps: [
    "建一個符號 → 數值的對照表。",
    "由左到右看每個字元 `s[i]`。",
    "如果右邊還有字元，而且 `s[i]` 的值比 `s[i+1]` 小 → `total` 減掉它。",
    "否則 → `total` 加上它。最後一個字元右邊沒東西，一定是加。",
  ],
  pitfalls: ["記得先檢查 `i + 1 < len(s)` 再讀 `s[i + 1]`，否則最後一個字元會超出範圍。"],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def romanToInt(self, s: str) -> int:
        `,
  presets: [
    { label: '"MCMXCIV"', input: { s: "MCMXCIV" }, expected: "1994" },
    { label: '"LVIII"', input: { s: "LVIII" }, expected: "58" },
    { label: '"XLIX"', input: { s: "XLIX" }, expected: "49" },
  ],
  trace({ s }) {
    const t = tracer();
    const n = s.length;
    // 每個字元最後算成的 +值 / −值
    const signed: Cell[] = new Array(n).fill("");
    const tones: Record<number, Tone> = {};
    let total = 0;
    const CONTRIB = "每個符號算成";

    t.push({
      line: [3, 4],
      note: "準備好七個符號的對照表，`total` 從 0 開始。接下來每個符號只要決定「加」還是「減」。",
      views: [V.chars("s", s), V.array(CONTRIB, signed), V.map("value", VALUE)],
      vars: { total },
    });

    for (let i = 0; i < n; i++) {
      const cur = VALUE[s[i]];
      const hasNext = i + 1 < n;
      const nxt = hasNext ? VALUE[s[i + 1]] : 0;
      const minus = hasNext && cur < nxt;

      const keyMarks: Record<string, Tone> = hasNext ? { [s[i + 1]]: "compare" } : {};
      keyMarks[s[i]] = "active";
      t.push({
        line: [5, 6],
        note: hasNext
          ? `\`s[${i}] = ${s[i]}\`（${cur}），往右偷看一格是 \`${s[i + 1]}\`（${nxt}）：\`${cur} ${cur < nxt ? "<" : cur === nxt ? "=" : ">"} ${nxt}\`。`
          : `\`s[${i}] = ${s[i]}\`（${cur}）是最後一個符號，右邊沒有東西可以比。`,
        views: [
          V.chars("s", s, {
            pointers: { i },
            marks: hasNext ? { [i]: "active", [i + 1]: "compare" } : { [i]: "active" },
          }),
          V.array(CONTRIB, signed, { marks: tones }),
          V.map("value", VALUE, { marks: keyMarks }),
        ],
        vars: { i, total },
      });

      const before = total;
      if (minus) {
        total -= cur;
        signed[i] = `-${cur}`;
        tones[i] = "alt";
      } else {
        total += cur;
        signed[i] = `+${cur}`;
        tones[i] = "good";
      }
      t.push({
        line: minus ? 7 : [8, 9],
        note: minus
          ? `小的 \`${s[i]}\` 擋在大的 \`${s[i + 1]}\` 左邊，這是減法寫法（\`${s[i]}${s[i + 1]} = ${nxt - cur}\`），所以**減掉** ${cur}：\`total = ${before} − ${cur} = ${total}\`。`
          : `${hasNext ? `\`${s[i]}\` 沒有比右邊小，` : ""}正常**加上** ${cur}：\`total = ${before} + ${cur} = ${total}\`。`,
        views: [
          V.chars("s", s, { pointers: { i }, marks: { [i]: minus ? "alt" : "good" } }),
          V.array(CONTRIB, signed, { marks: tones }),
          V.map("value", VALUE, { marks: { [s[i]]: minus ? "alt" : "good" } }),
        ],
        vars: { i, total },
      });
    }

    t.push({
      line: 10,
      note: `所有符號都處理完了：\`${signed
        .map((x) => `${String(x)[0] === "-" ? "−" : "+"} ${String(x).slice(1)}`)
        .join(" ")
        .replace(/^\+ /, "")} = ${total}\`。`,
      views: [V.chars("s", s), V.array(CONTRIB, signed, { marks: tones }), V.map("value", VALUE)],
      vars: { total },
      result: py(total),
    });
    return t.frames;
  },
});
