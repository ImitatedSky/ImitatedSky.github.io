import { defineProblem } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # 數值 -> 索引
        for i, x in enumerate(nums):
            need = target - x
            if need in seen:
                return [seen[need], i]
            seen[x] = i
        return []`;

export default defineProblem<{ nums: number[]; target: number }>({
  id: 1,
  summary:
    "給一個整數陣列 `nums` 和一個目標值 `target`，找出**和為 target 的兩個數**，回傳它們的索引。\n\n保證恰好有一組答案，而且同一個元素不能用兩次。",
  summaryEn:
    "Given an integer array `nums` and a target value `target`, find **the two numbers that add up to target** and return their indices.\n\nThere is exactly one answer, and the same element cannot be used twice.",
  examples: [
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", note: "nums[0] + nums[1] = 2 + 7 = 9", noteEn: "nums[0] + nums[1] = 2 + 7 = 9" },
    { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
  ],
  constraints: ["2 ≤ nums.length ≤ 10⁴", "只會有一組有效答案"],
  constraintsEn: ["2 ≤ nums.length ≤ 10⁴", "There is exactly one valid answer"],
  idea:
    "看到 `x` 時，我們真正想問的是：「`target - x` 之前出現過嗎？」用雜湊表記住**看過的數值 → 索引**，這個問題就能 O(1) 回答，整體只要掃一遍。",
  steps: [
    "準備一個空的雜湊表 `seen`（數值 → 索引）。",
    "由左到右走訪，對每個 `x` 算出需要的另一半 `need = target - x`。",
    "若 `need` 已在 `seen` 裡，答案就是 `[seen[need], i]`。",
    "否則把 `x` 記進 `seen`，繼續往下。",
  ],
  pitfalls: ["要**先查再存**：先存的話，`target = 2x` 時會把自己跟自己配對。"],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `,
  presets: [
    { label: "[2,7,11,15], 9", input: { nums: [2, 7, 11, 15], target: 9 }, expected: "[0, 1]" },
    { label: "[3,2,4], 6", input: { nums: [3, 2, 4], target: 6 }, expected: "[1, 2]" },
    { label: "[1,5,8,3,10,4], 14", input: { nums: [1, 5, 8, 3, 10, 4], target: 14 }, expected: "[4, 5]" },
  ],
  trace({ nums, target }) {
    const t = tracer();
    const seen = new Map<number, number>();

    t.push({
      line: 3,
      note: `建立空的雜湊表 \`seen\`，用來記錄「數值 → 索引」。目標 \`target = ${target}\`。`,
      views: [V.array("nums", nums), V.map("seen", seen)],
      vars: { target },
    });

    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];
      const need = target - x;
      t.push({
        line: [4, 5],
        note: `看 \`nums[${i}] = ${x}\`，需要的另一半是 \`${target} - ${x} = ${need}\`。`,
        views: [
          V.array("nums", nums, { pointers: { i }, marks: { [i]: "active" } }),
          V.map("seen", seen),
        ],
        vars: { target, i, x, need },
      });

      if (seen.has(need)) {
        const j = seen.get(need)!;
        t.push({
          line: [6, 7],
          note: `\`${need}\` 在 \`seen\` 裡（索引 ${j}）！\`${need} + ${x} = ${target}\`，找到答案。`,
          views: [
            V.array("nums", nums, { pointers: { i }, marks: { [i]: "good", [j]: "good" } }),
            V.map("seen", seen, { marks: { [String(need)]: "good" } }),
          ],
          vars: { target, i, x, need },
          result: py([j, i]),
        });
        return t.frames;
      }

      seen.set(x, i);
      t.push({
        line: 8,
        note: `\`${need}\` 還沒出現過，把 \`${x} → ${i}\` 記進 \`seen\`。`,
        views: [
          V.array("nums", nums, { pointers: { i }, marks: { [i]: "visited" } }),
          V.map("seen", seen, { marks: { [String(x)]: "active" } }),
        ],
        vars: { target, i, x, need },
      });
    }

    t.push({ line: 9, note: "走完整個陣列都沒有找到。", views: [V.array("nums", nums)], result: "[]" });
    return t.frames;
  },
});
