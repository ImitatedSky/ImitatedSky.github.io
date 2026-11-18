import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        left = self.maxDepth(root.left)
        right = self.maxDepth(root.right)
        return 1 + max(left, right)`;

/** One activation record of maxDepth() */
interface Call {
  node: BTNode;
  left: number | null;
  right: number | null;
}

export default defineProblem<{ root: (number | null)[] }>({
  id: 104,
  summary:
    "給一棵二元樹的根節點，回傳它的**最大深度**：從根節點一路往下走到最遠的葉節點，這條路徑上總共有幾個節點。\n\n空樹的深度是 0，只有一個節點的樹深度是 1。",
  examples: [
    { input: "root = [3,9,20,null,null,15,7]", output: "3", note: "最長的路徑是 3 → 20 → 15（或 7），共 3 個節點" },
    { input: "root = [1,null,2]", output: "2" },
    { input: "root = []", output: "0" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 10⁴", "-100 ≤ Node.val ≤ 100"],
  idea:
    "把問題丟給小孩：一棵樹的深度 = **1（自己這一層）+ 左右子樹中比較深的那一個**。空節點的深度是 0，這就是遞迴的終點。每個節點只要相信左右子樹會回報正確的深度，自己加 1 往上回報就好。",
  steps: [
    "空節點沒有任何一層，回傳 `0`。",
    "遞迴問左子樹的深度 `left`。",
    "遞迴問右子樹的深度 `right`。",
    "自己佔一層，回傳 `1 + max(left, right)`。",
  ],
  pitfalls: [
    "深度數的是**節點數**不是邊數，所以葉節點回傳的是 `1`（`1 + max(0, 0)`），不是 `0`。",
    "是取 `max` 不是相加 —— 我們只關心最長的那一條路。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        `,
  presets: [
    { label: "[3,9,20,null,null,15,7]", input: { root: [3, 9, 20, null, null, 15, 7] }, expected: "3" },
    {
      label: "[1,2,3,4,5,null,null,null,null,6]",
      input: { root: [1, 2, 3, 4, 5, null, null, null, null, 6] },
      expected: "4",
    },
    { label: "[]", input: { root: [] }, expected: "0" },
  ],
  trace({ root: level }) {
    const t = tracer();
    const root = buildTree(level);
    const spec = treeSpec(root);

    if (!root) {
      t.push({
        line: [3, 4],
        note: "`root` 是空的 —— 空樹一層都沒有，深度就是 `0`。",
        views: [V.tree("tree", spec), V.stack("呼叫堆疊", [])],
        result: "0",
      });
      return t.frames;
    }

    const calls: Call[] = [];
    const done = new Set<string>(); // nodes whose call has returned
    const edgeLabels: Record<string, string> = {}; // depth each child reported to its parent
    const edgeMarks: Record<string, Tone> = {};

    const show = (v: number | null) => (v === null ? "?" : String(v));
    const stackItems = () =>
      calls.map((c) => `maxDepth(${c.node.val})　left=${show(c.left)}　right=${show(c.right)}`);

    const views = (extra: Record<string, Tone> = {}, pending?: string) => {
      const marks: Record<string, Tone> = {};
      done.forEach((id) => (marks[id] = "good"));
      calls.forEach((c) => (marks[c.node.id] = "visited"));
      const top = calls[calls.length - 1];
      if (top) marks[top.node.id] = "active";
      const items = stackItems();
      if (pending) items.push(pending);
      return [
        V.tree("tree（邊上的數字 = 小孩回報的深度）", spec, {
          marks: { ...marks, ...extra },
          pointers: top ? { root: top.node.id } : {},
          edgeLabels,
          edgeMarks,
        }),
        V.stack("呼叫堆疊", items, {
          marks: pending ? { [items.length - 1]: "muted" } : items.length ? { [items.length - 1]: "active" } : {},
        }),
      ];
    };
    const vars = (): Record<string, string | number> => {
      const top = calls[calls.length - 1];
      return top ? { "root.val": top.node.val, left: show(top.left), right: show(top.right) } : {};
    };

    const dfs = (node: BTNode, parent: BTNode | null): number => {
      const me: Call = { node, left: null, right: null };
      calls.push(me);
      t.push({
        line: [2, 3],
        note: parent
          ? `\`${parent.val}\` 往下問：進入 \`maxDepth(${node.val})\`。節點不是空的，所以還不知道答案，得先問自己的左右子樹。`
          : `從根節點開始：呼叫 \`maxDepth(${node.val})\`。它不是空的，深度要等左右子樹回報才算得出來。`,
        views: views(),
        vars: vars(),
      });

      for (const side of ["left", "right"] as const) {
        const child = node[side];
        const zh = side === "left" ? "左" : "右";
        const line = side === "left" ? 5 : 6;
        if (!child) {
          me[side] = 0;
          t.push({
            line: [line, 3, 4],
            note: `\`${node.val}\` 沒有${zh}小孩：\`maxDepth(None)\` 碰到空節點立刻回傳 \`0\`，所以 \`${side} = 0\`。`,
            views: views({}, "maxDepth(None) → 0"),
            vars: vars(),
          });
        } else {
          const d = dfs(child, node);
          me[side] = d;
          t.push({
            line,
            note:
              `回到 \`${node.val}\`：${zh}子樹（以 \`${child.val}\` 為根）回報深度 \`${d}\`，記成 \`${side} = ${d}\`。` +
              (side === "left" ? "接著問右邊。" : "左右都問完了。"),
            views: views(),
            vars: vars(),
          });
        }
      }

      const l = me.left!;
      const r = me.right!;
      const depth = 1 + Math.max(l, r);
      const why =
        l === 0 && r === 0
          ? "左右都是空的，這是葉節點，自己就是唯一的一層"
          : l === r
            ? "兩邊一樣深，任選一邊再加上自己這一層"
            : `${l > r ? "左" : "右"}邊比較深，取它再加上自己這一層`;
      if (parent) {
        edgeLabels[`${parent.id}>${node.id}`] = String(depth);
        edgeMarks[`${parent.id}>${node.id}`] = "good";
      }
      t.push({
        line: 7,
        note: `\`${node.val}\` 算出答案：\`1 + max(${l}, ${r}) = ${depth}\`（${why}）。${parent ? `把 \`${depth}\` 回傳給上一層的 \`${parent.val}\`。` : ""}`,
        views: views({ [node.id]: "good" }),
        vars: { ...vars(), 回傳: depth },
      });
      calls.pop();
      done.add(node.id);
      return depth;
    };

    const ans = dfs(root, null);
    const last = t.frames[t.frames.length - 1];
    last.note += `這是最外層的呼叫，所以整棵樹的最大深度就是 **${ans}**。`;
    last.result = py(ans);
    return t.frames;
  },
});
