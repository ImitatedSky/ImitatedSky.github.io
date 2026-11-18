import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1   # mid 和它左邊都太小
            else:
                hi = mid - 1   # mid 和它右邊都太大
        return lo  # lo 停在第一個 > target 的位置`;

export default defineProblem<{ nums: number[]; target: number }>({
  id: 35,
  summary:
    "給一個**由小到大排序、沒有重複**的整數陣列 `nums` 和一個 `target`。如果 `target` 在陣列裡，回傳它的索引；如果不在，回傳把它**插進去後仍保持有序**的位置。\n\n時間複雜度必須是 O(log n)。",
  examples: [
    { input: "nums = [1,3,5,6], target = 5", output: "2" },
    { input: "nums = [1,3,5,6], target = 2", output: "1", note: "2 應該插在 1 和 3 之間" },
    { input: "nums = [1,3,5,6], target = 7", output: "4", note: "比所有數都大，插在最後面" },
  ],
  constraints: ["1 ≤ nums.length ≤ 10⁴", "nums 嚴格遞增"],
  idea:
    "標準二分搜尋。重點在**找不到時 `lo` 剛好就是答案**：迴圈全程維持「`lo` 左邊都 < target、`hi` 右邊都 > target」，當 `lo > hi` 兩者交錯時，`lo` 正好指著第一個比 target 大的位置 —— 也就是插入點。",
  steps: [
    "搜尋範圍是閉區間 `[lo, hi]`，一開始是整個陣列。",
    "取中間 `mid`，`nums[mid] == target` 就直接回傳。",
    "`nums[mid] < target`：`mid` 和它左邊全部太小，`lo = mid + 1`。",
    "否則 `mid` 和它右邊全部太大，`hi = mid - 1`。",
    "範圍變空（`lo > hi`）還沒找到，回傳 `lo`。",
  ],
  pitfalls: [
    "閉區間寫法的迴圈條件是 `lo <= hi`；少了等號會漏看最後剩下的那一格。",
    "找不到時回傳的是 `lo` 不是 `hi`（此時 `hi = lo - 1`）。",
  ],
  complexity: { time: "O(log n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        `,
  presets: [
    { label: "[1,3,5,6,8,10,13], 9", input: { nums: [1, 3, 5, 6, 8, 10, 13], target: 9 }, expected: "5" },
    { label: "[1,3,5,6], 5", input: { nums: [1, 3, 5, 6], target: 5 }, expected: "2" },
    { label: "[1,3,5,6], 7（插在尾端）", input: { nums: [1, 3, 5, 6], target: 7 }, expected: "4" },
  ],
  trace({ nums, target }) {
    const t = tracer();
    const n = nums.length;
    let lo = 0;
    let hi = n - 1;

    // 搜尋範圍 [lo, hi] 以外的格子一律變暗
    const marks = (extra: Record<number, Tone> = {}) => {
      const m: Record<number, Tone> = {};
      for (let i = 0; i < n; i++) if (i < lo || i > hi) m[i] = "muted";
      return { ...m, ...extra };
    };

    t.push({
      line: 3,
      note: `搜尋範圍是閉區間 \`[lo, hi] = [0, ${hi}]\`，也就是整個陣列。要找 \`target = ${target}\`。`,
      views: [V.array("nums", nums, { pointers: { lo, hi }, marks: marks() })],
      vars: { target, lo, hi },
    });

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const x = nums[mid];
      t.push({
        line: [4, 5],
        note: `範圍還有 ${hi - lo + 1} 格。取中間 \`mid = (${lo} + ${hi}) // 2 = ${mid}\`，\`nums[${mid}] = ${x}\`，拿它跟 \`${target}\` 比。`,
        views: [V.array("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "compare" }) })],
        vars: { target, lo, mid, hi, "nums[mid]": x },
      });

      if (x === target) {
        t.push({
          line: [6, 7],
          note: `\`nums[${mid}] = ${x}\` 正好等於 \`target\`，直接回傳索引 \`${mid}\`。`,
          views: [V.array("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "good" }) })],
          vars: { target, lo, mid, hi, "nums[mid]": x },
          result: py(mid),
        });
        return t.frames;
      }

      if (x < target) {
        lo = mid + 1;
        t.push({
          line: [8, 9],
          note: `\`${x} < ${target}\`：陣列有序，所以 \`mid\` **和它左邊**全都比 target 小，整段丟掉 → \`lo = mid + 1 = ${lo}\`。`,
          views: [V.array("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
          vars: { target, lo, mid, hi, "nums[mid]": x },
        });
      } else {
        hi = mid - 1;
        t.push({
          line: [10, 11],
          note: `\`${x} > ${target}\`：陣列有序，所以 \`mid\` **和它右邊**全都比 target 大，整段丟掉 → \`hi = mid - 1 = ${hi}\`。`,
          views: [V.array("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
          vars: { target, lo, mid, hi, "nums[mid]": x },
        });
      }
    }

    const where =
      lo === n
        ? `所有數都比 \`${target}\` 小，所以插在最尾端`
        : lo === 0
          ? `所有數都比 \`${target}\` 大，所以插在最前面`
          : `\`nums[${lo - 1}] = ${nums[lo - 1]} < ${target} < nums[${lo}] = ${nums[lo]}\`，剛好夾在中間`;
    t.push({
      line: 12,
      note: `\`lo > hi\`，範圍空了，陣列裡沒有 \`${target}\`。\`lo\` 左邊都比它小、\`hi\` 右邊都比它大：${where}，回傳 \`lo = ${lo}\`。`,
      views: [
        V.array("nums", nums, {
          pointers: { lo, hi },
          marks: lo < n ? { [lo]: "good" } : {},
          ranges: lo > 0 ? [{ from: 0, to: lo - 1, tone: "muted", label: `< ${target}` }] : [],
        }),
      ],
      vars: { target, lo, hi },
      result: py(lo),
    });
    return t.frames;
  },
});
