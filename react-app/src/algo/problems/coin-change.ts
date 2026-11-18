import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        # dp[a] = 湊出金額 a 最少需要幾枚硬幣（inf 代表湊不出來）
        dp = [0] + [inf] * amount
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)
        return dp[amount] if dp[amount] != inf else -1`;

export default defineProblem<{ coins: number[]; amount: number }>({
  id: 322,
  summary:
    "給幾種面額的硬幣 `coins`（每種數量不限）和一個總金額 `amount`，問**最少要用幾枚硬幣**才能剛好湊出這個金額。\n\n如果怎麼湊都湊不出來，回傳 `-1`。",
  examples: [
    { input: "coins = [1,2,5], amount = 11", output: "3", note: "5 + 5 + 1" },
    { input: "coins = [2], amount = 3", output: "-1" },
    { input: "coins = [1], amount = 0", output: "0" },
  ],
  constraints: ["1 ≤ coins.length ≤ 12", "0 ≤ amount ≤ 10⁴"],
  idea:
    "定義 `dp[a]` = 湊出金額 `a` 的最少硬幣數。想像**最後放上去的那一枚**是面額 `c`，那在它之前一定已經用最少的硬幣湊好了 `a - c`，所以 `dp[a] = min(dp[a - c]) + 1`，把每種面額都試一遍取最小。",
  steps: [
    "`dp[0] = 0`，其餘先填 `inf`（還不知道湊不湊得出來）。",
    "金額 `a` 從 1 填到 `amount`：對每個不超過 `a` 的面額 `c`，用 `dp[a - c] + 1` 來更新 `dp[a]`。",
    "最後 `dp[amount]` 還是 `inf` 就回傳 `-1`，否則回傳它。",
  ],
  pitfalls: [
    "貪心（每次拿最大面額）會錯：`coins = [1,3,4]`、`amount = 6`，貪心拿 `4+1+1` 是 3 枚，最佳解是 `3+3` 共 2 枚。",
    "初始值要用「無限大」而不是 0 或 -1，否則 `min` 會被錯誤的值污染；`inf + 1` 仍是 `inf`，不用特別判斷。",
  ],
  complexity: { time: "O(amount × 硬幣種類)", space: "O(amount)" },
  code,
  starter: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        `,
  presets: [
    { label: "[1,2,5], 11", input: { coins: [1, 2, 5], amount: 11 }, expected: "3" },
    { label: "[1,3,4], 6（貪心會錯）", input: { coins: [1, 3, 4], amount: 6 }, expected: "2" },
    { label: "[2], 3（湊不出來）", input: { coins: [2], amount: 3 }, expected: "-1" },
  ],
  trace({ coins, amount }) {
    const t = tracer();
    const dp: number[] = [0, ...new Array(amount).fill(Infinity)];
    const fmt = (x: number) => (x === Infinity ? "∞" : String(x));
    const show = (): Cell[] => dp.map((v) => (v === Infinity ? "∞" : v));
    const views = (
      dpMarks: Record<number, Tone> = {},
      coinMarks: Record<number, Tone> = {},
      pointers: Record<string, number> = {},
    ) => [V.array("coins", coins, { marks: coinMarks }), V.array("dp", show(), { marks: dpMarks, pointers })];

    t.push({
      line: [3, 4],
      note: `\`dp[a]\` 的意思是：**湊出金額 \`a\` 最少要幾枚硬幣**。\`dp[0] = 0\`（0 元不用任何硬幣），其他先填 \`∞\` 表示「還湊不出來」。答案在 \`dp[${amount}]\`。`,
      views: views({ 0: "good" }),
      vars: { amount },
    });

    for (let a = 1; a <= amount; a++) {
      const dpMarks: Record<number, Tone> = { [a]: "active" };
      const coinMarks: Record<number, Tone> = {};
      const parts: string[] = [];
      const cands: number[] = [];
      let best = Infinity;
      let bestCoins: number[] = [];
      coins.forEach((c, k) => {
        if (c > a) {
          coinMarks[k] = "muted";
          return;
        }
        coinMarks[k] = "compare";
        dpMarks[a - c] = "compare";
        const v = dp[a - c] + 1;
        parts.push(`最後一枚用 ${c} → \`dp[${a - c}] + 1 = ${fmt(v)}\``);
        cands.push(a - c);
        if (v < best) {
          best = v;
          bestCoins = [c];
        } else if (v === best) {
          bestCoins.push(c);
        }
      });
      dp[a] = Math.min(dp[a], best);

      let note: string;
      if (!cands.length) {
        note = `金額 ${a}：每種硬幣都比 ${a} 大，一枚都放不進去，\`dp[${a}]\` 維持 \`∞\`。`;
      } else {
        const formula =
          cands.length === 1
            ? `\`dp[${a}] = dp[${cands[0]}] + 1 = ${fmt(dp[a])}\``
            : `\`dp[${a}] = min(${cands.map((x) => `dp[${x}]`).join(", ")}) + 1 = ${fmt(dp[a])}\``;
        note =
          `金額 ${a}：${parts.join("；")}。${formula}` +
          (dp[a] === Infinity
            ? "，前面那幾格本身就湊不出來，所以這格也湊不出來。"
            : cands.length > 1
              ? bestCoins.length === cands.length
                ? "，選哪一枚都一樣。"
                : `，最後一枚選 ${bestCoins.join(" 或 ")} 最省。`
              : "。");
      }
      t.push({
        line: [5, 6, 7, 8],
        note,
        views: views(dpMarks, coinMarks, { a }),
        vars: { amount, a, "dp[a]": fmt(dp[a]) },
      });
    }

    const ok = dp[amount] !== Infinity;
    const res = ok ? dp[amount] : -1;

    // 回溯出實際用了哪些硬幣
    const used: number[] = [];
    const path: Record<number, Tone> = {};
    if (ok) {
      let a = amount;
      path[a] = "good";
      while (a > 0) {
        const c = coins.find((c) => c <= a && dp[a - c] + 1 === dp[a])!;
        used.push(c);
        a -= c;
        path[a] = "good";
      }
    } else {
      path[amount] = "bad";
    }
    t.push({
      line: 9,
      note: ok
        ? `\`dp[${amount}] = ${res}\`${amount > 0 ? `，其中一種湊法是 \`${used.join(" + ")} = ${amount}\`（綠色格子是沿路經過的金額）` : ""}。`
        : `\`dp[${amount}]\` 還是 \`∞\`，代表這些面額湊不出 ${amount}，回傳 \`-1\`。`,
      views: views(path),
      vars: { amount },
      result: py(res),
    });
    return t.frames;
  },
});
