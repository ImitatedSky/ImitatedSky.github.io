import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = -inf

        def gain(node):
            nonlocal best
            if not node:
                return 0
            left = max(gain(node.left), 0)   # 負的貢獻不如不要
            right = max(gain(node.right), 0)
            best = max(best, node.val + left + right)  # 以 node 為最高點的路徑
            return node.val + max(left, right)         # 往上只能帶一邊

        gain(root)
        return best`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 124,
  summary:
    "在二元樹裡，「路徑」是一串沿著邊相連的節點，每個節點最多經過一次；路徑**不一定要經過根節點**，也不一定要走到葉節點，但至少要有一個節點。\n\n路徑和是路徑上所有節點值的總和。請回傳整棵樹裡**最大的路徑和**。節點值可能是負數。",
  summaryEn:
    "In a binary tree, a path is a chain of nodes connected by edges, visiting each node at most once. A path **does not have to pass through the root** or reach a leaf, but it must contain at least one node.\n\nA path's sum is the total of its node values. Return the **largest path sum** anywhere in the tree. Node values can be negative.",
  examples: [
    { input: "root = [1,2,3]", output: "6", note: "2 → 1 → 3", noteEn: "2 → 1 → 3" },
    { input: "root = [-10,9,20,null,null,15,7]", output: "42", note: "15 → 20 → 7，不經過根", noteEn: "15 → 20 → 7, skipping the root" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 3 × 10⁴", "-1000 ≤ Node.val ≤ 1000"],
  constraintsEn: ["1 ≤ number of nodes ≤ 3 × 10⁴", "-1000 ≤ Node.val ≤ 1000"],
  idea:
    "任何一條路徑都有一個**最高點**：從它往左下延伸一段、往右下延伸一段。所以對每個節點算兩件事 —— (1) 把它當最高點時的路徑和 `val + left + right`，用來更新答案；(2) 它能往上「貢獻」多少，也就是 `val + max(left, right)`，因為接到父節點的路徑不能分岔，只能挑一邊。子樹的貢獻如果是負的，乾脆不要（當成 0）。",
  steps: [
    "`gain(node)` 回傳「從 `node` 往下走一條不分岔的路，最大能拿到多少」。空節點是 0。",
    "後序走訪：先拿到左右小孩的 gain，負的就取 0（等於不往那邊走）。",
    "用 `node.val + left + right` 更新全域答案 `best`：這是以 `node` 為最高點、兩邊都接上的路徑。",
    "回傳 `node.val + max(left, right)` 給父節點：只能選比較好的一邊。",
  ],
  pitfalls: [
    "`best` 要從 `-inf` 開始，不能是 0：整棵樹都是負數時，答案是最大的那個負數。",
    "回傳值和更新答案用的式子**不一樣**：更新 `best` 時兩邊都加，回傳時只能加一邊。",
    "`max(..., 0)` 是套在小孩的 gain 上，不是套在回傳值上 —— 節點自己的值再負也得算進去。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        `,
  presets: [
    { label: "[-10,9,20,null,null,15,7]", input: { root: [-10, 9, 20, null, null, 15, 7] }, expected: "42" },
    {
      label: "[5,4,8,11,null,13,4,7,2,null,null,null,1]",
      input: { root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1] },
      expected: "48",
    },
    { label: "[-3,-2,-5]（全是負數）", input: { root: [-3, -2, -5] }, expected: "-2" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    if (!root) {
      t.push({ line: 15, note: "題目保證至少有一個節點；空樹沒有路徑。", views: [V.tree("tree", spec)], result: "-inf" });
      return t.frames;
    }

    let best = -Infinity;
    let bestPath: BTNode[] = []; // 目前最佳路徑（由左端到右端）
    const calls: string[] = [];
    const done = new Set<string>();
    const gains: Record<string, number> = {};
    const chain: Record<string, BTNode[]> = {}; // 各節點往下的最佳單邊路徑（從自己開始）

    /** 一串相鄰節點 → 邊的 key（不知道誰是父節點，所以兩個方向都給） */
    const parentOf: Record<string, string> = {};
    const indexParents = (n: BTNode | null) => {
      if (!n) return;
      for (const c of [n.left, n.right])
        if (c) {
          parentOf[c.id] = n.id;
          indexParents(c);
        }
    };
    indexParents(root);
    const edgesOf = (nodes: BTNode[], tone: Tone) => {
      const out: Record<string, Tone> = {};
      for (let i = 0; i + 1 < nodes.length; i++) {
        const a = nodes[i].id;
        const b = nodes[i + 1].id;
        out[parentOf[b] === a ? `${a}>${b}` : `${b}>${a}`] = tone;
      }
      return out;
    };
    const fmtBest = () => (best === -Infinity ? "-inf" : best);
    const sgn = (x: number) => (x < 0 ? `(${x})` : `${x}`);

    const views = (cur: BTNode | null, cand: BTNode[] = [], candTone: Tone = "compare") => {
      const marks: Record<string, Tone> = {};
      done.forEach((id) => (marks[id] = "visited"));
      bestPath.forEach((n) => (marks[n.id] = "good"));
      cand.forEach((n) => (marks[n.id] = candTone));
      if (cur && candTone !== "good") marks[cur.id] = "active";
      const edgeMarks = { ...edgesOf(bestPath, "good"), ...edgesOf(cand, candTone) };

      const gainSpec = {
        root: spec.root,
        nodes: spec.nodes.map((n) => ({ ...n, val: (n.id in gains ? gains[n.id] : "·") as Cell })),
      };
      const gmarks: Record<string, Tone> = {};
      for (const [id, g] of Object.entries(gains)) gmarks[id] = g > 0 ? "good" : "muted";
      if (cur && !(cur.id in gains)) gmarks[cur.id] = "active";

      return [
        V.tree("tree（綠色 = 目前最佳路徑）", spec, { marks, edgeMarks, pointers: cur ? { node: cur.id } : {} }),
        V.tree("gain：往上最多能貢獻多少（負的會被當成 0）", gainSpec, { marks: gmarks }),
        V.stack("呼叫堆疊 gain(node)", calls, { marks: calls.length ? { [calls.length - 1]: "active" } : {} }),
      ];
    };

    t.push({
      line: 3,
      note: "`best` 從 `-inf` 開始，因為答案可能是負數。接下來用後序走訪，讓每個節點回報它的 `gain`。",
      views: views(null),
      vars: { best: fmtBest() },
    });

    const describe = (child: BTNode | null, side: "左" | "右", raw: number, name: string) => {
      if (!child) return `${side}邊沒有節點，\`gain(None)\` 回傳 0，\`${name} = 0\`。`;
      if (raw < 0)
        return `${side}子樹回報 gain = \`${raw}\`，是負的 —— 接上去只會讓總和變小，所以 \`${name} = max(${raw}, 0) = 0\`，等於不往${side}邊走。`;
      if (raw === 0) return `${side}子樹回報 gain = \`0\`，\`${name} = 0\`，接不接都一樣。`;
      return `${side}子樹回報 gain = \`${raw}\`，是正的，值得接上：\`${name} = ${raw}\`。`;
    };

    const gain = (node: BTNode): number => {
      calls.push(`gain(${node.val})`);
      const isLeaf = !node.left && !node.right;
      let left = 0;
      let right = 0;

      if (isLeaf) {
        t.push({
          line: [7, 9, 10],
          note: `走到葉節點 \`${node.val}\`。左右都是空的，\`gain(None)\` 回傳 0，所以 \`left = right = 0\`。`,
          views: views(node),
          vars: { left, right, best: fmtBest() },
        });
      } else {
        t.push({
          line: [7, 9],
          note: `走到 \`${node.val}\`。要先知道左右小孩各能貢獻多少，才能算自己 —— 這就是後序走訪。先問左邊。`,
          views: views(node),
          vars: { best: fmtBest() },
        });
        const rawL = node.left ? gain(node.left) : 0;
        left = Math.max(rawL, 0);
        t.push({
          line: node.left ? 9 : [8, 9],
          note: `回到 \`${node.val}\`：${describe(node.left, "左", rawL, "left")}接著問右邊。`,
          views: views(node),
          vars: { left, best: fmtBest() },
        });
        const rawR = node.right ? gain(node.right) : 0;
        right = Math.max(rawR, 0);
        t.push({
          line: node.right ? 10 : [8, 10],
          note: `回到 \`${node.val}\`：${describe(node.right, "右", rawR, "right")}`,
          views: views(node),
          vars: { left, right, best: fmtBest() },
        });
      }

      // 以 node 為最高點的路徑
      const through = node.val + left + right;
      const leftChain = left > 0 && node.left ? chain[node.left.id] : [];
      const rightChain = right > 0 && node.right ? chain[node.right.id] : [];
      const cand = [...[...leftChain].reverse(), node, ...rightChain];
      const improved = through > best;
      const prev = fmtBest();
      if (improved) {
        best = through;
        bestPath = cand;
      }
      t.push({
        line: 11,
        note:
          `把 \`${node.val}\` 當成路徑的**最高點**，左右兩邊都接上：\`${sgn(node.val)} + ${left} + ${right} = ${through}\`。` +
          (improved
            ? `比 \`best = ${prev}\` 大，更新 \`best = ${through}\`。`
            : `沒有比 \`best = ${prev}\` 大，答案不變。`),
        views: views(node, cand, improved ? "good" : "compare"),
        vars: { left, right, "val+left+right": through, best: fmtBest() },
      });

      const g = node.val + Math.max(left, right);
      const down = left >= right ? leftChain : rightChain;
      chain[node.id] = [node, ...down];
      gains[node.id] = g;
      done.add(node.id);
      t.push({
        line: 12,
        note:
          `要往上接到父節點的話，路徑不能在 \`${node.val}\` 分岔，只能帶比較好的一邊：` +
          `\`gain = ${sgn(node.val)} + max(${left}, ${right}) = ${g}\`，回傳給上一層。`,
        views: views(node, chain[node.id], "alt"),
        vars: { left, right, 回傳: g, best: fmtBest() },
      });
      calls.pop();
      return g;
    };

    gain(root);
    t.push({
      line: [14, 15],
      note: `每個節點都當過一次最高點了。最大的路徑和是 **${best}**（${bestPath.map((n) => n.val).join(" → ")}）。`,
      views: views(null),
      vars: { best },
      result: py(best),
    });
    return t.frames;
  },
});
