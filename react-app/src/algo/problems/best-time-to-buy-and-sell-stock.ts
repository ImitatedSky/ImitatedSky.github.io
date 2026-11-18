import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        lowest = inf  # 到今天為止看過的最低價
        best = 0
        for p in prices:
            lowest = min(lowest, p)
            best = max(best, p - lowest)  # 今天賣，最多賺多少
        return best`;

export default defineProblem<{ prices: number[] }>({
  id: 121,
  summary:
    "`prices[i]` 是某支股票第 `i` 天的價格。你只能**買一次、賣一次**，而且必須先買後賣（賣出日要在買入日之後）。\n\n回傳能賺到的最大利潤；如果怎麼買都不會賺，回傳 `0`。",
  examples: [
    { input: "prices = [7,1,5,3,6,4]", output: "5", note: "第 1 天用 1 買、第 4 天用 6 賣" },
    { input: "prices = [7,6,4,3,1]", output: "0", note: "一路下跌，不交易最好" },
  ],
  constraints: ["1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
  idea:
    "把問題換個角度：**假設今天賣**，那買入日一定要選「今天以前的最低價」才賺最多。所以只要一路記住目前為止的最低價 `lowest`，每天算一次 `今天價格 - lowest`，取最大的就是答案 —— 掃一遍就好。",
  steps: [
    "`lowest = inf`（還沒看過任何價格）、`best = 0`。",
    "依序看每天的價格 `p`：先用它更新 `lowest`。",
    "再算如果今天賣能賺多少 `p - lowest`，用它更新 `best`。",
    "走完回傳 `best`。",
  ],
  pitfalls: [
    "不能直接拿「全域最高價 − 全域最低價」：最高價可能出現在最低價**之前**，那樣是先賣後買。",
    "先更新 `lowest` 再算利潤時，當天買當天賣的利潤是 0，不會影響答案，所以順序這樣寫沒問題。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        `,
  presets: [
    { label: "[7,1,5,3,6,4]", input: { prices: [7, 1, 5, 3, 6, 4] }, expected: "5" },
    { label: "[3,8,2,5,1,9,4]", input: { prices: [3, 8, 2, 5, 1, 9, 4] }, expected: "8" },
    { label: "[7,6,4,3,1]", input: { prices: [7, 6, 4, 3, 1] }, expected: "0" },
  ],
  trace({ prices }) {
    const t = tracer();
    const n = prices.length;
    let lowest = Infinity;
    let lowIdx = -1;
    let best = 0;
    let bestBuy = -1;
    let bestSell = -1;

    const view = (i: number, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let x = 0; x < Math.min(i, n); x++) marks[x] = "visited";
      if (lowIdx >= 0) marks[lowIdx] = "alt";
      const pointers: Record<string, number> = {};
      if (lowIdx >= 0) pointers.lowest = lowIdx;
      if (i < n) pointers.p = i;
      return V.bars("prices", prices, {
        marks: { ...marks, ...extra },
        pointers,
        ranges:
          best > 0
            ? [{ from: bestBuy, to: bestSell, tone: "good", label: `best = +${best}` }]
            : [],
      });
    };
    const vars = (p?: number) => ({
      ...(p === undefined ? {} : { p }),
      lowest: lowest === Infinity ? "inf" : lowest,
      best,
    });

    t.push({
      line: [3, 4],
      note: "`lowest` 記「到今天為止的最低價」，還沒看任何一天所以先設成無限大；`best` 記目前最好的利潤，不交易就是 0。",
      views: [view(0)],
      vars: vars(),
    });

    for (let i = 0; i < n; i++) {
      const p = prices[i];
      if (p < lowest) {
        const old = lowest;
        lowest = p;
        lowIdx = i;
        t.push({
          line: [5, 6],
          note:
            old === Infinity
              ? `第 ${i} 天價格 \`${p}\`。這是第一天，它就是目前的最低價。`
              : `第 ${i} 天價格 \`${p}\`，比之前的最低價 \`${old}\` 還便宜 —— 之後任何一天賣，改在今天買一定更划算，所以 \`lowest = ${p}\`。`,
          views: [view(i, { [i]: "active" })],
          vars: vars(p),
        });
      } else {
        t.push({
          line: [5, 6],
          note: `第 ${i} 天價格 \`${p}\`，沒有比最低價 \`${lowest}\` 便宜，\`lowest\` 不變。`,
          views: [view(i, { [i]: "active" })],
          vars: vars(p),
        });
      }

      const profit = p - lowest;
      if (profit > best) {
        const old = best;
        best = profit;
        bestBuy = lowIdx;
        bestSell = i;
        t.push({
          line: 7,
          note: `如果今天賣：\`${p} - ${lowest} = ${profit}\`，比原本的 \`best = ${old}\` 好，更新 \`best = ${best}\`。`,
          views: [view(i, { [i]: "good", [lowIdx]: "good" })],
          vars: vars(p),
        });
      } else {
        t.push({
          line: 7,
          note:
            profit === 0
              ? `如果今天賣：今天就是最低價，\`${p} - ${lowest} = 0\`，賺不到錢，\`best\` 維持 ${best}。`
              : `如果今天賣：\`${p} - ${lowest} = ${profit}\`，沒有超過 \`best = ${best}\`，不更新。`,
          views: [view(i, { [i]: "compare" })],
          vars: vars(p),
        });
      }
    }

    const final: Record<number, Tone> = {};
    if (best > 0) {
      final[bestBuy] = "good";
      final[bestSell] = "good";
    }
    lowIdx = -1; // 收尾畫面只強調答案
    t.push({
      line: 8,
      note:
        best > 0
          ? `每一天都試過「今天賣」了。最好的是第 ${bestBuy} 天用 \`${prices[bestBuy]}\` 買、第 ${bestSell} 天用 \`${prices[bestSell]}\` 賣，賺 \`${best}\`。`
          : "價格一路沒有漲過，任何一天賣都賺不到錢，最好的選擇是不交易，回傳 `0`。",
      views: [view(n, final)],
      vars: { best },
      result: py(best),
    });
    return t.frames;
  },
});
