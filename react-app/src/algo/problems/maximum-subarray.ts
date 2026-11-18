import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)  # 接在前一段後面，或從 x 重新開始
            best = max(best, cur)
        return best`;

export default defineProblem<{ nums: number[] }>({
  id: 53,
  summary:
    "給一個整數陣列 `nums`（有正有負），找出**總和最大的連續子陣列**，回傳這個最大總和。子陣列至少要包含一個元素。",
  examples: [
    { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", note: "子陣列 [4,-1,2,1] 的總和最大" },
    { input: "nums = [5,4,-1,7,8]", output: "23" },
    { input: "nums = [-3,-1,-4]", output: "-1" },
  ],
  constraints: ["1 ≤ nums.length ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
  idea:
    "Kadane 演算法：讓 `cur` 代表**以目前這格結尾**的最大子陣列和。走到 `x` 時只有兩種選擇 —— 接在前一段後面（`cur + x`），或丟掉前面、從 `x` 重新開始。前面累積的和如果是負的，帶著它只會扣分，所以直接丟掉。過程中出現過的最大 `cur` 就是答案。",
  steps: [
    "`cur` 和 `best` 都從 `nums[0]` 開始。",
    "對後面的每個 `x`：`cur = max(x, cur + x)`。",
    "用 `cur` 更新 `best`。",
    "走完回傳 `best`。",
  ],
  pitfalls: [
    "`best` 不能從 0 開始：陣列全是負數時，答案是最大的那個負數，不是 0。",
    "`cur` 是「以這格**結尾**」的最佳和，不是「到目前為止」的最佳和，後者是 `best`。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[-2,1,-3,4,-1,2,1,-5,4]", input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: "6" },
    { label: "[5,4,-1,7,8]", input: { nums: [5, 4, -1, 7, 8] }, expected: "23" },
    { label: "全部是負數", input: { nums: [-3, -1, -4] }, expected: "-1" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    // table[i] = 以 nums[i] 結尾的最大子陣列和（每一輪的 cur）
    const table: Cell[] = nums.map(() => "");
    const paren = (v: number) => (v < 0 ? `(${v})` : `${v}`);

    let cur = nums[0];
    let best = nums[0];
    let curL = 0; // 目前這一段的起點
    let bestL = 0;
    let bestR = 0;
    table[0] = cur;

    const views = (i: number, done = false) => {
      const marks: Record<number, Tone> = {};
      for (let k = bestL; k <= bestR; k++) marks[k] = "good";
      return [
        V.array("nums", nums, {
          pointers: done ? {} : { i },
          marks,
          ranges: done
            ? [{ from: bestL, to: bestR, tone: "good", label: `best = ${best}` }]
            : [{ from: curL, to: i, tone: "active", label: `cur = ${cur}` }],
        }),
        V.array("以每一格結尾的最大和（歷次的 cur）", table, {
          marks: done ? { [bestR]: "good" } : { [bestR]: "good", [i]: "active" },
        }),
      ];
    };

    t.push({
      line: 3,
      note: `從第一個數開始：以 \`nums[0]\` 結尾的子陣列只有它自己，所以 \`cur = best = ${cur}\`。綠色是目前找到的最佳子陣列。`,
      views: views(0),
      vars: { cur, best },
    });

    for (let i = 1; i < n; i++) {
      const x = nums[i];
      const prev = cur;
      let note: string;
      if (prev + x >= x) {
        cur = prev + x;
        note = `\`x = ${x}\`。前面累積的 \`cur = ${prev}\` 不是負的，帶著它不吃虧：\`${prev} + ${paren(x)} = ${cur}\` ≥ 單獨的 \`${x}\`，所以**接上去**。`;
      } else {
        cur = x;
        curL = i;
        note = `\`x = ${x}\`。前面累積的 \`cur = ${prev}\` 是負的，接上去只有 \`${prev} + ${paren(x)} = ${prev + x}\`，還不如單獨的 \`${x}\`。**丟掉前面，從這格重新開始**。`;
      }
      table[i] = cur;
      if (cur > best) {
        note += `\`cur = ${cur}\` 超過 \`best = ${best}\`，更新最佳答案。`;
        best = cur;
        bestL = curL;
        bestR = i;
      } else {
        note += `\`cur = ${cur}\` 沒有超過 \`best = ${best}\`，答案不變。`;
      }
      t.push({
        line: [4, 5, 6],
        note,
        views: views(i),
        vars: { x, cur, best },
      });
    }

    t.push({
      line: 7,
      note: `走完了。每一格結尾的最大和裡，最大的是 \`${best}\`，對應的子陣列是 \`${py(nums.slice(bestL, bestR + 1))}\`。`,
      views: views(n - 1, true),
      vars: { cur, best },
      result: py(best),
    });
    return t.frames;
  },
});
