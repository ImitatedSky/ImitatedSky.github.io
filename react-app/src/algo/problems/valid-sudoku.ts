import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        for r in range(9):
            for c in range(9):
                x = board[r][c]
                if x == ".":
                    continue
                b = r // 3 * 3 + c // 3  # 第幾個九宮格
                if x in rows[r] or x in cols[c] or x in boxes[b]:
                    return False
                rows[r].add(x)
                cols[c].add(x)
                boxes[b].add(x)
        return True`;

const VALID = [
  "53..7....",
  "6..195...",
  ".98....6.",
  "8...6...3",
  "4..8.3..1",
  "7...2...6",
  ".6....28.",
  "...419..5",
  "....8..79",
];

export default defineProblem<{ board: string[] }>({
  id: 36,
  summary:
    "給一個 9×9 的數獨盤面，有些格子已填數字、有些是空的（`.`）。判斷**目前已填的數字**是否合法：每一列、每一欄、每個 3×3 九宮格裡，數字 1–9 都不能重複。\n\n只需要檢查已填的格子，不用管這個盤面最後解不解得出來。",
  examples: [
    { input: 'board = [["5","3",".",".","7",…], …]（標準範例盤面）', output: "true" },
    { input: "把上面盤面左上角的 5 改成 8", output: "false", note: "左上角的九宮格裡出現兩個 8" },
  ],
  constraints: ["board 固定是 9×9", "每格是 `1`–`9` 或 `.`"],
  idea:
    "每個數字同時屬於**一列、一欄、一個九宮格**。替 9 列、9 欄、9 宮各準備一個集合，掃過盤面一次：放進去之前先問「這三個集合裡有沒有它？」有就是重複。九宮格的編號用 `r // 3 * 3 + c // 3` 算出來。",
  steps: [
    "建立 `rows`、`cols`、`boxes` 各 9 個空集合。",
    "由左到右、由上到下走訪每一格，空格直接跳過。",
    "算出這格屬於第 `b = r // 3 * 3 + c // 3` 個九宮格。",
    "若數字已在 `rows[r]`、`cols[c]` 或 `boxes[b]` 裡 → 重複，回傳 `False`。",
    "否則把它加進這三個集合；全部走完都沒衝突就回傳 `True`。",
  ],
  pitfalls: [
    "九宮格編號是 `r // 3 * 3 + c // 3`，先整除再乘 3，不要寫成 `r * 3 // 3`。",
    "題目只問「目前合法嗎」，不是問「有沒有解」，不需要回溯。",
  ],
  complexity: { time: "O(81) = O(1)", space: "O(81) = O(1)" },
  code,
  starter: `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        `,
  presets: [
    { label: "合法盤面", input: { board: VALID }, expected: "True" },
    { label: "九宮格內重複", input: { board: ["83..7....", ...VALID.slice(1)] }, expected: "False" },
    {
      label: "同一欄重複",
      input: {
        board: [
          "1..4..7..",
          ".2..5..8.",
          "..3..6..9",
          "4........",
          "..3......",
          ".........",
          ".........",
          ".........",
          ".........",
        ],
      },
      expected: "False",
    },
  ],
  trace({ board }) {
    const t = tracer();
    const cells = board.map((row) => [...row].map((ch) => (ch === "." ? "" : ch)));
    const labels = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const rows = labels.map(() => new Set<string>());
    const cols = labels.map(() => new Set<string>());
    const boxes = labels.map(() => new Set<string>());
    const grid = (marks: Record<string, Tone> = {}, pointers: Record<string, [number, number]> = {}) =>
      V.grid("board", cells, { marks, pointers, rowLabels: labels, colLabels: labels });

    t.push({
      line: [3, 4, 5],
      note: "替 9 列、9 欄、9 個九宮格各準備一個空集合，記錄「這裡已經出現過哪些數字」。",
      views: [grid(), V.set("rows[r]", []), V.set("cols[c]", []), V.set("boxes[b]", [])],
    });

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const x = board[r][c];
        if (x === ".") continue;
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);

        // 只突顯與這格有關的列、欄、宮；其餘淡化
        const marks: Record<string, Tone> = {};
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            const sameBox = Math.floor(i / 3) === Math.floor(r / 3) && Math.floor(j / 3) === Math.floor(c / 3);
            if (i !== r && j !== c && !sameBox) {
              marks[`${i},${j}`] = "muted";
              continue;
            }
            const seen = (i < r || (i === r && j < c)) && board[i][j] !== ".";
            if (seen) marks[`${i},${j}`] = board[i][j] === x ? "bad" : "compare";
          }
        }
        marks[`${r},${c}`] = "active";
        const vars = { r, c, b, x };

        const where: string[] = [];
        if (rows[r].has(x)) where.push(`第 ${r} 列`);
        if (cols[c].has(x)) where.push(`第 ${c} 欄`);
        if (boxes[b].has(x)) where.push(`第 ${b} 宮`);

        if (where.length) {
          marks[`${r},${c}`] = "bad";
          const bad = (s: Set<string>) => (s.has(x) ? { marks: { [x]: "bad" as Tone } } : {});
          t.push({
            line: [8, 11, 12, 13],
            note: `\`board[${r}][${c}] = ${x}\`，屬於第 ${b} 宮。但 \`${x}\` 已經出現在${where.join("、")}的集合裡 —— **重複了**，盤面不合法。`,
            views: [
              grid(marks, { x: [r, c] }),
              V.set("rows[r]", rows[r], bad(rows[r])),
              V.set("cols[c]", cols[c], bad(cols[c])),
              V.set("boxes[b]", boxes[b], bad(boxes[b])),
            ],
            vars,
            result: py(false),
          });
          return t.frames;
        }

        rows[r].add(x);
        cols[c].add(x);
        boxes[b].add(x);
        const added = { marks: { [x]: "good" as Tone } };
        t.push({
          line: [8, 11, 12, 14, 15, 16],
          note: `\`board[${r}][${c}] = ${x}\`，屬於第 \`${r} // 3 * 3 + ${c} // 3 = ${b}\` 宮。第 ${r} 列、第 ${c} 欄、第 ${b} 宮都還沒有 \`${x}\`，把它記進三個集合。`,
          views: [
            grid(marks, { x: [r, c] }),
            V.set("rows[r]", rows[r], added),
            V.set("cols[c]", cols[c], added),
            V.set("boxes[b]", boxes[b], added),
          ],
          vars,
        });
      }
    }

    const all: Record<string, Tone> = {};
    board.forEach((row, i) => [...row].forEach((ch, j) => ch !== "." && (all[`${i},${j}`] = "good")));
    t.push({
      line: 17,
      note: "所有已填的格子都檢查完，沒有任何一列、一欄或九宮格出現重複，盤面合法。",
      views: [grid(all), V.set("rows[r]", []), V.set("cols[c]", []), V.set("boxes[b]", [])],
      result: py(true),
    });
    return t.frames;
  },
});
