import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        res = []
        q = deque([root])
        while q:
            total, size = 0, len(q)
            for _ in range(size):
                node = q.popleft()
                total += node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(total / size)
        return res`;

/** Python 的 float 表示法：整數值也要帶 `.0` */
const pf = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

export default defineProblem<{ root: (number | null)[] }>({
  id: 637,
  summary:
    "給一棵非空二元樹的根節點，算出**每一層節點值的平均**，由上到下依序放進陣列回傳（浮點數）。",
  examples: [
    { input: "root = [3,9,20,null,null,15,7]", output: "[3.0,14.5,11.0]", note: "第 1 層 (9 + 20) / 2 = 14.5" },
    { input: "root = [3,9,20,15,7]", output: "[3.0,14.5,11.0]" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 10⁴", "−2³¹ ≤ Node.val ≤ 2³¹ − 1"],
  idea:
    "層序走訪（BFS）的直接應用：每一輪開始時佇列長度 `size` 就是這一層的節點數，把這 `size` 個節點的值加總成 `total`，平均就是 `total / size`。",
  steps: [
    "把 root 放進佇列。",
    "每一輪先記下 `size = len(q)`，並把 `total` 歸零。",
    "pop 出 `size` 個節點：值加進 `total`，左右小孩 push 進佇列（它們屬於下一層）。",
    "這一層結束，把 `total / size` 加進 `res`。",
  ],
  pitfalls: [
    "`size` 要在迴圈**開始前**先存起來：迴圈中佇列會被塞進下一層的小孩，長度已經不是這一層的節點數了。",
    "要用真除法 `/`（不是 `//`），答案才會是浮點數。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        `,
  presets: [
    { label: "[3,9,20,null,null,15,7]", input: { root: [3, 9, 20, null, null, 15, 7] }, expected: "[3.0, 14.5, 11.0]" },
    { label: "含負數 [2,-4,7,1,null,5,3]", input: { root: [2, -4, 7, 1, null, 5, 3] }, expected: "[2.0, 1.5, 3.0]" },
    { label: "單一節點 [5]", input: { root: [5] }, expected: "[5.0]" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0)!;
    const spec = treeSpec(root);

    const res: number[] = [];
    const q: BTNode[] = [root];
    const done = new Set<string>();
    const fmtRes = () => `[${res.map(pf).join(", ")}]`;
    const views = (o: { level?: BTNode[]; node?: BTNode; newest?: boolean } = {}) => {
      const m: Record<string, Tone> = {};
      done.forEach((id) => (m[id] = "visited"));
      q.forEach((n) => (m[n.id] = "compare"));
      o.level?.forEach((n) => (m[n.id] = "good"));
      if (o.node) m[o.node.id] = "active";
      return [
        V.tree("tree", spec, { marks: m, pointers: o.node ? { node: o.node.id } : {} }),
        V.queue("q", q.map((n) => n.val)),
        V.array("res", res.map(pf), { marks: o.newest ? { [res.length - 1]: "good" } : {} }),
      ];
    };

    t.push({
      line: [3, 4],
      note: "把 root 放進佇列。之後每一輪處理一整層，順便把這一層的值加總。",
      views: views(),
    });

    let depth = 0;
    while (q.length) {
      const size = q.length;
      let total = 0;
      t.push({
        line: [5, 6],
        note: `佇列裡有 ${size} 個節點 —— 這就是第 ${depth} 層的節點數，先存進 \`size\`（等一下佇列長度會變）。\`total\` 從 0 開始累加。`,
        views: views(),
        vars: { 層: depth, size, total },
      });

      const level: BTNode[] = [];
      for (let k = 0; k < size; k++) {
        const node = q.shift()!;
        const before = total;
        total += node.val;
        level.push(node);
        const kids = [node.left, node.right].filter((c): c is BTNode => c !== null);
        q.push(...kids);
        t.push({
          line: kids.length ? [7, 8, 9, 10, 11, 12, 13] : [7, 8, 9],
          note:
            `取出 \`${node.val}\`，\`total = ${before} + ${node.val < 0 ? `(${node.val})` : node.val} = ${total}\`。` +
            (kids.length
              ? `小孩 ${kids.map((c) => `\`${c.val}\``).join("、")} 排進佇列，屬於下一層，不影響這一層的 \`size\`。`
              : "它沒有小孩。"),
          views: views({ node }),
          vars: { 層: depth, size, total },
        });
        done.add(node.id);
      }

      const avg = total / size;
      res.push(avg);
      t.push({
        line: 14,
        note: `第 ${depth} 層走完：平均 = \`total / size = ${total} / ${size} = ${pf(avg)}\`，加進 \`res\`。`,
        views: views({ level, newest: true }),
        vars: { 層: depth, size, total, 平均: pf(avg) },
      });
      depth++;
    }

    t.push({
      line: 15,
      note: `佇列空了，每一層的平均都算完，回傳 \`${fmtRes()}\`。`,
      views: views(),
      result: fmtRes(),
    });
    return t.frames;
  },
});
