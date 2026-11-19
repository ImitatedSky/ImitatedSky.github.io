import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_row = any(matrix[0][c] == 0 for c in range(n))
        first_col = any(matrix[r][0] == 0 for r in range(m))
        for r in range(1, m):  # 1. 用第一列、第一欄當記號
            for c in range(1, n):
                if matrix[r][c] == 0:
                    matrix[r][0] = matrix[0][c] = 0
        for r in range(1, m):  # 2. 依記號把內部歸零
            for c in range(1, n):
                if matrix[r][0] == 0 or matrix[0][c] == 0:
                    matrix[r][c] = 0
        if first_row:  # 3. 最後才處理第一列、第一欄
            for c in range(n):
                matrix[0][c] = 0
        if first_col:
            for r in range(m):
                matrix[r][0] = 0`;

export default defineProblem<{ matrix: number[][] }>({
  id: 73,
  summary:
    "給一個 `m × n` 的整數矩陣。只要某一格是 0，就把它**所在的整列和整欄**都設成 0。\n\n必須原地修改；進階要求是只用 O(1) 的額外空間。",
  summaryEn:
    "Given an `m × n` integer matrix, whenever a cell is 0, set **its entire row and entire column** to 0.\n\nModify the matrix in-place; the follow-up asks for only O(1) extra space.",
  examples: [
    { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" },
    { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
  ],
  constraints: ["1 ≤ m, n ≤ 200"],
  constraintsEn: ["1 ≤ m, n ≤ 200"],
  idea:
    "需要記住「哪些列、哪些欄要歸零」。與其另外開陣列，不如**借矩陣自己的第一列和第一欄當記號板**：`matrix[r][0] == 0` 代表第 r 列要清、`matrix[0][c] == 0` 代表第 c 欄要清。唯一的麻煩是第一列／第一欄本身會被記號蓋掉，所以先用兩個布林值記下它們原本有沒有 0。",
  steps: [
    "先記下 `first_row`、`first_col`：第一列、第一欄**原本**有沒有 0。",
    "掃內部（`r ≥ 1`、`c ≥ 1`）：遇到 0，就把 `matrix[r][0]` 和 `matrix[0][c]` 設成 0 當記號。",
    "再掃一次內部：只要這格的列記號或欄記號是 0，就把它歸零。",
    "最後依 `first_row`、`first_col` 決定要不要把第一列、第一欄整個歸零。",
  ],
  pitfalls: [
    "一邊掃一邊把整列整欄設成 0 是錯的：新寫上去的 0 會被當成「原本的 0」，最後整張都變 0。",
    "第一列、第一欄一定要**最後**才歸零，太早清掉會把記號一起毀掉。",
    "`first_row`、`first_col` 要在寫任何記號之前就算好。",
  ],
  complexity: { time: "O(m·n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """原地修改 matrix，不需要回傳"""
        `,
  presets: [
    {
      label: "中間一個 0",
      input: { matrix: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] },
      expected: "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]",
    },
    {
      label: "第一列有 0",
      input: { matrix: [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]] },
      expected: "[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]",
    },
    {
      label: "第一欄與內部都有 0",
      input: { matrix: [[1, 2, 3, 4], [5, 0, 7, 8], [0, 10, 11, 12], [13, 14, 15, 16]] },
      expected: "[[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 15, 16]]",
    },
  ],
  trace({ matrix: input }) {
    const t = tracer();
    const matrix = input.map((row) => [...row]);
    const m = matrix.length;
    const n = matrix[0].length;
    const cleared = new Set<string>(); // 已被演算法歸零的內部格子
    let flags = false; // 記號是否已開始生效

    const view = (extra: Record<string, Tone> = {}, final = false) => {
      const marks: Record<string, Tone> = {};
      if (final) {
        matrix.forEach((row, r) => row.forEach((v, c) => v === 0 && (marks[`${r},${c}`] = "good")));
      } else {
        for (let c = 0; c < n; c++) marks[`0,${c}`] = flags && c > 0 && matrix[0][c] === 0 ? "compare" : "alt";
        for (let r = 1; r < m; r++) marks[`${r},0`] = flags && matrix[r][0] === 0 ? "compare" : "alt";
        cleared.forEach((k) => (marks[k] = "visited"));
      }
      return [
        V.grid("matrix", matrix, {
          marks: { ...marks, ...extra },
          rowLabels: matrix.map((_, r) => r),
          colLabels: matrix[0].map((_, c) => c),
        }),
      ];
    };

    t.push({
      line: 3,
      note: "藍色的第一列和第一欄等一下要拿來當**記號板**：`matrix[r][0]` 記第 r 列、`matrix[0][c]` 記第 c 欄要不要歸零。",
      views: view(),
      vars: { m, n },
    });

    const firstRow = matrix[0].some((v) => v === 0);
    const rowMarks: Record<string, Tone> = {};
    matrix[0].forEach((v, c) => (rowMarks[`0,${c}`] = v === 0 ? "bad" : "compare"));
    t.push({
      line: 4,
      note: `記號板本身等一下會被改寫，所以先記下第一列**原本**有沒有 0：${firstRow ? "有" : "沒有"}，\`first_row = ${py(firstRow)}\`。`,
      views: view(rowMarks),
      vars: { first_row: py(firstRow) },
    });

    const firstCol = matrix.some((row) => row[0] === 0);
    const colMarks: Record<string, Tone> = {};
    matrix.forEach((row, r) => (colMarks[`${r},0`] = row[0] === 0 ? "bad" : "compare"));
    t.push({
      line: 5,
      note: `同樣記下第一欄原本有沒有 0：${firstCol ? "有" : "沒有"}，\`first_col = ${py(firstCol)}\`。`,
      views: view(colMarks),
      vars: { first_row: py(firstRow), first_col: py(firstCol) },
    });
    const flagsVars = { first_row: py(firstRow), first_col: py(firstCol) };

    flags = true;
    let found = 0;
    for (let r = 1; r < m; r++) {
      for (let c = 1; c < n; c++) {
        if (matrix[r][c] !== 0) continue;
        found++;
        matrix[r][0] = 0;
        matrix[0][c] = 0;
        t.push({
          line: [6, 7, 8, 9],
          note: `掃內部時在 \`(${r}, ${c})\` 遇到 0：第 ${r} 列和第 ${c} 欄都要歸零。先不動手，只在記號板上做記號 —— \`matrix[${r}][0] = 0\`、\`matrix[0][${c}] = 0\`。`,
          views: view({ [`${r},${c}`]: "active", [`${r},0`]: "compare", [`0,${c}`]: "compare" }),
          vars: { ...flagsVars, r, c },
        });
      }
    }
    if (!found) {
      t.push({
        line: [6, 7, 8],
        note: "掃完內部（`r ≥ 1`、`c ≥ 1`），沒有任何 0，不需要寫新的記號。",
        views: view(),
        vars: flagsVars,
      });
    }

    for (let r = 1; r < m; r++) {
      const hit: Record<string, Tone> = {};
      const why: string[] = [];
      const cols: number[] = [];
      for (let c = 1; c < n; c++) {
        if (matrix[r][0] === 0 || matrix[0][c] === 0) {
          if (matrix[r][0] !== 0) cols.push(c);
          hit[`${r},${c}`] = "active";
        }
      }
      if (matrix[r][0] === 0) why.push(`列記號 \`matrix[${r}][0]\` 是 0，整列歸零`);
      else if (cols.length) why.push(`列記號不是 0，但第 ${cols.join("、")} 欄的欄記號是 0，只清這${cols.length > 1 ? "幾" : "一"}格`);
      else why.push("列記號和各欄記號都不是 0，這一列不用動");
      for (const k of Object.keys(hit)) {
        const [rr, cc] = k.split(",").map(Number);
        matrix[rr][cc] = 0;
      }
      t.push({
        line: [10, 11, 12, 13],
        note: `依記號處理第 ${r} 列的內部：${why[0]}。`,
        views: view(hit),
        vars: { ...flagsVars, r },
      });
      Object.keys(hit).forEach((k) => cleared.add(k));
    }
    if (m === 1 || n === 1) {
      t.push({
        line: [10, 11],
        note: "矩陣只有一列或一欄，沒有「內部」可以處理。",
        views: view(),
        vars: flagsVars,
      });
    }

    flags = false;
    if (firstRow) {
      const hit: Record<string, Tone> = {};
      for (let c = 0; c < n; c++) {
        matrix[0][c] = 0;
        hit[`0,${c}`] = "active";
      }
      t.push({
        line: [14, 15, 16],
        note: "記號用完了，現在才能動記號板。`first_row` 是 `True`（第一列原本就有 0），把第一列整個歸零。",
        views: view(hit),
        vars: flagsVars,
      });
      for (let c = 1; c < n; c++) cleared.add(`0,${c}`);
    } else {
      t.push({
        line: 14,
        note: matrix[0].some((v) => v === 0)
          ? "`first_row` 是 `False`：第一列原本沒有 0，上面那些 0 只是欄記號（正好也是該歸零的位置），其他格保持原樣。"
          : "`first_row` 是 `False`：第一列原本沒有 0，不用整列歸零。",
        views: view(),
        vars: flagsVars,
      });
    }

    if (firstCol) {
      const hit: Record<string, Tone> = {};
      for (let r = 0; r < m; r++) {
        matrix[r][0] = 0;
        hit[`${r},0`] = "active";
      }
      t.push({
        line: [17, 18, 19],
        note: "`first_col` 是 `True`（第一欄原本就有 0），把第一欄整個歸零。",
        views: view(hit),
        vars: flagsVars,
      });
    } else {
      t.push({
        line: 17,
        note: matrix.some((row, r) => r > 0 && row[0] === 0)
          ? "`first_col` 是 `False`：第一欄原本沒有 0，上面那些 0 只是列記號（正好也是該歸零的位置），其他格保持原樣。"
          : "`first_col` 是 `False`：第一欄原本沒有 0，不用整欄歸零。",
        views: view(),
        vars: flagsVars,
      });
    }

    t.push({
      line: 19,
      note: "完成。整個過程只多用了兩個布林值，記號全部寫在矩陣自己的第一列和第一欄上。",
      views: view({}, true),
      vars: flagsVars,
      result: py(matrix),
    });
    return t.frames;
  },
});
