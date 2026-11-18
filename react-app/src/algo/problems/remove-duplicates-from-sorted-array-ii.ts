import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        k = 0  # nums[:k] 是整理好的部分
        for i in range(len(nums)):
            # 前兩個一定留；之後只要和「往回數第 2 個」不同就能留
            if k < 2 or nums[i] != nums[k - 2]:
                nums[k] = nums[i]
                k += 1
        return k`;

export default defineProblem<{ nums: number[] }>({
  id: 80,
  summary:
    "給一個**由小到大排序**的整數陣列 `nums`，請原地刪掉多餘的重複，讓每個數值**最多出現兩次**，並保持原本的相對順序。\n\n回傳處理後的長度 `k`；`nums` 的前 `k` 格必須是結果，之後的內容不重要。只能用 O(1) 的額外空間。",
  examples: [
    { input: "nums = [1,1,1,2,2,3]", output: "5, nums = [1,1,2,2,3,_]" },
    { input: "nums = [0,0,1,1,1,1,2,3,3]", output: "7, nums = [0,0,1,1,2,3,3,_,_]" },
  ],
  constraints: ["1 ≤ nums.length ≤ 3 × 10⁴", "nums 已經由小到大排序"],
  idea:
    "保留區 `nums[:k]` 也是排序的。新來的 `x` 能不能放進去，只要看保留區**倒數第 2 個** `nums[k - 2]`：如果它也等於 `x`，那倒數第 1 個一定也是 `x`（夾在中間），代表 `x` 已經有兩個了，不能再放；否則就可以放。",
  steps: [
    "`k = 0`，`i` 由左到右走訪每個數。",
    "若 `k < 2`（保留區還不到兩個）或 `nums[i] != nums[k - 2]`：保留，抄到 `nums[k]`，`k += 1`。",
    "否則這個數已經出現兩次了，跳過。",
    "走完回傳 `k`。",
  ],
  pitfalls: [
    "要跟**保留區**的 `nums[k - 2]` 比，不是跟原位置的 `nums[i - 2]` 比 —— `i - 2` 那格可能已經被覆寫過，值不再可靠。",
    "把程式裡的 2 換成任意 `m`，就是「每個數最多保留 m 次」的通解。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[1,1,1,2,2,3]", input: { nums: [1, 1, 1, 2, 2, 3] }, expected: "5" },
    { label: "[0,0,1,1,1,1,2,3,3]", input: { nums: [0, 0, 1, 1, 1, 1, 2, 3, 3] }, expected: "7" },
    { label: "[5,5,5,5,5]", input: { nums: [5, 5, 5, 5, 5] }, expected: "2" },
  ],
  trace({ nums: input }) {
    const t = tracer();
    const nums = [...input];
    const n = nums.length;
    let k = 0;

    const view = (i: number, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let x = 0; x < n; x++) {
        if (x < k) marks[x] = "good";
        else if (x < i) marks[x] = "muted";
      }
      return V.array("nums", nums, {
        marks: { ...marks, ...extra },
        pointers: i < n ? { k, i } : { k },
        ranges: [{ from: 0, to: k - 1, tone: "good", label: `保留 ${k} 個` }],
      });
    };

    t.push({
      line: 3,
      note: "`k = 0`：保留區是空的。`k` 也是下一個要保留的數該放的位置。",
      views: [view(0)],
      vars: { k },
    });

    for (let i = 0; i < n; i++) {
      const x = nums[i];
      const early = k < 2;
      if (early || x !== nums[k - 2]) {
        t.push({
          line: [4, 6],
          note: early
            ? `保留區只有 ${k} 個（\`k < 2\`），不管 \`nums[${i}] = ${x}\` 是什麼都不可能超過兩次，直接留下。`
            : `看保留區倒數第 2 個：\`nums[${k - 2}] = ${nums[k - 2]}\`，和 \`nums[${i}] = ${x}\` 不同，表示 \`${x}\` 在保留區裡最多只有 1 個，可以留。`,
          views: [view(i, early ? { [i]: "active" } : { [i]: "active", [k - 2]: "compare" })],
          vars: { i, k },
        });
        const same = i === k;
        nums[k] = x;
        k++;
        t.push({
          line: [7, 8],
          note: same
            ? `\`i\` 和 \`k\` 在同一格，不用搬；\`k\` 前進到 ${k}。`
            : `把 \`${x}\` 抄到 \`nums[${k - 1}]\`，\`k\` 前進到 ${k}。`,
          views: [view(i + 1, same ? {} : { [i]: "compare" })],
          vars: { i, k },
        });
      } else {
        t.push({
          line: [4, 6],
          note: `保留區倒數第 2 個 \`nums[${k - 2}] = ${nums[k - 2]}\` 就等於 \`nums[${i}] = ${x}\`。保留區是排序的，所以最後兩格都是 \`${x}\` —— 已經滿兩個，這個跳過。`,
          views: [view(i, { [i]: "bad", [k - 2]: "compare", [k - 1]: "compare" })],
          vars: { i, k },
        });
      }
    }

    t.push({
      line: 9,
      note: `走完了。前 \`k = ${k}\` 格 \`${py(nums.slice(0, k))}\` 裡每個數最多出現兩次。`,
      views: [view(n)],
      vars: { k },
      result: py(k),
    });
    return t.frames;
  },
});
