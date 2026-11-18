import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = end = farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == end:  # 這一跳能到的範圍走完了，必須再跳一次
                jumps += 1
                end = farthest
        return jumps`;

export default defineProblem<{ nums: number[] }>({
  id: 45,
  summary:
    "你站在陣列 `nums` 的第 0 格，`nums[i]` 表示在第 `i` 格時最多可以往右跳幾格。題目保證一定到得了最後一格。\n\n回傳跳到最後一格所需的**最少跳躍次數**。",
  examples: [
    { input: "nums = [2,3,1,1,4]", output: "2", note: "0 → 1 → 4" },
    { input: "nums = [2,3,0,1,4]", output: "2" },
  ],
  constraints: ["1 ≤ nums.length ≤ 10⁴", "0 ≤ nums[i] ≤ 1000", "保證到得了最後一格"],
  idea:
    "把格子**分層**，像 BFS：第 0 層是起點，「跳 1 次能到的格子」是第 1 層，「跳 2 次才到得了的」是第 2 層……每一層都是一段連續區間。掃過目前這一層時順便記下從這層出發最遠能到哪（`farthest`），那就是下一層的右邊界。最後一格落在第幾層，答案就是幾。",
  steps: [
    "`end` 是目前這一層的右邊界，`farthest` 是下一層的右邊界，`jumps` 是已經跳的次數。",
    "走訪 `i`（不含最後一格），用 `i + nums[i]` 更新 `farthest`。",
    "當 `i == end`：這一層看完了，要再往前就得多跳一次 —— `jumps += 1`，並把 `end` 推到 `farthest`。",
    "回傳 `jumps`。",
  ],
  pitfalls: [
    "迴圈只跑到 `len(nums) - 2`。如果連最後一格也處理，當 `end` 剛好等於最後一格時會多算一跳。",
    "不需要決定「實際跳到哪一格」；只要知道每一層的邊界就能算出次數。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def jump(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[2,3,1,1,4]", input: { nums: [2, 3, 1, 1, 4] }, expected: "2" },
    { label: "[1,2,1,1,3,1,1,1]", input: { nums: [1, 2, 1, 1, 3, 1, 1, 1] }, expected: "4" },
    { label: "[5,1,1,1,1]", input: { nums: [5, 1, 1, 1, 1] }, expected: "1" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    let jumps = 0;
    let end = 0;
    let farthest = 0;
    // 每一層是一段連續區間；levels[j] = 跳 j 次才到得了的格子
    const levels: { from: number; to: number }[] = [{ from: 0, to: 0 }];
    const clamp = (x: number) => Math.min(x, n - 1);

    const view = (i: number, extra: Record<number, Tone> = {}, finished = false) => {
      const ranges = levels.map((lv, j) => ({
        from: lv.from,
        to: lv.to,
        tone: (finished ? (j === levels.length - 1 ? "good" : "visited") : j === levels.length - 1 ? "active" : "visited") as Tone,
        label: j === 0 ? "起點" : `第 ${j} 跳`,
      }));
      // 還在探索中的下一層：(end, farthest]
      if (!finished) {
        const from = clamp(end) + 1;
        ranges.push({ from, to: Math.max(from - 1, clamp(farthest)), tone: "compare", label: "下一跳" });
      }
      const pointers: Record<string, number> = finished ? {} : { end: clamp(end), farthest: clamp(farthest) };
      if (!finished && i < n) pointers.i = i;
      return V.array("nums", nums, { marks: extra, pointers, ranges });
    };

    t.push({
      line: 3,
      note: "把格子分層：起點是第 0 層（`end = 0`）。`farthest` 用來記「從目前這一層出發，最遠能到哪」，也就是下一層的右邊界。",
      views: [view(0)],
      vars: { jumps, end, farthest },
    });

    for (let i = 0; i < n - 1; i++) {
      const to = i + nums[i];
      const old = farthest;
      farthest = Math.max(farthest, to);
      const cand: Record<number, Tone> = { [i]: "active" };
      t.push({
        line: [4, 5],
        note:
          farthest > old
            ? `從第 ${i} 格最遠可以到 \`${i} + ${nums[i]} = ${to}\`，比原本的 \`${old}\` 遠，\`farthest = ${farthest}\`。下一跳能到的範圍變大了。`
            : `從第 ${i} 格最遠可以到 \`${i} + ${nums[i]} = ${to}\`，沒有超過 \`farthest = ${old}\`，不更新。`,
        views: [view(i, cand)],
        vars: { i, jumps, end, farthest },
      });

      if (i === end) {
        jumps++;
        const oldEnd = end;
        end = farthest;
        levels.push({ from: oldEnd + 1, to: clamp(end) });
        t.push({
          line: [6, 7, 8],
          note:
            `\`i == end\`：這一層的格子都看完了，想再往前**一定要多跳一次**，\`jumps = ${jumps}\`。新的一層是索引 ${oldEnd + 1} ~ ${clamp(end)}，\`end = ${end}\`` +
            (end >= n - 1 ? "，已經包含最後一格。" : "。"),
          views: [view(i, { [i]: "active" })],
          vars: { i, jumps, end, farthest },
        });
      }
    }

    t.push({
      line: 9,
      note:
        n === 1
          ? "只有一格，起點就是終點，不用跳，回傳 `0`。"
          : `最後一格落在「第 ${jumps} 跳」那一層，所以最少要跳 \`${jumps}\` 次。`,
      views: [view(n, { [n - 1]: "good" }, true)],
      vars: { jumps },
      result: py(jumps),
    });
    return t.frames;
  },
});
