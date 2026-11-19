import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        buy = [-inf] * (k + 1)  # buy[j] = 買進第 j 張股票後，手上最多剩多少現金
        sell = [0] * (k + 1)    # sell[j] = 至多完成 j 筆交易後，手上最多有多少現金
        for p in prices:
            for j in range(1, k + 1):
                buy[j] = max(buy[j], sell[j - 1] - p)
                sell[j] = max(sell[j], buy[j] + p)
        return sell[k]`;

export default defineProblem<{ k: number; prices: number[] }>({
  id: 188,
  summary:
    "`prices[i]` 是某支股票第 `i` 天的價格。你**最多可以完成 `k` 筆交易**（一買一賣算一筆），而且必須先賣掉手上的股票才能再買。\n\n求能賺到的最大利潤。",
  examples: [
    { input: "k = 2, prices = [2,4,1]", output: "2", note: "2 買 4 賣" },
    { input: "k = 2, prices = [3,2,6,5,0,3]", output: "7", note: "2 買 6 賣賺 4，0 買 3 賣賺 3" },
  ],
  constraints: ["1 ≤ k ≤ 100", "1 ≤ prices.length ≤ 1000", "0 ≤ prices[i] ≤ 1000"],
  idea:
    "這是 LC 123 的推廣：把 `buy1, sell1, buy2, sell2` 換成兩個陣列。`buy[j]` = 買進第 `j` 張後手上最多的現金，`sell[j]` = 至多完成 `j` 筆交易後最多的現金。第 `j` 張只能用「完成 `j - 1` 筆」的錢去買，所以 `buy[j]` 看 `sell[j-1]`；賣掉它就完成第 `j` 筆，所以 `sell[j]` 看 `buy[j]`。",
  steps: [
    "`buy` 全部設成 `-inf`，`sell` 全部設成 0；`sell[0] = 0` 代表「一筆都不做」。",
    "每天對 `j = 1..k`：`buy[j] = max(buy[j], sell[j-1] - p)`。",
    "接著 `sell[j] = max(sell[j], buy[j] + p)`。",
    "答案是 `sell[k]`。",
  ],
  pitfalls: [
    "陣列要開 `k + 1` 格：`sell[0]` 是第 1 筆交易的起點，少了它 `j - 1` 會出錯。",
    "`j` 由小到大更新不會出錯：同一天買了又賣的獲利是 0，不會讓答案虛增。",
    "`sell[j]` 的意思是「**至多** `j` 筆」，所以不需要另外對所有 `j` 取最大值。",
  ],
  complexity: { time: "O(n × k)", space: "O(k)" },
  code,
  starter: `class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        `,
  presets: [
    { label: "k = 2, [3,2,6,5,0,3]", input: { k: 2, prices: [3, 2, 6, 5, 0, 3] }, expected: "7" },
    { label: "k = 1, [1,5,2,8]", input: { k: 1, prices: [1, 5, 2, 8] }, expected: "7" },
    { label: "k = 3, [1,5,2,8]（k 比需要的多）", input: { k: 3, prices: [1, 5, 2, 8] }, expected: "10" },
  ],
  trace({ k, prices }) {
    const t = tracer();
    const fmt = (x: number): string => (x === -Infinity ? "-∞" : String(x));
    const buy: number[] = new Array(k + 1).fill(-Infinity);
    const sell: number[] = new Array(k + 1).fill(0);
    const views = (
      day: number | null,
      buyMarks: Record<number, Tone> = {},
      sellMarks: Record<number, Tone> = {},
    ) => [
      V.bars("prices", prices, {
        marks: day === null ? {} : { [day]: "active" },
        pointers: day === null ? {} : { p: day },
      }),
      // buy / sell 併成一張兩列的表（行 = j），比兩條陣列矮很多
      V.grid("buy / sell（行 = 第 j 筆交易）", [buy.map(fmt), sell as Cell[]], {
        rowLabels: ["buy", "sell"],
        colLabels: buy.map((_, c) => `j=${c}`),
        marks: {
          "0,0": "muted",
          ...Object.fromEntries(Object.entries(buyMarks).map(([c, tone]) => [`0,${c}`, tone])),
          ...Object.fromEntries(Object.entries(sellMarks).map(([c, tone]) => [`1,${c}`, tone])),
        },
      }),
    ];

    t.push({
      line: [3, 4],
      note: `\`buy[j]\` 的意思是：**買進第 \`j\` 張股票後，手上最多剩多少現金**；\`sell[j]\` 是：**至多完成 \`j\` 筆交易後，手上最多有多少現金**。還沒買過所以 \`buy\` 全是 \`-∞\`，什麼都不做獲利是 0。答案在 \`sell[${k}]\`（\`buy[0]\` 用不到）。`,
      views: views(null),
      vars: { k },
    });

    prices.forEach((p, d) => {
      for (let j = 1; j <= k; j++) {
        const oldBuy = buy[j];
        const candBuy = sell[j - 1] - p;
        buy[j] = Math.max(oldBuy, candBuy);
        t.push({
          line: j === 1 ? [5, 6, 7] : [6, 7],
          note:
            `${j === 1 ? `第 ${d} 天，股價 \`p = ${p}\`。` : ""}第 ${j} 張：帶著前 ${j - 1} 筆的獲利 \`sell[${j - 1}] = ${sell[j - 1]}\` 今天買進，現金是 \`${sell[j - 1]} - ${p} = ${candBuy}\`。` +
            `\`buy[${j}] = max(${fmt(oldBuy)}, ${candBuy}) = ${buy[j]}\`，` +
            (candBuy > oldBuy ? "比原本划算，更新。" : candBuy === oldBuy ? "跟原本一樣。" : "之前有更划算的買點，維持不變。"),
          views: views(d, { [j]: "active" }, { [j - 1]: "compare" }),
          vars: { k, p, j, "buy[j]": buy[j], "sell[j]": sell[j] },
        });

        const oldSell = sell[j];
        const candSell = buy[j] + p;
        sell[j] = Math.max(oldSell, candSell);
        t.push({
          line: 8,
          note:
            `今天把第 ${j} 張賣掉，現金是 \`buy[${j}] + ${p} = ${buy[j]} + ${p} = ${candSell}\`。` +
            `\`sell[${j}] = max(${oldSell}, ${candSell}) = ${sell[j]}\`，` +
            (candSell > oldSell
              ? `完成 ${j} 筆交易的最大獲利提高到 ${sell[j]}。`
              : candSell === oldSell
                ? "跟原本一樣。"
                : "沒有比原本的獲利高，維持不變。"),
          views: views(d, { [j]: "compare" }, { [j]: "active" }),
          vars: { k, p, j, "buy[j]": buy[j], "sell[j]": sell[j] },
        });
      }
    });

    t.push({
      line: 9,
      note:
        sell[k] > 0
          ? `每一天都處理完了，\`sell[${k}] = ${sell[k]}\` 就是最多做 ${k} 筆交易能賺到的最大利潤。` +
            (k > 1 && sell[k] === sell[k - 1] ? `（它和 \`sell[${k - 1}]\` 一樣，表示用不到第 ${k} 筆。）` : "")
          : `\`sell[${k}]\` 一直是 0：沒有任何能賺錢的買賣點，不交易最好。`,
      views: views(null, {}, { [k]: "good" }),
      vars: { k },
      result: py(sell[k]),
    });
    return t.frames;
  },
});
