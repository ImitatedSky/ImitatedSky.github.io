import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        # dp[i][j] = 以 matrix[i - 1][j - 1] 為「右下角」的最大正方形邊長
        # 多開一圈 0 當邊界，就不用特別處理第一列和第一行
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        side = 0
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if matrix[i - 1][j - 1] == "1":
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
                    side = max(side, dp[i][j])
        return side * side`;

export default defineProblem<{ matrix: string[][] }>({
  id: 221,
  summary:
    "給一個只包含 `\"0\"` 和 `\"1\"` 的 `m × n` 矩陣，找出**全部由 1 組成的最大正方形**，回傳它的**面積**。",
  summaryEn:
    "Given an `m × n` matrix containing only `\"0\"` and `\"1\"`, find the **largest square made entirely of 1s** and return its **area**.",
  examples: [
    {
      input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]',
      output: "4",
    },
    { input: 'matrix = [["0","1"],["1","0"]]', output: "1" },
    { input: 'matrix = [["0"]]', output: "0" },
  ],
  constraints: ["1 ≤ m, n ≤ 300", "matrix[i][j] 只會是 \"0\" 或 \"1\""],
  constraintsEn: ["1 ≤ m, n ≤ 300", "matrix[i][j] is either \"0\" or \"1\""],
  idea:
    "定義 `dp[i][j]` = 以這一格為**右下角**的最大正方形邊長。一個邊長 `k` 的正方形要成立，它的**上方、左方、左上**三格都必須至少撐得起邊長 `k - 1` 的正方形，三個之中最短的那個就是瓶頸，所以 `dp[i][j] = 1 + min(上, 左, 左上)`；這格是 0 的話就是 0。",
  steps: [
    "開 `(m + 1) × (n + 1)` 的表格，外圍多一圈 0。",
    "逐格掃描：`matrix[i-1][j-1]` 是 `\"1\"` 時，`dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`。",
    "隨時用 `side` 記下出現過的最大邊長。",
    "回傳 `side * side`。",
  ],
  pitfalls: [
    "題目要的是**面積**，別直接回傳邊長。",
    "矩陣裡是**字串** `\"1\"`，不是整數 1，`== 1` 永遠不會成立。",
    "`dp` 比 `matrix` 多一圈，`dp[i][j]` 對應的是 `matrix[i-1][j-1]`。",
  ],
  complexity: { time: "O(m × n)", space: "O(m × n)（可壓到 O(n)）" },
  code,
  starter: `class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        `,
  presets: [
    {
      label: "3×4，邊長長到 3",
      input: {
        matrix: [
          ["0", "1", "1", "1"],
          ["1", "1", "1", "1"],
          ["0", "1", "1", "1"],
        ],
      },
      expected: "9",
    },
    {
      label: "4×5（範例）",
      input: {
        matrix: [
          ["1", "0", "1", "0", "0"],
          ["1", "0", "1", "1", "1"],
          ["1", "1", "1", "1", "1"],
          ["1", "0", "0", "1", "0"],
        ],
      },
      expected: "4",
    },
    { label: '[["0","1"],["1","0"]]', input: { matrix: [["0", "1"], ["1", "0"]] }, expected: "1" },
  ],
  trace({ matrix }) {
    const t = tracer();
    const m = matrix.length;
    const n = matrix[0].length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    // 掃描順序上已經處理過的格子（外圍那圈 0 一開始就算處理過）
    const filled: boolean[][] = dp.map((row, i) => row.map((_, j) => i === 0 || j === 0));
    const show = (): Cell[][] => dp.map((row, i) => row.map((v, j) => (filled[i][j] ? v : "")));
    const border: Record<string, Tone> = {};
    for (let i = 0; i <= m; i++) border[`${i},0`] = "muted";
    for (let j = 0; j <= n; j++) border[`0,${j}`] = "muted";
    const mRows = matrix.map((_, i) => i);
    const mCols = matrix[0].map((_, j) => j);
    const dRows = dp.map((_, i) => i);
    const dCols = dp[0].map((_, j) => j);

    let side = 0;
    let bestI = 0; // 最大正方形的右下角（dp 座標）
    let bestJ = 0;

    /** matrix 上，以 dp 座標 (i, j) 為右下角、邊長 len 的正方形 */
    const square = (i: number, j: number, len: number, tone: Tone) => {
      const mk: Record<string, Tone> = {};
      for (let r = i - len; r < i; r++) for (let c = j - len; c < j; c++) mk[`${r},${c}`] = tone;
      return mk;
    };
    const views = (
      matMarks: Record<string, Tone> = {},
      dpMarks: Record<string, Tone> = {},
      ptr?: [number, number],
    ) => [
      V.grid("matrix", matrix, {
        rowLabels: mRows,
        colLabels: mCols,
        marks: matMarks,
        pointers: ptr ? { "i-1,j-1": [ptr[0] - 1, ptr[1] - 1] } : {},
      }),
      V.grid("dp", show(), {
        rowLabels: dRows,
        colLabels: dCols,
        marks: { ...border, ...dpMarks },
        pointers: ptr ? { "i,j": ptr } : {},
      }),
    ];

    t.push({
      line: [3, 4, 5, 6, 7],
      note: `\`dp[i][j]\` 的意思是：**以 \`matrix[i-1][j-1]\` 為右下角，最大能畫出邊長多少的全 1 正方形**。\`dp\` 比 \`matrix\` 多一圈 0（灰色），這樣第一列、第一行就不用特別處理。\`side\` 記錄目前看過的最大邊長。`,
      views: views(),
      vars: { m, n, side },
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const key = `${i},${j}`;
        const mKey = `${i - 1},${j - 1}`;
        filled[i][j] = true;
        if (matrix[i - 1][j - 1] !== "1") {
          t.push({
            line: [9, 10],
            note: `\`matrix[${i - 1}][${j - 1}]\` 是 0，不可能當任何正方形的右下角，\`dp[${i}][${j}]\` 維持 0。`,
            views: views({ [mKey]: "bad" }, { [key]: "active" }, [i, j]),
            vars: { i, j, "dp[i][j]": 0, side },
          });
          continue;
        }
        const up = dp[i - 1][j];
        const left = dp[i][j - 1];
        const diag = dp[i - 1][j - 1];
        const v = 1 + Math.min(up, left, diag);
        dp[i][j] = v;
        const grew = v > side;
        if (grew) {
          side = v;
          bestI = i;
          bestJ = j;
        }
        const why =
          v === 1
            ? "鄰居裡有 0，擴不出去，只能是自己這一格。"
            : `三邊都撐得起邊長 ${v - 1}，加上這格拼成邊長 ${v}。`;
        t.push({
          line: [10, 11, 12],
          note:
            `\`matrix[${i - 1}][${j - 1}]\` 是 1，上、左、左上三格最小的是瓶頸：` +
            `\`dp[${i}][${j}] = 1 + min(${up}, ${left}, ${diag}) = ${v}\`。${why}` +
            (grew ? `刷新 \`side = ${v}\`。` : ""),
          views: views(
            { ...square(i, j, v, grew ? "good" : "compare"), [mKey]: "active" },
            { [`${i - 1},${j}`]: "compare", [`${i},${j - 1}`]: "compare", [`${i - 1},${j - 1}`]: "compare", [key]: "active" },
            [i, j],
          ),
          vars: { i, j, 上: up, 左: left, 左上: diag, "dp[i][j]": v, side },
        });
      }
    }

    t.push({
      line: 13,
      note:
        side > 0
          ? `整張表填完，最大邊長是 \`side = ${side}\`（\`dp[${bestI}][${bestJ}]\`），對應 \`matrix\` 上綠色的正方形。題目要面積，回傳 \`${side} × ${side} = ${side * side}\`。`
          : "矩陣裡一個 1 都沒有，`side = 0`，面積是 0。",
      views: views(side > 0 ? square(bestI, bestJ, side, "good") : {}, side > 0 ? { [`${bestI},${bestJ}`]: "good" } : {}),
      vars: { m, n, side },
      result: py(side * side),
    });
    return t.frames;
  },
});
