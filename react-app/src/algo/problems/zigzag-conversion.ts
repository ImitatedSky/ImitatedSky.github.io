import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def convert(self, s: str, numRows: int) -> str:
        if numRows == 1 or numRows >= len(s):
            return s                # 根本折不起來，原樣回傳
        rows = [[] for _ in range(numRows)]
        row, step = 0, 1
        for ch in s:
            rows[row].append(ch)
            if row == 0:
                step = 1            # 碰到最上面 → 改成往下
            elif row == numRows - 1:
                step = -1           # 碰到最下面 → 改成往上
            row += step
        return "".join("".join(r) for r in rows)`;

export default defineProblem<{ s: string; numRows: number }>({
  id: 6,
  summary:
    "把字串 `s` 的字元依序排成 `numRows` 列的**鋸齒形**：先由上往下寫滿一直行，再沿著斜線往右上爬回第一列，如此反覆。\n\n排完之後**一列一列由左到右讀**，把讀到的字元接成新字串回傳。",
  examples: [
    { input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"' },
    { input: 's = "PAYPALISHIRING", numRows = 4', output: '"PINALSIGYAHRPI"' },
    { input: 's = "A", numRows = 1', output: '"A"' },
  ],
  constraints: ["1 ≤ s.length ≤ 1000", "1 ≤ numRows ≤ 1000"],
  idea:
    "不需要真的畫出二維圖形。最後是一列一列讀，所以每個字元**只要知道它落在第幾列**就夠了。列號的變化像乒乓球：0, 1, 2, …, numRows−1, …, 2, 1, 0, 1, …，用一個方向變數 `step` 在碰到頂端和底端時反轉即可。",
  steps: [
    "`numRows == 1` 或列數不小於字串長度時，圖形不會轉折，直接回傳 `s`。",
    "準備 `numRows` 個空的列，`row = 0`、`step = 1`（往下）。",
    "依序把每個字元接到 `rows[row]` 後面。",
    "碰到第 0 列就把 `step` 設成 `+1`，碰到最後一列就設成 `-1`，然後 `row += step`。",
    "把每一列接起來，再把所有列接起來。",
  ],
  pitfalls: [
    "`numRows == 1` 一定要特判：這時第 0 列同時是頂端也是底端，`row` 會一路往下加而超出範圍。",
    "要**先放字元再決定方向**，轉向判斷看的是「剛放完的這一列」。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def convert(self, s: str, numRows: int) -> str:
        `,
  presets: [
    { label: '"HELLOWORLD", 3', input: { s: "HELLOWORLD", numRows: 3 }, expected: '"HOLELWRDLO"' },
    { label: '"ALGORITHMS", 4', input: { s: "ALGORITHMS", numRows: 4 }, expected: '"ATLIHGRMOS"' },
    { label: '"AB", 1', input: { s: "AB", numRows: 1 }, expected: '"AB"' },
  ],
  trace({ s, numRows }) {
    const t = tracer();
    const n = s.length;

    if (numRows === 1 || numRows >= n) {
      const all: Record<number, Tone> = {};
      for (let k = 0; k < n; k++) all[k] = "good";
      t.push({
        line: 3,
        note: `\`numRows = ${numRows}\`，字串長度 ${n}。${numRows === 1 ? "只有一列，所有字元都排在同一列上。" : "列數不比字串短，字元往下排一直行就用完了，還來不及轉折。"}`,
        views: [V.chars("s", s)],
        vars: { numRows },
      });
      t.push({
        line: 4,
        note: "一列一列讀出來的順序跟原本一模一樣，直接回傳 `s`。",
        views: [V.chars("s", s, { marks: all })],
        vars: { numRows },
        result: py(s),
      });
      return t.frames;
    }

    // 先模擬一次，算出鋸齒圖形總共需要幾欄
    let cols = 1;
    {
      let row = 0;
      let step = 1;
      let col = 0;
      for (let k = 0; k < n; k++) {
        cols = Math.max(cols, col + 1);
        if (row === 0) step = 1;
        else if (row === numRows - 1) step = -1;
        if (step === -1) col++;
        row += step;
      }
    }

    const cells: Cell[][] = Array.from({ length: numRows }, () => new Array<Cell>(cols).fill(""));
    const rowLabels = Array.from({ length: numRows }, (_, r) => `rows[${r}]`);
    const placed: Record<string, Tone> = {};
    const sMarks: Record<number, Tone> = {};
    const rows: string[][] = Array.from({ length: numRows }, () => []);
    const GRID = "鋸齒排列";
    const arrow = (step: number) => (step === 1 ? "+1（往下）" : "-1（往上）");

    let row = 0;
    let step = 1;
    let col = 0;

    // 「結果」從頭到尾都在，還沒讀到的格子留空，版面才不會在最後突然長高
    const outView = (text: string, marks: Record<number, Tone> = {}) =>
      V.array("結果（一列一列讀出來）", Array.from({ length: n }, (_, k) => text[k] ?? ""), { marks });

    t.push({
      line: 3,
      note: `\`numRows = ${numRows}\`，字串長度 ${n}，會產生轉折，所以要實際排一次。`,
      views: [V.chars("s", s), V.grid(GRID, cells, { rowLabels }), outView("")],
      vars: { numRows },
    });
    t.push({
      line: [5, 6],
      note: `準備 ${numRows} 個空的列。\`row = 0\` 代表下一個字元要放第幾列，\`step = 1\` 代表目前方向是往下。其實只需要知道每個字元屬於哪一列，圖形是畫給我們看的。`,
      views: [V.chars("s", s), V.grid(GRID, cells, { rowLabels, pointers: { row: [0, 0] } }), outView("")],
      vars: { row, step: arrow(step) },
    });

    for (let k = 0; k < n; k++) {
      const ch = s[k];
      rows[row].push(ch);
      cells[row][col] = ch;
      const here = `${row},${col}`;
      t.push({
        line: [7, 8],
        note: `把 \`"${ch}"\` 接到 \`rows[${row}]\` 後面，現在 \`rows[${row}] = "${rows[row].join("")}"\`。`,
        views: [
          V.chars("s", s, { pointers: { ch: k }, marks: { ...sMarks, [k]: "active" } }),
          V.grid(GRID, cells, { rowLabels, marks: { ...placed, [here]: "active" }, pointers: { row: [row, col] } }),
          outView(""),
        ],
        vars: { ch, row, step: arrow(step) },
      });
      placed[here] = "visited";
      sMarks[k] = "visited";

      const at = row;
      let line: number[];
      let why: string;
      if (row === 0) {
        step = 1;
        line = [9, 10, 13];
        why = "剛放的是**第 0 列**（頂端），不能再往上了，`step = 1` 改成往下。";
      } else if (row === numRows - 1) {
        step = -1;
        line = [11, 12, 13];
        why = `剛放的是**第 ${row} 列**（底端），不能再往下了，\`step = -1\` 改成沿斜線往上。`;
      } else {
        line = [9, 11, 13];
        why = `第 ${row} 列在中間，不是頂端也不是底端，方向維持${step === 1 ? "往下" : "往上"}。`;
      }
      if (step === -1) col++;
      row += step;
      const inGrid = col < cols && k < n - 1;
      t.push({
        line,
        note: `${why}下一個字元放第 \`${at} ${step === 1 ? "+" : "−"} 1 = ${row}\` 列。`,
        views: [
          V.chars("s", s, { pointers: { ch: k }, marks: sMarks }),
          V.grid(GRID, cells, {
            rowLabels,
            marks: { ...placed, [here]: "compare" },
            pointers: inGrid ? { row: [row, col] } : {},
          }),
          outView(""),
        ],
        vars: { ch, row, step: arrow(step) },
      });
    }

    let out = "";
    for (let r = 0; r < numRows; r++) {
      out += rows[r].join("");
      const marks: Record<string, Tone> = {};
      for (const key of Object.keys(placed)) {
        const kr = Number(key.split(",")[0]);
        marks[key] = kr < r ? "good" : kr === r ? "active" : "visited";
      }
      t.push({
        line: 14,
        note:
          (r === 0 ? "字元都放完了，開始**一列一列由左到右讀**。" : "繼續讀下一列。") +
          `\`rows[${r}] = "${rows[r].join("")}"\` 接上去，目前是 \`"${out}"\`。`,
        views: [V.chars("s", s, { marks: sMarks }), V.grid(GRID, cells, { rowLabels, marks }), outView(out)],
        vars: { 結果: py(out) },
      });
    }

    const good: Record<string, Tone> = {};
    for (const key of Object.keys(placed)) good[key] = "good";
    const outMarks: Record<number, Tone> = {};
    for (let k = 0; k < out.length; k++) outMarks[k] = "good";
    t.push({
      line: 14,
      note: `所有列都接完了，答案是 \`"${out}"\`。`,
      views: [
        V.chars("s", s, { marks: sMarks }),
        V.grid(GRID, cells, { rowLabels, marks: good }),
        outView(out, outMarks),
      ],
      vars: { 結果: py(out) },
      result: py(out),
    });
    return t.frames;
  },
});
