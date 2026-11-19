import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        last = {}  # 數值 -> 最近一次出現的索引
        for i, x in enumerate(nums):
            if x in last and i - last[x] <= k:
                return True
            last[x] = i
        return False`;

const LAST = "last（數值 → 最近一次出現的索引）";

export default defineProblem<{ nums: number[]; k: number }>({
  id: 219,
  summary:
    "給一個整數陣列 `nums` 和整數 `k`。判斷陣列裡有沒有**兩個相同的數**，而且它們的索引距離不超過 `k`。\n\n也就是是否存在不同的 `i`、`j`，使得 `nums[i] == nums[j]` 且 `|i - j| ≤ k`。",
  examples: [
    { input: "nums = [1,2,3,1], k = 3", output: "true", note: "兩個 1 在索引 0 和 3，距離 3" },
    { input: "nums = [1,0,1,1], k = 1", output: "true" },
    { input: "nums = [1,2,3,1,2,3], k = 2", output: "false", note: "相同的數都相隔 3" },
  ],
  constraints: ["1 ≤ nums.length ≤ 10⁵", "0 ≤ k ≤ 10⁵"],
  idea:
    "走到 `nums[i] = x` 時，往左邊找相同的數，**最有機會夠近的一定是離我最近的那一個**。所以雜湊表只要記每個數值「最近一次出現的索引」，比一次距離就夠了。",
  steps: [
    "準備雜湊表 `last`（數值 → 最近一次出現的索引）。",
    "由左到右走訪，對每個 `x = nums[i]`：若 `x` 出現過，而且 `i - last[x] ≤ k`，回傳 `True`。",
    "否則把 `last[x]` 更新成 `i` —— 不管之前有沒有出現過，都要更新成最新的位置。",
    "走完都沒找到就回傳 `False`。",
  ],
  pitfalls: [
    "距離太遠時**仍然要更新** `last[x] = i`：舊的位置對後面的元素只會更遠，留著沒有用。",
    "另一種等價寫法是維護一個大小最多 `k` 的滑動視窗 `set`，空間是 O(min(n, k))。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        `,
  presets: [
    { label: "[1,2,3,1,2,3,3], k = 2", input: { nums: [1, 2, 3, 1, 2, 3, 3], k: 2 }, expected: "True" },
    { label: "[1,2,3,1], k = 3", input: { nums: [1, 2, 3, 1], k: 3 }, expected: "True" },
    { label: "[1,2,3,1,2,3], k = 2", input: { nums: [1, 2, 3, 1, 2, 3], k: 2 }, expected: "False" },
  ],
  trace({ nums, k }) {
    const t = tracer();
    const last = new Map<number, number>();

    // 以 i 為右端、往左 k 格的範圍：只有落在這裡面的相同數字才算「夠近」
    const reach = (i: number, tone: Tone) => {
      const from = Math.max(0, i - k);
      // 範圍太窄時放不下文字，就只畫框
      return [{ from, to: i, tone, ...(i - from >= 2 ? { label: `距離 ≤ ${k}` } : {}) }];
    };

    t.push({
      line: 3,
      note: `建立空的雜湊表 \`last\`，記錄每個數值**最近一次**出現在哪個索引。目標：找到兩個相同的數，索引差不超過 \`k = ${k}\`。`,
      views: [V.array("nums", nums, { ranges: [] }), V.map(LAST, last)],
      vars: { k },
    });

    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];

      if (!last.has(x)) {
        t.push({
          line: [4, 5],
          note: `看 \`nums[${i}] = ${x}\`。\`${x}\` 不在 \`last\` 裡，左邊沒有出現過，不可能配成一對。`,
          views: [
            V.array("nums", nums, { pointers: { i }, marks: { [i]: "active" }, ranges: reach(i, "active") }),
            V.map(LAST, last),
          ],
          vars: { k, i, x },
        });
      } else {
        const j = last.get(x)!;
        const dist = i - j;
        if (dist <= k) {
          t.push({
            line: [4, 5, 6],
            note: `看 \`nums[${i}] = ${x}\`。\`${x}\` 上次出現在索引 ${j}，距離 \`${i} - ${j} = ${dist} ≤ ${k}\`，夠近！找到一組答案。`,
            views: [
              V.array("nums", nums, {
                pointers: { i, "last[x]": j },
                marks: { [i]: "good", [j]: "good" },
                ranges: reach(i, "good"),
              }),
              V.map(LAST, last, { marks: { [String(x)]: "good" } }),
            ],
            vars: { k, i, x, "i - last[x]": dist },
            result: py(true),
          });
          return t.frames;
        }
        t.push({
          line: [4, 5],
          note: `看 \`nums[${i}] = ${x}\`。\`${x}\` 上次出現在索引 ${j}，但距離 \`${i} - ${j} = ${dist} > ${k}\`，太遠了。更早的 \`${x}\` 只會更遠，不用再看。`,
          views: [
            V.array("nums", nums, {
              pointers: { i, "last[x]": j },
              marks: { [i]: "active", [j]: "bad" },
              ranges: reach(i, "active"),
            }),
            V.map(LAST, last, { marks: { [String(x)]: "bad" } }),
          ],
          vars: { k, i, x, "i - last[x]": dist },
        });
      }

      const had = last.has(x);
      last.set(x, i);
      t.push({
        line: 7,
        note: had
          ? `把 \`last[${x}]\` **更新**成 ${i}。對後面的元素來說，索引 ${i} 的 \`${x}\` 比舊的更近，舊位置可以丟掉了。`
          : `記下 \`last[${x}] = ${i}\`，之後若再遇到 \`${x}\` 就拿這個位置來算距離。`,
        views: [
          V.array("nums", nums, { pointers: { i }, marks: { [i]: "visited" }, ranges: [] }),
          V.map(LAST, last, { marks: { [String(x)]: "active" } }),
        ],
        vars: { k, i, x },
      });
    }

    t.push({
      line: 8,
      note: `走完整個陣列，每個數和它左邊最近的相同數字都相隔超過 ${k}（或根本沒有重複），回傳 \`False\`。`,
      views: [V.array("nums", nums, { ranges: [] }), V.map(LAST, last)],
      vars: { k },
      result: py(false),
    });
    return t.frames;
  },
});
