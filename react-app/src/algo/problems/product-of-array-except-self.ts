import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [1] * n
        prefix = 1
        for i in range(n):
            res[i] = prefix          # 左邊所有數的乘積
            prefix *= nums[i]
        suffix = 1
        for i in range(n - 1, -1, -1):
            res[i] *= suffix         # 再乘上右邊所有數的乘積
            suffix *= nums[i]
        return res`;

export default defineProblem<{ nums: number[] }>({
  id: 238,
  summary:
    "給一個整數陣列 `nums`，回傳一個陣列 `res`，其中 `res[i]` 等於**除了 `nums[i]` 以外所有元素的乘積**。\n\n要求時間 O(n)，而且**不能使用除法**。",
  examples: [
    { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
    { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
  ],
  constraints: ["2 ≤ nums.length ≤ 10⁵", "任何前綴 / 後綴的乘積都落在 32 位元整數內", "不可使用除法"],
  idea:
    "「除了自己以外的乘積」可以拆成兩半：**左邊所有數的乘積 × 右邊所有數的乘積**。先由左往右掃一遍，把左半邊的乘積寫進 `res`；再由右往左掃一遍，把右半邊的乘積乘上去。",
  steps: [
    "`res` 全部先設成 1，`prefix = 1` 代表「目前位置左邊的乘積」。",
    "由左到右：先把 `prefix` 寫進 `res[i]`，再把 `nums[i]` 乘進 `prefix`，留給下一格用。",
    "`suffix = 1` 代表「目前位置右邊的乘積」。",
    "由右到左：`res[i]` 乘上 `suffix`，再把 `nums[i]` 乘進 `suffix`。",
  ],
  pitfalls: [
    "順序是**先用再更新**：先把 `prefix` 寫進 `res[i]`，才把 `nums[i]` 乘進去，否則就把自己也算進去了。",
    "不要想用「總乘積 ÷ 自己」：題目禁止除法，而且陣列裡有 0 時根本除不了。",
  ],
  complexity: { time: "O(n)", space: "O(1)（不計輸出陣列）" },
  code,
  starter: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        `,
  presets: [
    { label: "[1,2,3,4]", input: { nums: [1, 2, 3, 4] }, expected: "[24, 12, 8, 6]" },
    { label: "[-1,1,0,-3,3]", input: { nums: [-1, 1, 0, -3, 3] }, expected: "[0, 0, 9, 0, 0]" },
    { label: "[2,5]", input: { nums: [2, 5] }, expected: "[5, 2]" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    const res: number[] = new Array(n).fill(1);
    // JS 會算出 -0，統一成 0 才跟 Python 一樣
    const mul = (a: number, b: number) => a * b + 0;
    const list = (from: number, to: number) =>
      nums
        .slice(from, to + 1)
        .map((x) => (x < 0 ? `(${x})` : String(x)))
        .join(" × ");

    t.push({
      line: [3, 4],
      note: "`res` 先全部填 1。接下來分兩趟：第一趟算每格**左邊**的乘積，第二趟再乘上**右邊**的乘積。",
      views: [V.array("nums", nums), V.array("res", res)],
      vars: { n },
    });

    let prefix = 1;
    t.push({
      line: 5,
      note: "`prefix` 代表「目前這格左邊所有數的乘積」。最左邊那格左邊沒有東西，所以從 1 開始。",
      views: [V.array("nums", nums), V.array("res", res)],
      vars: { prefix },
    });

    for (let i = 0; i < n; i++) {
      res[i] = prefix;
      const doneL: Record<number, Tone> = {};
      for (let k = 0; k < i; k++) doneL[k] = "visited";
      t.push({
        line: [6, 7],
        note:
          i === 0
            ? "`res[0] = prefix = 1`：`nums[0]` 左邊沒有任何數，「什麼都沒乘」就當作 1。"
            : `\`res[${i}] = prefix = ${prefix}\`，也就是 \`nums[${i}]\` 左邊 \`${list(0, i - 1)}\` 的乘積 —— 還沒把自己算進去。`,
        views: [
          V.array("nums", nums, {
            pointers: { i },
            marks: { [i]: "active" },
            ranges: i > 0 ? [{ from: 0, to: i - 1, tone: "alt", label: `prefix = ${prefix}` }] : [],
          }),
          V.array("res", res, { marks: { ...doneL, [i]: "active" } }),
        ],
        vars: { i, prefix },
      });

      const before = prefix;
      prefix = mul(prefix, nums[i]);
      t.push({
        line: 8,
        note: `寫完才把 \`nums[${i}] = ${nums[i]}\` 乘進去：\`prefix = ${before} × ${nums[i]} = ${prefix}\`，留給下一格當「左邊的乘積」。`,
        views: [
          V.array("nums", nums, {
            pointers: { i },
            ranges: [{ from: 0, to: i, tone: "alt", label: `prefix = ${prefix}` }],
          }),
          V.array("res", res, { marks: { ...doneL, [i]: "visited" } }),
        ],
        vars: { i, prefix },
      });
    }

    let suffix = 1;
    const half: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) half[k] = "visited";
    t.push({
      line: 9,
      note: "第一趟結束，`res` 裡每格都是「左邊的乘積」。現在換 `suffix` 從右邊走回來，代表「右邊所有數的乘積」，一樣從 1 開始。",
      views: [V.array("nums", nums), V.array("res", res, { marks: half })],
      vars: { suffix },
    });

    for (let i = n - 1; i >= 0; i--) {
      const marks: Record<number, Tone> = {};
      for (let k = 0; k < n; k++) marks[k] = k > i ? "good" : "visited";
      const left = res[i];
      res[i] = mul(res[i], suffix);
      t.push({
        line: [10, 11],
        note:
          i === n - 1
            ? `\`res[${i}]\` 原本是左邊的乘積 ${left}。最右邊這格右邊沒有任何數，\`suffix = 1\`，乘完還是 ${res[i]}。這格完成了。`
            : `\`res[${i}]\` 原本是左邊的乘積 ${left}，再乘上右邊 \`${list(i + 1, n - 1)}\` 的乘積 \`suffix = ${suffix}\`，得到 \`${left} × ${suffix} = ${res[i]}\`。這格完成了。`,
        views: [
          V.array("nums", nums, {
            pointers: { i },
            marks: { [i]: "active" },
            ranges: i < n - 1 ? [{ from: i + 1, to: n - 1, tone: "alt", label: `suffix = ${suffix}` }] : [],
          }),
          V.array("res", res, { marks: { ...marks, [i]: "active" } }),
        ],
        vars: { i, suffix },
      });

      const before = suffix;
      suffix = mul(suffix, nums[i]);
      t.push({
        line: 12,
        note: `把 \`nums[${i}] = ${nums[i]}\` 乘進去：\`suffix = ${before} × ${nums[i]} = ${suffix}\`，留給左邊下一格用。`,
        views: [
          V.array("nums", nums, {
            pointers: { i },
            ranges: [{ from: i, to: n - 1, tone: "alt", label: `suffix = ${suffix}` }],
          }),
          V.array("res", res, { marks: { ...marks, [i]: "good" } }),
        ],
        vars: { i, suffix },
      });
    }

    const all: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) all[k] = "good";
    t.push({
      line: 13,
      note: "兩趟都走完，每格都是「左邊乘積 × 右邊乘積」，全程沒有用到除法。",
      views: [V.array("nums", nums), V.array("res", res, { marks: all })],
      result: py(res),
    });
    return t.frames;
  },
});
