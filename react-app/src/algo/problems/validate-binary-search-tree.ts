import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def valid(node, low, high):
            if not node:
                return True
            if not (low < node.val < high):
                return False
            return (valid(node.left, low, node.val) and
                    valid(node.right, node.val, high))

        return valid(root, -inf, inf)`;

interface Call {
  node: BTNode;
  low: number;
  high: number;
  /** 設下這個下界 / 上界的祖先 */
  lowBy: BTNode | null;
  highBy: BTNode | null;
}

export default defineProblem<{ root: (number | null)[] }>({
  id: 98,
  summary:
    "給一棵二元樹的根節點，判斷它是不是合法的**二元搜尋樹**（BST）。\n\n合法的 BST：每個節點的左子樹裡**所有**值都嚴格小於它，右子樹裡**所有**值都嚴格大於它，而且左右子樹本身也都是 BST。",
  summaryEn:
    "Given the root of a binary tree, decide whether it is a valid **binary search tree** (BST).\n\nIn a valid BST, **every** value in a node's left subtree is strictly smaller than the node, **every** value in its right subtree is strictly larger, and both subtrees are BSTs themselves.",
  examples: [
    { input: "root = [2,1,3]", output: "true" },
    { input: "root = [5,1,4,null,null,3,6]", output: "false", note: "4 在 5 的右子樹裡，卻比 5 小", noteEn: "4 sits in the right subtree of 5 but is smaller than 5" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 10⁴", "−2³¹ ≤ Node.val ≤ 2³¹ − 1"],
  constraintsEn: ["1 ≤ number of nodes ≤ 10⁴", "−2³¹ ≤ Node.val ≤ 2³¹ − 1"],
  idea:
    "BST 的限制不只在父子之間，而是**每個祖先**都會留下限制。把這些限制濃縮成一個開區間 `(low, high)` 往下傳：往左走時上界收緊成父節點的值，往右走時下界收緊成父節點的值。每個節點只要檢查自己有沒有落在區間內。",
  steps: [
    "從 root 出發，允許範圍是 `(-inf, inf)`。",
    "空節點視為合法，回傳 `True`。",
    "若 `node.val` 不在 `(low, high)` 內，回傳 `False`。",
    "遞迴檢查左子樹（範圍 `(low, node.val)`）與右子樹（範圍 `(node.val, high)`），兩邊都合法才是 BST。",
  ],
  pitfalls: [
    "只檢查 `left.val < node.val < right.val` 是**錯的**：孫節點可能違反更上層祖先的限制。",
    "必須是嚴格不等式，BST 不允許重複值。",
    "用 `-inf` / `inf` 當初始邊界，不要用某個「很大的整數」，節點值可能就是 `2³¹ − 1`。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        `,
  presets: [
    { label: "合法 [5,3,8,1,4,6,9]", input: { root: [5, 3, 8, 1, 4, 6, 9] }, expected: "True" },
    { label: "孫節點違規 [5,1,7,null,null,4,8]", input: { root: [5, 1, 7, null, null, 4, 8] }, expected: "False" },
    { label: "重複值 [2,2]", input: { root: [2, 2] }, expected: "False" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    // 數線兩端用來代表 ±inf
    const vals = spec.nodes.map((n) => n.val as number);
    const lo = vals.length ? Math.min(...vals) : 0;
    const hi = vals.length ? Math.max(...vals) : 0;
    const pad = Math.max(1, Math.ceil((hi - lo) * 0.2));
    const LO = lo - pad;
    const HI = hi + pad;
    const clamp = (x: number) => Math.max(LO, Math.min(HI, x));
    const show = (x: number) => (x === Infinity ? "inf" : x === -Infinity ? "-inf" : String(x));

    const stack: Call[] = [];
    const ok = new Set<string>();
    let bad: BTNode | null = null;
    let blame: BTNode | null = null;

    const views = (o: { tone?: Tone } = {}) => {
      const top = stack[stack.length - 1];
      const m: Record<string, Tone> = {};
      ok.forEach((id) => (m[id] = "good"));
      stack.forEach((c) => (m[c.node.id] = "compare"));
      if (top) m[top.node.id] = o.tone ?? "active";
      if (blame) m[blame.id] = "alt";
      if (bad) m[bad.id] = "bad";
      const items = stack.length
        ? stack.map((c, i) => ({
            start: clamp(c.low),
            end: clamp(c.high),
            label: `(${show(c.low)}, ${show(c.high)})`,
            tone: (i === stack.length - 1 ? (o.tone ?? "active") : "muted") as Tone,
          }))
        : [{ start: LO, end: HI, label: "(-inf, inf)", tone: (bad ? "bad" : "good") as Tone }];
      return [
        V.tree("tree", spec, { marks: m, pointers: top ? { node: top.node.id } : {} }),
        V.stack("遞迴堆疊", stack.map((c) => `valid(${c.node.val}, ${show(c.low)}, ${show(c.high)})`)),
        V.intervals("允許範圍（數線兩端代表 ±inf，越深的呼叫越窄）", items, {
          points: top ? [{ at: top.node.val, label: `node = ${top.node.val}`, tone: o.tone ?? "active" }] : [],
        }),
      ];
    };
    const vars = () => {
      const top = stack[stack.length - 1];
      return top ? { low: show(top.low), "node.val": top.node.val, high: show(top.high) } : undefined;
    };

    t.push({
      line: 11,
      note: "從 root 開始。它上面沒有任何祖先，所以還沒有限制：允許範圍是 `(-inf, inf)`。",
      views: views(),
    });

    const valid = (node: BTNode | null, low: number, high: number, lowBy: BTNode | null, highBy: BTNode | null): boolean => {
      if (!node) return true;
      stack.push({ node, low, high, lowBy, highBy });
      const range = `\`${show(low)} < ${node.val} < ${show(high)}\``;

      if (!(low < node.val && node.val < high)) {
        bad = node;
        blame = node.val <= low ? lowBy : highBy;
        const why =
          node.val <= low
            ? `它位在 \`${low}\` 的**右子樹**裡，必須大於 \`${low}\`，但 \`${node.val}\` ${node.val === low ? "和它相等（BST 不允許重複）" : "比它小"}。`
            : `它位在 \`${high}\` 的**左子樹**裡，必須小於 \`${high}\`，但 \`${node.val}\` ${node.val === high ? "和它相等（BST 不允許重複）" : "比它大"}。`;
        t.push({
          line: [6, 7],
          note: `檢查 \`${node.val}\`：${range} **不成立**。${why}回傳 \`False\`。`,
          views: views({ tone: "bad" }),
          vars: vars(),
        });
        stack.pop();
        return false;
      }

      const leaf = !node.left && !node.right;
      if (leaf) {
        ok.add(node.id);
        t.push({
          line: [6, 8, 9],
          note: `檢查 \`${node.val}\`：${range} 成立。它沒有小孩（空子樹一定合法），所以這棵子樹合法，回傳 \`True\`。`,
          views: views({ tone: "good" }),
          vars: vars(),
        });
        stack.pop();
        return true;
      }

      t.push({
        line: node.left ? [6, 8] : [6, 8, 9],
        note:
          `檢查 \`${node.val}\`：${range} 成立。` +
          (node.left
            ? `接著看左子樹：裡面的值都必須**小於** \`${node.val}\`，所以上界收緊，範圍變成 \`(${show(low)}, ${node.val})\`。`
            : `沒有左小孩（空子樹合法），直接看右子樹：裡面的值都必須**大於** \`${node.val}\`，下界收緊成 \`(${node.val}, ${show(high)})\`。`),
        views: views(),
        vars: vars(),
      });

      if (!valid(node.left, low, node.val, lowBy, node)) {
        stack.pop();
        return false;
      }

      if (node.left && node.right) {
        t.push({
          line: 9,
          note: `\`${node.val}\` 的左子樹合法。換右子樹：裡面的值都必須**大於** \`${node.val}\`，下界收緊，範圍變成 \`(${node.val}, ${show(high)})\`（上界 \`${show(high)}\` 是祖先留下來的，照樣往下傳）。`,
          views: views(),
          vars: vars(),
        });
      }

      if (!valid(node.right, node.val, high, node, highBy)) {
        stack.pop();
        return false;
      }

      ok.add(node.id);
      t.push({
        line: [8, 9],
        note: `\`${node.val}\` 自己在範圍內，左右子樹也都合法 → 以 \`${node.val}\` 為根的子樹是 BST，回傳 \`True\`。`,
        views: views({ tone: "good" }),
        vars: vars(),
      });
      stack.pop();
      return true;
    };

    const res = valid(root, -Infinity, Infinity, null, null);

    t.push({
      line: 11,
      note: res
        ? "每個節點都落在祖先們留下的範圍內，這是一棵合法的 BST。"
        : `一發現違規，\`and\` 就短路，\`False\` 沿著遞迴一路傳回最上層 —— 剩下的節點不用再看。`,
      views: views(),
      result: py(res),
    });
    return t.frames;
  },
});
