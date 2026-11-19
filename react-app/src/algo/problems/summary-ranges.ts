import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        res = []
        i = 0
        while i < len(nums):
            start = nums[i]
            while i + 1 < len(nums) and nums[i + 1] == nums[i] + 1:
                i += 1  # 還連著，就繼續往右延伸
            if start == nums[i]:
                res.append(str(start))
            else:
                res.append(f"{start}->{nums[i]}")
            i += 1
        return res`;

type Range = { from: number; to: number; tone?: Tone; label?: string };

export default defineProblem<{ nums: number[] }>({
  id: 228,
  summary:
    "給一個**已排序、沒有重複**的整數陣列。把連續的整數合併成區間，用最少的區間剛好涵蓋所有數字，並依序輸出。\n\n區間 `[a, b]` 在 `a != b` 時寫成 `\"a->b\"`，只有一個數時寫成 `\"a\"`。",
  summaryEn:
    "Given a **sorted integer array with no duplicates**, merge runs of consecutive integers into ranges so that the fewest ranges cover every number exactly, and output them in order.\n\nA range `[a, b]` is written as `\"a->b\"` when `a != b`, and as `\"a\"` when it holds a single number.",
  examples: [
    { input: "nums = [0,1,2,4,5,7]", output: '["0->2","4->5","7"]' },
    { input: "nums = [0,2,3,4,6,8,9]", output: '["0","2->4","6","8->9"]' },
  ],
  constraints: ["0 ≤ nums.length ≤ 20", "nums 嚴格遞增"],
  constraintsEn: ["0 ≤ nums.length ≤ 20", "nums is strictly increasing"],
  idea:
    "陣列已排序又不重複，所以「連續」就是**下一個數剛好等於這個數 + 1**。記下每一段的起點 `start`，讓 `i` 一路往右走到斷掉的地方，那裡就是這一段的終點。",
  steps: [
    "`i` 指向一段的開頭，記下 `start = nums[i]`。",
    "只要下一個數存在而且等於 `nums[i] + 1`，就 `i += 1` 繼續延伸。",
    "停下來時 `nums[i]` 是這段的終點：起點等於終點就輸出單一數字，否則輸出 `start->終點`。",
    "`i += 1` 跳到下一段的開頭，重複直到走完。",
  ],
  pitfalls: [
    "內層迴圈要先檢查 `i + 1 < len(nums)` 再讀 `nums[i + 1]`，否則最後一段會越界。",
    "只有一個數的區間不要輸出成 `\"7->7\"`。",
  ],
  complexity: { time: "O(n)", space: "O(1)（不含輸出）" },
  code,
  starter: `class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        `,
  presets: [
    { label: "[0,1,2,4,5,7]", input: { nums: [0, 1, 2, 4, 5, 7] }, expected: '["0->2", "4->5", "7"]' },
    { label: "[0,2,3,4,6,8,9]", input: { nums: [0, 2, 3, 4, 6, 8, 9] }, expected: '["0", "2->4", "6", "8->9"]' },
    { label: "[5]", input: { nums: [5] }, expected: '["5"]' },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    const res: string[] = [];
    const done: Range[] = [];
    const doneMarks: Record<number, Tone> = {};

    const views = (i?: number, cur?: Range, extra: Record<number, Tone> = {}) => [
      V.array("nums", nums, {
        pointers: i === undefined ? {} : { i },
        marks: { ...doneMarks, ...extra },
        ranges: cur ? [...done, cur] : done,
      }),
      V.array("res", res, { marks: resMarks() }),
    ];
    const resMarks = (last: Tone = "good") =>
      Object.fromEntries(res.map((_, k) => [k, k === res.length - 1 ? last : ("good" as Tone)]));

    t.push({
      line: [3, 4],
      note: "陣列已排序且不重複，所以只要相鄰兩數相差剛好 1 就算「連著」。從 `i = 0` 開始找第一段。",
      views: [V.array("nums", nums, { pointers: n ? { i: 0 } : {} }), V.array("res", res)],
      vars: { i: 0 },
    });

    let i = 0;
    while (i < n) {
      const s = i;
      const start = nums[i];
      t.push({
        line: [5, 6],
        note: `新的一段從 \`nums[${i}] = ${start}\` 開始，記下 \`start = ${start}\`。`,
        views: views(i, { from: s, to: i, tone: "active", label: `start = ${start}` }, { [i]: "active" }),
        vars: { i, start },
      });

      while (i + 1 < n && nums[i + 1] === nums[i] + 1) {
        i++;
        t.push({
          line: [7, 8],
          note: `下一個數 \`${nums[i]}\` 剛好是 \`${nums[i - 1]} + 1\`，還連著，\`i\` 往右走一步，區間跟著延伸。`,
          views: views(i, { from: s, to: i, tone: "active", label: `${start} … ${nums[i]}` }, { [i]: "active" }),
          vars: { i, start },
        });
      }

      const why =
        i + 1 >= n
          ? "後面沒有數字了"
          : `下一個數 \`${nums[i + 1]}\` 不是 \`${nums[i]} + 1 = ${nums[i] + 1}\`，斷開了`;
      const text = start === nums[i] ? String(start) : `${start}->${nums[i]}`;
      res.push(text);
      done.push({ from: s, to: i, tone: "good", label: text });
      for (let k = s; k <= i; k++) doneMarks[k] = "good";
      const stopMark: Record<number, Tone> = i + 1 < n ? { [i + 1]: "bad" } : {};
      t.push({
        line: start === nums[i] ? [7, 9, 10] : [7, 9, 11, 12],
        note:
          `${why}，這一段到 \`${nums[i]}\` 為止。` +
          (start === nums[i]
            ? `起點和終點都是 \`${start}\`，只輸出一個數字 \`"${text}"\`。`
            : `起點 \`${start}\` ≠ 終點 \`${nums[i]}\`，輸出 \`"${text}"\`。`),
        views: [
          V.array("nums", nums, { pointers: { i }, marks: { ...doneMarks, ...stopMark }, ranges: done }),
          V.array("res", res, { marks: resMarks("active") }),
        ],
        vars: { i, start },
      });
      i++;
    }

    t.push({
      line: [5, 14],
      note: n
        ? `\`i\` 走到陣列尾端，所有數字都被 ${res.length} 個區間涵蓋了。`
        : "陣列是空的，迴圈一次都不會進去，直接回傳空陣列。",
      views: [
        V.array("nums", nums, { pointers: { i: n }, marks: doneMarks, ranges: done }),
        V.array("res", res, { marks: resMarks() }),
      ],
      vars: { i: n },
      result: py(res),
    });
    return t.frames;
  },
});
