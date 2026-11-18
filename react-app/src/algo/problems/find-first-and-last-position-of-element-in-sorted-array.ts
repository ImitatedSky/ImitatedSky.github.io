import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def lower_bound(x: int) -> int:
            # 回傳第一個 nums[i] >= x 的位置（都比 x 小就回傳 len(nums)）
            lo, hi = 0, len(nums)
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] < x:
                    lo = mid + 1
                else:
                    hi = mid
            return lo

        first = lower_bound(target)
        if first == len(nums) or nums[first] != target:
            return [-1, -1]
        last = lower_bound(target + 1) - 1
        return [first, last]`;

export default defineProblem<{ nums: number[]; target: number }>({
  id: 34,
  summary:
    "給一個**非遞減排序**（可能有重複）的整數陣列 `nums` 和一個 `target`，回傳 `target` 在陣列中**第一次和最後一次出現的索引** `[first, last]`；不存在就回傳 `[-1, -1]`。\n\n時間複雜度必須是 O(log n)。",
  examples: [
    { input: "nums = [5,7,7,8,8,10], target = 8", output: "[3,4]" },
    { input: "nums = [5,7,7,8,8,10], target = 6", output: "[-1,-1]" },
    { input: "nums = [], target = 0", output: "[-1,-1]" },
  ],
  constraints: ["0 ≤ nums.length ≤ 10⁵", "nums 為非遞減排序"],
  idea:
    "只要會寫一個函式 `lower_bound(x)`：**第一個 ≥ x 的位置**，兩個答案都能用它算出來。開頭是 `lower_bound(target)`；結尾則是「第一個 ≥ target + 1 的位置」**再往左一格**，因為整數裡比 target 大的最小值就是 target + 1。",
  steps: [
    "`lower_bound(x)`：在半開區間 `[lo, hi)` 上二分，`nums[mid] < x` 就 `lo = mid + 1`，否則 `hi = mid`，最後 `lo` 就是第一個 ≥ x 的位置。",
    "`first = lower_bound(target)`。",
    "若 `first` 超出陣列或 `nums[first] != target`，代表 target 不存在，回傳 `[-1, -1]`。",
    "`last = lower_bound(target + 1) - 1`，回傳 `[first, last]`。",
  ],
  pitfalls: [
    "`hi` 的初值是 `len(nums)`（不是 `len - 1`），因為答案有可能是「全部都比 x 小」→ 回傳 n。",
    "遇到 `nums[mid] == x` 時**不能停**，要繼續往左縮（`hi = mid`）才找得到第一個。",
    "檢查 `nums[first] != target` 之前要先確認 `first` 沒有越界。",
  ],
  complexity: { time: "O(log n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        `,
  presets: [
    { label: "[5,7,7,8,8,8,10], 8", input: { nums: [5, 7, 7, 8, 8, 8, 10], target: 8 }, expected: "[3, 5]" },
    { label: "[1,2,2,2,2,3,5,5], 5（在尾端）", input: { nums: [1, 2, 2, 2, 2, 3, 5, 5], target: 5 }, expected: "[6, 7]" },
    { label: "[5,7,7,8,8,10], 6（不存在）", input: { nums: [5, 7, 7, 8, 8, 10], target: 6 }, expected: "[-1, -1]" },
  ],
  trace({ nums, target }) {
    const t = tracer();
    const n = nums.length;
    let first: number | null = null;

    const lowerBound = (x: number, pass: string): number => {
      let lo = 0;
      let hi = n;
      // 半開區間 [lo, hi)：lo 左邊都 < x，hi 和它右邊都 >= x
      const marks = (extra: Record<number, Tone> = {}) => {
        const m: Record<number, Tone> = {};
        for (let i = 0; i < n; i++) if (i < lo || i >= hi) m[i] = "muted";
        if (first !== null && first < n) m[first] = "good";
        return { ...m, ...extra };
      };
      const vars = (mid?: number) => ({
        target,
        x,
        lo,
        ...(mid === undefined ? {} : { mid }),
        hi,
        ...(first === null ? {} : { first }),
      });

      t.push({
        line: [3, 5],
        note: `${pass}：呼叫 \`lower_bound(${x})\`，找**第一個 ≥ ${x}** 的位置。用半開區間 \`[lo, hi) = [0, ${n})\`，\`hi\` 從陣列外面開始，因為答案可能是 \`${n}\`（全部都比 ${x} 小）。`,
        views: [V.array("nums", nums, { pointers: { lo, hi }, marks: marks() })],
        vars: vars(),
      });

      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const v = nums[mid];
        t.push({
          line: [6, 7, 8],
          note: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`，\`nums[${mid}] = ${v}\`，問它：「你 < ${x} 嗎？」`,
          views: [V.array("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "compare" }) })],
          vars: vars(mid),
        });
        if (v < x) {
          lo = mid + 1;
          t.push({
            line: 9,
            note: `\`${v} < ${x}\`：\`mid\` 和它左邊都太小，不可能是答案，丟掉 → \`lo = mid + 1 = ${lo}\`。`,
            views: [V.array("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
            vars: vars(mid),
          });
        } else {
          hi = mid;
          t.push({
            line: [10, 11],
            note:
              `\`${v} >= ${x}\`：\`mid\` 是候選答案，但左邊可能還有更早的${v === x ? `（就算剛好等於 ${x} 也**不能停**）` : ""}。` +
              `\`mid\` 右邊一定不是「第一個」，丟掉 → \`hi = mid = ${hi}\`。`,
            views: [V.array("nums", nums, { pointers: { lo, mid, hi }, marks: marks() })],
            vars: vars(mid),
          });
        }
      }

      t.push({
        line: 12,
        note:
          `\`lo == hi == ${lo}\`，區間空了。\`lo\` 左邊全部 < ${x}，\`lo\` 開始全部 ≥ ${x}，所以 \`lower_bound(${x}) = ${lo}\`` +
          (lo === n ? "（陣列外面：沒有任何數 ≥ " + x + "）。" : "。"),
        views: [
          V.array("nums", nums, {
            pointers: { lo, hi },
            marks: marks(lo < n ? { [lo]: "active" } : {}),
            ranges: lo > 0 ? [{ from: 0, to: lo - 1, tone: "muted", label: `< ${x}` }] : [],
          }),
        ],
        vars: vars(),
      });
      return lo;
    };

    first = lowerBound(target, "第一次搜尋");
    const found = first < n && nums[first] === target;
    t.push({
      line: [14, 15],
      note: found
        ? `\`first = ${first}\`，而且 \`nums[${first}] = ${nums[first]}\` 真的等於 \`target\`，所以 target 存在，這就是它**第一次出現**的位置。`
        : first === n
          ? `\`first = ${first}\` 已經超出陣列，代表沒有任何數 ≥ ${target}，target 不存在。`
          : `\`first = ${first}\`，但 \`nums[${first}] = ${nums[first]}\` 不是 \`${target}\` —— 第一個 ≥ ${target} 的數就已經超過它了，target 不存在。`,
      views: [
        V.array("nums", nums, {
          pointers: { first },
          marks: first < n ? { [first]: found ? "good" : "bad" } : {},
        }),
      ],
      vars: { target, first },
    });

    if (!found) {
      t.push({
        line: 16,
        note: "找不到 `target`，回傳 `[-1, -1]`。",
        views: [V.array("nums", nums, { pointers: { first }, marks: first < n ? { [first]: "bad" } : {} })],
        vars: { target, first },
        result: py([-1, -1]),
      });
      return t.frames;
    }

    const after = lowerBound(target + 1, "第二次搜尋");
    const last = after - 1;
    const good: Record<number, Tone> = {};
    for (let i = first; i <= last; i++) good[i] = "good";
    t.push({
      line: 17,
      note: `第一個 ≥ ${target + 1} 的位置是 \`${after}\`，它的**前一格**就是最後一個 \`${target}\`：\`last = ${after} - 1 = ${last}\`。`,
      views: [V.array("nums", nums, { pointers: { first, last }, marks: good })],
      vars: { target, first, last },
    });
    t.push({
      line: 18,
      note: `\`${target}\` 佔據索引 \`${first}\` 到 \`${last}\`（共 ${last - first + 1} 個），回傳 \`[${first}, ${last}]\`。兩次二分搜尋，總共 O(log n)。`,
      views: [
        V.array("nums", nums, {
          pointers: { first, last },
          marks: good,
          ranges: [{ from: first, to: last, tone: "good", label: `target = ${target}` }],
        }),
      ],
      vars: { target, first, last },
      result: py([first, last]),
    });
    return t.frames;
  },
});
