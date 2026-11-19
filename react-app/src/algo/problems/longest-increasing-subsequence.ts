import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        # tails[k] = 所有長度為 k + 1 的遞增子序列中，最小的結尾
        tails = []
        for x in nums:
            i = bisect_left(tails, x)  # 第一個 >= x 的位置
            if i == len(tails):
                tails.append(x)        # x 比所有結尾都大：最長長度 + 1
            else:
                tails[i] = x           # 把那個結尾換成更小的 x
        return len(tails)`;

export default defineProblem<{ nums: number[] }>({
  id: 300,
  summary:
    "給一個整數陣列 `nums`，找出**最長嚴格遞增子序列**的長度。\n\n子序列不需要連續，但必須保持原本的先後順序。",
  summaryEn:
    "Given an integer array `nums`, find the length of its **longest strictly increasing subsequence**.\n\nA subsequence doesn't have to be contiguous, but it must keep the original order of the elements.",
  examples: [
    { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", note: "例如 [2,3,7,101]", noteEn: "For example [2,3,7,101]" },
    { input: "nums = [0,1,0,3,2,3]", output: "4" },
    { input: "nums = [7,7,7,7]", output: "1" },
  ],
  constraints: ["1 ≤ nums.length ≤ 2500", "-10⁴ ≤ nums[i] ≤ 10⁴"],
  constraintsEn: ["1 ≤ nums.length ≤ 2500", "-10⁴ ≤ nums[i] ≤ 10⁴"],
  idea:
    "維護 `tails`：`tails[k]` 是「長度 `k+1` 的遞增子序列」**結尾最小可以是多少**。結尾越小，後面越容易接上新的數，所以每來一個 `x` 就用二分搜尋找到第一個 `≥ x` 的結尾把它換小；找不到就代表 `x` 能接在最長的那條後面，長度加一。`tails` 永遠是遞增的，所以才能二分。",
  steps: [
    "`tails` 一開始是空的。",
    "對每個 `x`，`i = bisect_left(tails, x)` 找出第一個 `≥ x` 的位置。",
    "`i == len(tails)`：`x` 比所有結尾都大，`append`。",
    "否則 `tails[i] = x`：同樣長度的子序列，現在有一個更小的結尾。",
    "答案是 `len(tails)`。",
  ],
  pitfalls: [
    "`tails` **不是**真正的 LIS，只有它的長度有意義（例如 `[2,5,3]` 之後 `tails = [2,3]` 剛好是，但一般不保證）。",
    "嚴格遞增要用 `bisect_left`：相等的數會**取代**而不是接在後面。用 `bisect_right` 會變成「非遞減」。",
    "O(n²) 的 `dp[i] = max(dp[j]) + 1` 也能過，但面試通常會追問這個 O(n log n) 解。",
  ],
  complexity: { time: "O(n log n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[10,9,2,5,3,7,101,18]", input: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, expected: "4" },
    { label: "[0,1,0,3,2,3]", input: { nums: [0, 1, 0, 3, 2, 3] }, expected: "4" },
    { label: "[7,7,7,7]", input: { nums: [7, 7, 7, 7] }, expected: "1" },
  ],
  trace({ nums }) {
    const t = tracer();
    const tails: number[] = [];
    const views = (
      idx: number,
      numTone: Tone | null,
      tailMarks: Record<number, Tone> = {},
      i?: number,
    ) => {
      const numMarks: Record<number, Tone> = {};
      for (let k = 0; k < idx; k++) numMarks[k] = "visited";
      if (numTone && idx < nums.length) numMarks[idx] = numTone;
      return [
        V.array("nums", nums, { marks: numMarks, pointers: idx < nums.length ? { x: idx } : {} }),
        V.array("tails", tails, { marks: tailMarks, pointers: i === undefined ? {} : { i } }),
      ];
    };

    t.push({
      line: [3, 4],
      note: "`tails[k]` 的意思是：**所有長度為 `k + 1` 的遞增子序列裡，結尾最小的那個值**。結尾越小，之後越容易再接上新的數。一開始是空的。",
      views: [V.array("nums", nums), V.array("tails", tails)],
      vars: { "len(tails)": 0 },
    });

    for (let idx = 0; idx < nums.length; idx++) {
      const x = nums[idx];
      let i = 0;
      while (i < tails.length && tails[i] < x) i++;

      const searchMarks: Record<number, Tone> = {};
      for (let k = 0; k < i; k++) searchMarks[k] = "muted";
      if (i < tails.length) searchMarks[i] = "compare";
      const smaller = i > 0 ? `前 ${i} 個結尾（\`${tails.slice(0, i).join(", ")}\`）都比 ${x} 小` : `沒有任何結尾比 ${x} 小`;
      t.push({
        line: [5, 6],
        note:
          tails.length === 0
            ? `看 \`x = ${x}\`。\`tails\` 還是空的，\`bisect_left\` 回傳 \`i = 0\`。`
            : i === tails.length
              ? `看 \`x = ${x}\`。在 \`tails\` 裡二分搜尋第一個 \`≥ ${x}\` 的位置：全部都比 ${x} 小，所以 \`i = ${i}\`（落在尾端之外）。`
              : `看 \`x = ${x}\`。在 \`tails\` 裡二分搜尋第一個 \`≥ ${x}\` 的位置：${smaller}，\`tails[${i}] = ${tails[i]} ≥ ${x}\`，所以 \`i = ${i}\`。`,
        views: views(idx, "active", searchMarks, i),
        vars: { x, i, "len(tails)": tails.length },
      });

      if (i === tails.length) {
        tails.push(x);
        t.push({
          line: [7, 8],
          note:
            i === 0
              ? `\`i == len(tails)\`，把 \`${x}\` 放進去：目前最長的遞增子序列長度是 1，結尾是 ${x}。`
              : `\`i == len(tails)\`：\`${x}\` 比所有結尾都大，可以接在長度 ${i} 的那條後面，得到長度 **${i + 1}** 的遞增子序列。\`append(${x})\`。`,
          views: views(idx, "active", { [i]: "good" }, i),
          vars: { x, i, "len(tails)": tails.length },
        });
      } else {
        const old = tails[i];
        tails[i] = x;
        t.push({
          line: [9, 10],
          note:
            old === x
              ? `\`tails[${i}]\` 本來就是 ${x}，換了等於沒換 —— 相等的數**不能**接在後面，因為要嚴格遞增。長度不變。`
              : `長度 ${i + 1} 的遞增子序列原本結尾最小是 ${old}，現在可以改用 \`${x}\` 結尾（${i > 0 ? `接在結尾 ${tails[i - 1]} 的那條後面` : `只取 ${x} 自己`}）。結尾變小，之後更容易接下去：\`tails[${i}] = ${x}\`。長度不變。`,
          views: views(idx, "active", { [i]: "active" }, i),
          vars: { x, i, "len(tails)": tails.length },
        });
      }
    }

    const all: Record<number, Tone> = {};
    tails.forEach((_, k) => (all[k] = "good"));
    t.push({
      line: 11,
      note: `全部看完，\`tails\` 有 ${tails.length} 格，代表最長能湊出長度 **${tails.length}** 的遞增子序列。注意 \`tails\` 的內容不一定是真正的那條子序列，只有長度是對的。`,
      views: views(nums.length, null, all),
      vars: { "len(tails)": tails.length },
      result: py(tails.length),
    });
    return t.frames;
  },
});
