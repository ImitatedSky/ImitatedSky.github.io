import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1   # 往右是上坡，右半一定有峰
            else:
                hi = mid       # 往右是下坡，mid 或它左邊一定有峰
        return lo`;

export default defineProblem<{ nums: number[] }>({
  id: 162,
  summary:
    "**峰值**是指嚴格大於左右鄰居的元素。給一個相鄰元素都不相等的陣列 `nums`，回傳**任意一個**峰值的索引。\n\n可以把陣列兩端之外想成負無限大（`nums[-1] = nums[n] = -∞`），所以邊界上的元素只要比唯一的鄰居大就算峰值。時間複雜度必須是 O(log n)。",
  examples: [
    { input: "nums = [1,2,3,1]", output: "2", note: "3 比兩邊的 2 和 1 都大" },
    { input: "nums = [1,2,1,3,5,6,4]", output: "5", note: "回傳 1（值 2）也算對" },
  ],
  constraints: ["1 ≤ nums.length ≤ 1000", "nums[i] ≠ nums[i + 1]"],
  idea:
    "陣列沒排序也能二分，因為我們只需要**一個保證有峰的方向**。看 `mid` 和右鄰居：往右是上坡，那一路往上爬，要嘛遇到下坡（那就是峰）、要嘛爬到最右端（右端外面是 −∞，也是峰）——右半一定有峰。下坡的話同理，`mid` 或它左邊一定有峰。",
  steps: [
    "搜尋範圍 `[lo, hi]`，維持「這個範圍內一定有峰值」。",
    "取 `mid`，比較 `nums[mid]` 和 `nums[mid + 1]`。",
    "上坡（`nums[mid] < nums[mid + 1]`）：峰在右邊，`lo = mid + 1`。",
    "下坡：`mid` 自己可能就是峰，所以 `hi = mid`（不能減 1）。",
    "`lo == hi` 時只剩一格，它就是峰值。",
  ],
  pitfalls: [
    "迴圈條件是 `lo < hi`，這樣 `mid + 1` 永遠不會超出範圍（`mid < hi`）。",
    "下坡時要寫 `hi = mid`；寫成 `mid - 1` 會把可能是峰的 `mid` 丟掉。",
  ],
  complexity: { time: "O(log n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[1,2,1,3,5,6,4]", input: { nums: [1, 2, 1, 3, 5, 6, 4] }, expected: "5" },
    { label: "[2,4,7,9,8,6,5,3,1]", input: { nums: [2, 4, 7, 9, 8, 6, 5, 3, 1] }, expected: "3" },
    { label: "[6,5,4,3,2]（一路下坡）", input: { nums: [6, 5, 4, 3, 2] }, expected: "0" },
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
      note: `把數值畫成高度。搜尋範圍 \`[lo, hi] = [0, ${hi}]\`，我們要維持一件事：**這個範圍裡一定有峰值**（兩端外面都當成 −∞）。`,
      views: [V.bars("nums", nums, { pointers: { lo, hi }, marks: marks() })],
      vars: { lo, hi },
    });

    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const a = nums[mid];
      const b = nums[mid + 1];
      t.push({
        line: [4, 5, 6],
        note: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`。只看 \`mid\` 和右鄰居：\`nums[${mid}] = ${a}\`、\`nums[${mid + 1}] = ${b}\`，判斷這裡是上坡還是下坡。`,
        views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "compare", [mid + 1]: "alt" }) })],
        vars: { lo, mid, hi, "nums[mid]": a, "nums[mid+1]": b },
      });

      if (a < b) {
        lo = mid + 1;
        t.push({
          line: 7,
          note: `\`${a} < ${b}\`，往右是**上坡**。從 \`mid + 1\` 繼續往右爬，遲早會遇到下坡或走到盡頭（外面是 −∞），所以右半一定有峰 → \`lo = mid + 1 = ${lo}\`。`,
          views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid + 1]: "alt" }) })],
          vars: { lo, mid, hi, "nums[mid]": a, "nums[mid+1]": b },
        });
      } else {
        hi = mid;
        t.push({
          line: [8, 9],
          note: `\`${a} > ${b}\`，往右是**下坡**。\`mid\` 已經比右邊高，往左看要嘛它就是峰、要嘛左邊更高的地方有峰 → \`hi = mid = ${hi}\`（\`mid\` 要留著）。`,
          views: [V.bars("nums", nums, { pointers: { lo, mid, hi }, marks: marks({ [mid]: "compare" }) })],
          vars: { lo, mid, hi, "nums[mid]": a, "nums[mid+1]": b },
        });
      }
    }

    const left = lo > 0 ? `${nums[lo - 1]}` : "−∞";
    const right = lo < n - 1 ? `${nums[lo + 1]}` : "−∞";
    t.push({
      line: 10,
      note: `\`lo == hi == ${lo}\`，範圍只剩一格，而範圍內保證有峰，所以就是它：\`${left} < ${nums[lo]} > ${right}\`。回傳 \`${lo}\`。`,
      views: [V.bars("nums", nums, { pointers: { lo, hi }, marks: marks({ [lo]: "good" }) })],
      vars: { lo, hi },
      result: py(lo),
    });
    return t.frames;
  },
});
