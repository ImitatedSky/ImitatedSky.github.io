import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        best = inf
        total = 0  # 視窗 nums[l..r] 的總和
        l = 0
        for r, x in enumerate(nums):
            total += x
            while total >= target:
                best = min(best, r - l + 1)
                total -= nums[l]
                l += 1
        return 0 if best == inf else best`;

export default defineProblem<{ target: number; nums: number[] }>({
  id: 209,
  summary:
    "給一個**全是正整數**的陣列 `nums` 和一個正整數 `target`，找出總和**大於等於** `target` 的連續子陣列中，長度最短的那一個，回傳它的長度。\n\n如果沒有任何子陣列符合，回傳 `0`。",
  examples: [
    { input: "target = 7, nums = [2,3,1,2,4,3]", output: "2", note: "[4,3] 是最短的" },
    { input: "target = 4, nums = [1,4,4]", output: "1" },
    { input: "target = 11, nums = [1,1,1,1,1,1,1,1]", output: "0" },
  ],
  constraints: ["1 ≤ target ≤ 10⁹", "1 ≤ nums.length ≤ 10⁵", "1 ≤ nums[i] ≤ 10⁴"],
  idea:
    "因為數字都是正的，視窗**變長總和一定變大、變短一定變小**。所以用滑動視窗：右邊界不斷往右擴張，一旦總和達標，就從左邊盡量縮 —— 每縮一次都是一個更短的候選答案，縮到不達標再繼續擴張。",
  steps: [
    "`l = 0`、`total = 0`，用 `r` 由左到右把數字一個一個加進視窗。",
    "只要 `total >= target`：用目前視窗長度 `r - l + 1` 更新 `best`。",
    "接著把 `nums[l]` 從總和扣掉、`l` 右移，試試更短的視窗還達不達標。",
    "全部走完後，`best` 若還是無限大代表沒有答案，回傳 `0`。",
  ],
  pitfalls: [
    "縮視窗要用 `while` 不是 `if`：加進一個很大的數之後，左邊可能可以連續丟掉好幾個。",
    "這個做法依賴「全是正數」。如果有負數，總和就沒有單調性，滑動視窗不成立。",
    "別忘了沒有答案時要回傳 `0`，而不是 `inf`。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        `,
  presets: [
    { label: "7, [2,3,1,2,4,3]", input: { target: 7, nums: [2, 3, 1, 2, 4, 3] }, expected: "2" },
    { label: "8, [1,2,1,8,1,3,5]", input: { target: 8, nums: [1, 2, 1, 8, 1, 3, 5] }, expected: "1" },
    { label: "11, [1,2,1,1,2,1]", input: { target: 11, nums: [1, 2, 1, 1, 2, 1] }, expected: "0" },
  ],
  trace({ target, nums }) {
    const t = tracer();
    const n = nums.length;
    let best = Infinity;
    let bestL = -1;
    let total = 0;
    let l = 0;
    const showBest = () => (best === Infinity ? "inf" : best);

    const view = (r: number, tone: Tone, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let k = 0; k < l && k < n; k++) marks[k] = "muted";
      const pointers: Record<string, number> = r >= 0 ? { l, r } : { l };
      return V.array("nums", nums, {
        pointers,
        marks: { ...marks, ...extra },
        ...(r >= l ? { ranges: [{ from: l, to: r, tone, label: `total = ${total}` }] } : {}),
      });
    };

    t.push({
      line: [3, 4, 5],
      note: `視窗一開始是空的，\`total = 0\`。目標是找到總和 ≥ \`${target}\` 的最短視窗；\`best\` 先設成無限大，代表還沒找到。`,
      views: [view(-1, "active")],
      vars: { target, total, l, best: showBest() },
    });

    for (let r = 0; r < n; r++) {
      const x = nums[r];
      total += x;
      t.push({
        line: [6, 7],
        note:
          `右邊界擴張，把 \`nums[${r}] = ${x}\` 收進視窗，\`total = ${total}\`。` +
          (total >= target ? `已經 ≥ \`${target}\`，達標了！` : `還不到 \`${target}\`，繼續往右擴張。`),
        views: [view(r, total >= target ? "good" : "active", { [r]: "active" })],
        vars: { target, total, l, r, best: showBest() },
      });

      while (total >= target) {
        const len = r - l + 1;
        const improved = len < best;
        if (improved) {
          best = len;
          bestL = l;
        }
        const out = nums[l];
        const viewBefore = view(r, "good", { [l]: "compare" });
        const before = total;
        total -= out;
        l++;
        t.push({
          line: [8, 9, 10, 11],
          note:
            `視窗長度 \`${r} - ${l - 1} + 1 = ${len}\`，` +
            (improved ? `比紀錄短，\`best\` 更新為 **${best}**。` : `沒有比 \`best = ${best}\` 短。`) +
            `接著試試能不能更短：丟掉最左邊的 \`${out}\`，\`total\` 會從 ${before} 變成 ${total}` +
            (total >= target ? "，仍然達標，可以繼續縮。" : `，不到 \`${target}\` 就得停止收縮。`),
          views: [viewBefore],
          vars: { target, total: before, l: l - 1, r, best: showBest() },
        });
      }
    }

    const marks: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) marks[k] = bestL >= 0 && k >= bestL && k < bestL + best ? "good" : "muted";
    t.push({
      line: 12,
      note:
        best === Infinity
          ? `整個陣列都收進視窗了，總和還是不到 \`${target}\`，\`best\` 仍是無限大 —— 沒有答案，回傳 \`0\`。`
          : `右邊界走到底了。最短的達標視窗是索引 ${bestL} ~ ${bestL + best - 1}，長度 **${best}**。`,
      views: [
        V.array("nums", nums, {
          pointers: { l, r: n - 1 },
          marks,
          ...(bestL >= 0
            ? { ranges: [{ from: bestL, to: bestL + best - 1, tone: "good" as Tone, label: `最短，長度 ${best}` }] }
            : {}),
        }),
      ],
      vars: { target, total, l, best: showBest() },
      result: py(best === Infinity ? 0 : best),
    });
    return t.frames;
  },
});
