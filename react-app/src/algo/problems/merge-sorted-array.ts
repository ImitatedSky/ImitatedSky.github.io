import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        i, j, k = m - 1, n - 1, m + n - 1
        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
            k -= 1`;

export default defineProblem<{ nums1: number[]; m: number; nums2: number[]; n: number }>({
  id: 88,
  summary:
    "有兩個已經由小到大排好的陣列 `nums1` 和 `nums2`。`nums1` 的長度是 `m + n`：前 `m` 格是真正的資料，後 `n` 格是預留的空位（填 0）。\n\n請把 `nums2` 的 `n` 個數**原地合併**進 `nums1`，讓整個 `nums1` 維持由小到大。不需要回傳任何東西。",
  summaryEn:
    "You get two arrays, `nums1` and `nums2`, both already sorted in ascending order. `nums1` has length `m + n`: its first `m` slots hold real data and the last `n` slots are reserved space (filled with 0).\n\nMerge the `n` numbers of `nums2` **into `nums1` in-place** so that all of `nums1` ends up sorted in ascending order. Nothing needs to be returned.",
  examples: [
    { input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]" },
    { input: "nums1 = [1], m = 1, nums2 = [], n = 0", output: "[1]" },
    { input: "nums1 = [0], m = 0, nums2 = [1], n = 1", output: "[1]" },
  ],
  constraints: ["nums1.length == m + n", "0 ≤ m, n ≤ 200", "1 ≤ m + n ≤ 200"],
  constraintsEn: ["nums1.length == m + n", "0 ≤ m, n ≤ 200", "1 ≤ m + n ≤ 200"],
  idea:
    "空位在 `nums1` 的**尾巴**，所以從尾巴開始填：每次比較兩邊還沒用掉的**最大值**，把比較大的那個放到最後一個空格。由後往前寫，寫入的位置 `k` 永遠不會追上還沒讀的 `i`，所以不會蓋掉任何還沒用到的資料。",
  steps: [
    "三個指標：`i = m - 1`（nums1 有效資料的尾端）、`j = n - 1`（nums2 的尾端）、`k = m + n - 1`（下一個要填的位置）。",
    "只要 `nums2` 還有數字（`j >= 0`）就繼續：比較 `nums1[i]` 和 `nums2[j]`，把較大者寫到 `nums1[k]`，該指標往左一格。",
    "每寫完一格 `k` 往左一格。",
    "`nums2` 用完就結束 —— `nums1` 剩下的數字本來就待在正確位置，不必再搬。",
  ],
  pitfalls: [
    "從前面開始合併會蓋掉 `nums1` 還沒處理的數字，只好開額外陣列；**從後面**合併才能 O(1) 空間。",
    "迴圈條件只需要 `j >= 0`。但比較前要先確認 `i >= 0`，否則 `nums1` 用完時 `nums1[-1]` 在 Python 會讀到最後一格而不是報錯。",
  ],
  complexity: { time: "O(m + n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        """不需要回傳，直接修改 nums1"""
        `,
  presets: [
    {
      label: "[1,2,3,0,0,0] + [2,5,6]",
      input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 },
      expected: "[1, 2, 2, 3, 5, 6]",
    },
    {
      label: "[4,5,6,0,0,0] + [1,2,3]",
      input: { nums1: [4, 5, 6, 0, 0, 0], m: 3, nums2: [1, 2, 3], n: 3 },
      expected: "[1, 2, 3, 4, 5, 6]",
    },
    {
      label: "[2,7,0,0,0] + [1,3,9]",
      input: { nums1: [2, 7, 0, 0, 0], m: 2, nums2: [1, 3, 9], n: 3 },
      expected: "[1, 2, 3, 7, 9]",
    },
  ],
  trace({ nums1: input1, m, nums2, n }) {
    const t = tracer();
    const nums1 = [...input1];
    let i = m - 1;
    let j = n - 1;
    let k = m + n - 1;

    // nums1: k 右邊已定案；(i, k] 是空位；[0, i] 還沒讀
    const view1 = (extra: Record<number, Tone> = {}, showPointers = true) => {
      const marks: Record<number, Tone> = {};
      nums1.forEach((_, x) => {
        if (x > k) marks[x] = "good";
        else if (x > i) marks[x] = "muted";
      });
      return V.array("nums1", nums1, {
        marks: { ...marks, ...extra },
        pointers: showPointers ? { i, k } : {},
      });
    };
    const view2 = (extra: Record<number, Tone> = {}, showPointers = true) => {
      const marks: Record<number, Tone> = {};
      nums2.forEach((_, x) => {
        if (x > j) marks[x] = "muted";
      });
      return V.array("nums2", nums2, { marks: { ...marks, ...extra }, pointers: showPointers ? { j } : {} });
    };

    t.push({
      line: 3,
      note: `\`i\` 指向 nums1 有效資料的尾端、\`j\` 指向 nums2 的尾端、\`k\` 指向最後一個空格。灰色的格子是空位，我們要**從後面往前**填。`,
      views: [view1(), view2()],
      vars: { m, n, i, j, k },
    });

    while (j >= 0) {
      if (i >= 0 && nums1[i] > nums2[j]) {
        t.push({
          line: [4, 5],
          note: `比較兩邊剩下的最大值：\`nums1[${i}] = ${nums1[i]}\` > \`nums2[${j}] = ${nums2[j]}\`，nums1 的比較大，它就是目前所有沒放好的數裡最大的。`,
          views: [view1({ [i]: "compare" }), view2({ [j]: "compare" })],
          vars: { i, j, k },
        });
        const moved = nums1[i];
        nums1[k] = moved;
        i--;
        k--;
        t.push({
          line: [6, 7, 11],
          note: `把 \`${moved}\` 寫到 \`nums1[${k + 1}]\`，\`i\` 和 \`k\` 各往左一格。原本的位置變成可以覆蓋的空位。`,
          views: [view1({ [k + 1]: "active" }), view2()],
          vars: { i, j, k },
        });
      } else {
        const why =
          i < 0
            ? `nums1 的資料已經用完（\`i = -1\`），剩下的一定來自 nums2。`
            : `\`nums1[${i}] = ${nums1[i]}\` ≤ \`nums2[${j}] = ${nums2[j]}\`，這次是 nums2 的比較大（一樣大時拿哪邊都可以）。`;
        t.push({
          line: [4, 5, 8],
          note: `比較兩邊剩下的最大值：${why}`,
          views: [view1(i >= 0 ? { [i]: "compare" } : {}), view2({ [j]: "compare" })],
          vars: { i, j, k },
        });
        const moved = nums2[j];
        nums1[k] = moved;
        j--;
        k--;
        t.push({
          line: [9, 10, 11],
          note: `把 \`${moved}\` 寫到 \`nums1[${k + 1}]\`，\`j\` 和 \`k\` 各往左一格。`,
          views: [view1({ [k + 1]: "active" }), view2({ [j + 1]: "active" })],
          vars: { i, j, k },
        });
      }
    }

    const done: Record<number, Tone> = {};
    nums1.forEach((_, x) => (done[x] = "good"));
    t.push({
      line: 4,
      note:
        i >= 0
          ? `\`j = -1\`，nums2 全部放完了。nums1 前面剩下的 ${i + 1} 個數本來就在正確位置，不用再動，合併完成。`
          : "`j = -1`，nums2 全部放完了，合併完成。",
      views: [V.array("nums1", nums1, { marks: done }), view2({}, false)],
      vars: { i, j, k },
      result: py(nums1),
    });
    return t.frames;
  },
});
