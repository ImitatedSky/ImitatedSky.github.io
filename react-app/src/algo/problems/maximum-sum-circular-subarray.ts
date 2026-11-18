import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxSubarraySumCircular(self, nums: List[int]) -> int:
        total = 0
        cur_max = cur_min = 0
        best_max, best_min = -inf, inf
        for x in nums:
            total += x
            cur_max = max(x, cur_max + x)  # Kadane 找最大子陣列
            best_max = max(best_max, cur_max)
            cur_min = min(x, cur_min + x)  # 同樣的方法找最小子陣列
            best_min = min(best_min, cur_min)
        if best_max < 0:  # 全是負數：不能把整個陣列都挖掉
            return best_max
        return max(best_max, total - best_min)`;

type Range = { from: number; to: number; tone?: Tone; label?: string };

export default defineProblem<{ nums: number[] }>({
  id: 918,
  summary:
    "給一個**環形**的整數陣列 `nums`：最後一個元素的下一個是第一個元素。找出總和最大的非空連續子陣列，回傳這個最大總和。\n\n子陣列可以跨過尾端繞回開頭，但每個元素最多只能用一次。",
  examples: [
    { input: "nums = [1,-2,3,-2]", output: "3", note: "不繞圈的 [3] 最大" },
    { input: "nums = [5,-3,5]", output: "10", note: "繞圈取 [5,5]" },
    { input: "nums = [-3,-2,-3]", output: "-2" },
  ],
  constraints: ["1 ≤ nums.length ≤ 3 × 10⁴", "−3 × 10⁴ ≤ nums[i] ≤ 3 × 10⁴"],
  idea:
    "答案只有兩種長相。**不繞圈**：就是一般的最大子陣列（Kadane）。**繞圈**：取了頭和尾，沒取的是中間一段連續的元素 —— 要讓頭尾的和最大，就要讓中間被挖掉的那段和**最小**，所以是 `total - 最小子陣列和`。兩者取大的即可，而最小子陣列同樣用 Kadane 一趟算出來。",
  steps: [
    "一趟走訪同時維護：總和 `total`、最大子陣列和 `best_max`、最小子陣列和 `best_min`。",
    "不繞圈的答案是 `best_max`。",
    "繞圈的答案是 `total - best_min`（把中間最小的那段挖掉）。",
    "若 `best_max < 0`（全是負數），直接回傳 `best_max`；否則回傳兩者較大的。",
  ],
  pitfalls: [
    "全是負數時，最小子陣列就是整個陣列，`total - best_min = 0` 代表「一個都不拿」，但子陣列不能是空的，一定要特判。",
    "不要把陣列複製兩份再做 Kadane：那樣子陣列長度可能超過 `n`，同一個元素被用兩次。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def maxSubarraySumCircular(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "繞圈比較好", input: { nums: [8, -1, -3, 8, -6, -9, 2, 4] }, expected: "18" },
    { label: "不繞圈比較好 [1,-2,3,-2]", input: { nums: [1, -2, 3, -2] }, expected: "3" },
    { label: "全部是負數", input: { nums: [-3, -2, -3] }, expected: "-2" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    const LABEL = "nums（環形：尾巴接回開頭）";
    const paren = (v: number) => (v < 0 ? `(${v})` : `${v}`);

    let total = 0;
    let curMax = 0;
    let curMin = 0;
    let bestMax = -Infinity;
    let bestMin = Infinity;
    let curMaxL = 0;
    let curMinL = 0;
    let maxL = 0;
    let maxR = 0;
    let minL = 0;
    let minR = 0;

    const maxRange = (): Range => ({ from: maxL, to: maxR, tone: "good", label: `max ${bestMax}` });
    const minRange = (): Range => ({ from: minL, to: minR, tone: "bad", label: `min ${bestMin}` });
    // 兩段完全重合時（例如只看過第一格）合併標籤，避免文字疊在一起
    const ranges = (): Range[] =>
      maxL === minL && maxR === minR
        ? [{ ...maxRange(), label: `max = min = ${bestMax}` }, { ...minRange(), label: undefined }]
        : [maxRange(), minRange()];
    const vars = () => ({
      total,
      cur_max: curMax,
      best_max: bestMax === -Infinity ? "-inf" : bestMax,
      cur_min: curMin,
      best_min: bestMin === Infinity ? "inf" : bestMin,
    });

    t.push({
      line: [3, 4, 5],
      note: "環形陣列的最佳子陣列只有兩種：**不繞圈**（普通的最大子陣列），或**繞圈**（拿頭和尾，中間挖掉一段）。一趟走訪同時算出總和、最大子陣列、最小子陣列。",
      views: [V.array(LABEL, nums)],
      vars: vars(),
    });

    for (let i = 0; i < n; i++) {
      const x = nums[i];
      total += x;

      if (curMax + x >= x && i > 0) curMax += x;
      else {
        curMax = x;
        curMaxL = i;
      }
      const newMax = curMax > bestMax;
      if (newMax) {
        bestMax = curMax;
        maxL = curMaxL;
        maxR = i;
      }

      if (curMin + x <= x && i > 0) curMin += x;
      else {
        curMin = x;
        curMinL = i;
      }
      const newMin = curMin < bestMin;
      if (newMin) {
        bestMin = curMin;
        minL = curMinL;
        minR = i;
      }

      const parts = [`\`x = ${x}\`，\`total\` 累加到 ${total}。`];
      parts.push(
        `以這格結尾的最大和 \`cur_max = ${curMax}\`${curMaxL === i && i > 0 ? "（丟掉前面，從這格重新開始）" : ""}${newMax ? "，刷新 `best_max`" : ""}；` +
          `最小和 \`cur_min = ${curMin}\`${curMinL === i && i > 0 ? "（丟掉前面，從這格重新開始）" : ""}${newMin ? "，刷新 `best_min`" : ""}。`,
      );
      t.push({
        line: [6, 7, 8, 9, 10, 11],
        note: parts.join(""),
        views: [V.array(LABEL, nums, { pointers: { i }, marks: { [i]: "active" }, ranges: ranges() })],
        vars: vars(),
      });
    }

    const maxMarks: Record<number, Tone> = {};
    for (let k = maxL; k <= maxR; k++) maxMarks[k] = "good";
    t.push({
      line: 12,
      note: `走完一圈。**不繞圈**的最佳答案就是最大子陣列：\`${py(nums.slice(maxL, maxR + 1))}\`，和為 \`best_max = ${bestMax}\`。`,
      views: [V.array(LABEL, nums, { marks: maxMarks, ranges: ranges() })],
      vars: vars(),
    });

    if (bestMax < 0) {
      const marks: Record<number, Tone> = {};
      nums.forEach((_, k) => (marks[k] = k >= maxL && k <= maxR ? "good" : "muted"));
      t.push({
        line: [12, 13],
        note: `\`best_max = ${bestMax} < 0\`，表示每個數都是負的。這時最小子陣列是整個陣列，\`total - best_min = 0\` 等於「全部挖掉、一個都不拿」，但子陣列不能是空的。所以直接回傳最大的那個數 \`${bestMax}\`。`,
        views: [V.array(LABEL, nums, { marks, ranges: ranges() })],
        vars: vars(),
        result: py(bestMax),
      });
      return t.frames;
    }

    const wrap = total - bestMin;
    const wrapMarks: Record<number, Tone> = {};
    nums.forEach((_, k) => (wrapMarks[k] = k >= minL && k <= minR ? "bad" : "alt"));
    t.push({
      line: 14,
      note: `**繞圈**的子陣列拿頭和尾，沒拿的是中間一段。要讓剩下的最大，就挖掉和最小的那段 \`${py(nums.slice(minL, minR + 1))}\`（\`best_min = ${bestMin}\`）：藍色部分的和是 \`total - best_min = ${total} - ${paren(bestMin)} = ${wrap}\`。`,
      views: [V.array(LABEL, nums, { marks: wrapMarks, ranges: ranges() })],
      vars: { ...vars(), "total - best_min": wrap },
    });

    const ans = Math.max(bestMax, wrap);
    const useWrap = wrap > bestMax;
    const finalMarks: Record<number, Tone> = {};
    nums.forEach((_, k) => {
      const inAnswer = useWrap ? k < minL || k > minR : k >= maxL && k <= maxR;
      finalMarks[k] = inAnswer ? "good" : "muted";
    });
    t.push({
      line: 14,
      note: useWrap
        ? `比較兩種：不繞圈 \`${bestMax}\` vs 繞圈 \`${wrap}\`。繞圈比較大，答案是 \`${ans}\` —— 綠色的尾巴接回開頭，是一段連續的環形子陣列。`
        : `比較兩種：不繞圈 \`${bestMax}\` vs 繞圈 \`${wrap}\`。${wrap === bestMax ? "兩者一樣大" : "不繞圈比較大"}，答案是 \`${ans}\`。`,
      views: [V.array(LABEL, nums, { marks: finalMarks, ranges: useWrap ? [minRange()] : [maxRange()] })],
      vars: { ...vars(), "total - best_min": wrap },
      result: py(ans),
    });
    return t.frames;
  },
});
