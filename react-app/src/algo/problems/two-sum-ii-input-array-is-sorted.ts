import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        l, r = 0, len(numbers) - 1
        while l < r:
            total = numbers[l] + numbers[r]
            if total == target:
                return [l + 1, r + 1]  # 題目的索引從 1 開始
            if total < target:
                l += 1  # 太小，換大一點的左邊
            else:
                r -= 1  # 太大，換小一點的右邊
        return []`;

export default defineProblem<{ numbers: number[]; target: number }>({
  id: 167,
  summary:
    "給一個**已經由小到大排好**的整數陣列 `numbers` 和目標值 `target`，找出相加剛好等於 `target` 的兩個數，回傳它們的位置（**從 1 開始算**，小的在前）。\n\n保證恰好有一組答案，同一個元素不能用兩次，而且只能使用常數的額外空間。",
  examples: [
    { input: "numbers = [2,7,11,15], target = 9", output: "[1,2]", note: "2 + 7 = 9" },
    { input: "numbers = [2,3,4], target = 6", output: "[1,3]" },
    { input: "numbers = [-1,0], target = -1", output: "[1,2]" },
  ],
  constraints: ["2 ≤ numbers.length ≤ 3 × 10⁴", "numbers 為非遞減排序", "恰好只有一組答案"],
  idea:
    "陣列有序，就可以用**頭尾雙指標**。目前的和太小 → 只有把左指標右移才會變大；太大 → 只有把右指標左移才會變小。每次移動都能確定地**淘汰一個數**，所以掃一遍就找得到。",
  steps: [
    "`l` 指向最小的數、`r` 指向最大的數。",
    "算 `total = numbers[l] + numbers[r]`。",
    "等於 `target` 就回傳 `[l + 1, r + 1]`。",
    "`total` 太小：`numbers[l]` 配上目前最大的數都不夠，它不可能是答案，`l += 1`。",
    "`total` 太大：`numbers[r]` 配上目前最小的數都超過，它不可能是答案，`r -= 1`。",
  ],
  pitfalls: [
    "回傳的是**從 1 開始**的位置，別忘了各加 1。",
    "用雜湊表也能過，但會用到 O(n) 空間，沒有利用到「已排序」這個條件。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        `,
  presets: [
    { label: "[1,3,4,6,8,10,13], 12", input: { numbers: [1, 3, 4, 6, 8, 10, 13], target: 12 }, expected: "[3, 5]" },
    { label: "[2,7,11,15], 9", input: { numbers: [2, 7, 11, 15], target: 9 }, expected: "[1, 2]" },
    { label: "[-5,-2,0,3,4,9], 2", input: { numbers: [-5, -2, 0, 3, 4, 9], target: 2 }, expected: "[2, 5]" },
  ],
  trace({ numbers, target }) {
    const t = tracer();
    let l = 0;
    let r = numbers.length - 1;
    const out: Record<number, Tone> = {}; // 已被淘汰的數
    const view = (extra: Record<number, Tone> = {}) =>
      V.array("numbers", numbers, { pointers: { l, r }, marks: { ...out, ...extra } });

    t.push({
      line: 3,
      note: `陣列已排序：\`l\` 指著最小的數、\`r\` 指著最大的數，目標 \`target = ${target}\`。`,
      views: [view()],
      vars: { target, l, r },
    });

    while (l < r) {
      const a = numbers[l];
      const b = numbers[r];
      const total = a + b;
      if (total === target) {
        t.push({
          line: [5, 6, 7],
          note: `\`${a} + ${b} = ${total}\`，剛好等於 \`target\`！回傳從 1 開始的位置 \`[${l} + 1, ${r} + 1]\`。`,
          views: [view({ [l]: "good", [r]: "good" })],
          vars: { target, l, r, total },
          result: py([l + 1, r + 1]),
        });
        return t.frames;
      }
      if (total < target) {
        t.push({
          line: [5, 8, 9],
          note: `\`${a} + ${b} = ${total} < ${target}\`，太小。\`${b}\` 已經是範圍內最大的數，\`${a}\` 配它都不夠，所以 \`${a}\` 不可能是答案 —— \`l\` 右移。`,
          views: [view({ [l]: "bad", [r]: "compare" })],
          vars: { target, l, r, total },
        });
        out[l] = "muted";
        l++;
      } else {
        t.push({
          line: [5, 10, 11],
          note: `\`${a} + ${b} = ${total} > ${target}\`，太大。\`${a}\` 已經是範圍內最小的數，\`${b}\` 配它都超過，所以 \`${b}\` 不可能是答案 —— \`r\` 左移。`,
          views: [view({ [l]: "compare", [r]: "bad" })],
          vars: { target, l, r, total },
        });
        out[r] = "muted";
        r--;
      }
    }

    t.push({
      line: 12,
      note: "`l` 和 `r` 相遇了還沒找到，代表沒有答案（題目保證不會發生）。",
      views: [view()],
      vars: { target, l, r },
      result: "[]",
    });
    return t.frames;
  },
});
