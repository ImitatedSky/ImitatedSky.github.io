import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi = 0, x
        while lo <= hi:
            mid = (lo + hi) // 2
            if mid * mid <= x:
                lo = mid + 1  # mid 可行，答案至少是 mid，往右找更大的
            else:
                hi = mid - 1  # mid 太大，答案一定在左邊
        return hi`;

export default defineProblem<{ x: number }>({
  id: 69,
  summary:
    "給一個非負整數 `x`，回傳它的**平方根無條件捨去到整數**的結果，也就是滿足 `k × k ≤ x` 的最大整數 `k`。\n\n不能使用內建的開根號或次方函式。",
  examples: [
    { input: "x = 4", output: "2" },
    { input: "x = 8", output: "2", note: "√8 ≈ 2.828，捨去小數" },
  ],
  constraints: ["0 ≤ x ≤ 2³¹ − 1"],
  idea:
    "**對答案做二分搜尋**。候選答案 `k` 從 0 到 `x`，而 `k × k ≤ x` 這個條件有單調性：小的 `k` 都成立，超過某個點之後全部不成立。我們要找的就是「最後一個成立的 `k`」—— 每次猜中間，成立就往右找更大的，不成立就往左縮。",
  steps: [
    "搜尋範圍 `lo = 0`、`hi = x`。",
    "取 `mid = (lo + hi) // 2`，比較 `mid * mid` 和 `x`。",
    "`mid * mid <= x`：`mid` 可行，但可能還有更大的，`lo = mid + 1`。",
    "否則 `mid` 太大，`hi = mid - 1`。",
    "`lo > hi` 時結束：`hi` 左邊（含）全是可行的、`lo` 右邊（含）全是太大的，所以答案是 `hi`。",
  ],
  pitfalls: [
    "回傳的是 `hi` 不是 `lo`：結束時 `lo` 停在**第一個太大的數**，`hi` 才是最後一個可行的。",
    "其他語言裡 `mid * mid` 可能溢位，要用 64 位元整數或改比 `mid <= x / mid`。",
    "`x = 0`、`x = 1` 也要對：這個寫法不用特判。",
  ],
  complexity: { time: "O(log x)", space: "O(1)" },
  code,
  starter: `class Solution:
    def mySqrt(self, x: int) -> int:
        `,
  presets: [
    { label: "x = 8", input: { x: 8 }, expected: "2" },
    { label: "x = 25", input: { x: 25 }, expected: "5" },
    { label: "x = 0", input: { x: 0 }, expected: "0" },
  ],
  trace({ x }) {
    const t = tracer();
    const cand = Array.from({ length: x + 1 }, (_, k) => k);
    const label = `候選答案 k（0 … ${x}）`;
    let lo = 0;
    let hi = x;

    // lo 左邊：已確認 k² ≤ x；hi 右邊：已確認 k² > x
    const marks = (extra: Record<number, Tone> = {}) => {
      const m: Record<number, Tone> = {};
      for (let k = 0; k < lo; k++) m[k] = "good";
      for (let k = hi + 1; k <= x; k++) m[k] = "muted";
      return { ...m, ...extra };
    };
    const range = () => (lo <= hi ? [{ from: lo, to: hi, tone: "compare" as Tone, label: "還沒確定" }] : []);

    t.push({
      line: 3,
      note: `答案一定落在 0 到 ${x} 之間，先把整段都當成搜尋範圍：\`lo = 0\`、\`hi = ${x}\`。越小的 \`k\` 越容易滿足 \`k² ≤ ${x}\`，所以可以用二分搜尋找**最後一個滿足的**。`,
      views: [V.array(label, cand, { pointers: { lo, hi }, ranges: range() })],
      vars: { x, lo, hi },
    });

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const sq = mid * mid;
      t.push({
        line: [4, 5, 6],
        note: `範圍 \`[${lo}, ${hi}]\` 還有候選。猜正中間：\`mid = (${lo} + ${hi}) // 2 = ${mid}\`，\`${mid}² = ${sq}\`，和 \`x = ${x}\` 比。`,
        views: [V.array(label, cand, { pointers: { lo, hi, mid }, marks: marks({ [mid]: "active" }), ranges: range() })],
        vars: { x, lo, hi, mid, "mid * mid": sq },
      });

      if (sq <= x) {
        const plo = lo;
        lo = mid + 1;
        t.push({
          line: [6, 7],
          note:
            `\`${sq} ≤ ${x}\`，\`${mid}\` 可行。` +
            (plo < mid ? `比它小的（\`${plo}\`～\`${mid - 1}\`）當然也可行，` : "") +
            `但我們要**最大**的，所以把 \`lo\` 移到 \`${lo}\`，繼續往右找有沒有更大的。`,
          views: [V.array(label, cand, { pointers: { lo, hi, mid }, marks: marks(), ranges: range() })],
          vars: { x, lo, hi, mid, "mid * mid": sq },
        });
      } else {
        const phi = hi;
        hi = mid - 1;
        t.push({
          line: [8, 9],
          note:
            `\`${sq} > ${x}\`，\`${mid}\` 太大了` +
            (phi > mid ? `，比它更大的（\`${mid + 1}\`～\`${phi}\`）只會更大` : "") +
            `。整段丟掉，\`hi\` 移到 \`${hi}\`。`,
          views: [V.array(label, cand, { pointers: { lo, hi, mid }, marks: marks({ [mid]: "bad" }), ranges: range() })],
          vars: { x, lo, hi, mid, "mid * mid": sq },
        });
      }
    }

    const done: Record<number, Tone> = {};
    for (let k = 0; k <= x; k++) done[k] = k <= hi ? "visited" : "muted";
    done[hi] = "good";
    t.push({
      line: [4, 10],
      note: `\`lo = ${lo} > hi = ${hi}\`，範圍空了。\`hi\` 停在**最後一個可行的數**（\`${hi}² = ${hi * hi} ≤ ${x}\`），\`lo\` 停在第一個太大的數（\`${lo}² = ${lo * lo} > ${x}\`），所以答案是 \`hi = ${hi}\`。`,
      views: [V.array(label, cand, { pointers: { lo, hi }, marks: done })],
      vars: { x, lo, hi },
      result: py(hi),
    });
    return t.frames;
  },
});
