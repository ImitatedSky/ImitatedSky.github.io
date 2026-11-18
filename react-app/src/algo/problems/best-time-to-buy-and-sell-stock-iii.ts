import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        buy1 = buy2 = -inf  # 買進第 1 / 第 2 張股票後，手上最多剩多少現金
        sell1 = sell2 = 0   # 賣掉第 1 / 第 2 張股票後，手上最多有多少現金
        for p in prices:
            buy1 = max(buy1, -p)
            sell1 = max(sell1, buy1 + p)
            buy2 = max(buy2, sell1 - p)
            sell2 = max(sell2, buy2 + p)
        return sell2`;

const NAMES = ["buy1", "sell1", "buy2", "sell2"] as const;

export default defineProblem<{ prices: number[] }>({
  id: 123,
  summary:
    "`prices[i]` 是某支股票第 `i` 天的價格。你**最多可以完成兩筆交易**（一買一賣算一筆），而且手上同時只能持有一張 —— 必須先賣掉才能再買。\n\n求能賺到的最大利潤；賺不到錢就回傳 0。",
  examples: [
    { input: "prices = [3,3,5,0,0,3,1,4]", output: "6", note: "0 買 3 賣賺 3，1 買 4 賣再賺 3" },
    { input: "prices = [1,2,3,4,5]", output: "4", note: "1 買 5 賣，一筆交易就夠" },
    { input: "prices = [7,6,4,3,1]", output: "0", note: "一路下跌，不交易" },
  ],
  constraints: ["1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁵"],
  idea:
    "把「兩筆交易」拆成依序經過的四個狀態：`buy1 → sell1 → buy2 → sell2`，每個變數記錄**走到那個狀態時手上最多有多少現金**（從 0 元開始，買進會變負的）。每天對每個狀態只有兩個選擇：維持原狀，或是今天從前一個狀態做一次買／賣走過來。四個 `max` 掃一遍就結束。",
  steps: [
    "`buy1 = buy2 = -inf`（還不可能處於持有狀態），`sell1 = sell2 = 0`。",
    "`buy1 = max(buy1, -p)`：用更便宜的價格買第一張。",
    "`sell1 = max(sell1, buy1 + p)`：今天把第一張賣掉。",
    "`buy2 = max(buy2, sell1 - p)`：拿第一筆的獲利去買第二張。",
    "`sell2 = max(sell2, buy2 + p)`：今天把第二張賣掉。答案是 `sell2`。",
  ],
  pitfalls: [
    "四行的順序可以照 `buy1 → sell2` 寫沒問題：同一天「買了又賣」獲利是 0，不會讓答案變大，所以不需要暫存前一天的值。",
    "只做一筆交易的情況已經包含在內：第二筆可以在同一天買賣（賺 0），所以 `sell2 ≥ sell1`。",
    "把陣列切成左右兩半各算一次也能做，但要兩趟加額外陣列；狀態機寫法只要 O(1) 空間，還能直接推廣到 k 筆交易（LC 188）。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        `,
  presets: [
    { label: "[3,3,5,0,0,3,1,4]", input: { prices: [3, 3, 5, 0, 0, 3, 1, 4] }, expected: "6" },
    { label: "[1,2,3,4,5]", input: { prices: [1, 2, 3, 4, 5] }, expected: "4" },
    { label: "[7,6,4,3,1]（一路下跌）", input: { prices: [7, 6, 4, 3, 1] }, expected: "0" },
  ],
  trace({ prices }) {
    const t = tracer();
    const n = prices.length;
    const fmt = (x: number): string => (x === -Infinity ? "-∞" : String(x));
    const signed = (x: number): string => (x < 0 ? `(${x})` : String(x));
    // state[k] = buy1, sell1, buy2, sell2 目前的值
    const state = [-Infinity, 0, -Infinity, 0];
    // 表格：4 列（四個狀態）× n + 1 行（初始 + 每一天）
    const table: Cell[][] = NAMES.map(() => new Array<Cell>(n + 1).fill(""));
    state.forEach((v, k) => (table[k][0] = fmt(v)));
    const colLabels: Cell[] = ["初始", ...prices];
    const rowLabels: Cell[] = [...NAMES];
    const vars = (p?: number): Record<string, Cell> => ({
      ...(p === undefined ? {} : { p }),
      buy1: fmt(state[0]),
      sell1: fmt(state[1]),
      buy2: fmt(state[2]),
      sell2: fmt(state[3]),
    });
    const views = (day: number | null, marks: Record<string, Tone> = {}, priceMarks: Record<number, Tone> = {}) => [
      V.bars("prices", prices, {
        marks: priceMarks,
        pointers: day === null ? {} : { p: day },
      }),
      V.grid("狀態（列）× 每一天的股價（行）", table, { rowLabels, colLabels, marks }),
    ];

    t.push({
      line: [3, 4],
      note: "四個變數代表依序經過的四個狀態，值是**走到該狀態時手上最多有多少現金**（從 0 元起算）。還沒買過所以 `buy1`、`buy2` 是 `-∞`（不可能的狀態）；什麼都不做獲利是 0，所以 `sell1 = sell2 = 0`。",
      views: views(null, { "0,0": "active", "1,0": "active", "2,0": "active", "3,0": "active" }),
      vars: vars(),
    });

    for (let d = 0; d < n; d++) {
      const p = prices[d];
      const col = d + 1;
      for (let k = 0; k < 4; k++) {
        const prev = state[k];
        const isBuy = k % 2 === 0;
        // 前一個狀態今天的值；buy1 的「前一個狀態」是 0 元起點
        const src = k === 0 ? 0 : state[k - 1];
        const cand = isBuy ? src - p : src + p;
        const next = Math.max(prev, cand);
        state[k] = next;
        table[k][col] = fmt(next);

        const name = NAMES[k];
        const which = k < 2 ? 1 : 2;
        let expr: string;
        let action: string;
        if (k === 0) {
          expr = `max(${fmt(prev)}, ${fmt(cand)})`;
          action = `今天用 ${p} 元買第 1 張，現金變成 \`0 - ${p} = ${fmt(cand)}\``;
        } else if (isBuy) {
          expr = `max(${fmt(prev)}, ${fmt(src)} - ${p})`;
          action = `帶著第 1 筆的獲利 \`sell1 = ${fmt(src)}\`，今天用 ${p} 元買第 2 張，現金變成 \`${fmt(cand)}\``;
        } else {
          expr = `max(${fmt(prev)}, ${src === -Infinity ? "-∞" : signed(src)} + ${p})`;
          action = `今天用 ${p} 元把第 ${which} 張賣掉，現金變成 \`buy${which} + ${p} = ${fmt(cand)}\``;
        }
        const verdict =
          cand > prev
            ? isBuy
              ? "比原本好（等於買得更划算），更新。"
              : "比原本的獲利高，更新。"
            : cand === prev
              ? "跟原本一樣，沒有變化。"
              : isBuy
                ? "比原本差（之前有更划算的買點），維持不變。"
                : "沒有比原本的獲利高，維持不變。";

        const marks: Record<string, Tone> = { [`${k},${col}`]: "active", [`${k},${col - 1}`]: "compare" };
        if (k > 0) marks[`${k - 1},${col}`] = "compare";
        t.push({
          line: k === 0 ? [5, 6] : 6 + k,
          note: `${k === 0 ? `第 ${d} 天，股價 \`p = ${p}\`。` : ""}${action}。\`${name} = ${expr} = ${fmt(next)}\`，${verdict}`,
          views: views(d, marks, { [d]: "active" }),
          vars: vars(p),
        });
      }
    }

    const last: Record<string, Tone> = { [`3,${n}`]: "good" };
    t.push({
      line: 10,
      note:
        state[3] > 0
          ? `每一天都處理完了。\`sell2 = ${state[3]}\` 是「最多做兩筆交易」能拿到的最大現金，也就是答案。`
          : "股價從頭到尾沒有任何能賺錢的買賣點，`sell2` 一直是 0：不交易就是最佳解。",
      views: views(null, last),
      vars: vars(),
      result: py(state[3]),
    });
    return t.frames;
  },
});
