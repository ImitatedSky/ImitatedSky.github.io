import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        farthest = 0  # 目前為止最遠能到的索引
        for i, step in enumerate(nums):
            if i > farthest:  # 連這格都到不了
                return False
            farthest = max(farthest, i + step)
        return True`;

export default defineProblem<{ nums: number[] }>({
  id: 55,
  summary:
    "你站在陣列 `nums` 的第 0 格。`nums[i]` 表示站在第 `i` 格時**最多**可以往右跳幾格（可以跳比較少）。\n\n判斷有沒有辦法跳到最後一格，可以回傳 `True`，否則回傳 `False`。",
  examples: [
    { input: "nums = [2,3,1,1,4]", output: "true", note: "0 → 1 → 4" },
    { input: "nums = [3,2,1,0,4]", output: "false", note: "怎麼跳都會停在索引 3，那格是 0" },
  ],
  constraints: ["1 ≤ nums.length ≤ 10⁴", "0 ≤ nums[i] ≤ 10⁵"],
  idea:
    "不用管「實際怎麼跳」，只要記一個數：**目前最遠能到哪裡** `farthest`。因為可以跳少一點，`farthest` 以內的每一格都到得了；每走到一格就用 `i + nums[i]` 把邊界往外推。如果哪天走到的 `i` 已經超出 `farthest`，代表中間斷掉了，之後都到不了。",
  steps: [
    "`farthest = 0`：一開始只到得了起點。",
    "由左到右看每一格 `i`：若 `i > farthest`，這格到不了，直接回傳 `False`。",
    "否則這格到得了，用 `i + nums[i]` 更新 `farthest`。",
    "整個陣列都走得完，表示最後一格也在可達範圍內，回傳 `True`。",
  ],
  pitfalls: [
    "要先檢查 `i > farthest` 再更新 —— 到不了的格子，它的跳躍力不能拿來用。",
    "不需要 DP 或 BFS 記錄每一格；可達的格子永遠是從 0 開始的一段連續區間，一個變數就夠了。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        `,
  presets: [
    { label: "[2,3,1,1,4]", input: { nums: [2, 3, 1, 1, 4] }, expected: "True" },
    { label: "[3,2,1,0,4]", input: { nums: [3, 2, 1, 0, 4] }, expected: "False" },
    { label: "[1,0,2]", input: { nums: [1, 0, 2] }, expected: "False" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    let farthest = 0;

    const view = (i: number, extra: Record<number, Tone> = {}) => {
      const reach = Math.min(farthest, n - 1);
      const marks: Record<number, Tone> = {};
      for (let x = reach + 1; x < n; x++) marks[x] = "muted";
      const pointers: Record<string, number> = { farthest: reach };
      if (i < n) pointers.i = i;
      return V.array("nums", nums, {
        marks: { ...marks, ...extra },
        pointers,
        ranges: [{ from: 0, to: reach, tone: "good", label: "到得了" }],
      });
    };

    t.push({
      line: 3,
      note: "`farthest = 0`：一開始只確定到得了起點。綠色括號是「目前確定到得了」的範圍，目標是讓它蓋到最後一格。",
      views: [view(0)],
      vars: { farthest },
    });

    for (let i = 0; i < n; i++) {
      const step = nums[i];
      if (i > farthest) {
        t.push({
          line: [4, 5, 6],
          note: `\`i = ${i}\` > \`farthest = ${farthest}\`：前面所有格子全力跳也到不了第 ${i} 格，路在這裡斷了，後面更不可能到。回傳 \`False\`。`,
          views: [view(i, { [i]: "bad" })],
          vars: { i, step, farthest },
          result: py(false),
        });
        return t.frames;
      }

      const to = i + step;
      const cand: Record<number, Tone> = { [i]: "active" };
      for (let x = i + 1; x <= Math.min(to, n - 1); x++) cand[x] = "compare";
      t.push({
        line: [4, 5],
        note:
          step === 0
            ? `第 ${i} 格在範圍內（\`${i} ≤ ${farthest}\`），但 \`nums[${i}] = 0\`，從這裡一步都跳不出去。`
            : `第 ${i} 格在範圍內（\`${i} ≤ ${farthest}\`）。從這裡最多跳 ${step} 格，可以到索引 ${i + 1}${to > i + 1 ? ` ~ ${to}` : ""}${to >= n ? "（已超過陣列尾端）" : ""}。`,
        views: [view(i, cand)],
        vars: { i, step, farthest },
      });

      const old = farthest;
      farthest = Math.max(farthest, to);
      t.push({
        line: 7,
        note:
          farthest > old
            ? `\`i + step = ${to}\` 比原本的 \`${old}\` 遠，邊界往外推：\`farthest = ${farthest}\`${farthest >= n - 1 ? "，已經蓋到最後一格了。" : "。"}`
            : `\`i + step = ${to}\` 沒有超過 \`farthest = ${old}\`，邊界不變。`,
        views: [view(i, { [i]: "active" })],
        vars: { i, step, farthest },
      });
    }

    const done: Record<number, Tone> = {};
    for (let x = 0; x < n; x++) done[x] = "good";
    t.push({
      line: 8,
      note: "每一格都走得到，沒有在中途斷掉 —— 最後一格當然也到得了，回傳 `True`。",
      views: [view(n, done)],
      vars: { farthest },
      result: py(true),
    });
    return t.frames;
  },
});
