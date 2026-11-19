import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        lo, hi = 0, m * n - 1  # 把矩陣當成一條長度 m*n 的有序陣列
        while lo <= hi:
            mid = (lo + hi) // 2
            x = matrix[mid // n][mid % n]  # 一維索引 -> (列, 行)
            if x == target:
                return True
            if x < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False`;

export default defineProblem<{ matrix: number[][]; target: number }>({
  id: 74,
  summary:
    "給一個 `m × n` 的整數矩陣，它有兩個性質：**每一列由左到右遞增**，而且**每一列的第一個數都大於上一列的最後一個數**。判斷 `target` 是否在矩陣裡。\n\n時間複雜度必須是 O(log(m·n))。",
  summaryEn:
    "An `m × n` integer matrix has two properties: **each row increases from left to right**, and **the first number of each row is greater than the last number of the row above**. Decide whether `target` appears in the matrix.\n\nThe solution must run in O(log(m·n)) time.",
  examples: [
    { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", output: "true" },
    { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13", output: "false" },
  ],
  constraints: ["1 ≤ m, n ≤ 100"],
  constraintsEn: ["1 ≤ m, n ≤ 100"],
  idea:
    "把每一列頭尾相接，整個矩陣其實就是**一條排好序的一維陣列**。直接在索引 `0 … m·n − 1` 上做二分搜尋，需要讀值時再把一維索引 `k` 換回座標：列是 `k // n`、行是 `k % n`。",
  steps: [
    "`lo = 0`、`hi = m * n - 1`，把矩陣想成攤平後的有序陣列。",
    "取 `mid`，用 `matrix[mid // n][mid % n]` 讀出那一格的值 `x`。",
    "`x == target` 回傳 `True`；`x < target` 丟掉左半（`lo = mid + 1`）；否則丟掉右半（`hi = mid - 1`）。",
    "範圍變空就代表不存在，回傳 `False`。",
  ],
  pitfalls: [
    "換算座標時除數是**行數 `n`**，不是列數 `m`。",
    "這題的矩陣是「整體有序」；LC 240 只有列、行各自有序，不能用這個做法。",
  ],
  complexity: { time: "O(log(m·n))", space: "O(1)" },
  code,
  starter: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        `,
  presets: [
    {
      label: "3×4, target = 16",
      input: { matrix: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 16 },
      expected: "True",
    },
    {
      label: "3×4, target = 13（不存在）",
      input: { matrix: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 13 },
      expected: "False",
    },
    { label: "2×3, target = 1（第一格）", input: { matrix: [[1, 4, 6], [8, 9, 12]], target: 1 }, expected: "True" },
  ],
  trace({ matrix, target }) {
    const t = tracer();
    const m = matrix.length;
    const n = matrix[0].length;
    const flat = matrix.flat();
    const total = m * n;
    let lo = 0;
    let hi = total - 1;
    const rc = (k: number): [number, number] => [Math.floor(k / n), k % n];

    // 同一個狀態畫兩次：真正的矩陣，和「攤平後」的一維陣列
    const views = (mid: number | null, midTone: Tone | null) => {
      const gridMarks: Record<string, Tone> = {};
      const flatMarks: Record<number, Tone> = {};
      for (let k = 0; k < total; k++) {
        if (k < lo || k > hi) {
          gridMarks[rc(k).join(",")] = "muted";
          flatMarks[k] = "muted";
        }
      }
      if (mid !== null && midTone) {
        gridMarks[rc(mid).join(",")] = midTone;
        flatMarks[mid] = midTone;
      }
      const gridPointers: Record<string, [number, number]> = {};
      const flatPointers: Record<string, number> = { lo };
      if (lo < total) gridPointers.lo = rc(lo);
      if (mid !== null) {
        gridPointers.mid = rc(mid);
        flatPointers.mid = mid;
      }
      if (hi >= 0) gridPointers.hi = rc(hi);
      flatPointers.hi = hi;
      return [
        V.grid("matrix", matrix, {
          marks: gridMarks,
          pointers: gridPointers,
          rowLabels: matrix.map((_, r) => `列 ${r}`),
          colLabels: matrix[0].map((_, c) => `行 ${c}`),
        }),
        V.array("攤平後的樣子（一維索引）", flat, { marks: flatMarks, pointers: flatPointers }),
      ];
    };

    t.push({
      line: [3, 4],
      note: `矩陣是 ${m} 列 × ${n} 行。把每一列頭尾相接，就是一條長度 ${total} 的**有序陣列**，在索引 \`[0, ${hi}]\` 上二分搜尋 \`target = ${target}\`。`,
      views: views(null, null),
      vars: { target, m, n, lo, hi },
    });

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const [r, c] = rc(mid);
      const x = flat[mid];
      t.push({
        line: [5, 6, 7],
        note: `\`mid = (${lo} + ${hi}) // 2 = ${mid}\`。換回座標：列 \`${mid} // ${n} = ${r}\`、行 \`${mid} % ${n} = ${c}\`，所以 \`x = matrix[${r}][${c}] = ${x}\`。`,
        views: views(mid, "compare"),
        vars: { target, lo, mid, hi, x },
      });

      if (x === target) {
        t.push({
          line: [8, 9],
          note: `\`x = ${x}\` 就是 \`target\`，找到了，回傳 \`True\`。`,
          views: views(mid, "good"),
          vars: { target, lo, mid, hi, x },
          result: py(true),
        });
        return t.frames;
      }

      if (x < target) {
        lo = mid + 1;
        t.push({
          line: [10, 11],
          note: `\`${x} < ${target}\`：一維順序中 \`mid\` 和它之前的格子都太小（包含上面的整列），全部丟掉 → \`lo = ${lo}\`。`,
          views: views(mid, null),
          vars: { target, lo, mid, hi, x },
        });
      } else {
        hi = mid - 1;
        t.push({
          line: [12, 13],
          note: `\`${x} > ${target}\`：一維順序中 \`mid\` 和它之後的格子都太大（包含下面的整列），全部丟掉 → \`hi = ${hi}\`。`,
          views: views(mid, null),
          vars: { target, lo, mid, hi, x },
        });
      }
    }

    t.push({
      line: 14,
      note: `\`lo = ${lo} > hi = ${hi}\`，搜尋範圍空了，每一格都被排除，矩陣裡沒有 \`${target}\`，回傳 \`False\`。`,
      views: views(null, null),
      vars: { target, lo, hi },
      result: py(false),
    });
    return t.frames;
  },
});
