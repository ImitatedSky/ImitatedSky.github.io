import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:  # 左半 [lo, mid] 有序
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:  # 右半 [mid, hi] 有序
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1`;

export default defineProblem<{ nums: number[]; target: number }>({
  id: 33,
  summary:
    "一個**由小到大、元素不重複**的陣列，在某個位置被「旋轉」過：前面一段被搬到後面，例如 `[0,1,2,4,5,6,7]` 變成 `[4,5,6,7,0,1,2]`。\n\n給旋轉後的陣列 `nums` 和 `target`，回傳 `target` 的索引，不存在就回傳 `-1`。時間複雜度必須是 O(log n)。",
  summaryEn:
    "An array **sorted ascending with distinct values** has been \"rotated\" at some point: a leading chunk was moved to the back, e.g. `[0,1,2,4,5,6,7]` became `[4,5,6,7,0,1,2]`.\n\nGiven the rotated array `nums` and a `target`, return the index of `target`, or `-1` if it isn't there. The solution must run in O(log n) time.",
  examples: [
    { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
    { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
    { input: "nums = [1], target = 0", output: "-1" },
  ],
  constraints: ["1 ≤ nums.length ≤ 5000", "nums 的值互不相同"],
  constraintsEn: ["1 ≤ nums.length ≤ 5000", "All values in nums are distinct"],
  idea:
    "旋轉後的陣列只有**一個斷點**，所以從 `mid` 切開，左右兩半**至少有一半是完全有序的**。有序的那一半只要看頭尾兩個數，就能確定 `target` 在不在裡面：在就往那一半找，不在就一定在另一半。",
  steps: [
    "閉區間 `[lo, hi]` 二分，`nums[mid] == target` 直接回傳。",
    "用 `nums[lo] <= nums[mid]` 判斷哪一半有序：成立代表左半 `[lo, mid]` 有序，否則右半 `[mid, hi]` 有序。",
    "左半有序：`nums[lo] <= target < nums[mid]` 就往左（`hi = mid - 1`），否則往右。",
    "右半有序：`nums[mid] < target <= nums[hi]` 就往右（`lo = mid + 1`），否則往左。",
    "範圍變空就回傳 `-1`。",
  ],
  pitfalls: [
    "`nums[lo] <= nums[mid]` 的**等號不能少**：只剩兩格時 `lo == mid`，左半只有一格也算有序。",
    "判斷 target 是否落在有序半邊時，靠 `mid` 的那一側用嚴格不等號（`mid` 已經比過了），靠 `lo` / `hi` 的那一側要含等號。",
  ],
  complexity: { time: "O(log n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        `,
  presets: [
    { label: "[4,5,6,7,8,0,1,2,3], 1", input: { nums: [4, 5, 6, 7, 8, 0, 1, 2, 3], target: 1 }, expected: "6" },
    { label: "[6,7,0,1,2,3,4,5], 7", input: { nums: [6, 7, 0, 1, 2, 3, 4, 5], target: 7 }, expected: "1" },
    { label: "[4,5,6,7,0,1,2], 3（不存在）", input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 }, expected: "-1" },
  ],
  trace({ nums, target }) {
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
      note: `把數值畫成高度：旋轉過的有序陣列是「兩段上坡」，中間有一個**斷點**。在 \`[lo, hi] = [0, ${hi}]\` 裡找 \`target = ${target}\`。`,
      views: [V.bars("nums", nums, { pointers: { lo, hi }, marks: marks() })],
      vars: { target, lo, hi },
    });

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const x = nums[mid];
      t.push({
        line: [4, 5, 6],
        note: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`，\`nums[${mid}] = ${x}\`${x === target ? "。" : `，不是 \`${target}\`。接下來要決定丟掉哪一半。`}`,
        views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "compare" }) })],
        vars: { target, lo, mid, hi, "nums[mid]": x },
      });

      if (x === target) {
        t.push({
          line: 7,
          note: `\`nums[${mid}] = ${x}\` 就是 \`target\`，回傳索引 \`${mid}\`。`,
          views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "good" }) })],
          vars: { target, lo, mid, hi, "nums[mid]": x },
          result: py(mid),
        });
        return t.frames;
      }

      const vars = { target, lo, mid, hi, "nums[lo]": nums[lo], "nums[mid]": x, "nums[hi]": nums[hi] };
      if (nums[lo] <= x) {
        // 左半有序
        const inside = nums[lo] <= target && target < x;
        t.push({
          line: [8, 9],
          note:
            `\`nums[lo] = ${nums[lo]} <= nums[mid] = ${x}\`，頭比尾小，代表斷點不在這裡 —— **左半 \`[${lo}, ${mid}]\` 是有序的**。` +
            `有序就能直接用頭尾判斷：\`${target}\` ${inside ? "落在" : "不在"} \`[${nums[lo]}, ${x})\` 裡。`,
          views: [
            V.bars("nums", nums, {
              pointers: { lo, mid, hi },
              marks: marks({ [mid]: "compare" }),
              ranges: [{ from: lo, to: mid, tone: "alt", label: "有序" }],
            }),
          ],
          vars,
        });
        if (inside) {
          hi = mid - 1;
          t.push({
            line: 10,
            note: `\`${vars["nums[lo]"]} <= ${target} < ${x}\`，\`target\` 一定在有序的左半裡，右半整段丟掉 → \`hi = mid - 1 = ${hi}\`。`,
            views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
            vars: { target, lo, mid, hi },
          });
        } else {
          lo = mid + 1;
          t.push({
            line: [11, 12],
            note: `有序的左半只涵蓋 \`${vars["nums[lo]"]} ~ ${x}\`，\`${target}\` 不可能在裡面，整段丟掉，改找右半 → \`lo = mid + 1 = ${lo}\`。`,
            views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
            vars: { target, lo, mid, hi },
          });
        }
      } else {
        // 右半有序
        const inside = x < target && target <= nums[hi];
        t.push({
          line: [8, 13, 14],
          note:
            `\`nums[lo] = ${nums[lo]} > nums[mid] = ${x}\`，頭比尾大，斷點在左半，所以 **右半 \`[${mid}, ${hi}]\` 是有序的**。` +
            `用它的頭尾判斷：\`${target}\` ${inside ? "落在" : "不在"} \`(${x}, ${nums[hi]}]\` 裡。`,
          views: [
            V.bars("nums", nums, {
              pointers: { lo, mid, hi },
              marks: marks({ [mid]: "compare" }),
              ranges: [{ from: mid, to: hi, tone: "alt", label: "有序" }],
            }),
          ],
          vars,
        });
        if (inside) {
          lo = mid + 1;
          t.push({
            line: 15,
            note: `\`${x} < ${target} <= ${vars["nums[hi]"]}\`，\`target\` 一定在有序的右半裡，左半整段丟掉 → \`lo = mid + 1 = ${lo}\`。`,
            views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
            vars: { target, lo, mid, hi },
          });
        } else {
          hi = mid - 1;
          t.push({
            line: [16, 17],
            note: `有序的右半只涵蓋 \`${x} ~ ${vars["nums[hi]"]}\`，\`${target}\` 不可能在裡面，整段丟掉，改找左半 → \`hi = mid - 1 = ${hi}\`。`,
            views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
            vars: { target, lo, mid, hi },
          });
        }
      }
    }

    t.push({
      line: 18,
      note: `\`lo = ${lo} > hi = ${hi}\`，搜尋範圍空了，每一段都被排除過，\`${target}\` 不在陣列裡，回傳 \`-1\`。`,
      views: [V.bars("nums", nums, { pointers: { lo, hi }, marks: marks() })],
      vars: { target, lo, hi },
      result: py(-1),
    });
    return t.frames;
  },
});
