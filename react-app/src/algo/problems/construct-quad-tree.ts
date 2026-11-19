import { defineProblem } from "../types";
import type { Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def construct(self, grid: List[List[int]]) -> 'Node':
        def build(r: int, c: int, size: int) -> 'Node':
            if size == 1:                         # 單一格子一定是葉子
                return Node(grid[r][c] == 1, True, None, None, None, None)
            half = size // 2
            tl = build(r, c, half)                # 左上
            tr = build(r, c + half, half)         # 右上
            bl = build(r + half, c, half)         # 左下
            br = build(r + half, c + half, half)  # 右下
            kids = [tl, tr, bl, br]
            # 四塊都是葉子而且值相同 → 整塊同一種值，合併成一個葉子
            if all(k.isLeaf for k in kids) and len({k.val for k in kids}) == 1:
                return Node(tl.val, True, None, None, None, None)
            return Node(True, False, tl, tr, bl, br)

        return build(0, 0, len(grid))`;

interface Q {
  id: string;
  r: number;
  c: number;
  size: number;
  state: "pending" | "leaf" | "inner";
  val: boolean;
  kids: Q[];
}

const DIR = ["左上", "右上", "左下", "右下"];
const ARROW = ["↖", "↗", "↙", "↘"];

export default defineProblem<{ grid: number[][] }>({
  id: 427,
  summary:
    "給一個只有 `0` 和 `1` 的 `n × n` 方陣 `grid`（`n` 是 2 的次方），用**四元樹**來表示它，回傳樹的根節點。\n\n四元樹的每個節點代表一塊正方形區域：如果整塊的值都一樣，它就是**葉子**（`isLeaf = True`，`val` 是那個值）；否則把這塊區域切成左上、右上、左下、右下四等分，各自成為它的四個小孩。",
  summaryEn:
    "You get an `n × n` matrix `grid` holding only `0` and `1` (`n` is a power of 2). Represent it as a **quad tree** and return the root.\n\nEach quad-tree node covers a square region. If every value in that region is the same, the node is a **leaf** (`isLeaf = True`, `val` is that value); otherwise the region is split into four equal quadrants (top-left, top-right, bottom-left, bottom-right), which become its four children.",
  examples: [
    { input: "grid = [[0,1],[1,0]]", output: "[[0,1],[1,0],[1,1],[1,1],[1,0]]", note: "每個節點寫成 [isLeaf, val]，照層序列出", noteEn: "Each node is written as [isLeaf, val], listed in level order" },
    { input: "grid = [[1,1],[1,1]]", output: "[[1,1]]", note: "整塊都是 1，一個葉子就夠了", noteEn: "The whole grid is 1, so a single leaf is enough" },
  ],
  constraints: ["n == grid.length == grid[i].length", "n = 2ˣ，0 ≤ x ≤ 6"],
  constraintsEn: ["n == grid.length == grid[i].length", "n = 2ˣ, 0 ≤ x ≤ 6"],
  idea:
    "與其每到一塊區域就掃一遍檢查「是不是全部相同」，不如**由下往上**：先把四個小區塊各自建好，再看結果 —— 如果四個小孩**都是葉子而且值相同**，代表這一整塊都是同一個值，直接合併成一個葉子；否則才建立帶四個小孩的內部節點。這樣每個格子只會被看一次。",
  steps: [
    "`build(r, c, size)` 負責左上角在 `(r, c)`、邊長 `size` 的正方形。",
    "`size == 1`：單一格子，回傳葉子，`val` 就是那格的值。",
    "否則切成四個邊長 `size // 2` 的區塊，依左上、右上、左下、右下的順序遞迴建好。",
    "四個小孩都是葉子且 `val` 相同 → 回傳一個合併後的葉子。",
    "否則回傳內部節點（`isLeaf = False`），把四個小孩接上去。",
  ],
  pitfalls: [
    "合併的條件有兩個，缺一不可：四個小孩**都是葉子**，而且**值相同**。只比 `val` 會把內部節點也誤合併掉。",
    "`Node` 建構子的參數順序是 `val, isLeaf, topLeft, topRight, bottomLeft, bottomRight`，`val` 在 `isLeaf` 前面。",
    "右上是 `(r, c + half)`、左下是 `(r + half, c)`，列和行不要加反。",
  ],
  complexity: { time: "O(n²)", space: "O(log n)（遞迴深度，不含輸出的樹）" },
  code,
  starter: `class Solution:
    def construct(self, grid: List[List[int]]) -> 'Node':
        `,
  presets: [
    {
      label: "4 × 4",
      input: {
        grid: [
          [1, 1, 0, 0],
          [1, 1, 0, 0],
          [1, 0, 1, 1],
          [0, 1, 1, 1],
        ],
      },
      expected: "[[0, 1], [1, 1], [1, 0], [0, 1], [1, 1], None, None, None, None, None, None, None, None, [1, 1], [1, 0], [1, 0], [1, 1]]",
    },
    {
      // (was LeetCode's 8 × 8 example: same tree shape as preset 1 but a 370px-tall grid)
      label: "4 × 4（全是 1）",
      input: {
        grid: [
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1],
          [1, 1, 1, 1],
        ],
      },
      expected: "[[1, 1]]",
    },
    {
      label: "2 × 2",
      input: {
        grid: [
          [0, 1],
          [1, 0],
        ],
      },
      expected: "[[0, 1], [1, 0], [1, 1], [1, 1], [1, 0]]",
    },
  ],
  trace({ grid }) {
    const t = tracer();
    const n = grid.length;
    const labels = Array.from({ length: n }, (_, i) => i);
    let root: Q | null = null;
    const stack: Q[] = [];

    const make = (r: number, c: number, size: number, parent: Q | null): Q => {
      const q: Q = { id: `q${r}_${c}_${size}`, r, c, size, state: "pending", val: false, kids: [] };
      if (parent) parent.kids.push(q);
      else root = q;
      return q;
    };
    const leafTone = (q: Q): Tone => (q.val ? "good" : "muted");
    const where = (q: Q) =>
      q.size === 1 ? `格子 \`(${q.r}, ${q.c})\`` : `左上角 \`(${q.r}, ${q.c})\`、邊長 ${q.size} 的區塊`;

    /** `cur` = the square being worked on, drawn with `tone` */
    const views = (cur?: Q, tone: Tone = "active") => {
      const gm: Record<string, Tone> = {};
      const fill = (q: Q, tn: Tone) => {
        for (let r = q.r; r < q.r + q.size; r++) for (let c = q.c; c < q.c + q.size; c++) gm[`${r},${c}`] = tn;
      };
      const nodes: TreeNodeSpec[] = [];
      const tm: Record<string, Tone> = {};
      const edgeLabels: Record<string, string> = {};
      const walk = (q: Q) => {
        nodes.push({
          id: q.id,
          val: q.state === "pending" ? "?" : q.state === "leaf" ? (q.val ? 1 : 0) : "⊞",
          children: q.kids.map((k) => k.id),
        });
        if (q.state === "leaf") {
          tm[q.id] = leafTone(q);
          fill(q, leafTone(q));
        }
        q.kids.forEach((k, i) => {
          edgeLabels[`${q.id}>${k.id}`] = ARROW[i];
          walk(k);
        });
      };
      if (root) walk(root);
      stack.forEach((q, i) => {
        if (q.state !== "leaf") tm[q.id] = i === stack.length - 1 ? "active" : "compare";
      });
      if (cur) {
        fill(cur, tone);
        tm[cur.id] = tone;
      }
      return [
        V.grid("grid（綠 = 值為 1 的葉子，灰 = 值為 0 的葉子）", grid, { marks: gm, rowLabels: labels, colLabels: labels }),
        V.tree(
          "四元樹（⊞ = 內部節點，數字 = 葉子的值）",
          { nodes, root: root ? (root as Q).id : null },
          { marks: tm, edgeLabels },
        ),
        V.stack(
          "呼叫堆疊",
          stack.map((q) => `build(${q.r}, ${q.c}, ${q.size})`),
        ),
      ];
    };

    t.push({
      line: 17,
      note: `從整個 ${n} × ${n} 的方陣開始：\`build(0, 0, ${n})\`。做法是由下往上 —— 先把四個小區塊建好，再決定要不要合併。`,
      views: views(),
      vars: { n },
    });

    const build = (r: number, c: number, size: number, parent: Q | null): Q => {
      const q = make(r, c, size, parent);
      stack.push(q);

      if (size === 1) {
        // Only reached for a 1 × 1 grid; larger grids handle 1 × 1 cells four at a time below
        q.state = "leaf";
        q.val = grid[r][c] === 1;
        t.push({
          line: [4, 5],
          note: `\`size == 1\`，單一格子一定是葉子，\`val\` 就是這格的值 \`${grid[r][c]}\`。`,
          views: views(q, leafTone(q)),
          vars: { r, c, size },
        });
        stack.pop();
        return q;
      }

      const half = size / 2;
      const corners: [number, number][] = [
        [r, c],
        [r, c + half],
        [r + half, c],
        [r + half, c + half],
      ];
      if (half === 1) {
        for (const [kr, kc] of corners) {
          const k = make(kr, kc, 1, q);
          k.state = "leaf";
          k.val = grid[kr][kc] === 1;
        }
        t.push({
          line: [6, 7, 8, 9, 10, 4, 5],
          note:
            `處理${where(q)}：\`half = 1\`，切成四個 1 × 1 的格子。單一格子一定是葉子，值依序是 ` +
            q.kids.map((k, i) => `${DIR[i]} \`${k.val ? 1 : 0}\``).join("、") +
            "。",
          views: views(q),
          vars: { r, c, size, half },
        });
      } else {
        t.push({
          line: [6, 7],
          note: `處理${where(q)}：還不知道它是不是同一種值，先切成四個邊長 ${half} 的小區塊，依左上 → 右上 → 左下 → 右下的順序各自建好。`,
          views: views(q),
          vars: { r, c, size, half },
        });
        for (const [kr, kc] of corners) build(kr, kc, half, q);
      }

      const kids = q.kids;
      const allLeaf = kids.every((k) => k.state === "leaf");
      const same = kids.every((k) => k.val === kids[0].val);
      const desc = kids.map((k) => (k.state === "leaf" ? (k.val ? "1" : "0") : "⊞")).join("、");
      if (allLeaf && same) {
        q.state = "leaf";
        q.val = kids[0].val;
        q.kids = [];
        t.push({
          line: [11, 13, 14],
          note: `${where(q)}的四個小孩是 ${desc}：**都是葉子而且值都是 \`${q.val ? 1 : 0}\`**，代表整塊都是同一個值。丟掉四個小孩，**合併**成一個值為 \`${q.val ? 1 : 0}\` 的葉子。`,
          views: views(q, "compare"),
          vars: { r, c, size, isLeaf: true, val: q.val },
        });
      } else {
        q.state = "inner";
        q.val = true;
        const why = !allLeaf
          ? `其中 ${kids.map((k, i) => (k.state === "inner" ? DIR[i] : "")).filter(Boolean).join("、")} 不是葉子（裡面還有不同的值）`
          : "雖然都是葉子，但值不全相同";
        t.push({
          line: [11, 13, 15],
          note: `${where(q)}的四個小孩是 ${desc}：${why}，不能合併。建立**內部節點** ⊞（\`isLeaf = False\`），把四個小孩接上去。`,
          views: views(q, "active"),
          vars: { r, c, size, isLeaf: false },
        });
      }
      stack.pop();
      return q;
    };
    const tree = build(0, 0, n, null);

    // LeetCode's serialisation: level order of [isLeaf, val]; a leaf contributes four nulls
    const out: (number[] | null)[] = [];
    const queue: (Q | null)[] = [tree];
    while (queue.length) {
      const q = queue.shift()!;
      if (!q) {
        out.push(null);
        continue;
      }
      out.push([q.state === "leaf" ? 1 : 0, q.val ? 1 : 0]);
      if (q.state === "leaf") queue.push(null, null, null, null);
      else queue.push(...q.kids);
    }
    while (out.length && out[out.length - 1] === null) out.pop();

    const leaves = out.filter((x) => x && x[0] === 1).length;
    t.push({
      line: 17,
      note: `完成。${n * n} 個格子最後只用了 ${leaves} 個葉子就表示完了 —— 大片相同的區域被壓成一個節點，這就是四元樹的用途。（結果以 \`[isLeaf, val]\` 的層序列出。）`,
      views: views(),
      vars: { n, 葉子數: leaves },
      result: py(out),
    });
    return t.frames;
  },
});
