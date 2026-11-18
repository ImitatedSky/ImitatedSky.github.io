import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        # dp[j] = 從「目前這一列」的第 j 格出發，一路走到底的最小路徑和
        dp = triangle[-1][:]
        for i in range(len(triangle) - 2, -1, -1):
            for j in range(i + 1):
                dp[j] = triangle[i][j] + min(dp[j], dp[j + 1])
        return dp[0]`;

export default defineProblem<{ triangle: number[][] }>({
  id: 120,
  summary:
    "給一個數字三角形，從頂端走到最底層，每一步只能移動到**下一列相鄰的兩格**之一（索引 `j` 或 `j + 1`）。\n\n求路徑上數字總和的最小值。",
  examples: [
    { input: "triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]", output: "11", note: "2 + 3 + 5 + 1" },
    { input: "triangle = [[-10]]", output: "-10" },
  ],
  constraints: ["1 ≤ triangle.length ≤ 200", "triangle[i].length == i + 1", "-10⁴ ≤ triangle[i][j] ≤ 10⁴"],
  idea:
    "**由下往上**算。定義 `dp[j]` = 從目前這一列的第 `j` 格走到底的最小路徑和；最底層就是數字本身，往上一列時每格只要挑下方兩格中較小的那個：`dp[j] = triangle[i][j] + min(dp[j], dp[j+1])`。一路收斂到頂端只剩 `dp[0]`，而且只需要一維陣列。",
  steps: [
    "`dp` 先複製最底層那一列。",
    "從倒數第二列往上，每一列由左到右：`dp[j] = triangle[i][j] + min(dp[j], dp[j + 1])`。",
    "處理完第 0 列後，`dp[0]` 就是答案。",
  ],
  pitfalls: [
    "貪心（每次往下挑較小的鄰居）會錯，較小的鄰居下面可能藏著很大的數。",
    "由上往下也能做，但要處理左右邊界、最後還要對整列取 `min`；由下往上兩者都省了。",
    "`j` 必須**由左到右**更新：算 `dp[j]` 時要用到的 `dp[j + 1]` 還是下一列的舊值，才不會被覆蓋。",
  ],
  complexity: { time: "O(n²)（n 為列數）", space: "O(n)" },
  code,
  starter: `class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        `,
  presets: [
    { label: "[[2],[3,4],[6,5,7],[4,1,8,3]]", input: { triangle: [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]] }, expected: "11" },
    { label: "[[1],[2,3],[4,-5,6]]（含負數）", input: { triangle: [[1], [2, 3], [4, -5, 6]] }, expected: "-2" },
    { label: "[[-10]]", input: { triangle: [[-10]] }, expected: "-10" },
  ],
  trace({ triangle }) {
    const t = tracer();
    const n = triangle.length;
    // 畫成左對齊的方陣，空位補空字串
    const cells: Cell[][] = triangle.map((row) => [...row, ...new Array<Cell>(n - row.length).fill("")]);
    const rowLabels = triangle.map((_, i) => `i=${i}`);
    const dp = [...triangle[n - 1]];
    // choice[i][j] = 第 i 列第 j 格往下走到哪一格（用來在最後畫出最佳路徑）
    const choice: number[][] = triangle.map((row) => row.map(() => 0));

    const views = (
      triMarks: Record<string, Tone> = {},
      dpMarks: Record<number, Tone> = {},
      ptr?: [number, number],
    ) => [
      V.grid("triangle", cells, { rowLabels, marks: triMarks, pointers: ptr ? { "i,j": ptr } : {} }),
      V.array("dp", dp, { marks: dpMarks, pointers: ptr ? { j: ptr[1] } : {} }),
    ];
    const stale = (width: number) => {
      const m: Record<number, Tone> = {};
      for (let k = width; k < n; k++) m[k] = "muted";
      return m;
    };

    {
      const m: Record<string, Tone> = {};
      for (let j = 0; j < n; j++) m[`${n - 1},${j}`] = "active";
      t.push({
        line: [3, 4],
        note: `\`dp[j]\` 的意思是：**從目前這一列的第 \`j\` 格出發，走到底的最小路徑和**。最底層已經在底了，所以 \`dp\` 直接複製最後一列 \`${py(dp)}\`。`,
        views: views(m),
        vars: { 列: n - 1 },
      });
    }

    for (let i = n - 2; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        const a = dp[j];
        const b = dp[j + 1];
        const v = triangle[i][j];
        choice[i][j] = a <= b ? j : j + 1;
        dp[j] = v + Math.min(a, b);
        t.push({
          line: [5, 6, 7],
          note:
            `第 ${i} 列第 ${j} 格是 \`${v}\`，往下可以走到正下方（剩餘最小和 \`dp[${j}] = ${a}\`）或右下方（\`dp[${j + 1}] = ${b}\`），挑小的走：` +
            `\`dp[${j}] = ${v} + min(${a}, ${b}) = ${dp[j]}\`。`,
          views: views(
            { [`${i},${j}`]: "active", [`${i + 1},${j}`]: "compare", [`${i + 1},${j + 1}`]: "compare" },
            { ...stale(i + 2), [j]: "active", [j + 1]: "compare" },
            [i, j],
          ),
          vars: { i, j, "triangle[i][j]": v, "dp[j]": dp[j] },
        });
      }
      if (i > 0) {
        const m: Record<string, Tone> = {};
        for (let j = 0; j <= i; j++) m[`${i},${j}`] = "visited";
        t.push({
          line: 5,
          note: `第 ${i} 列算完了：\`dp[0..${i}] = ${py(dp.slice(0, i + 1))}\` 現在代表「從第 ${i} 列各格走到底」的最小和。後面灰掉的格子是上一輪留下的舊值，不會再用到。`,
          views: views(m, stale(i + 1)),
          vars: { i },
        });
      }
    }

    const path: Record<string, Tone> = {};
    const picked: number[] = [];
    for (let i = 0, j = 0; i < n; i++) {
      path[`${i},${j}`] = "good";
      picked.push(triangle[i][j]);
      if (i < n - 1) j = choice[i][j];
    }
    t.push({
      line: 8,
      note:
        n === 1
          ? `只有一列，頂端同時也是底部，答案就是 \`dp[0] = ${dp[0]}\`。`
          : `回到頂端，\`dp[0] = ${dp[0]}\` 就是整個三角形的最小路徑和。綠色是對應的路徑：\`${picked.map((x) => (x < 0 ? `(${x})` : x)).join(" + ")} = ${dp[0]}\`。`,
      views: views(path, { ...stale(1), 0: "good" }),
      vars: { "dp[0]": dp[0] },
      result: py(dp[0]),
    });
    return t.frames;
  },
});
