import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])

        def dfs(r: int, c: int, k: int) -> bool:
            if k == len(word):                 # 整個單字都對上了
                return True
            if not (0 <= r < m and 0 <= c < n) or board[r][c] != word[k]:
                return False
            board[r][c] = "#"                  # 標記：這條路徑已經踩過這格
            found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or
                     dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))
            board[r][c] = word[k]              # 還原，別條路徑還能用這格
            return found

        for r in range(m):
            for c in range(n):
                if dfs(r, c, 0):
                    return True
        return False`;

const DIRS: [number, number, string][] = [
  [1, 0, "下"],
  [-1, 0, "上"],
  [0, 1, "右"],
  [0, -1, "左"],
];

export default defineProblem<{ board: string[][]; word: string }>({
  id: 79,
  summary:
    "給一個 `m × n` 的字母方格 `board` 和一個字串 `word`，判斷 `word` 能不能在方格裡**連續走出來**。\n\n每一步只能走到上下左右相鄰的格子，而且**同一格在一條路徑裡不能重複使用**。",
  summaryEn:
    "Given an `m × n` grid of letters `board` and a string `word`, decide whether `word` can be **traced as a continuous path** through the grid.\n\nEach step moves to a cell directly above, below, left, or right, and **a cell may not be used twice in the same path**.",
  examples: [
    { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true" },
    { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: "true" },
    { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: "false" },
  ],
  constraints: ["1 ≤ m, n ≤ 6", "1 ≤ word.length ≤ 15", "board 和 word 只包含大小寫英文字母"],
  constraintsEn: ["1 ≤ m, n ≤ 6", "1 ≤ word.length ≤ 15", "board and word contain only upper- and lowercase English letters"],
  idea:
    "從每一格當起點做 DFS：`dfs(r, c, k)` 問的是「從這一格出發，能不能對上 `word[k:]`？」對上一個字就把那格**暫時改成 `#`**（代表這條路徑已經用過），再往四個方向找下一個字；四個方向都失敗就把字母**改回來**再回頭 —— 這個「標記 → 往下找 → 還原」就是回溯。",
  steps: [
    "對每一格 `(r, c)` 呼叫 `dfs(r, c, 0)`，任何一個成功就回傳 `True`。",
    "`k == len(word)`：整個字都對上了，回傳 `True`。",
    "出界，或這格的字母不是 `word[k]`（包含已經被標成 `#` 的格子）：回傳 `False`。",
    "把這格標成 `#`，依序往下、上、右、左找 `word[k + 1]`；用 `or` 串起來，一成功就不再試其他方向。",
    "把這格還原成原本的字母，回傳結果。",
  ],
  pitfalls: [
    "忘了還原：這格會永遠是 `#`，之後從別的起點出發的路徑就不能用它了。",
    "要先檢查邊界再讀 `board[r][c]`；Python 的負索引不會報錯而是讀到另一邊，更容易出錯。",
    "`k == len(word)` 的檢查要放在邊界檢查**之前**：最後一個字對上後，下一層不管座標是否出界都應該回傳 `True`。",
  ],
  complexity: { time: "O(m · n · 3^L)（L 為 word 長度）", space: "O(L)（遞迴深度）" },
  code,
  starter: `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        `,
  presets: [
    {
      label: "ABCCED",
      input: {
        board: [
          ["A", "B", "C", "E"],
          ["S", "F", "C", "S"],
          ["A", "D", "E", "E"],
        ],
        word: "ABCCED",
      },
      expected: "True",
    },
    {
      label: "ABCB（無解）",
      input: {
        board: [
          ["A", "B", "C", "E"],
          ["S", "F", "C", "S"],
          ["A", "D", "E", "E"],
        ],
        word: "ABCB",
      },
      expected: "False",
    },
    {
      label: "AAB（多次回頭）",
      input: {
        board: [
          ["C", "A", "A"],
          ["A", "A", "A"],
          ["B", "C", "D"],
        ],
        word: "AAB",
      },
      expected: "True",
    },
  ],
  trace({ board: input, word }) {
    const t = tracer();
    const board = input.map((row) => [...row]);
    const m = board.length;
    const n = board[0].length;
    const L = word.length;
    const rows = Array.from({ length: m }, (_, i) => i);
    const cols = Array.from({ length: n }, (_, i) => i);
    const path: [number, number][] = [];
    const onPath = (r: number, c: number) => path.some(([pr, pc]) => pr === r && pc === c);

    /** `k` = index of the letter being looked for; `cell` = the square under inspection */
    const views = (k: number, cell?: [number, number], tone: Tone = "active", allGood = false) => {
      const marks: Record<string, Tone> = {};
      path.forEach(([r, c], i) => (marks[`${r},${c}`] = i === path.length - 1 && !allGood ? "active" : "good"));
      if (cell) marks[`${cell[0]},${cell[1]}`] = tone;
      const wm: Record<number, Tone> = {};
      for (let i = 0; i < L; i++) {
        if (i < path.length) wm[i] = "good";
        else if (i === k && !allGood) wm[i] = "compare";
      }
      return [
        V.grid("board（綠色 = 目前路徑，已暫時標成 #）", input, { marks, rowLabels: rows, colLabels: cols }),
        V.chars("word", word, { marks: wm, pointers: { k: Math.min(k, L) } }),
        V.stack(
          "路徑（遞迴堆疊）",
          path.map(([r, c]) => `${input[r][c]} (${r},${c})`),
        ),
      ];
    };

    t.push({
      line: [3, 16, 17],
      note: `方格是 ${m} × ${n}，要找 \`"${word}"\`。把每一格都當成起點試一次：從那一格出發，看能不能依序走出整個單字。`,
      views: views(0),
      vars: { m, n, word: `"${word}"` },
    });

    const dfs = (r: number, c: number, k: number): boolean => {
      // Caller has already checked: in bounds and board[r][c] == word[k]
      board[r][c] = "#";
      path.push([r, c]);
      t.push({
        line: [8, 10],
        note:
          `\`board[${r}][${c}] = ${input[r][c]}\` 正是 \`word[${k}]\`，對上了！先把這格**標成 \`#\`**，` +
          (k + 1 < L
            ? `免得等一下又繞回來用同一格；接著往四個方向找 \`word[${k + 1}] = ${word[k + 1]}\`。`
            : `這已經是最後一個字。`),
        views: views(k + 1),
        vars: { r, c, k, 已對上: `"${word.slice(0, k + 1)}"` },
      });

      if (k + 1 === L) {
        t.push({
          line: [11, 6, 7],
          note: `往下一層時 \`k = ${L} == len(word)\`，代表整個單字都對上了，直接回傳 \`True\`。`,
          views: views(L, undefined, "active", true),
          vars: { r, c, k: L, 已對上: `"${word}"` },
        });
        return true;
      }

      const outside: string[] = [];
      for (const [dr, dc, name] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= m || nc < 0 || nc >= n) {
          outside.push(name);
          continue;
        }
        if (board[nr][nc] !== word[k + 1]) {
          const reason = onPath(nr, nc)
            ? `\`(${nr}, ${nc})\` 已經在這條路徑上（被標成 \`#\`），不能重複用`
            : `\`(${nr}, ${nc})\` 是 \`${input[nr][nc]}\`，不是要找的 \`${word[k + 1]}\``;
          t.push({
            line: [11, 12, 8, 9],
            note: `從 \`(${r}, ${c})\` 往**${name}**看：${reason}，回傳 \`False\`。`,
            views: views(k + 1, [nr, nc], "bad"),
            vars: { r: nr, c: nc, k: k + 1, 已對上: `"${word.slice(0, k + 1)}"` },
          });
          continue;
        }
        if (dfs(nr, nc, k + 1)) return true;
      }

      board[r][c] = input[r][c];
      path.pop();
      t.push({
        line: [13, 14],
        note:
          `\`(${r}, ${c})\` 的四個方向` +
          (outside.length ? `（${outside.join("、")}邊出界）` : "") +
          `都找不到 \`${word[k + 1]}\`。把這格**還原**成 \`${input[r][c]}\` 並回傳 \`False\`，退回上一格換別的方向。`,
        views: views(k, [r, c], "compare"),
        vars: { r, c, k, 已對上: `"${word.slice(0, k)}"` },
      });
      return false;
    };

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] !== word[0]) {
          t.push({
            line: [16, 17, 18, 8, 9],
            note: `以 \`(${r}, ${c})\` 當起點：這格是 \`${input[r][c]}\`，不是 \`word[0] = ${word[0]}\`，馬上回傳 \`False\`，換下一格。`,
            views: views(0, [r, c], "bad"),
            vars: { r, c, k: 0 },
          });
          continue;
        }
        if (dfs(r, c, 0)) {
          t.push({
            line: [13, 14, 18, 19],
            note: `\`True\` 一層一層往回傳（沿途每一格也會還原成原本的字母），最外層收到後回傳 \`True\`。綠色就是找到的路徑。`,
            views: views(L, undefined, "active", true),
            vars: { 起點: `(${r}, ${c})`, 已對上: `"${word}"` },
            result: py(true),
          });
          return t.frames;
        }
      }
    }

    t.push({
      line: 20,
      note: `每一格都當過起點了，沒有任何一條路徑能走出 \`"${word}"\`，回傳 \`False\`。`,
      views: views(0),
      vars: { word: `"${word}"` },
      result: py(false),
    });
    return t.frames;
  },
});
