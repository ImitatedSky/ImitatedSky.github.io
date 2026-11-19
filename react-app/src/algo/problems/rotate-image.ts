import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        for i in range(n):  # 1. 轉置：沿主對角線翻
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        for row in matrix:  # 2. 每一列左右反轉
            row.reverse()`;

export default defineProblem<{ matrix: number[][] }>({
  id: 48,
  summary:
    "給一個 `n × n` 的矩陣，把它當成一張圖片**順時針旋轉 90 度**。\n\n必須**原地**修改這個矩陣，不能另外開一個矩陣來放結果。",
  summaryEn:
    "Given an `n × n` matrix, treat it as an image and **rotate it 90 degrees clockwise**.\n\nYou must modify the matrix **in-place**; allocating a second matrix for the result is not allowed.",
  examples: [
    { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" },
    {
      input: "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]",
      output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]",
    },
  ],
  constraints: ["1 ≤ n ≤ 20"],
  constraintsEn: ["1 ≤ n ≤ 20"],
  idea:
    "順時針轉 90° 會把 `(r, c)` 搬到 `(c, n-1-r)`。這可以拆成兩個很好寫的原地動作：先**轉置**（`(r, c)` → `(c, r)`，列變成欄），再把**每一列左右反轉**（`(c, r)` → `(c, n-1-r)`）。",
  steps: [
    "轉置：對主對角線右上方的每一格 `(i, j)`（`j > i`），和它的鏡像 `(j, i)` 交換。",
    "反轉：把每一列左右顛倒。",
    "兩步做完，原本的第 0 列就站到最右邊那一欄，正好是順時針 90°。",
  ],
  pitfalls: [
    "轉置時 `j` 要從 `i + 1` 開始。如果 `j` 從 0 跑，每一對會被交換兩次，等於沒換。",
    "先轉置再反轉**列**是順時針；如果改成反轉**欄**（上下顛倒）就變成逆時針了。",
  ],
  complexity: { time: "O(n²)", space: "O(1)" },
  code,
  starter: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        """原地修改 matrix，不需要回傳"""
        `,
  presets: [
    {
      label: "3×3",
      input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
      expected: "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]",
    },
    {
      label: "4×4",
      input: { matrix: [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]] },
      expected: "[[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]",
    },
    { label: "2×2", input: { matrix: [[1, 2], [3, 4]] }, expected: "[[3, 1], [4, 2]]" },
  ],
  trace({ matrix: input }) {
    const t = tracer();
    const matrix = input.map((row) => [...row]);
    const n = matrix.length;
    // from[r][c] = 這一格的值原本住在第幾列；用來追蹤「原本的第 0 列」跑到哪裡
    const from = input.map((row, r) => row.map(() => r));

    const origMarks: Record<string, Tone> = {};
    for (let c = 0; c < n; c++) origMarks[`0,${c}`] = "alt";
    const views = (extra: Record<string, Tone> = {}, base?: Tone) => {
      const marks: Record<string, Tone> = {};
      for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++) {
          if (from[r][c] === 0) marks[`${r},${c}`] = "alt";
          else if (base) marks[`${r},${c}`] = base;
        }
      return [
        V.grid("matrix", matrix, { marks: { ...marks, ...extra } }),
        V.grid("原本的矩陣", input, { marks: origMarks }),
      ];
    };

    t.push({
      line: 3,
      note: `要把 ${n}×${n} 的矩陣順時針轉 90°。盯著藍色的**原本第 0 列**：轉完之後它應該站在最右邊那一欄。`,
      views: views(),
      vars: { n },
    });

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = matrix[i][j];
        const b = matrix[j][i];
        [matrix[i][j], matrix[j][i]] = [b, a];
        [from[i][j], from[j][i]] = [from[j][i], from[i][j]];
        t.push({
          line: [4, 5, 6],
          note: `轉置：\`(${i}, ${j})\` 和它對主對角線的鏡像 \`(${j}, ${i})\` 交換，\`${a}\` ↔ \`${b}\`。只處理對角線右上方（\`j > i\`），每一對才不會被換兩次。`,
          views: views({ [`${i},${j}`]: "active", [`${j},${i}`]: "active" }),
          vars: { n, i, j },
        });
      }
    }

    t.push({
      line: 7,
      note:
        n > 1
          ? "轉置完成：原本的每一**列**都變成了**欄**，藍色的第 0 列現在躺在最左邊那一欄。離順時針 90° 只差左右顛倒。"
          : "只有一格，轉置後沒有變化。",
      views: views(),
      vars: { n },
    });

    for (let r = 0; r < n; r++) {
      const before = py(matrix[r]);
      matrix[r].reverse();
      from[r].reverse();
      const rowMarks: Record<string, Tone> = {};
      for (let c = 0; c < n; c++) if (from[r][c] !== 0) rowMarks[`${r},${c}`] = "active";
      t.push({
        line: [7, 8],
        note: `把第 ${r} 列左右反轉：\`${before}\` → \`${py(matrix[r])}\`。藍色那格被甩到最右邊。`,
        views: views(rowMarks),
        vars: { n, row: py(matrix[r]) },
      });
    }

    t.push({
      line: 8,
      note: "完成。原本的第 0 列現在是最右邊那一欄（由上到下順序不變），整個矩陣順時針轉了 90°，而且全程沒有用到額外的矩陣。",
      views: views({}, "good"),
      vars: { n },
      result: py(matrix),
    });
    return t.frames;
  },
});
