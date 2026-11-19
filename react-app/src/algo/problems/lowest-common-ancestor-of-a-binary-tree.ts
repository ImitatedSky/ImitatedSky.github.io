import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root is p or root is q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:    # p、q 分別在兩邊，root 就是分岔點
            return root
        return left or right  # 都在同一邊（或都不在）：把找到的往上傳`;

export default defineProblem<{ root: (number | null)[]; p: number; q: number }>({
  id: 236,
  summary:
    "給一棵二元樹和樹上的兩個節點 `p`、`q`，找出它們的**最近共同祖先**（LCA）：同時是 `p` 和 `q` 的祖先、而且離它們最近（深度最深）的那個節點。\n\n一個節點也算是自己的祖先，所以如果 `p` 本身就是 `q` 的祖先，答案就是 `p`。樹上的值都不重複，`p`、`q` 一定存在且不是同一個節點。",
  summaryEn:
    "Given a binary tree and two of its nodes `p` and `q`, find their **lowest common ancestor** (LCA): the node that is an ancestor of both `p` and `q` and sits closest to them (deepest in the tree).\n\nA node counts as its own ancestor, so if `p` is itself an ancestor of `q`, the answer is `p`. All values are distinct, and `p` and `q` both exist and are different nodes.",
  examples: [
    { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1", output: "3" },
    { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4", output: "5", note: "5 是 4 的祖先，也是自己的祖先", noteEn: "5 is an ancestor of 4, and also of itself" },
    { input: "root = [1,2], p = 1, q = 2", output: "1" },
  ],
  constraints: ["2 ≤ 節點數 ≤ 10⁵", "所有 Node.val 都不相同", "p ≠ q，且兩者都在樹上"],
  constraintsEn: ["2 ≤ number of nodes ≤ 10⁵", "All Node.val are distinct", "p ≠ q, and both are in the tree"],
  idea:
    "用後序走訪，讓每棵子樹回答一個問題：「你裡面有沒有 `p` 或 `q`？有的話把找到的節點交上來。」對某個節點來說，如果**左右兩邊都交了東西上來**，代表 `p`、`q` 一個在左、一個在右，它就是兩條路第一次會合的地方 —— 也就是 LCA。只有一邊有東西就原封不動往上傳。",
  steps: [
    "`root` 是空的 → 回傳 `None`；`root` 就是 `p` 或 `q` → 直接回傳 `root`，不用再往下找。",
    "遞迴問左子樹和右子樹，得到 `left`、`right`。",
    "兩邊都不是 `None`：`root` 就是 LCA，回傳 `root`。",
    "否則回傳不是 `None` 的那一邊（兩邊都是 `None` 就回傳 `None`）。",
  ],
  pitfalls: [
    "遇到 `p` 或 `q` 就直接回傳、不往下找是**正確**的：如果另一個在它底下，它自己就是答案；如果不在，另一個會從別的子樹交上來。",
    "回傳值有兩種意思 ——「我找到 p/q 其中一個」或「我已經是 LCA」。兩種情況往上傳的處理方式一樣，所以不必區分。",
    "比較節點要用 `is`（同一個物件），題目給的是節點本身，不是數值。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        `,
  presets: [
    {
      label: "p = 6, q = 4",
      input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 6, q: 4 },
      expected: "5",
    },
    {
      label: "p = 5, q = 4（p 是 q 的祖先）",
      input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 5, q: 4 },
      expected: "5",
    },
    {
      label: "p = 7, q = 8（分居根的兩側）",
      input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 7, q: 8 },
      expected: "3",
    },
  ],
  trace({ root: level0, p: pVal, q: qVal }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    const find = (n: BTNode | null, v: number): BTNode | null =>
      !n ? null : n.val === v ? n : (find(n.left, v) ?? find(n.right, v));
    const p = find(root, pVal);
    const q = find(root, qVal);
    if (!root || !p || !q) {
      t.push({
        note: "這組輸入不符合題目條件：`p`、`q` 必須都在樹上。",
        views: [V.tree("tree", spec)],
        result: "None",
      });
      return t.frames;
    }

    const calls: string[] = [];
    const status: Record<string, Tone> = {}; // 已回傳的節點
    const ret: Record<string, BTNode | null> = {}; // 各節點的回傳值
    let lca: BTNode | null = null; // 左右都有找到的那個節點（確定是答案）
    const show = (n: BTNode | null) => (n ? String(n.val) : "None");

    const views = (cur: BTNode | null, extra: Record<string, Tone> = {}, edgeMarks: Record<string, Tone> = {}) => {
      const marks: Record<string, Tone> = { ...status, [p.id]: "alt", [q.id]: "alt" };
      if (lca) marks[lca.id] = "good";
      if (cur) marks[cur.id] = "active";
      Object.assign(marks, extra);
      const pointers: Record<string, string | null> = { p: p.id, q: q.id };
      if (cur) pointers.root = cur.id;

      const retSpec = {
        root: spec.root,
        nodes: spec.nodes.map((n) => ({
          ...n,
          val: (n.id in ret ? (ret[n.id] ? ret[n.id]!.val : null) : "·") as Cell,
        })),
      };
      const rmarks: Record<string, Tone> = {};
      for (const [id, r] of Object.entries(ret)) rmarks[id] = r ? "good" : "muted";
      if (cur && !(cur.id in ret)) rmarks[cur.id] = "active";

      return [
        V.tree("tree", spec, { marks, pointers, edgeMarks }),
        V.tree("每棵子樹的回傳值（∅ = None，· = 還沒回傳 / 沒走到）", retSpec, { marks: rmarks }),
        V.stack("呼叫堆疊 lowestCommonAncestor(root)", calls, {
          marks: calls.length ? { [calls.length - 1]: "active" } : {},
        }),
      ];
    };

    t.push({
      line: 2,
      note: `要找 \`p = ${p.val}\` 和 \`q = ${q.val}\` 的最近共同祖先。做法是後序走訪：每棵子樹回報「我裡面找到了誰」。`,
      views: views(null),
      vars: { p: p.val, q: q.val },
    });

    const lcaOf = (node: BTNode): BTNode | null => {
      calls.push(`lca(${node.val})`);

      if (node === p || node === q) {
        const name = node === p ? "p" : "q";
        const other = node === p ? "q" : "p";
        ret[node.id] = node;
        status[node.id] = "visited";
        t.push({
          line: [3, 4],
          note:
            `\`${node.val}\` 就是 \`${name}\`，直接回傳自己，**不用再往下找**：` +
            `就算 \`${other}\` 藏在它底下，答案也會是 \`${node.val}\` 本身；如果不在，\`${other}\` 會從別的子樹交上來。`,
          views: views(node),
          vars: { p: p.val, q: q.val, 回傳: node.val },
        });
        calls.pop();
        return node;
      }

      const isLeaf = !node.left && !node.right;
      if (isLeaf) {
        ret[node.id] = null;
        status[node.id] = "muted";
        t.push({
          line: [3, 5, 6, 9],
          note: `\`${node.val}\` 不是 \`p\` 也不是 \`q\`，而且是葉節點：左右都是空的，兩邊都回傳 \`None\`，所以它也回傳 \`None\` —— 這棵子樹裡沒有我們要的節點。`,
          views: views(node, { [node.id]: "muted" }),
          vars: { p: p.val, q: q.val, left: "None", right: "None", 回傳: "None" },
        });
        calls.pop();
        return null;
      }

      t.push({
        line: [3, 5],
        note: `\`${node.val}\` 不是 \`p\` 也不是 \`q\`。它是不是共同祖先，要等左右子樹回報才知道，先問左邊。`,
        views: views(node),
        vars: { p: p.val, q: q.val },
      });
      const left = node.left ? lcaOf(node.left) : null;
      t.push({
        line: 6,
        note:
          `回到 \`${node.val}\`：` +
          (node.left
            ? left
              ? `左子樹回報 \`${left.val}\`，裡面有找到東西。`
              : "左子樹回報 `None`，那邊什麼都沒有。"
            : "左邊是空的，`left = None`。") +
          "再問右邊。",
        views: views(node, {}, left ? { [`${node.id}>${node.left!.id}`]: "good" } : {}),
        vars: { p: p.val, q: q.val, left: show(left) },
      });
      const right = node.right ? lcaOf(node.right) : null;
      const rightMsg = node.right
        ? right
          ? `右子樹回報 \`${right.val}\``
          : "右子樹回報 `None`"
        : "右邊是空的（`None`）";
      const edges: Record<string, Tone> = {};
      if (left) edges[`${node.id}>${node.left!.id}`] = "good";
      if (right) edges[`${node.id}>${node.right!.id}`] = "good";
      const vars = { p: p.val, q: q.val, left: show(left), right: show(right) };

      let out: BTNode | null;
      if (left && right) {
        out = node;
        lca = node;
        ret[node.id] = out;
        status[node.id] = "good";
        t.push({
          line: [7, 8],
          note:
            `${rightMsg}，而左邊是 \`${left.val}\` —— **兩邊都有找到**。` +
            `\`p\`、\`q\` 一個在左、一個在右，\`${node.val}\` 是兩條路第一次會合的地方，它就是最近共同祖先。回傳 \`${node.val}\`。`,
          views: views(node, { [node.id]: "good" }, edges),
          vars: { ...vars, 回傳: node.val },
        });
      } else {
        out = left ?? right;
        ret[node.id] = out;
        status[node.id] = out ? "visited" : "muted";
        t.push({
          line: 9,
          note: out
            ? `${rightMsg}。只有${left ? "左" : "右"}邊有東西，就把 \`${out.val}\` 原封不動往上傳` +
              (out === lca ? "（它已經是確定的答案了）。" : `（目前只知道 \`${node.val}\` 底下有它，另一個還沒出現）。`)
            : `${rightMsg}。兩邊都沒有找到 \`p\` 或 \`q\`，回傳 \`None\`。`,
          views: views(node, out ? {} : { [node.id]: "muted" }, edges),
          vars: { ...vars, 回傳: show(out) },
        });
      }
      calls.pop();
      return out;
    };

    const ans = lcaOf(root)!;
    const wasSplit = lca !== null;
    lca = ans;
    // 最後把答案到 p、q 的兩條路標出來
    const parent: Record<string, BTNode> = {};
    const index = (n: BTNode) => {
      for (const c of [n.left, n.right])
        if (c) {
          parent[c.id] = n;
          index(c);
        }
    };
    index(root);
    const finalEdges: Record<string, Tone> = {};
    for (const target of [p, q])
      for (let n = target; n !== ans; n = parent[n.id]) finalEdges[`${parent[n.id].id}>${n.id}`] = "good";
    t.push({
      note: wasSplit
        ? `最上層回傳 \`${ans.val}\`：\`${p.val}\` 和 \`${q.val}\` 的最近共同祖先就是 **${ans.val}**。`
        : `最上層回傳 \`${ans.val}\`，而且從頭到尾沒有任何節點「兩邊都找到」—— 代表另一個節點就在 \`${ans.val}\` 的子樹裡，所以 **${ans.val}** 自己就是最近共同祖先。`,
      views: views(null, {}, finalEdges),
      vars: { p: p.val, q: q.val, 答案: ans.val },
      result: py(ans.val),
    });
    return t.frames;
  },
});
