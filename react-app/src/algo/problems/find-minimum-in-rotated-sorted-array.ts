import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def findMin(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1   # 斷點在 mid 右邊，最小值也在右邊
            else:
                hi = mid       # mid..hi 有序，最小值是 mid 或在它左邊
        return nums[lo]`;

export default defineProblem<{ nums: number[] }>({
  id: 153,
  summary:
    "一個**由小到大、元素不重複**的陣列被旋轉了若干次（前面一段搬到後面），例如 `[0,1,2,4,5,6,7]` 可能變成 `[4,5,6,7,0,1,2]`。\n\n給旋轉後的陣列 `nums`，回傳其中的**最小值**。時間複雜度必須是 O(log n)。",
  examples: [
    { input: "nums = [3,4,5,1,2]", output: "1" },
    { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
    { input: "nums = [11,13,15,17]", output: "11", note: "轉了一整圈，等於沒轉" },
  ],
  constraints: ["1 ≤ nums.length ≤ 5000", "nums 的值互不相同"],
  idea:
    "旋轉後的陣列是「高的一段 + 低的一段」，最小值就是低段的第一個。拿 `nums[mid]` 跟**最右邊的 `nums[hi]`** 比：比它大，表示 `mid` 還在高段，最小值在右邊；比它小，表示 `mid` 已經在低段，最小值是 `mid` 自己或在它左邊。",
  steps: [
    "搜尋範圍 `[lo, hi]`，維持「最小值一定在範圍內」。",
    "取 `mid`，比較 `nums[mid]` 和 `nums[hi]`。",
    "`nums[mid] > nums[hi]`：`mid` 在高段，最小值在它右邊，`lo = mid + 1`。",
    "否則 `mid` 到 `hi` 是有序的，最小值不會在 `mid` 右邊，`hi = mid`。",
    "`lo == hi` 時剩下的那一格就是最小值。",
  ],
  pitfalls: [
    "要跟 `nums[hi]` 比，不是跟 `nums[lo]` 比：陣列沒旋轉時，跟 `nums[lo]` 比會往錯的方向走。",
    "`hi = mid` 不能寫成 `mid - 1`，因為 `mid` 本身可能就是最小值。",
  ],
  complexity: { time: "O(log n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def findMin(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[4,5,6,7,8,9,1,2,3]", input: { nums: [4, 5, 6, 7, 8, 9, 1, 2, 3] }, expected: "1" },
    { label: "[7,8,1,2,3,4,5,6]", input: { nums: [7, 8, 1, 2, 3, 4, 5, 6] }, expected: "1" },
    { label: "[11,13,15,17,19]（沒旋轉）", input: { nums: [11, 13, 15, 17, 19] }, expected: "11" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    let lo = 0;
    let hi = n - 1;

    const marks = (extra: Record<number, Tone> = {}) => {
      const m: Record<number, Tone> = {};
      for (let i = 0; i < n; i++) if (i < lo || i > hi) m[i] = "muted";
      return { ...m, ...extra };
    };

    t.push({
      line: 3,
      note: `把數值畫成高度：旋轉後是「高的一段」接「低的一段」，**最小值就是低段的第一根**。搜尋範圍 \`[lo, hi] = [0, ${hi}]\`。`,
      views: [V.bars("nums", nums, { pointers: { lo, hi }, marks: marks() })],
      vars: { lo, hi },
    });

    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const a = nums[mid];
      const b = nums[hi];
      t.push({
        line: [4, 5, 6],
        note: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`。拿 \`nums[mid] = ${a}\` 跟最右邊的 \`nums[hi] = ${b}\` 比，看 \`mid\` 站在高段還是低段。`,
        views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "compare", [hi]: "alt" }) })],
        vars: { lo, mid, hi, "nums[mid]": a, "nums[hi]": b },
      });

      if (a > b) {
        lo = mid + 1;
        t.push({
          line: 7,
          note: `\`${a} > ${b}\`：左邊的數竟然比右邊大，表示 \`mid\` 還在**高段**，斷點在它右邊。\`mid\` 和它左邊都不可能是最小值 → \`lo = mid + 1 = ${lo}\`。`,
          views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [hi]: "alt" }) })],
          vars: { lo, mid, hi, "nums[mid]": a, "nums[hi]": b },
        });
      } else {
        const oldHi = hi;
        hi = mid;
        t.push({
          line: [8, 9],
          note: `\`${a} < ${b}\`：\`mid\` 到 \`hi\` 這段是**有序的**，裡面最小的就是 \`nums[mid]\`，它右邊全部可以丟掉。但 \`mid\` 自己可能就是答案 → \`hi = mid = ${hi}\`。`,
          views: [
            V.bars("nums", nums, {
              pointers: { lo, mid, hi },
              marks: marks({ [mid]: "compare" }),
              ranges: [{ from: mid, to: oldHi, tone: "alt", label: "有序" }],
            }),
          ],
          vars: { lo, mid, hi, "nums[mid]": a, "nums[hi]": a },
        });
      }
    }

    t.push({
      line: 10,
      note: `\`lo == hi == ${lo}\`，範圍只剩一格。最小值一直都被留在範圍內，所以就是 \`nums[${lo}] = ${nums[lo]}\`。`,
      views: [V.bars("nums", nums, { pointers: { lo, hi }, marks: marks({ [lo]: "good" }) })],
      vars: { lo, hi },
      result: py(nums[lo]),
    });
    return t.frames;
  },
});
