import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        m, n = len(board), len(board[0])

        def dfs(r, c):
            if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != "O":
                return
            board[r][c] = "#"  # 連得到邊界，安全
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        # 1. 從四條邊上的 O 出發，標記所有「逃得掉」的 O
        for r in range(m):
            dfs(r, 0)
            dfs(r, n - 1)
        for c in range(n):
            dfs(0, c)
            dfs(m - 1, c)

        # 2. 還是 O 的被包圍 → 翻成 X；# 還原成 O
        for r in range(m):
            for c in range(n):
                if board[r][c] == "O":
                    board[r][c] = "X"
                elif board[r][c] == "#":
                    board[r][c] = "O"`;

const DIRS: [number, number, string][] = [
  [1, 0, "下"],
  [-1, 0, "上"],
  [0, 1, "右"],
  [0, -1, "左"],
];

export default defineProblem<{ board: string[][] }>({
  id: 130,
  summary:
    "給一張由 `\"X\"` 和 `\"O\"` 組成的棋盤。一塊上下左右相連的 `O` 區域，如果**完全被 `X` 包住**（沒有任何一格碰到棋盤邊界），就要把整塊翻成 `X`。\n\n直接修改 `board`，不需要回傳值。",
  examples: [
    {
      input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]',
      output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]',
      note: "最下面那個 O 在邊界上，不會被翻掉",
    },
    { input: 'board = [["X"]]', output: '[["X"]]' },
  ],
  constraints: ["1 ≤ m, n ≤ 200", "board[i][j] 只會是 \"X\" 或 \"O\""],
  idea:
    "直接判斷「這塊 `O` 有沒有被包圍」很麻煩，**反過來想**：不會被翻的 `O`，一定連得到邊界。所以從四條邊上的 `O` 出發做 DFS，把碰得到的都先標成 `#`；剩下還是 `O` 的，就是被包圍的。",
  steps: [
    "走過四條邊，對每一格呼叫 `dfs`：是 `O` 就改成 `#`，並往四個方向擴散。",
    "此時棋盤上有三種格子：`X`、`#`（安全）、`O`（被包圍）。",
    "最後整張掃一遍：`O` → `X`，`#` → `O`。",
  ],
  pitfalls: [
    "不要從棋盤內部的 `O` 開始找「有沒有碰到邊界」——要到整塊走完才知道結果，還得回頭再改一次，寫起來又慢又容易錯。",
    "最後一步的兩個判斷要用 `if / elif`：先把 `O` 翻成 `X`，再把 `#` 還原成 `O`，順序或寫法錯了會把剛還原的 `O` 又翻掉。",
  ],
  complexity: { time: "O(m·n)", space: "O(m·n)（最壞情況的遞迴深度）" },
  code,
  starter: `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        `,
  presets: [
    {
      label: "5×5，一塊被包圍、兩塊靠邊",
      input: {
        board: [
          ["X", "X", "X", "X", "X"],
          ["X", "O", "O", "X", "X"],
          ["X", "X", "O", "X", "O"],
          ["X", "O", "X", "O", "O"],
          ["X", "O", "X", "X", "X"],
        ],
      },
      expected:
        '[["X", "X", "X", "X", "X"], ["X", "X", "X", "X", "X"], ["X", "X", "X", "X", "O"], ["X", "O", "X", "O", "O"], ["X", "O", "X", "X", "X"]]',
    },
    {
      label: "經典 4×4",
      input: {
        board: [
          ["X", "X", "X", "X"],
          ["X", "O", "O", "X"],
          ["X", "X", "O", "X"],
          ["X", "O", "X", "X"],
        ],
      },
      expected: '[["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "O", "X", "X"]]',
    },
    {
      label: "四個角 + 正中央",
      input: {
        board: [
          ["O", "X", "O"],
          ["X", "O", "X"],
          ["O", "X", "O"],
        ],
      },
      expected: '[["O", "X", "O"], ["X", "X", "X"], ["O", "X", "O"]]',
    },
  ],
  trace({ board: board0 }) {
    const t = tracer();
    const board = board0.map((row) => [...row]);
    const m = board.length;
    const n = board[0].length;
    const stack: string[] = [];
    const captured = new Set<string>();
    const restored = new Set<string>();

    const marks = (extra: Record<string, Tone> = {}) => {
      const mk: Record<string, Tone> = {};
      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
          const k = `${r},${c}`;
          if (captured.has(k)) mk[k] = "bad";
          else if (restored.has(k) || board[r][c] === "#") mk[k] = "good";
          else if (board[r][c] === "X") mk[k] = "muted";
        }
      return { ...mk, ...extra };
    };
    const views = (at?: [number, number], extra: Record<string, Tone> = {}) => [
      V.grid("board", board, { marks: marks(extra), pointers: at ? { "r,c": at } : {} }),
      V.stack("遞迴呼叫堆疊 dfs(r, c)", stack),
    ];

    t.push({
      line: 3,
      note: `棋盤是 ${m} × ${n}。想法是反過來做：不去找「被包圍的 \`O\`」，而是先找出**連得到邊界、一定安全**的 \`O\`。`,
      views: views(),
      vars: { m, n },
    });

    let safe = 0;
    const dfs = (r: number, c: number, from: string) => {
      if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== "O") return;
      board[r][c] = "#";
      safe++;
      stack.push(`(${r}, ${c})`);
      t.push({
        line: [8, 9, 10, 11, 12],
        note: from
          ? `${from} \`(${r}, ${c})\` 也是 \`O\`：它經由剛才那格連得到邊界，所以同樣安全，標成 \`#\`。`
          : `邊界上的 \`(${r}, ${c})\` 是 \`O\`：貼著邊界不可能被四面包住。標成 \`#\`（安全），再往四個方向找跟它相連的 \`O\`。`,
        views: views([r, c], { [`${r},${c}`]: "active" }),
        vars: { r, c, 安全格數: safe },
      });
      for (const [dr, dc, name] of DIRS) dfs(r + dr, c + dc, `從 \`(${r}, ${c})\` 往${name}走，`);
      stack.pop();
    };

    t.push({
      line: [15, 16, 17],
      note: "第一階段：先走**最左欄和最右欄**，每一格都丟給 `dfs`。不是 `O` 的格子（`X` 或已標過的 `#`）會在第一行判斷就直接返回。",
      views: views(),
      vars: { 安全格數: safe },
    });
    for (let r = 0; r < m; r++) {
      dfs(r, 0, "");
      dfs(r, n - 1, "");
    }
    t.push({
      line: [18, 19, 20],
      note: "接著走**最上列和最下列**，同樣把邊上的 `O` 連同它們相連的區域標成 `#`。",
      views: views(),
      vars: { 安全格數: safe },
    });
    for (let c = 0; c < n; c++) {
      dfs(0, c, "");
      dfs(m - 1, c, "");
    }

    const left: Record<string, Tone> = {};
    let leftCount = 0;
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++)
        if (board[r][c] === "O") {
          left[`${r},${c}`] = "compare";
          leftCount++;
        }
    t.push({
      line: 23,
      note:
        `四條邊都走完了，共 ${safe} 格被標成 \`#\`。` +
        (leftCount
          ? `還維持 \`O\` 的 ${leftCount} 格（標示出來的那幾格）從邊界怎麼走都到不了 → 它們就是**被包圍**的。`
          : "棋盤上已經沒有 `O` 了，代表沒有任何區域被包圍。"),
      views: views(undefined, left),
      vars: { 安全格數: safe, 被包圍格數: leftCount },
    });

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const k = `${r},${c}`;
        if (board[r][c] === "O") {
          board[r][c] = "X";
          captured.add(k);
          t.push({
            line: [25, 26],
            note: `\`(${r}, ${c})\` 還是 \`O\`，表示第一階段沒被碰到 → 被包圍，翻成 \`X\`。`,
            views: views([r, c]),
            vars: { r, c },
          });
        } else if (board[r][c] === "#") {
          board[r][c] = "O";
          restored.add(k);
          t.push({
            line: [27, 28],
            note: `\`(${r}, ${c})\` 是 \`#\`，是連得到邊界的安全格 → 還原成 \`O\`。`,
            views: views([r, c]),
            vars: { r, c },
          });
        }
      }
    }

    t.push({
      line: [23, 24],
      note: `整張掃完：被包圍的 ${captured.size} 格翻成了 \`X\`，連得到邊界的 ${restored.size} 格保留為 \`O\`。\`board\` 已原地修改完成。`,
      views: views(),
      result: py(board),
    });
    return t.frames;
  },
});
