import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        res = []
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        while top <= bottom and left <= right:
            for c in range(left, right + 1):  # 上邊：左 → 右
                res.append(matrix[top][c])
            top += 1
            for r in range(top, bottom + 1):  # 右邊：上 → 下
                res.append(matrix[r][right])
            right -= 1
            if top <= bottom:  # 還有列，才走下邊：右 → 左
                for c in range(right, left - 1, -1):
                    res.append(matrix[bottom][c])
                bottom -= 1
            if left <= right:  # 還有欄，才走左邊：下 → 上
                for r in range(bottom, top - 1, -1):
                    res.append(matrix[r][left])
                left += 1
        return res`;

export default defineProblem<{ matrix: number[][] }>({
  id: 54,
  summary:
    "給一個 `m × n` 的矩陣，從左上角出發，照**順時針螺旋**的順序（往右 → 往下 → 往左 → 往上，一圈一圈往內）把所有元素讀出來，回傳這個順序的陣列。",
  summaryEn:
    "Given an `m × n` matrix, start at the top-left corner and read every element in **clockwise spiral** order (right -> down -> left -> up, working inward one ring at a time). Return the elements as an array in that order.",
  examples: [
    { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]" },
    { input: "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]" },
  ],
  constraints: ["1 ≤ m, n ≤ 10"],
  constraintsEn: ["1 ≤ m, n ≤ 10"],
  idea:
    "用四條邊界 `top`、`bottom`、`left`、`right` 圍住**還沒讀的區域**。每走完一條邊，就把那條邊界往內縮一格 —— 邊界本身就記住了「哪裡走過」，不需要額外的 visited 陣列。",
  steps: [
    "`top / bottom / left / right` 一開始貼著矩陣的四個邊。",
    "走上邊（左 → 右），然後 `top += 1`。",
    "走右邊（上 → 下），然後 `right -= 1`。",
    "若 `top <= bottom`，走下邊（右 → 左），然後 `bottom -= 1`。",
    "若 `left <= right`，走左邊（下 → 上），然後 `left += 1`。",
    "只要邊界還沒交錯就繼續下一圈。",
  ],
  pitfalls: [
    "下邊和左邊前面的 `if` 不能省：只剩一列或一欄時，上邊／右邊已經把它讀完了，少了檢查會**重複讀一次**。",
    "往回走的 `range` 終點要寫 `left - 1`、`top - 1`，因為 `range` 不含終點。",
  ],
  complexity: { time: "O(m·n)", space: "O(1)（不含輸出）" },
  code,
  starter: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        `,
  presets: [
    {
      label: "3×4",
      input: { matrix: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]] },
      expected: "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]",
    },
    {
      label: "3×3",
      input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
      expected: "[1, 2, 3, 6, 9, 8, 7, 4, 5]",
    },
    { label: "只有一列", input: { matrix: [[1, 2, 3, 4]] }, expected: "[1, 2, 3, 4]" },
  ],
  trace({ matrix }) {
    const t = tracer();
    const m = matrix.length;
    const n = matrix[0].length;
    const res: number[] = [];
    const done = new Set<string>();
    let top = 0;
    let bottom = m - 1;
    let left = 0;
    let right = n - 1;

    const view = (edge: [number, number][] = [], final = false) => {
      const marks: Record<string, Tone> = {};
      done.forEach((k) => (marks[k] = final ? "good" : "visited"));
      edge.forEach(([r, c]) => (marks[`${r},${c}`] = "active"));
      const rowLabels: Cell[] = matrix.map((_, r) =>
        final ? r : r === top && r === bottom ? "top=bottom" : r === top ? "top" : r === bottom ? "bottom" : r,
      );
      const colLabels: Cell[] = matrix[0].map((_, c) =>
        final ? c : c === left && c === right ? "L=R" : c === left ? "left" : c === right ? "right" : c,
      );
      const resMarks: Record<number, Tone> = {};
      for (let k = 0; k < res.length; k++)
        if (final) resMarks[k] = "good";
        else if (k >= res.length - edge.length) resMarks[k] = "active";
      return [V.grid("matrix", matrix, { marks, rowLabels, colLabels }), V.array("res", res, { marks: resMarks })];
    };
    const vars = () => ({ top, bottom, left, right });
    const walk = (edge: [number, number][]) => {
      edge.forEach(([r, c]) => {
        res.push(matrix[r][c]);
        done.add(`${r},${c}`);
      });
      return edge.map(([r, c]) => `\`${matrix[r][c]}\``).join("、");
    };

    t.push({
      line: [3, 4, 5],
      note: "四條邊界 `top`、`bottom`、`left`、`right` 先貼著矩陣外緣，圍住的就是「還沒讀的區域」。",
      views: view(),
      vars: vars(),
    });

    while (top <= bottom && left <= right) {
      let edge: [number, number][] = [];
      for (let c = left; c <= right; c++) edge.push([top, c]);
      let got = walk(edge);
      top++;
      t.push({
        line: [7, 8, 9],
        note: `**上邊**由左到右：讀 ${got}。這一列讀完了，\`top\` 往下縮成 ${top}。`,
        views: view(edge),
        vars: vars(),
      });

      edge = [];
      for (let r = top; r <= bottom; r++) edge.push([r, right]);
      got = walk(edge);
      right--;
      t.push({
        line: [10, 11, 12],
        note: edge.length
          ? `**右邊**由上到下：讀 ${got}（右上角剛剛讀過，所以從新的 \`top\` 開始）。\`right\` 往左縮成 ${right}。`
          : `**右邊**：\`top\` 已經超過 \`bottom\`，這一欄沒有剩下的格子。\`right\` 照樣往左縮成 ${right}。`,
        views: view(edge),
        vars: vars(),
      });

      if (top <= bottom) {
        edge = [];
        for (let c = right; c >= left; c--) edge.push([bottom, c]);
        got = walk(edge);
        bottom--;
        t.push({
          line: [13, 14, 15, 16],
          note: edge.length
            ? `\`top <= bottom\`，還有列沒讀。**下邊**由右到左：讀 ${got}。\`bottom\` 往上縮成 ${bottom}。`
            : `\`top <= bottom\`，但 \`right < left\`，下邊沒有剩下的格子。\`bottom\` 往上縮成 ${bottom}。`,
          views: view(edge),
          vars: vars(),
        });
      } else {
        t.push({
          line: 13,
          note: `\`top = ${top} > bottom = ${bottom}\`：已經沒有剩下的列了。如果這裡硬走下邊，會把剛才上邊讀過的那一列**再讀一次**，所以跳過。`,
          views: view(),
          vars: vars(),
        });
      }

      if (left <= right) {
        edge = [];
        for (let r = bottom; r >= top; r--) edge.push([r, left]);
        got = walk(edge);
        left++;
        t.push({
          line: [17, 18, 19, 20],
          note: edge.length
            ? `\`left <= right\`，還有欄沒讀。**左邊**由下到上：讀 ${got}。\`left\` 往右縮成 ${left}，一圈走完。`
            : `\`left <= right\`，但 \`bottom < top\`，左邊沒有剩下的格子。\`left\` 往右縮成 ${left}。`,
          views: view(edge),
          vars: vars(),
        });
      } else {
        t.push({
          line: 17,
          note: `\`left = ${left} > right = ${right}\`：已經沒有剩下的欄了，跳過左邊，避免重複讀。`,
          views: view(),
          vars: vars(),
        });
      }
    }

    t.push({
      line: [6, 21],
      note: `邊界交錯了（${top > bottom ? "`top > bottom`" : "`left > right`"}），表示所有格子都讀過，回傳 \`res\`。`,
      views: view([], true),
      vars: vars(),
      result: py(res),
    });
    return t.frames;
  },
});
