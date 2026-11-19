import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        root.left, root.right = root.right, root.left
        self.invertTree(root.left)
        self.invertTree(root.right)
        return root`;

/** Level-order values the way LeetCode / `tree_vals` prints a tree */
function levelVals(root: BTNode | null): (number | null)[] {
  const out: (number | null)[] = [];
  const q: (BTNode | null)[] = [root];
  while (q.length) {
    const n = q.shift()!;
    out.push(n ? n.val : null);
    if (n) q.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

export default defineProblem<{ root: (number | null)[] }>({
  id: 226,
  summary:
    "給一棵二元樹的根節點，把整棵樹**左右翻轉**（像照鏡子一樣）：每個節點的左子樹和右子樹都要對調，最後回傳根節點。",
  summaryEn:
    "Given the root of a binary tree, **mirror the whole tree left to right**: swap the left and right subtrees of every node, then return the root.",
  examples: [
    { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
    { input: "root = [2,1,3]", output: "[2,3,1]" },
    { input: "root = []", output: "[]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 100", "-100 ≤ Node.val ≤ 100"],
  constraintsEn: ["0 ≤ number of nodes ≤ 100", "-100 ≤ Node.val ≤ 100"],
  idea:
    "翻轉整棵樹 = **每個節點都把自己的左右小孩對調一次**。對調是整棵子樹跟著搬家，所以只要走訪到每個節點、各做一次交換，整棵樹就鏡像了。",
  steps: [
    "空節點沒有東西可換，直接回傳。",
    "把目前節點的 `left`、`right` 對調（底下的整棵子樹會跟著換邊）。",
    "遞迴翻轉現在的左子樹，再遞迴翻轉現在的右子樹。",
    "回傳 `root`。",
  ],
  pitfalls: [
    "交換的是**指標**（整棵子樹），不是只交換兩個小孩的值 —— 只換值的話孫子輩不會跟著換邊。",
    "不要寫成 `root.left = self.invertTree(root.right)` 之後再用 `root.left` 去算右邊：那時 `root.left` 已經被蓋掉了。用同時賦值或先存到暫存變數。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        `,
  presets: [
    { label: "[4,2,7,1,3,6,9]", input: { root: [4, 2, 7, 1, 3, 6, 9] }, expected: "[4, 7, 2, 9, 6, 3, 1]" },
    {
      label: "[1,2,3,4,null,null,5]",
      input: { root: [1, 2, 3, 4, null, null, 5] },
      expected: "[1, 3, 2, 5, None, None, 4]",
    },
    { label: "[1,2]", input: { root: [1, 2] }, expected: "[1, None, 2]" },
  ],
  trace({ root: level }) {
    const t = tracer();
    const root = buildTree(level); // a fresh copy — safe to rewire

    if (!root) {
      t.push({
        line: [3, 4],
        note: "空樹沒有任何東西可以翻，直接回傳 `None`。",
        views: [V.tree("tree", treeSpec(root)), V.stack("呼叫堆疊", [])],
        result: "[]",
      });
      return t.frames;
    }

    const calls: BTNode[] = [];
    const swapped = new Set<string>(); // already swapped, subtrees still in progress
    const done = new Set<string>(); // call has returned

    const views = (extra: Record<string, Tone> = {}, pending?: string, edgeMarks: Record<string, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      done.forEach((id) => (marks[id] = "good"));
      calls.forEach((n) => (marks[n.id] = "visited"));
      const top = calls[calls.length - 1];
      if (top) marks[top.id] = "active";
      const items = calls.map((n) => `invertTree(${n.val})${swapped.has(n.id) ? "　已交換" : ""}`);
      if (pending) items.push(pending);
      return [
        V.tree("tree", treeSpec(root), {
          marks: { ...marks, ...extra },
          pointers: top ? { root: top.id } : {},
          edgeMarks,
        }),
        V.stack("呼叫堆疊", items, {
          marks: items.length ? { [items.length - 1]: pending ? "muted" : "active" } : {},
        }),
      ];
    };
    const name = (n: BTNode | null) => (n ? String(n.val) : "None");
    const vars = (n: BTNode) => ({ "root.val": n.val, "root.left": name(n.left), "root.right": name(n.right) });

    const invert = (node: BTNode, parent: BTNode | null) => {
      calls.push(node);
      const kidTones = (): Record<string, Tone> => ({
        ...(node.left ? { [node.left.id]: "compare" as Tone } : {}),
        ...(node.right ? { [node.right.id]: "alt" as Tone } : {}),
      });
      const kidEdges = (): Record<string, Tone> => ({
        ...(node.left ? { [`${node.id}>${node.left.id}`]: "compare" as Tone } : {}),
        ...(node.right ? { [`${node.id}>${node.right.id}`]: "alt" as Tone } : {}),
      });

      t.push({
        line: [2, 3],
        note:
          (parent ? `進入 \`invertTree(${node.val})\`。` : `從根節點開始：\`invertTree(${node.val})\`。`) +
          (node.left || node.right
            ? `它不是空的，目前左邊是 \`${name(node.left)}\`、右邊是 \`${name(node.right)}\`，準備對調。`
            : "它是葉節點，左右都是 `None`。"),
        views: views(kidTones(), undefined, kidEdges()),
        vars: vars(node),
      });

      const before = [name(node.left), name(node.right)];
      [node.left, node.right] = [node.right, node.left];
      swapped.add(node.id);
      t.push({
        line: 5,
        note:
          node.left || node.right
            ? `把 \`${node.val}\` 的左右指標對調：原本左邊的 \`${before[0]}\` 換到右邊、右邊的 \`${before[1]}\` 換到左邊。注意是**整棵子樹**一起搬家，但子樹內部還沒翻，所以接下來要往下遞迴。`
            : `對調 \`${node.val}\` 的左右指標 —— 兩邊都是 \`None\`，換了等於沒換。`,
        views: views(kidTones(), undefined, kidEdges()),
        vars: vars(node),
      });

      if (!node.left && !node.right) {
        t.push({
          line: [6, 7, 3, 4],
          note: `\`${node.val}\` 沒有小孩：\`invertTree(None)\` 兩次都碰到空節點，立刻回傳。`,
          views: views({}, "invertTree(None) → None"),
          vars: vars(node),
        });
      } else {
        for (const side of ["left", "right"] as const) {
          const child = node[side];
          const zh = side === "left" ? "左" : "右";
          const line = side === "left" ? 6 : 7;
          if (child) {
            invert(child, node);
            t.push({
              line,
              note:
                `回到 \`${node.val}\`：${zh}子樹（\`${child.val}\`）內部已經翻好了。` +
                (side === "left" ? "接著處理右子樹。" : ""),
              views: views(),
              vars: vars(node),
            });
          } else {
            t.push({
              line: [line, 3, 4],
              note: `\`${node.val}\` 現在的${zh}邊是空的：\`invertTree(None)\` 立刻回傳，沒有東西要翻。`,
              views: views({}, "invertTree(None) → None"),
              vars: vars(node),
            });
          }
        }
      }

      t.push({
        line: 8,
        note: `以 \`${node.val}\` 為根的子樹：自己換過了、左右子樹也都翻完了，這棵子樹已經完全鏡像，回傳。`,
        views: views({ [node.id]: "good" }),
        vars: vars(node),
      });
      calls.pop();
      done.add(node.id);
    };

    invert(root, null);
    const out = levelVals(root);
    const last = t.frames[t.frames.length - 1];
    last.note = `最外層的 \`invertTree(${root.val})\` 回傳：每個節點都對調過一次，整棵樹左右翻轉完成。`;
    last.result = py(out);
    return t.frames;
  },
});
