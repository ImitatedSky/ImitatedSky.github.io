import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1  # 消掉最低位的那個 1
            count += 1
        return count`;

export default defineProblem<{ n: number }>({
  id: 191,
  summary:
    "給一個正整數 `n`，回傳它的二進位表示裡**有幾個 `1`**（也叫 Hamming weight、popcount）。",
  examples: [
    { input: "n = 11", output: "3", note: "11 = 1011₂，有三個 1" },
    { input: "n = 128", output: "1", note: "128 = 10000000₂" },
  ],
  constraints: ["1 ≤ n ≤ 2³¹ − 1"],
  idea:
    "`n & (n - 1)` 會剛好**消掉 `n` 最低位的那個 1**。因為減 1 時會向最低位的 1 借位：那個 1 變成 0、它右邊的 0 全變成 1、左邊完全不動；兩者做 AND，左邊保留、從那個 1 開始往右全部歸零。所以能消幾次，就有幾個 1。",
  steps: [
    "`count = 0`。",
    "只要 `n` 不是 0，就做 `n &= n - 1`，消掉一個 1，`count += 1`。",
    "`n` 變成 0 時，`count` 就是 1 的個數。",
  ],
  pitfalls: [
    "逐位檢查（`n & 1` 再右移）也對，但固定要跑 32 次；這個寫法只跑「1 的個數」次。",
    "在有號整數的語言裡若用右移逐位檢查，要小心負數的算術右移會無限迴圈；`n & (n - 1)` 沒有這個問題。",
  ],
  complexity: { time: "O(k)，k 為 1 的個數（最多 32）", space: "O(1)" },
  code,
  starter: `class Solution:
    def hammingWeight(self, n: int) -> int:
        `,
  presets: [
    { label: "11", input: { n: 11 }, expected: "3" },
    { label: "244", input: { n: 244 }, expected: "5" },
    { label: "128", input: { n: 128 }, expected: "1" },
  ],
  trace({ n: n0 }) {
    const t = tracer();
    const W = Math.max(8, n0.toString(2).length);
    const bits = (x: number): Cell[] => Array.from({ length: W }, (_, k) => Math.floor(x / 2 ** (W - 1 - k)) % 2);
    const blank: Cell[] = Array.from({ length: W }, () => "");
    const colLabels = Array.from({ length: W }, (_, k) => W - 1 - k);
    const bin = (x: number) => x.toString(2).padStart(W, "0");

    const grid = (rows: Cell[][], labels: string[], marks: Record<string, Tone>) =>
      V.grid("位元（上方數字是第幾位，右邊是最低位）", rows, { rowLabels: labels, colLabels, marks });

    let n = n0;
    let count = 0;

    const ones: Record<string, Tone> = {};
    bits(n).forEach((b, c) => {
      if (b === 1) ones[`0,${c}`] = "compare";
    });
    t.push({
      line: 3,
      note: `把 \`n = ${n}\` 寫成二進位 \`${bin(n)}\`。我們要數裡面有幾個 1 —— 方法是每次用 \`n & (n - 1)\` 消掉最右邊的那個 1，看能消幾次。`,
      views: [grid([bits(n), blank, blank], [`n = ${n}`, "n - 1", "n & (n - 1)"], ones)],
      vars: { n, count },
    });

    while (n) {
      const m = n - 1;
      // 最低位 1 的位置（從右邊數）
      let low = 0;
      while (Math.floor(n / 2 ** low) % 2 === 0) low++;
      const lowCol = W - 1 - low;

      const marks: Record<string, Tone> = { [`0,${lowCol}`]: "active", [`1,${lowCol}`]: "active" };
      for (let c = lowCol + 1; c < W; c++) {
        marks[`0,${c}`] = "compare";
        marks[`1,${c}`] = "compare";
      }
      t.push({
        line: [4, 5],
        note:
          `\`n\` 不是 0。先看 \`n - 1 = ${m}\`：減 1 會向**最低位的 1**（第 ${low} 位）借位，那一位從 1 變 0` +
          (low > 0 ? `，它右邊的 ${low} 個 0 全部變成 1` : "") +
          "，左邊的位元完全不變。",
        views: [grid([bits(n), bits(m), blank], [`n = ${n}`, `n - 1 = ${m}`, "n & (n - 1)"], marks)],
        vars: { n, "n - 1": m, count },
      });

      // 用除法取代 JS 的 32 位元 &，結果相同：把第 low 位清掉
      const next = n - 2 ** low;
      count++;
      const marks2: Record<string, Tone> = { [`0,${lowCol}`]: "active", [`1,${lowCol}`]: "active", [`2,${lowCol}`]: "bad" };
      for (let c = lowCol + 1; c < W; c++) marks2[`2,${c}`] = "muted";
      for (let c = 0; c < lowCol; c++) if (bits(next)[c] === 1) marks2[`2,${c}`] = "compare";
      t.push({
        line: [5, 6],
        note:
          `兩列做 AND（上下都是 1 才是 1）：左邊一模一樣所以原樣保留；第 ${low} 位是 \`1 & 0 = 0\`，` +
          (low > 0 ? "右邊是 `0 & 1 = 0`，" : "") +
          `等於**剛好消掉最低位的那個 1**。\`n\` 變成 \`${next}\`，\`count = ${count}\`。`,
        views: [
          grid([bits(n), bits(m), bits(next)], [`n = ${n}`, `n - 1 = ${m}`, `n & (n - 1) = ${next}`], marks2),
        ],
        vars: { n: next, "n - 1": m, count },
      });
      n = next;
    }

    t.push({
      line: [4, 7],
      note: `\`n\` 變成 0，所有的 1 都被消光了。總共消了 ${count} 次，所以 \`${n0}\`（\`${bin(n0)}\`）有 **${count}** 個 1。`,
      views: [grid([bits(0), blank, blank], ["n = 0", "n - 1", "n & (n - 1)"], {})],
      vars: { n: 0, count },
      result: py(count),
    });
    return t.frames;
  },
});
