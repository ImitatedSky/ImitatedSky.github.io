import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 1:
            return 1
        dp = [0] * (n + 1)  # dp[i] = 爬到第 i 階的方法數
        dp[0] = dp[1] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]`;

export default defineProblem<{ n: number }>({
  id: 70,
  summary:
    "樓梯總共有 `n` 階，每一步可以爬 **1 階**或 **2 階**。\n\n問爬到最頂端一共有幾種不同的走法。",
  summaryEn:
    "A staircase has `n` steps, and each move climbs either **1 step** or **2 steps**.\n\nHow many different ways are there to reach the top?",
  examples: [
    { input: "n = 2", output: "2", note: "1+1、2", noteEn: "1+1, 2" },
    { input: "n = 3", output: "3", note: "1+1+1、1+2、2+1", noteEn: "1+1+1, 1+2, 2+1" },
  ],
  constraints: ["1 ≤ n ≤ 45"],
  constraintsEn: ["1 ≤ n ≤ 45"],
  idea:
    "定義 `dp[i]` = 爬到第 `i` 階的方法數。站上第 `i` 階的**最後一步**只有兩種可能：從 `i-1` 跨 1 階，或從 `i-2` 跨 2 階，所以 `dp[i] = dp[i-1] + dp[i-2]` —— 其實就是費氏數列。",
  steps: [
    "`dp[0] = 1`（站在地面，什麼都不做也算一種）、`dp[1] = 1`。",
    "從 `i = 2` 開始由小到大填：`dp[i] = dp[i-1] + dp[i-2]`。",
    "答案是 `dp[n]`。",
  ],
  pitfalls: [
    "兩種「最後一步」互不重疊，所以是**相加**而不是取最大值。",
    "每一格只用到前兩格，可以改用兩個變數 `a, b = b, a + b` 滾動，把空間壓到 O(1)。",
  ],
  complexity: { time: "O(n)", space: "O(n)（滾動變數可降到 O(1)）" },
  code,
  starter: `class Solution:
    def climbStairs(self, n: int) -> int:
        `,
  presets: [
    { label: "n = 6", input: { n: 6 }, expected: "13" },
    { label: "n = 2", input: { n: 2 }, expected: "2" },
    { label: "n = 1", input: { n: 1 }, expected: "1" },
  ],
  trace({ n }) {
    const t = tracer();

    if (n <= 1) {
      t.push({
        line: [3, 4],
        note: `只有 ${n} 階，走法只有 1 種，直接回傳。`,
        views: [V.array("dp", [1, 1].slice(0, n + 1), { marks: { [n]: "good" } })],
        vars: { n },
        result: py(1),
      });
      return t.frames;
    }

    const dp: number[] = new Array(n + 1).fill(0);
    let filled = -1; // dp[0..filled] 已經算好
    const show = (): Cell[] => dp.map((v, i) => (i <= filled ? v : ""));
    const view = (marks: Record<number, Tone> = {}, pointers: Record<string, number> = {}) =>
      V.array("dp", show(), { marks, pointers });

    t.push({
      line: 5,
      note: `開一個長度 \`n + 1 = ${n + 1}\` 的表格。\`dp[i]\` 的意思是：**爬到第 \`i\` 階一共有幾種走法**，我們要的是 \`dp[${n}]\`。`,
      views: [view()],
      vars: { n },
    });

    dp[0] = dp[1] = 1;
    filled = 1;
    t.push({
      line: 6,
      note: "起點：`dp[0] = 1`（站在地面不動算一種）、`dp[1] = 1`（只能跨 1 階）。這兩格是之後所有答案的基礎。",
      views: [view({ 0: "good", 1: "good" })],
      vars: { n },
    });

    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      filled = i;
      t.push({
        line: [7, 8],
        note:
          `要站上第 ${i} 階，最後一步不是從第 ${i - 1} 階跨 1 階，就是從第 ${i - 2} 階跨 2 階，兩種情況加起來：` +
          `\`dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}\`。`,
        views: [view({ [i]: "active", [i - 1]: "compare", [i - 2]: "compare" }, { i })],
        vars: { n, i, "dp[i]": dp[i] },
      });
    }

    t.push({
      line: 9,
      note: `表格填完了，\`dp[${n}] = ${dp[n]}\` 就是爬到頂端的方法數。`,
      views: [view({ [n]: "good" })],
      vars: { n },
      result: py(dp[n]),
    });
    return t.frames;
  },
});
