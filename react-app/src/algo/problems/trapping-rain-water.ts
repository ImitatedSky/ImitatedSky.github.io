import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def trap(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        left_max = right_max = 0
        water = 0
        while l < r:
            if height[l] < height[r]:       # 左邊較矮 → 左邊這格可以結算
                left_max = max(left_max, height[l])
                water += left_max - height[l]
                l += 1
            else:                           # 右邊較矮（或一樣高）→ 結算右邊
                right_max = max(right_max, height[r])
                water += right_max - height[r]
                r -= 1
        return water`;

export default defineProblem<{ height: number[] }>({
  id: 42,
  summary:
    "給一排寬度都是 1 的柱子，`height[i]` 是第 `i` 根的高度。下過雨之後，柱子之間的凹槽會積水，問**總共能接住多少單位的水**？",
  summaryEn:
    "You have a row of bars, each 1 unit wide, where `height[i]` is the height of bar `i`. After it rains, water collects in the dips between bars. **How many units of water are trapped in total**?",
  examples: [
    { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
    { input: "height = [4,2,0,3,2,5]", output: "9" },
  ],
  constraints: ["1 ≤ n ≤ 2 × 10⁴", "0 ≤ height[i] ≤ 10⁵"],
  constraintsEn: ["1 ≤ n ≤ 2 × 10⁴", "0 ≤ height[i] ≤ 10⁵"],
  idea:
    "每一格能積的水 = `min(左邊最高, 右邊最高) − 自己的高度`。用左右兩個指標往中間夾：**哪一邊的柱子比較矮，就先結算哪一邊**。因為較矮那邊的對面已經有一根不比它矮的牆撐著，它的水位只會被自己這一側的最高值決定，不用知道對面真正的最高是多少。",
  steps: [
    "`l`、`r` 放在兩端，`left_max`、`right_max` 記錄兩側走過的最高柱子。",
    "比較 `height[l]` 和 `height[r]`，處理**較矮**的那一邊。",
    "先用那格的高度更新該側的最高值，再把 `最高值 − 高度` 加進 `water`（自己就是最高時剛好加 0）。",
    "那一側的指標往中間移一格，直到 `l` 和 `r` 相遇。",
  ],
  pitfalls: [
    "要**先更新 max 再算水量**，這樣 `max − height` 永遠 ≥ 0，不需要另外判斷。",
    "迴圈條件是 `l < r`：兩個指標相遇的那一格一定是全場最高的柱子之一，上面不會有水。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def trap(self, height: List[int]) -> int:
        `,
  presets: [
    { label: "[0,1,0,2,1,0,1,3,2,1,2,1]", input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: "6" },
    { label: "[4,2,0,3,2,5]", input: { height: [4, 2, 0, 3, 2, 5] }, expected: "9" },
    { label: "[1,2,3,2,1]（沒有凹槽）", input: { height: [1, 2, 3, 2, 1] }, expected: "0" },
  ],
  trace({ height }) {
    const t = tracer();
    const n = height.length;
    const fill: number[] = new Array(n).fill(0);
    // 已經結算過的格子：有水 → good，沒水 → visited
    const done: Record<number, Tone> = {};
    let l = 0;
    let r = n - 1;
    let leftMax = 0;
    let rightMax = 0;
    let water = 0;

    const bars = (marks: Record<number, Tone> = {}) =>
      V.bars("height（上方疊的是積水）", height, { fill, pointers: { l, r }, marks: { ...done, ...marks } });
    const vars = () => ({ l, r, left_max: leftMax, right_max: rightMax, water });

    t.push({
      line: [3, 4, 5],
      note: "`l`、`r` 從兩端出發往中間夾。`left_max` / `right_max` 是兩側「已經走過」的最高柱子，一開始都是 0。",
      views: [bars()],
      vars: vars(),
    });

    while (l < r) {
      const hl = height[l];
      const hr = height[r];
      if (hl < hr) {
        t.push({
          line: [6, 7],
          note: `\`height[l] = ${hl}\` < \`height[r] = ${hr}\`，左邊較矮。右邊已經有一根高 ${hr} 的牆擋著，所以第 ${l} 格的水位只看 \`left_max\`，可以放心結算。`,
          views: [bars({ [l]: "active", [r]: "compare" })],
          vars: vars(),
        });
        const i = l;
        const raised = hl > leftMax;
        leftMax = Math.max(leftMax, hl);
        const add = leftMax - hl;
        water += add;
        fill[i] = add;
        done[i] = add > 0 ? "good" : "visited";
        l++;
        t.push({
          line: [8, 9, 10],
          note:
            (raised
              ? `這根柱子比之前的 \`left_max\` 還高，\`left_max\` 更新為 ${leftMax}；自己就是最高，上面積不了水（加 0）。`
              : `\`left_max = ${leftMax}\`，這格可以積 \`${leftMax} − ${hl} = ${add}\` 單位的水${add > 0 ? `，\`water\` 變成 ${water}` : ""}。`) +
            "`l` 往右移一格。",
          views: [bars({ [i]: add > 0 ? "good" : "active" })],
          vars: vars(),
        });
      } else {
        t.push({
          line: [6, 7, 11],
          note: `\`height[l] = ${hl}\` ${hl === hr ? "=" : ">"} \`height[r] = ${hr}\`，右邊${hl === hr ? "不比左邊高" : "較矮"}。左邊已經有一根高 ${hl} 的牆擋著，所以第 ${r} 格的水位只看 \`right_max\`，結算右邊。`,
          views: [bars({ [l]: "compare", [r]: "active" })],
          vars: vars(),
        });
        const i = r;
        const raised = hr > rightMax;
        rightMax = Math.max(rightMax, hr);
        const add = rightMax - hr;
        water += add;
        fill[i] = add;
        done[i] = add > 0 ? "good" : "visited";
        r--;
        t.push({
          line: [12, 13, 14],
          note:
            (raised
              ? `這根柱子比之前的 \`right_max\` 還高，\`right_max\` 更新為 ${rightMax}；自己就是最高，上面積不了水（加 0）。`
              : `\`right_max = ${rightMax}\`，這格可以積 \`${rightMax} − ${hr} = ${add}\` 單位的水${add > 0 ? `，\`water\` 變成 ${water}` : ""}。`) +
            "`r` 往左移一格。",
          views: [bars({ [i]: add > 0 ? "good" : "active" })],
          vars: vars(),
        });
      }
    }

    t.push({
      line: 15,
      note: `\`l\` 和 \`r\` 在第 ${l} 格相遇 —— 這是最高的柱子之一，上面不會有水。所有凹槽都結算完了，總共接住 ${water} 單位的水。`,
      views: [bars({ [l]: "alt" })],
      vars: vars(),
      result: py(water),
    });
    return t.frames;
  },
});
