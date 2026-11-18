import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])

        def dfs(r, c):
            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != "1":
                return
            grid[r][c] = "0"  # 沉掉，之後不會再被算到
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == "1":
                    count += 1
                    dfs(r, c)
        return count`;

/** 每座島用不同色調，方便看出「哪幾格屬於同一座島」 */
const ISLAND_TONES: Tone[] = ["good", "alt", "compare", "visited"];

const DIRS: [number, number, string][] = [
  [1, 0, "下"],
  [-1, 0, "上"],
  [0, 1, "右"],
  [0, -1, "左"],
];

export default defineProblem<{ grid: string[][] }>({
  id: 200,
  summary:
    "給一張由 `\"1\"`（陸地）和 `\"0\"`（水）組成的二維地圖，算出上面有**幾座島**。\n\n上下左右相連的陸地算同一座島，斜對角不算相連；地圖外面全部當作水。",
  examples: [
    {
      input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
      output: "3",
    },
    { input: 'grid = [["1","0","1"],["0","1","0"],["1","0","1"]]', output: "5", note: "斜對角不相連，每格各自是一座島" },
  ],
  constraints: ["1 ≤ m, n ≤ 300", "grid[i][j] 只會是 \"0\" 或 \"1\""],
  idea:
    "由左上掃到右下，**每碰到一格還沒處理過的陸地，就代表發現一座新島**。這時立刻用 DFS 把整座島「沉掉」（改成 `0`），同一座島之後就不會再被重複計算。",
  steps: [
    "逐格掃描整張地圖。",
    "遇到 `\"1\"`：島數 `count += 1`，並從這格開始 DFS。",
    "DFS 把目前這格改成 `\"0\"`，再往上下左右四個方向遞迴；出界或遇到水就直接返回。",
    "掃完整張地圖，`count` 就是答案。",
  ],
  pitfalls: [
    "要**一進到格子就先沉掉**再往外遞迴，否則相鄰的兩格會互相呼叫、無限遞迴。",
    "邊界判斷要寫在讀 `grid[r][c]` 之前，不然會索引出界（或在 Python 被負索引繞回去）。",
    "不想改到輸入的話，可以另外開一個 `visited` 集合，概念完全相同。",
  ],
  complexity: { time: "O(m·n)", space: "O(m·n)（最壞情況的遞迴深度）" },
  code,
  starter: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        `,
  presets: [
    {
      label: "4×5，三座島",
      input: {
        grid: [
          ["1", "1", "0", "0", "0"],
          ["1", "1", "0", "0", "0"],
          ["0", "0", "1", "0", "0"],
          ["0", "0", "0", "1", "1"],
        ],
      },
      expected: "3",
    },
    {
      label: "彎曲的大島 + 角落的小島",
      input: {
        grid: [
          ["1", "1", "1", "0"],
          ["0", "0", "1", "0"],
          ["1", "0", "1", "1"],
          ["1", "0", "0", "1"],
        ],
      },
      expected: "2",
    },
    {
      label: "斜對角不相連",
      input: {
        grid: [
          ["1", "0", "1"],
          ["0", "1", "0"],
          ["1", "0", "1"],
        ],
      },
      expected: "5",
    },
  ],
  trace({ grid: grid0 }) {
    const t = tracer();
    const grid = grid0.map((row) => [...row]);
    const m = grid.length;
    const n = grid[0].length;
    // owner[r][c] = 這格屬於第幾座島（-1 = 還沒被沉掉）
    const owner = grid.map((row) => row.map(() => -1));
    const stack: string[] = [];
    let count = 0;

    const marks = (extra: Record<string, Tone> = {}) => {
      const mk: Record<string, Tone> = {};
      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
          if (grid0[r][c] !== "1") mk[`${r},${c}`] = "muted";
          else if (owner[r][c] >= 0) mk[`${r},${c}`] = ISLAND_TONES[owner[r][c] % ISLAND_TONES.length];
        }
      return { ...mk, ...extra };
    };
    const views = (at?: [number, number], extra: Record<string, Tone> = {}) => [
      V.grid("grid", grid, { marks: marks(extra), pointers: at ? { "r,c": at } : {} }),
      V.stack("遞迴呼叫堆疊 dfs(r, c)", stack),
    ];

    t.push({
      line: [3, 14],
      note: `地圖是 ${m} × ${n}。變淡的格子是水，其餘的 \`1\` 是還沒處理的陸地。準備逐格掃描，\`count\` 從 0 開始。`,
      views: views(),
      vars: { m, n, count },
    });

    let size = 0;
    const dfs = (r: number, c: number, from: string) => {
      if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== "1") return;
      grid[r][c] = "0";
      owner[r][c] = count - 1;
      size++;
      stack.push(`(${r}, ${c})`);
      t.push({
        line: [8, 9, 10, 11, 12],
        note: from
          ? `${from} \`(${r}, ${c})\` 也是陸地，和起點相連 → 屬於同一座島。先把它沉成 \`0\`，再繼續往四個方向找。`
          : `進入 \`dfs(${r}, ${c})\`：**一進來就先把這格沉成 \`0\`**，這樣鄰居遞迴回頭時不會再走進來。接著往下、上、右、左探索。`,
        views: views([r, c], { [`${r},${c}`]: "active" }),
        vars: { count, r, c, 這座島的格數: size },
      });
      for (const [dr, dc, name] of DIRS) dfs(r + dr, c + dc, `從 \`(${r}, ${c})\` 往${name}走，`);
      stack.pop();
    };

    let skipped = 0;
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] !== "1") {
          skipped++;
          continue;
        }
        count++;
        t.push({
          line: [15, 16, 17, 18],
          note:
            (skipped ? `跳過 ${skipped} 格 \`0\`（水，或已經沉掉的陸地）。` : "") +
            `掃到 \`(${r}, ${c})\` 是 \`1\`：這是一塊**還沒被算過**的陸地，所以發現第 ${count} 座島，\`count = ${count}\`。`,
          views: views([r, c], { [`${r},${c}`]: "compare" }),
          vars: { count, r, c },
        });
        skipped = 0;
        size = 0;
        dfs(r, c, "");
        t.push({
          line: 19,
          note: `DFS 全部返回：第 ${count} 座島共 ${size} 格，已經整座沉掉。之後再掃到這些格子都是 \`0\`，不會重複計數。`,
          views: views([r, c]),
          vars: { count, r, c, 這座島的格數: size },
        });
      }
    }

    t.push({
      line: 20,
      note:
        (skipped ? `剩下的 ${skipped} 格都是 \`0\`，直接跳過。` : "") +
        `整張地圖掃完，一共啟動了 ${count} 次 DFS，也就是 ${count} 座島。`,
      views: views(),
      vars: { count },
      result: py(count),
    });
    return t.frames;
  },
});
