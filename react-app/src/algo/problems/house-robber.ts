import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def rob(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [0] * (n + 1)  # dp[i] = 只看前 i 間房子，最多能偷到多少
        dp[1] = nums[0]
        for i in range(2, n + 1):
            # 第 i 間（nums[i - 1]）：不偷，或是偷它再加上 dp[i - 2]
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])
        return dp[n]`;

export default defineProblem<{ nums: number[] }>({
  id: 198,
  summary:
    "一排房子，`nums[i]` 是第 `i` 間屋裡的現金。**相鄰的兩間不能同一晚都偷**，否則會觸發警報。\n\n問在不觸發警報的前提下，最多能偷到多少錢。",
  summaryEn:
    "Houses stand in a row, and `nums[i]` is the cash in house `i`. **Robbing two adjacent houses on the same night** sets off the alarm.\n\nWhat is the most money you can take without triggering it?",
  examples: [
    { input: "nums = [1,2,3,1]", output: "4", note: "偷第 1、3 間：1 + 3", noteEn: "Rob houses 1 and 3: 1 + 3" },
    { input: "nums = [2,7,9,3,1]", output: "12", note: "偷第 1、3、5 間：2 + 9 + 1", noteEn: "Rob houses 1, 3 and 5: 2 + 9 + 1" },
  ],
  constraints: ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
  constraintsEn: ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
  idea:
    "定義 `dp[i]` = 只考慮**前 `i` 間**房子時能偷到的最大金額。對第 `i` 間只有兩個選擇：**不偷**（答案沿用 `dp[i-1]`），或**偷**（上一間就不能碰，所以是 `dp[i-2] + nums[i-1]`），取較大者。",
  steps: [
    "`dp[0] = 0`（沒有房子）、`dp[1] = nums[0]`（只有一間就偷它）。",
    "`i` 從 2 到 n：`dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])`。",
    "答案是 `dp[n]`。",
  ],
  pitfalls: [
    "`dp` 多開一格，`dp[i]` 對應的是 `nums[i-1]`，索引差 1 很容易寫錯。",
    "不是「隔一間偷一間」就好：`[2,1,1,2]` 的最佳解是偷頭尾，中間跳過兩間。",
    "每格只看前兩格，可以用兩個變數滾動把空間壓到 O(1)。",
  ],
  complexity: { time: "O(n)", space: "O(n)（滾動變數可降到 O(1)）" },
  code,
  starter: `class Solution:
    def rob(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[2,7,9,3,1]", input: { nums: [2, 7, 9, 3, 1] }, expected: "12" },
    { label: "[2,1,1,2]", input: { nums: [2, 1, 1, 2] }, expected: "4" },
    { label: "[5]", input: { nums: [5] }, expected: "5" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    const dp: number[] = new Array(n + 1).fill(0);
    let filled = 0;
    const show = (): Cell[] => dp.map((v, i) => (i <= filled ? v : ""));
    const views = (
      numMarks: Record<number, Tone> = {},
      dpMarks: Record<number, Tone> = {},
      i?: number,
    ) => [
      V.bars("nums", nums, { marks: numMarks, pointers: i === undefined ? {} : { "i-1": i - 1 } }),
      V.array("dp", show(), { marks: dpMarks, pointers: i === undefined ? {} : { i } }),
    ];

    t.push({
      line: [3, 4],
      note: `\`dp[i]\` 的意思是：**只看前 \`i\` 間房子，最多能偷到多少**。表格多開一格，\`dp[0] = 0\` 代表「一間都沒有」，答案在 \`dp[${n}]\`。`,
      views: views({}, { 0: "good" }),
      vars: { n },
    });

    dp[1] = nums[0];
    filled = 1;
    t.push({
      line: 5,
      note: `只有第 1 間時沒什麼好選的，直接偷：\`dp[1] = nums[0] = ${nums[0]}\`。`,
      views: views({ 0: "active" }, { 1: "active" }, 1),
      vars: { n },
    });

    for (let i = 2; i <= n; i++) {
      const skip = dp[i - 1];
      const take = dp[i - 2] + nums[i - 1];
      dp[i] = Math.max(skip, take);
      filled = i;
      const why =
        take > skip
          ? `偷比較划算（${take} > ${skip}）`
          : take === skip
            ? "兩者一樣多"
            : `不偷比較划算（${skip} > ${take}），這間跳過`;
      t.push({
        line: [6, 7, 8],
        note:
          `第 ${i} 間有 \`${nums[i - 1]}\` 元。不偷 → 沿用 \`dp[${i - 1}] = ${skip}\`；偷 → 上一間不能碰，\`dp[${i - 2}] + ${nums[i - 1]} = ${dp[i - 2]} + ${nums[i - 1]} = ${take}\`。` +
          `${why}：\`dp[${i}] = max(${skip}, ${take}) = ${dp[i]}\`。`,
        views: views({ [i - 1]: "active" }, { [i]: "active", [i - 1]: "compare", [i - 2]: "compare" }, i),
        vars: { n, i, 不偷: skip, 偷: take, "dp[i]": dp[i] },
      });
    }

    // 回溯出實際偷了哪幾間，讓答案看得見
    const robbed: Record<number, Tone> = {};
    const picked: number[] = [];
    for (let i = n; i >= 1; ) {
      if (dp[i] === dp[i - 1]) i -= 1;
      else {
        robbed[i - 1] = "good";
        picked.unshift(nums[i - 1]);
        i -= 2;
      }
    }
    t.push({
      line: 9,
      note:
        `答案是 \`dp[${n}] = ${dp[n]}\`。` +
        (picked.length ? `對應的偷法是綠色那幾間：\`${picked.join(" + ")} = ${dp[n]}\`，彼此都不相鄰。` : "每間都是 0 元，偷不偷都一樣。"),
      views: views(robbed, { [n]: "good" }),
      vars: { n },
      result: py(dp[n]),
    });
    return t.frames;
  },
});
