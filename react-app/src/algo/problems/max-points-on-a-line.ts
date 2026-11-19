import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
        res = 1
        for i in range(len(points)):
            x1, y1 = points[i]
            slopes = defaultdict(int)  # 化簡後的 (dy, dx) -> 有幾個點
            for j in range(i + 1, len(points)):
                dx = points[j][0] - x1
                dy = points[j][1] - y1
                g = gcd(dx, dy)
                dx, dy = dx // g, dy // g
                if dx < 0 or (dx == 0 and dy < 0):
                    dx, dy = -dx, -dy  # 統一方向：(1, 2) 和 (-1, -2) 是同一條線
                slopes[(dy, dx)] += 1
                res = max(res, slopes[(dy, dx)] + 1)  # +1 是錨點自己
        return res`;

const PLANE = "平面上的點（標籤是座標 x,y）";

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

export default defineProblem<{ points: number[][] }>({
  id: 149,
  summary:
    "給平面上一些**互不相同**的整數座標點 `points[i] = [x, y]`，問**最多有幾個點落在同一條直線上**。",
  examples: [
    { input: "points = [[1,1],[2,2],[3,3]]", output: "3" },
    { input: "points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]", output: "4" },
  ],
  constraints: ["1 ≤ points.length ≤ 300", "−10⁴ ≤ x, y ≤ 10⁴", "所有點都不重複"],
  idea:
    "固定一個點當**錨點**，通過它的直線完全由**斜率**決定：其他點只要相對於錨點的斜率相同，就一定在同一條線上。所以對每個錨點開一張雜湊表，數「每種斜率有幾個點」，最大的那組加上錨點自己就是通過它的最佳直線。斜率不要用浮點數（會有誤差），改用 `gcd` 化簡後的整數對 `(dy, dx)` 當 key。",
  steps: [
    "依序讓每個點 `i` 當錨點，建立一張新的 `slopes` 表。",
    "對後面的每個點 `j`，算出 `dx`、`dy`，除以 `gcd(dx, dy)` 化成最簡。",
    "統一方向：讓 `dx > 0`（或 `dx == 0` 時 `dy > 0`），否則同一條線會被算成兩個 key。",
    "`slopes[(dy, dx)] += 1`，並用「這組的點數 + 1（錨點）」更新 `res`。",
    "只需要看 `j > i`：包含更前面的點的直線，在那個點當錨點時已經算過了。",
  ],
  pitfalls: [
    "用 `dy / dx` 浮點數當 key 會遇到精度問題，垂直線還會除以 0。",
    "化簡後要統一正負號：`(1, 2)` 與 `(-1, -2)` 方向相反但是同一條線。",
    "每換一個錨點都要用**新的**雜湊表；斜率相同但不經過同一個錨點的是平行線，不是同一條線。",
    "只有一個點時答案是 1，所以 `res` 從 1 開始。",
  ],
  complexity: { time: "O(n² · log M)（M 為座標範圍，來自 gcd）", space: "O(n)" },
  code,
  starter: `class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
        `,
  presets: [
    {
      label: "[[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]",
      input: { points: [[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]] },
      expected: "4",
    },
    {
      label: "[[2,1],[0,2],[2,3],[4,2],[2,4]]",
      input: { points: [[2, 1], [0, 2], [2, 3], [4, 2], [2, 4]] },
      expected: "3",
    },
    { label: "[[1,1],[2,2],[3,3]]", input: { points: [[1, 1], [2, 2], [3, 3]] }, expected: "3" },
  ],
  trace({ points }) {
    const t = tracer();
    const n = points.length;
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const norm = (v: number, lo: number, hi: number) => (hi === lo ? 0.5 : (v - lo) / (hi - lo));
    const id = (k: number) => `p${k}`;
    const at = (k: number) => `(${points[k][0]}, ${points[k][1]})`;
    // y 軸朝上，所以畫面上的 y 要反過來
    const nodes = points.map(([x, y], k) => ({
      id: id(k),
      label: `${x},${y}`,
      x: norm(x, minX, maxX),
      y: 1 - norm(y, minY, maxY),
    }));

    let res = 1;
    let best: number[] = [0]; // 目前最佳直線上的點（最後一格用來上色）

    const graph = (
      edges: { from: string; to: string }[],
      marks: Record<string, Tone>,
      edgeMarks: Record<string, Tone>,
      pointers: Record<string, string | null>,
    ) => V.graph(PLANE, { nodes, edges }, { marks, edgeMarks, pointers });

    t.push({
      line: 3,
      note: `共有 ${n} 個點。任何一個點自己就算「一條線上有 1 個點」，所以 \`res\` 從 1 開始。接下來輪流讓每個點當**錨點**，看通過它的直線最多能串起幾個點。`,
      views: [graph([], {}, {}, {}), V.map("slopes", [])],
      vars: { res },
    });

    for (let i = 0; i < n; i++) {
      const [x1, y1] = points[i];
      const slopes = new Map<Cell, Cell>();
      const members = new Map<string, number[]>(); // key → 這個斜率上的點
      const edges: { from: string; to: string }[] = [];
      const baseMarks = (): Record<string, Tone> => {
        const m: Record<string, Tone> = {};
        for (let k = 0; k < i; k++) m[id(k)] = "muted";
        m[id(i)] = "active";
        return m;
      };

      t.push({
        line: [4, 5, 6],
        note:
          `以 \`points[${i}] = ${at(i)}\` 當錨點，開一張**新的** \`slopes\` 表。` +
          (i === n - 1
            ? "它後面已經沒有點了，內層迴圈不會執行。"
            : i > 0
              ? "前面的點（變淡的）不用再看：包含它們的直線在它們當錨點時已經算過。"
              : "通過錨點的直線由斜率決定 —— 斜率相同的點就在同一條線上。"),
        views: [graph([], baseMarks(), {}, { i: id(i) }), V.map("slopes", slopes)],
        vars: { i, x1, y1, res },
      });

      for (let j = i + 1; j < n; j++) {
        const rawDx = points[j][0] - x1;
        const rawDy = points[j][1] - y1;
        const g = gcd(rawDx, rawDy);
        let dx = rawDx / g;
        let dy = rawDy / g;
        const flipped = dx < 0 || (dx === 0 && dy < 0);
        if (flipped) {
          dx = -dx;
          dy = -dy;
        }
        const key = `(${dy}, ${dx})`;
        const group = [...(members.get(key) ?? []), j];
        members.set(key, group);
        slopes.set(key, group.length);
        edges.push({ from: id(i), to: id(j) });
        const improved = group.length + 1 > res;
        if (improved) {
          res = group.length + 1;
          best = [i, ...group];
        }

        const marks = baseMarks();
        const edgeMarks: Record<string, Tone> = {};
        group.forEach((k) => {
          marks[id(k)] = "good";
          edgeMarks[`${id(i)}>${id(k)}`] = "good";
        });
        marks[id(j)] = group.length > 1 ? "good" : "compare";
        edgeMarks[`${id(i)}>${id(j)}`] = group.length > 1 ? "good" : "active";

        const simp =
          g > 1 && flipped
            ? `除以 \`gcd = ${g}\` 再整組變號（統一方向）後，`
            : g > 1
              ? `除以 \`gcd = ${g}\` 後，`
              : flipped
                ? "整組變號（統一方向）後，"
                : "已是最簡，";
        const outcome =
          group.length > 1
            ? `這個 key 出現過：它和 ${group
                .slice(0, -1)
                .map((k) => `\`${at(k)}\``)
                .join("、")} 跟錨點**共線**，線上共 ${group.length + 1} 點。`
            : "第一次出現，這條線上只有錨點和它 2 點。";
        t.push({
          line: flipped ? [7, 8, 9, 10, 11, 12, 13, 14, 15] : [7, 8, 9, 10, 11, 12, 14, 15],
          note:
            `\`points[${j}] = ${at(j)}\`：相對錨點 \`dx = ${rawDx}, dy = ${rawDy}\`，${simp}key 是 \`${key}\`。${outcome}` +
            (improved ? `\`res\` 更新為 **${res}**。` : ""),
          views: [
            graph(edges, marks, edgeMarks, { i: id(i), j: id(j) }),
            V.map("slopes", slopes, { marks: { [key]: group.length > 1 ? "good" : "active" } }),
          ],
          vars: { i, j, dx, dy, g, "slopes[(dy, dx)]": group.length, res },
        });
      }
    }

    // 把最佳直線上的點依位置排序後連起來
    const line = [...best].sort((a, b) => points[a][0] - points[b][0] || points[a][1] - points[b][1]);
    const finalEdges = line.slice(1).map((k, idx) => ({ from: id(line[idx]), to: id(k) }));
    const finalMarks: Record<string, Tone> = {};
    points.forEach((_, k) => (finalMarks[id(k)] = best.includes(k) ? "good" : "muted"));
    const finalEdgeMarks: Record<string, Tone> = {};
    finalEdges.forEach((e) => (finalEdgeMarks[`${e.from}>${e.to}`] = "good"));
    t.push({
      line: 16,
      note:
        res === 1
          ? "只有一個點，答案就是 1。"
          : `每個點都當過錨點了。最多的一條線串起了 **${res}** 個點：${line.map((k) => `\`${at(k)}\``).join("、")}。`,
      views: [graph(finalEdges, finalMarks, finalEdgeMarks, {}), V.map("slopes", [])],
      vars: { res },
      result: py(res),
    });
    return t.frames;
  },
});
