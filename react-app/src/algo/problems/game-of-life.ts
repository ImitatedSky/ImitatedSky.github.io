import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        m, n = len(board), len(board[0])
        for r in range(m):
            for c in range(n):
                live = -(board[r][c] & 1)  # 九宮格會算到自己，先扣掉
                for i in range(max(0, r - 1), min(m, r + 2)):
                    for j in range(max(0, c - 1), min(n, c + 2)):
                        live += board[i][j] & 1  # 最低位元 = 這一代
                if live == 3 or (live == 2 and board[r][c] & 1):
                    board[r][c] |= 2  # 第二個位元 = 下一代
        for r in range(m):
            for c in range(n):
                board[r][c] >>= 1`;

const ENCODING: [Cell, Cell][] = [
  [0, "死 → 死"],
  [1, "活 → 死"],
  [2, "死 → 活"],
  [3, "活 → 活"],
];

export default defineProblem<{ board: number[][] }>({
  id: 289,
  summary:
    "康威的**生命遊戲**：盤面上每一格不是活的（1）就是死的（0），下一代的狀態由周圍 8 個鄰居決定 —— 活細胞的活鄰居少於 2 個或多於 3 個就會死，剛好 2 或 3 個則存活；死細胞的活鄰居剛好 3 個就會復活。\n\n所有格子是**同時**更新的。請原地把盤面改成下一代。",
  summaryEn:
    "Conway's **Game of Life**: every cell on the board is either alive (1) or dead (0), and its next state depends on its 8 neighbors - a live cell with fewer than 2 or more than 3 live neighbors dies, while one with exactly 2 or 3 survives; a dead cell with exactly 3 live neighbors comes back to life.\n\nAll cells update **at the same time**. Change the board in-place to the next generation.",
  examples: [
    { input: "board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]", output: "[[0,0,0],[1,0,1],[0,1,1],[0,1,0]]" },
    { input: "board = [[1,1],[1,0]]", output: "[[1,1],[1,1]]" },
  ],
  constraints: ["1 ≤ m, n ≤ 25", "每格是 0 或 1"],
  constraintsEn: ["1 ≤ m, n ≤ 25", "Each cell is 0 or 1"],
  idea:
    "難處在「同時更新」：改了一格，後面的鄰居還需要它**原本**的狀態。每格其實只用到 1 個位元，所以把**下一代的狀態塞進第二個位元**：最低位元永遠是這一代，`& 1` 就能讀回原值。全部算完後整體右移一位，下一代就出現了。",
  steps: [
    "走訪每一格，數周圍 8 格的 `board[i][j] & 1`（只看最低位元 = 這一代的狀態）。",
    "四條規則可以濃縮成一句：下一代是活的 ⇔ 活鄰居 == 3，或（活鄰居 == 2 而且自己現在活著）。",
    "若下一代是活的，`board[r][c] |= 2`，把第二個位元設成 1。",
    "最後每一格 `>>= 1`，丟掉舊狀態、留下新狀態。",
  ],
  pitfalls: [
    "數鄰居一定要用 `& 1`。前面的格子可能已經變成 2 或 3，直接相加會算錯。",
    "九宮格範圍包含自己，記得扣掉；邊界用 `max` / `min` 夾住，才不會超出盤面。",
  ],
  complexity: { time: "O(m·n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        """原地修改 board，不需要回傳"""
        `,
  presets: [
    {
      label: "滑翔機 4×3",
      input: { board: [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]] },
      expected: "[[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]",
    },
    {
      label: "閃爍器 3×3",
      input: { board: [[0, 1, 0], [0, 1, 0], [0, 1, 0]] },
      expected: "[[0, 0, 0], [1, 1, 1], [0, 0, 0]]",
    },
    { label: "2×2", input: { board: [[1, 1], [1, 0]] }, expected: "[[1, 1], [1, 1]]" },
  ],
  trace({ board: input }) {
    const t = tracer();
    const board = input.map((row) => [...row]);
    const m = board.length;
    const n = board[0].length;

    // 底色：這一代活著的格子（最低位元是 1）
    const alive = (tone: Tone) => {
      const marks: Record<string, Tone> = {};
      board.forEach((row, r) => row.forEach((v, c) => v & 1 && (marks[`${r},${c}`] = tone)));
      return marks;
    };
    const legend = (v?: number) =>
      V.map("編碼：值 → 這一代 → 下一代", ENCODING, v === undefined ? {} : { marks: { [String(v)]: "active" } });

    t.push({
      line: 3,
      note: "所有格子要**同時**更新，但我們只能一格一格改。做法：最低位元保留「這一代」，把「下一代」寫進第二個位元，兩個狀態就能共存在同一格裡。",
      views: [V.grid("board", board, { marks: alive("visited") }), legend()],
      vars: { m, n },
    });

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const self = board[r][c] & 1;
        let live = -self;
        const marks = alive("visited");
        let encodedNeighbor = false;
        for (let i = Math.max(0, r - 1); i < Math.min(m, r + 2); i++) {
          for (let j = Math.max(0, c - 1); j < Math.min(n, c + 2); j++) {
            live += board[i][j] & 1;
            if (i === r && j === c) continue;
            if (board[i][j] & 1) marks[`${i},${j}`] = "compare";
            if (board[i][j] >= 2) encodedNeighbor = true;
          }
        }
        marks[`${r},${c}`] = "active";

        const next = live === 3 || (live === 2 && self === 1);
        let rule: string;
        if (self && live < 2) rule = `活細胞只有 ${live} 個活鄰居，太孤單 → 下一代死亡，第二個位元維持 0`;
        else if (self && live > 3) rule = `活細胞有 ${live} 個活鄰居，太擁擠 → 下一代死亡，第二個位元維持 0`;
        else if (self) rule = `活細胞有 ${live} 個活鄰居，剛剛好 → 繼續存活，\`|= 2\` 變成 3`;
        else if (live === 3) rule = "死細胞剛好有 3 個活鄰居 → 復活，`|= 2` 變成 2";
        else rule = `死細胞有 ${live} 個活鄰居（不是 3）→ 維持死亡`;
        if (next) board[r][c] |= 2;

        t.push({
          line: next ? [6, 7, 8, 9, 10, 11] : [6, 7, 8, 9, 10],
          note:
            `\`(${r}, ${c})\`：${rule}。` +
            (encodedNeighbor ? "有些鄰居已經被改成 2 或 3，但 `& 1` 讀到的仍是它們**這一代**的狀態。" : ""),
          views: [V.grid("board", board, { marks, pointers: { rc: [r, c] } }), legend(board[r][c])],
          vars: { r, c, live, "board[r][c]": board[r][c] },
        });
      }
    }

    const willLive: Record<string, Tone> = {};
    board.forEach((row, r) => row.forEach((v, c) => v >= 2 && (willLive[`${r},${c}`] = "good")));
    t.push({
      line: [12, 13],
      note: "每一格都編碼好了。綠色的是第二個位元為 1 的格子（值是 2 或 3），也就是下一代活著的細胞。",
      views: [V.grid("board", board, { marks: willLive }), legend()],
      vars: { m, n },
    });

    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) board[r][c] >>= 1;
    t.push({
      line: [12, 13, 14],
      note: "全部右移一位（`>>= 1`）：舊狀態被丟掉，第二個位元掉下來變成新的 0 / 1。這就是下一代的盤面。",
      views: [V.grid("board", board, { marks: alive("good") }), legend()],
      vars: { m, n },
      result: py(board),
    });
    return t.frames;
  },
});
