import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        profit = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i - 1]:  # 今天比昨天貴：這段漲幅收下
                profit += prices[i] - prices[i - 1]
        return profit`;

export default defineProblem<{ prices: number[] }>({
  id: 122,
  summary:
    "`prices[i]` 是某支股票第 `i` 天的價格。這次你可以**買賣任意多次**，但手上同時最多只能有一股（要先賣掉才能再買；同一天可以先賣再買）。\n\n回傳能賺到的最大總利潤。",
  examples: [
    { input: "prices = [7,1,5,3,6,4]", output: "7", note: "1 買 5 賣賺 4，3 買 6 賣賺 3" },
    { input: "prices = [1,2,3,4,5]", output: "4", note: "1 買 5 賣，等同每天的漲幅加總" },
    { input: "prices = [7,6,4,3,1]", output: "0" },
  ],
  constraints: ["1 ≤ prices.length ≤ 3 × 10⁴", "0 ≤ prices[i] ≤ 10⁴"],
  idea:
    "**貪心：把每一段上漲都賺走。**任何一筆「低點買、高點賣」的利潤，都可以拆成中間每一天漲幅的總和（`5 - 1 = (3 - 1) + (5 - 3)`）。所以不必找谷底和山頂，只要相鄰兩天有漲就把差價加進來，下跌的那幾天當作沒持股就好。",
  steps: [
    "`profit = 0`。",
    "從第 1 天開始，比較今天和昨天的價格。",
    "今天比較貴：把 `prices[i] - prices[i - 1]` 加進 `profit`（等於昨天買、今天賣）。",
    "今天沒有比較貴：跳過（等於這段期間不持股）。",
  ],
  pitfalls: [
    "這題不需要 DP 或真的去找每個波段的買賣點；相鄰差價為正就收是最簡潔的寫法。",
    "連續上漲時每天都「賣了再買」，和一路抱到最高點再賣的利潤完全一樣。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        `,
  presets: [
    { label: "[7,1,5,3,6,4]", input: { prices: [7, 1, 5, 3, 6, 4] }, expected: "7" },
    { label: "[1,3,4,8,2,2,6]", input: { prices: [1, 3, 4, 8, 2, 2, 6] }, expected: "11" },
    { label: "[7,6,4,3,1]", input: { prices: [7, 6, 4, 3, 1] }, expected: "0" },
  ],
  trace({ prices }) {
    const t = tracer();
    const n = prices.length;
    let profit = 0;
    // 連續上漲的日子合併成一個波段
    const runs: { from: number; to: number; sum: number }[] = [];

    const view = (i: number, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (const r of runs) for (let x = r.from; x <= r.to; x++) marks[x] = "good";
      return V.bars("prices", prices, {
        marks: { ...marks, ...extra },
        pointers: i >= 1 && i < n ? { "i-1": i - 1, i } : {},
        ranges: runs.map((r) => ({ from: r.from, to: r.to, tone: "good" as Tone, label: `+${r.sum}` })),
      });
    };

    t.push({
      line: 3,
      note: "`profit = 0`。接下來只看**相鄰兩天**：有漲就把差價收下來。",
      views: [view(0)],
      vars: { profit },
    });

    for (let i = 1; i < n; i++) {
      const a = prices[i - 1];
      const b = prices[i];
      if (b > a) {
        t.push({
          line: [4, 5],
          note: `第 ${i - 1} 天 \`${a}\` → 第 ${i} 天 \`${b}\`：漲了。昨天買、今天賣可以賺 \`${b} - ${a} = ${b - a}\`。`,
          views: [view(i, { [i - 1]: "compare", [i]: "active" })],
          vars: { i, profit },
        });
        profit += b - a;
        const last = runs[runs.length - 1];
        const extended = !!last && last.to === i - 1;
        if (extended) {
          last.to = i;
          last.sum += b - a;
        } else {
          runs.push({ from: i - 1, to: i, sum: b - a });
        }
        const run = runs[runs.length - 1];
        t.push({
          line: 6,
          note: extended
            ? `\`profit\` 加 ${b - a} 變成 ${profit}。這段連漲合起來是 \`${prices[run.to]} - ${prices[run.from]} = ${run.sum}\` —— 每天收差價，和一路抱到高點再賣**一模一樣**。`
            : `\`profit\` 加 ${b - a} 變成 ${profit}。`,
          views: [view(i)],
          vars: { i, profit },
        });
      } else {
        t.push({
          line: [4, 5],
          note:
            b === a
              ? `第 ${i - 1} 天 \`${a}\` → 第 ${i} 天 \`${b}\`：沒有變，沒有差價可賺，跳過。`
              : `第 ${i - 1} 天 \`${a}\` → 第 ${i} 天 \`${b}\`：跌了。這段不持股就不會賠，跳過。`,
          views: [view(i, { [i - 1]: "compare", [i]: "bad" })],
          vars: { i, profit },
        });
      }
    }

    t.push({
      line: 7,
      note:
        runs.length > 0
          ? `走完了。${runs.length} 個上漲波段（${runs.map((r) => `+${r.sum}`).join("、")}）全部收下，總利潤 \`${profit}\`。`
          : "價格從頭到尾沒有漲過，沒有任何差價可以賺，回傳 `0`。",
      views: [view(n)],
      vars: { profit },
      result: py(profit),
    });
    return t.frames;
  },
});
