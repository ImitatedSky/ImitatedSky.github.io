import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        # dp[i][j] = 從左上角走到 (i, j) 的路徑數
        dp = [[0] * n for _ in range(m)]
        for i in range(m):
            for j in range(n):
                if obstacleGrid[i][j] == 1:
                    dp[i][j] = 0  # 障礙物：到不了
                elif i == 0 and j == 0:
                    dp[i][j] = 1  # 起點
                else:
                    up = dp[i - 1][j] if i > 0 else 0
                    left = dp[i][j - 1] if j > 0 else 0
                    dp[i][j] = up + left
        return dp[m - 1][n - 1]`;

export default defineProblem<{ obstacleGrid: number[][] }>({
  id: 63,
  summary:
    "機器人從 `m × n` 方格的**左上角**出發，每一步只能**往右或往下**，要走到**右下角**。\n\n方格中 `1` 代表障礙物、`0` 代表空地，障礙物不能踩。問一共有幾條不同的路徑。",
  examples: [
    { input: "obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]", output: "2", note: "正中間有障礙，只能繞上面或繞下面" },
    { input: "obstacleGrid = [[0,1],[0,0]]", output: "1" },
  ],
  constraints: ["1 ≤ m, n ≤ 100", "obstacleGrid[i][j] 只會是 0 或 1"],
  idea:
    "定義 `dp[i][j]` = 走到 `(i, j)` 的路徑數。到達一格的前一步只可能在**上面**或**左邊**，所以路徑數是兩者相加：`dp[i][j] = dp[i-1][j] + dp[i][j-1]`；遇到障礙物這格直接是 0，它自然就不會貢獻給後面的格子。",
  steps: [
    "障礙物格：`dp[i][j] = 0`。",
    "起點（且不是障礙物）：`dp[0][0] = 1`。",
    "其餘：上面的路徑數 + 左邊的路徑數，超出邊界的一律當 0。",
    "答案是 `dp[m-1][n-1]`。",
  ],
  pitfalls: [
    "**起點或終點本身就是障礙物**時答案是 0，先判斷障礙物再判斷起點就能自然處理。",
    "第一列／第一行不能無腦全填 1：一旦遇到障礙物，它後面的格子全部到不了。",
  ],
  complexity: { time: "O(m × n)", space: "O(m × n)（可壓到 O(n)）" },
  code,
  starter: `class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        `,
  presets: [
    { label: "3×3，中間有障礙", input: { obstacleGrid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] }, expected: "2" },
    {
      label: "3×4，第一列被擋住",
      input: { obstacleGrid: [[0, 0, 1, 0], [0, 0, 0, 0], [1, 0, 0, 0]] },
      expected: "6",
    },
    { label: "[[0,1],[0,0]]", input: { obstacleGrid: [[0, 1], [0, 0]] }, expected: "1" },
  ],
  trace({ obstacleGrid }) {
    const t = tracer();
    const m = obstacleGrid.length;
    const n = obstacleGrid[0].length;
    const dp: number[][] = obstacleGrid.map((row) => row.map(() => 0));
    const filled: boolean[][] = obstacleGrid.map((row) => row.map(() => false));
    const rowLabels = obstacleGrid.map((_, i) => i);
    const colLabels = obstacleGrid[0].map((_, j) => j);
    const walls: Record<string, Tone> = {};
    obstacleGrid.forEach((row, i) => row.forEach((v, j) => v === 1 && (walls[`${i},${j}`] = "bad")));
    const show = (): Cell[][] => dp.map((row, i) => row.map((v, j) => (filled[i][j] ? v : "")));
    const views = (
      gridMarks: Record<string, Tone> = {},
      dpMarks: Record<string, Tone> = {},
      ptr?: [number, number],
    ) => [
      V.grid("obstacleGrid", obstacleGrid, {
        rowLabels,
        colLabels,
        marks: { ...walls, ...gridMarks },
        pointers: ptr ? { "i,j": ptr } : {},
      }),
      V.grid("dp", show(), { rowLabels, colLabels, marks: dpMarks, pointers: ptr ? { "i,j": ptr } : {} }),
    ];
    // dp 表上，已經填好的障礙物格維持紅色，方便對照
    const dpWalls = () => {
      const w: Record<string, Tone> = {};
      for (const k of Object.keys(walls)) {
        const [i, j] = k.split(",").map(Number);
        if (filled[i][j]) w[k] = "bad";
      }
      return w;
    };

    t.push({
      line: [3, 4, 5],
      note: `\`dp[i][j]\` 的意思是：**從左上角走到 \`(i, j)\` 一共有幾條路**。紅色格子是障礙物。答案會落在右下角 \`dp[${m - 1}][${n - 1}]\`。`,
      views: views(),
      vars: { m, n },
    });

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const key = `${i},${j}`;
        let line: number[];
        let note: string;
        const deps: Record<string, Tone> = {};
        const vars: Record<string, Cell> = { i, j };
        if (obstacleGrid[i][j] === 1) {
          dp[i][j] = 0;
          line = [8, 9];
          note = `\`(${i}, ${j})\` 是障礙物，根本站不上去，\`dp[${i}][${j}] = 0\`。這個 0 之後會讓經過這裡的路徑自動不被算進去。`;
        } else if (i === 0 && j === 0) {
          dp[i][j] = 1;
          line = [10, 11];
          note = "起點 `(0, 0)`：站在原地就是唯一的一條路，`dp[0][0] = 1`。";
        } else {
          const up = i > 0 ? dp[i - 1][j] : 0;
          const left = j > 0 ? dp[i][j - 1] : 0;
          dp[i][j] = up + left;
          if (i > 0) deps[`${i - 1},${j}`] = "compare";
          if (j > 0) deps[`${i},${j - 1}`] = "compare";
          line = [12, 13, 14, 15];
          const upTxt = i > 0 ? `上面 \`dp[${i - 1}][${j}] = ${up}\`` : "上面超出邊界算 0";
          const leftTxt = j > 0 ? `左邊 \`dp[${i}][${j - 1}] = ${left}\`` : "左邊超出邊界算 0";
          note =
            `要到 \`(${i}, ${j})\`，前一步不是在上面就是在左邊，兩邊的路徑數加起來：${upTxt}，${leftTxt}，` +
            `\`dp[${i}][${j}] = ${up} + ${left} = ${dp[i][j]}\`。` +
            (dp[i][j] === 0 ? "兩邊都過不來，這格到不了。" : "");
          vars.up = up;
          vars.left = left;
        }
        filled[i][j] = true;
        vars["dp[i][j]"] = dp[i][j];
        t.push({
          line,
          note,
          views: views({ [key]: "active" }, { ...dpWalls(), ...deps, [key]: "active" }, [i, j]),
          vars,
        });
      }
    }

    const ans = dp[m - 1][n - 1];
    const end = `${m - 1},${n - 1}`;
    t.push({
      line: 16,
      note:
        ans > 0
          ? `整張表填完，右下角 \`dp[${m - 1}][${n - 1}] = ${ans}\`：避開障礙物後一共有 ${ans} 條路可以走到終點。`
          : `右下角 \`dp[${m - 1}][${n - 1}] = 0\`：終點被障礙物隔開了，一條路都沒有。`,
      views: views({ [end]: ans > 0 ? "good" : "bad" }, { ...dpWalls(), [end]: ans > 0 ? "good" : "bad" }),
      vars: { m, n },
      result: py(ans),
    });
    return t.frames;
  },
});
