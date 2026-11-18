import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        # dp[i][j] = 從左上角走到 (i, j) 的最小路徑和
        dp = [[0] * n for _ in range(m)]
        for i in range(m):
            for j in range(n):
                if i == 0 and j == 0:
                    dp[i][j] = grid[0][0]
                elif i == 0:
                    dp[i][j] = dp[i][j - 1] + grid[i][j]  # 第一列只能從左邊來
                elif j == 0:
                    dp[i][j] = dp[i - 1][j] + grid[i][j]  # 第一行只能從上面來
                else:
                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
        return dp[m - 1][n - 1]`;

export default defineProblem<{ grid: number[][] }>({
  id: 64,
  summary:
    "給一個 `m × n` 的非負整數方格，從**左上角**走到**右下角**，每一步只能**往右或往下**。\n\n求路徑上所有數字總和的最小值。",
  examples: [
    { input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", output: "7", note: "1 → 3 → 1 → 1 → 1" },
    { input: "grid = [[1,2,3],[4,5,6]]", output: "12" },
  ],
  constraints: ["1 ≤ m, n ≤ 200", "0 ≤ grid[i][j] ≤ 200"],
  idea:
    "定義 `dp[i][j]` = 從左上角走到 `(i, j)` 的最小路徑和。因為只能往右或往下，要到 `(i, j)` 的**前一步只可能在上面或左邊**，挑比較小的那個再加上自己：`dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]`。",
  steps: [
    "起點 `dp[0][0] = grid[0][0]`。",
    "第一列只能從左邊一路走過來、第一行只能從上面一路走下來，各自累加。",
    "其餘格子取「上」和「左」的較小值，加上 `grid[i][j]`。",
    "答案是右下角 `dp[m-1][n-1]`。",
  ],
  pitfalls: [
    "邊界要分開處理，否則 `dp[-1]` 在 Python 會默默取到最後一列而不是報錯。",
    "可以直接改寫 `grid` 或只留一列來把空間壓到 O(n)，但先寫出二維版本最不容易錯。",
  ],
  complexity: { time: "O(m × n)", space: "O(m × n)（可壓到 O(n)）" },
  code,
  starter: `class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        `,
  presets: [
    { label: "[[1,3,1],[1,5,1],[4,2,1]]", input: { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] }, expected: "7" },
    { label: "[[1,2,3],[4,5,6]]", input: { grid: [[1, 2, 3], [4, 5, 6]] }, expected: "12" },
    { label: "[[1,2,5]]（只有一列）", input: { grid: [[1, 2, 5]] }, expected: "8" },
  ],
  trace({ grid }) {
    const t = tracer();
    const m = grid.length;
    const n = grid[0].length;
    const dp: number[][] = grid.map((row) => row.map(() => 0));
    const filled: boolean[][] = grid.map((row) => row.map(() => false));
    const rowLabels = grid.map((_, i) => i);
    const colLabels = grid[0].map((_, j) => j);
    const show = (): Cell[][] => dp.map((row, i) => row.map((v, j) => (filled[i][j] ? v : "")));
    const views = (
      gridMarks: Record<string, Tone> = {},
      dpMarks: Record<string, Tone> = {},
      ptr?: [number, number],
    ) => [
      V.grid("grid", grid, { rowLabels, colLabels, marks: gridMarks, pointers: ptr ? { "i,j": ptr } : {} }),
      V.grid("dp", show(), { rowLabels, colLabels, marks: dpMarks, pointers: ptr ? { "i,j": ptr } : {} }),
    ];

    t.push({
      line: [3, 4, 5],
      note: `\`dp[i][j]\` 的意思是：**從左上角走到 \`(i, j)\` 的最小路徑和**。開一張和 \`grid\` 一樣大的 ${m} × ${n} 表格，答案會落在右下角 \`dp[${m - 1}][${n - 1}]\`。`,
      views: views(),
      vars: { m, n },
    });

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const g = grid[i][j];
        const key = `${i},${j}`;
        let line: number[];
        let note: string;
        const deps: Record<string, Tone> = {};
        if (i === 0 && j === 0) {
          dp[i][j] = g;
          line = [8, 9];
          note = `起點 \`(0, 0)\`：還沒走任何一步，路徑和就是自己，\`dp[0][0] = ${g}\`。`;
        } else if (i === 0) {
          dp[i][j] = dp[i][j - 1] + g;
          deps[`${i},${j - 1}`] = "compare";
          line = [10, 11];
          note = `\`(0, ${j})\` 在第一列，上面沒有格子，只能從左邊走過來：\`dp[0][${j}] = dp[0][${j - 1}] + ${g} = ${dp[i][j - 1]} + ${g} = ${dp[i][j]}\`。`;
        } else if (j === 0) {
          dp[i][j] = dp[i - 1][j] + g;
          deps[`${i - 1},${j}`] = "compare";
          line = [12, 13];
          note = `\`(${i}, 0)\` 在第一行，左邊沒有格子，只能從上面走下來：\`dp[${i}][0] = dp[${i - 1}][0] + ${g} = ${dp[i - 1][j]} + ${g} = ${dp[i][j]}\`。`;
        } else {
          const up = dp[i - 1][j];
          const left = dp[i][j - 1];
          dp[i][j] = Math.min(up, left) + g;
          deps[`${i - 1},${j}`] = "compare";
          deps[`${i},${j - 1}`] = "compare";
          line = [14, 15];
          const from = up < left ? "從上面來比較省" : left < up ? "從左邊來比較省" : "兩邊一樣";
          note = `\`(${i}, ${j})\` 可以從上面（\`dp[${i - 1}][${j}] = ${up}\`）或左邊（\`dp[${i}][${j - 1}] = ${left}\`）過來，${from}：\`dp[${i}][${j}] = min(${up}, ${left}) + ${g} = ${dp[i][j]}\`。`;
        }
        filled[i][j] = true;
        t.push({
          line,
          note,
          views: views({ [key]: "active" }, { ...deps, [key]: "active" }, [i, j]),
          vars: { i, j, "grid[i][j]": g, "dp[i][j]": dp[i][j] },
        });
      }
    }

    // 從右下角回溯出最佳路徑
    const path: Record<string, Tone> = {};
    const picked: number[] = [];
    for (let i = m - 1, j = n - 1; ; ) {
      path[`${i},${j}`] = "good";
      picked.unshift(grid[i][j]);
      if (i === 0 && j === 0) break;
      if (i === 0) j--;
      else if (j === 0) i--;
      else if (dp[i - 1][j] <= dp[i][j - 1]) i--;
      else j--;
    }
    t.push({
      line: 16,
      note: `整張表填完，右下角 \`dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]}\` 就是答案。從終點往回看每一格是從哪邊來的，可以還原出綠色這條路徑：\`${picked.join(" + ")} = ${dp[m - 1][n - 1]}\`。`,
      views: views(path, path),
      vars: { m, n },
      result: py(dp[m - 1][n - 1]),
    });
    return t.frames;
  },
});
