import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        k = 1  # nums[:k] 是已經去重好的部分
        for i in range(1, len(nums)):
            if nums[i] != nums[k - 1]:
                nums[k] = nums[i]
                k += 1
        return k`;

export default defineProblem<{ nums: number[] }>({
  id: 26,
  summary:
    "給一個**由小到大排序**的整數陣列 `nums`，請原地刪掉重複的數，讓每個數值只出現一次，並保持原本的相對順序。\n\n回傳不重複的數值個數 `k`；`nums` 的前 `k` 格必須依序放著這些數，之後的內容不重要。",
  examples: [
    { input: "nums = [1,1,2]", output: "2, nums = [1,2,_]" },
    { input: "nums = [0,0,1,1,1,2,2,3,3,4]", output: "5, nums = [0,1,2,3,4,_,_,_,_,_]" },
  ],
  constraints: ["1 ≤ nums.length ≤ 3 × 10⁴", "nums 已經由小到大排序"],
  idea:
    "因為陣列排序過，**相同的數一定黏在一起**。所以判斷「是不是新的數」不需要雜湊表，只要跟保留區的最後一個 `nums[k - 1]` 比：不一樣就是第一次出現，抄到 `nums[k]`；一樣就是重複，跳過。",
  steps: [
    "第一個數一定保留，所以 `k = 1`，`i` 從 1 開始。",
    "若 `nums[i] != nums[k - 1]`：遇到新的數值，抄到 `nums[k]`，`k += 1`。",
    "否則它和保留區最後一個數相同，是重複的，直接跳過。",
    "走完回傳 `k`。",
  ],
  pitfalls: [
    "是跟 `nums[k - 1]`（保留區的最後一個）比，不是跟 `nums[i - 1]` 比 —— 這題兩種寫法剛好都對，但前者才能直接推廣到「最多保留 2 次」的進階題。",
    "題目保證至少有一個元素，所以 `k` 可以直接從 1 開始。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[0,0,1,1,1,2,2,3,3,4]", input: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] }, expected: "5" },
    { label: "[1,1,2]", input: { nums: [1, 1, 2] }, expected: "2" },
    { label: "[7,7,7,7]", input: { nums: [7, 7, 7, 7] }, expected: "1" },
  ],
  trace({ nums: input }) {
    const t = tracer();
    const nums = [...input];
    const n = nums.length;
    let k = 1;

    const view = (i: number, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let x = 0; x < n; x++) {
        if (x < k) marks[x] = "good";
        else if (x < i) marks[x] = "muted";
      }
      return V.array("nums", nums, {
        marks: { ...marks, ...extra },
        pointers: i < n ? { k, i } : { k },
        ranges: [{ from: 0, to: k - 1, tone: "good", label: `不重複 ${k} 個` }],
      });
    };

    t.push({
      line: 3,
      note: `第一個數 \`${nums[0]}\` 前面沒有東西，一定是第一次出現，所以保留區一開始就有 1 個：\`k = 1\`。`,
      views: [view(1)],
      vars: { k },
    });

    for (let i = 1; i < n; i++) {
      const last = nums[k - 1];
      if (nums[i] !== last) {
        t.push({
          line: [4, 5],
          note: `\`nums[${i}] = ${nums[i]}\` 和保留區最後一個 \`nums[${k - 1}] = ${last}\` 不同。陣列是排序的，所以 \`${nums[i]}\` 一定是第一次出現。`,
          views: [view(i, { [i]: "active", [k - 1]: "compare" })],
          vars: { i, k },
        });
        const same = i === k;
        nums[k] = nums[i];
        k++;
        t.push({
          line: [6, 7],
          note: same
            ? `\`i\` 和 \`k\` 在同一格，不用搬；\`k\` 前進到 ${k}。`
            : `把 \`${nums[k - 1]}\` 抄到 \`nums[${k - 1}]\`，\`k\` 前進到 ${k}。`,
          views: [view(i + 1, same ? {} : { [i]: "compare" })],
          vars: { i, k },
        });
      } else {
        t.push({
          line: [4, 5],
          note: `\`nums[${i}] = ${nums[i]}\` 和保留區最後一個 \`nums[${k - 1}] = ${last}\` 相同 —— 重複了，跳過不抄。`,
          views: [view(i, { [i]: "bad", [k - 1]: "compare" })],
          vars: { i, k },
        });
      }
    }

    t.push({
      line: 8,
      note: `走完了。前 \`k = ${k}\` 格 \`${py(nums.slice(0, k))}\` 就是去重後的結果。`,
      views: [view(n)],
      vars: { k },
      result: py(k),
    });
    return t.frames;
  },
});
