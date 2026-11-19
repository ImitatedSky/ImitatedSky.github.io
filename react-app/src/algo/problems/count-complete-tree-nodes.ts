import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def countNodes(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        lh, node = 0, root
        while node:          # 沿最左邊走到底
            lh += 1
            node = node.left
        rh, node = 0, root
        while node:          # 沿最右邊走到底
            rh += 1
            node = node.right
        if lh == rh:         # 兩邊一樣深 → 滿二元樹，直接套公式
            return 2 ** lh - 1
        return 1 + self.countNodes(root.left) + self.countNodes(root.right)`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 222,
  summary:
    "給一棵**完全二元樹**（除了最後一層以外每層都是滿的，而且最後一層的節點全部靠左排），回傳它的節點總數。\n\n一個一個數當然可以，但題目要求設計出比 O(n) 更快的演算法。",
  summaryEn:
    "Given a **complete binary tree** (every level is full except possibly the last, whose nodes are packed to the left), return the total number of nodes.\n\nCounting them one by one works, but the task asks for an algorithm faster than O(n).",
  examples: [
    { input: "root = [1,2,3,4,5,6]", output: "6" },
    { input: "root = []", output: "0" },
    { input: "root = [1]", output: "1" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 5 × 10⁴", "保證是完全二元樹"],
  constraintsEn: ["0 ≤ number of nodes ≤ 5 × 10⁴", "The tree is guaranteed to be complete"],
  idea:
    "高度為 `h` 的**滿**二元樹剛好有 `2^h − 1` 個節點，不用數。而完全二元樹的最後一層靠左排，所以只要比較「一路往左走的深度」和「一路往右走的深度」：兩者相等就代表最後一層是滿的，整棵直接套公式；不相等才需要拆成左右子樹遞迴。完全二元樹的左右子樹中**至少有一棵是滿的**，所以每一層遞迴只有一邊會繼續往下拆。",
  steps: [
    "空樹回傳 0。",
    "從 root 一路往左走，數出 `lh`；一路往右走，數出 `rh`。",
    "`lh == rh`：這是一棵滿二元樹，回傳 `2 ** lh - 1`。",
    "否則回傳 `1 + countNodes(左) + countNodes(右)`，子樹依然是完全二元樹，可以用同一招。",
  ],
  pitfalls: [
    "這個技巧**只對完全二元樹成立**：一般的樹就算最左和最右一樣深，中間也可能有洞。",
    "高度是用「節點數」算的（單一節點高度為 1），公式才會是 `2 ** lh - 1`。",
    "每次遞迴要花 O(log n) 量高度，而遞迴深度是 O(log n)，所以總共是 O(log² n)，不是 O(log n)。",
  ],
  complexity: { time: "O(log² n)", space: "O(log n)（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def countNodes(self, root: Optional[TreeNode]) -> int:
        `,
  presets: [
    { label: "[1,2,3,4,5,6]", input: { root: [1, 2, 3, 4, 5, 6] }, expected: "6" },
    {
      label: "12 個節點",
      input: { root: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      expected: "12",
    },
    { label: "[1,2,3,4,5,6,7]（滿二元樹）", input: { root: [1, 2, 3, 4, 5, 6, 7] }, expected: "7" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    if (!root) {
      t.push({ line: [3, 4], note: "空樹，節點數是 `0`。", views: [V.tree("tree", spec)], result: "0" });
      return t.frames;
    }

    const calls: string[] = [];
    const status: Record<string, Tone> = {}; // 已經被算進答案的節點
    const ret: Record<string, number> = {}; // 有被呼叫過的節點 → 回傳值
    let touched = 0; // 實際被呼叫 countNodes 的節點數

    const subtree = (n: BTNode | null, out: string[] = []): string[] => {
      if (!n) return out;
      out.push(n.id);
      subtree(n.left, out);
      subtree(n.right, out);
      return out;
    };
    const spine = (n: BTNode, side: "left" | "right") => {
      const nodes: BTNode[] = [];
      for (let c: BTNode | null = n; c; c = c[side]) nodes.push(c);
      return nodes;
    };
    const spineMarks = (nodes: BTNode[], tone: Tone) => {
      const marks: Record<string, Tone> = {};
      const edges: Record<string, Tone> = {};
      nodes.forEach((n, i) => {
        if (i > 0) marks[n.id] = tone; // 根節點保持 active
        if (i > 0) edges[`${nodes[i - 1].id}>${n.id}`] = tone;
      });
      return { marks, edges };
    };

    const views = (
      cur: BTNode | null,
      extra: Record<string, Tone> = {},
      edgeMarks: Record<string, Tone> = {},
      nullCall = false,
    ) => {
      const marks: Record<string, Tone> = { ...status, ...extra };
      if (cur && !(cur.id in extra)) marks[cur.id] = "active";
      const retSpec = {
        root: spec.root,
        nodes: spec.nodes.map((n) => ({ ...n, val: (n.id in ret ? ret[n.id] : "·") as Cell })),
      };
      const rmarks: Record<string, Tone> = {};
      Object.keys(ret).forEach((id) => (rmarks[id] = "good"));
      if (cur && !(cur.id in ret)) rmarks[cur.id] = "active";
      return [
        V.tree("tree", spec, {
          marks,
          edgeMarks,
          pointers: nullCall ? { root: null } : cur ? { root: cur.id } : {},
        }),
        V.tree("countNodes 的回傳值（· = 從來沒被呼叫）", retSpec, { marks: rmarks }),
        V.stack("呼叫堆疊 countNodes(root)", calls, { marks: calls.length ? { [calls.length - 1]: "active" } : {} }),
      ];
    };

    const count = (node: BTNode | null, parent: BTNode | null, side: string): number => {
      if (!node) {
        calls.push("countNodes(None)");
        t.push({
          line: [3, 4],
          note: `\`${parent!.val}\` 的${side}邊是空的，回傳 \`0\`。`,
          views: views(parent, { [parent!.id]: "alt" }, {}, true),
          vars: { 回傳: 0 },
        });
        calls.pop();
        return 0;
      }

      touched++;
      calls.push(`countNodes(${node.val})`);
      t.push({
        line: [3, 5],
        note:
          (parent
            ? `看以 \`${node.val}\` 為根的子樹。完全二元樹的子樹也是完全二元樹，所以同一招可以再用一次：`
            : `從整棵樹（根是 \`${node.val}\`）開始。先不急著一個一個數，`) +
          "先量量看它是不是「滿」的 —— 比較最左邊和最右邊各有多深。",
        views: views(node),
      });

      const ls = spine(node, "left");
      const lh = ls.length;
      const lm = spineMarks(ls, "compare");
      t.push({
        line: [6, 7, 8],
        note: `沿著最左邊一路往下：${ls.map((n) => `\`${n.val}\``).join(" → ")}，走了 ${lh} 個節點，\`lh = ${lh}\`。完全二元樹靠左排，所以這就是整棵子樹的高度。`,
        views: views(node, lm.marks, lm.edges),
        vars: { lh },
      });

      const rs = spine(node, "right");
      const rh = rs.length;
      const rm = spineMarks(rs, "alt");
      t.push({
        line: [9, 10, 11, 12],
        note: `再沿著最右邊一路往下：${rs.map((n) => `\`${n.val}\``).join(" → ")}，\`rh = ${rh}\`。最右邊是最後一層裡**最晚被填**的位置。`,
        views: views(node, { ...lm.marks, ...rm.marks }, { ...lm.edges, ...rm.edges }),
        vars: { lh, rh },
      });

      if (lh === rh) {
        const total = 2 ** lh - 1;
        const ids = subtree(node);
        ids.forEach((id) => (status[id] = "good"));
        ret[node.id] = total;
        t.push({
          line: [13, 14],
          note:
            `\`lh == rh == ${lh}\`：連最右邊都填到最後一層了，這棵子樹是**滿二元樹**。` +
            `不用走訪裡面的節點，直接算 \`2 ** ${lh} - 1 = ${total}\`。`,
          views: views(node, { [node.id]: "good" }),
          vars: { lh, rh, 回傳: total },
        });
        calls.pop();
        return total;
      }

      t.push({
        line: [13, 15],
        note:
          `\`lh = ${lh}\` 但 \`rh = ${rh}\`，最後一層沒有填滿，不能套公式。` +
          `把 \`${node.val}\` 自己算 1 個，左右子樹各自再問一次 —— 其中至少有一棵會是滿的，馬上就能結束。`,
        views: views(node, { ...lm.marks, ...rm.marks }, { ...lm.edges, ...rm.edges }),
        vars: { lh, rh },
      });

      const left = count(node.left, node, "左");
      t.push({
        line: 15,
        note: `回到 \`${node.val}\`：左子樹有 \`${left}\` 個節點。接著問右子樹。`,
        views: views(node),
        vars: { lh, rh, left },
      });
      const right = count(node.right, node, "右");
      const total = 1 + left + right;
      status[node.id] = "good";
      ret[node.id] = total;
      t.push({
        line: 15,
        note: `\`${node.val}\` 的子樹：自己 1 個 + 左 ${left} 個 + 右 ${right} 個 = \`${total}\`，回傳。`,
        views: views(node, { [node.id]: "good" }),
        vars: { lh, rh, left, right, 回傳: total },
      });
      calls.pop();
      return total;
    };

    const ans = count(root, null, "");
    const n = spec.nodes.length;
    t.push({
      note:
        `總共 **${ans}** 個節點。` +
        (touched < n
          ? `整個過程只對 ${touched} 個節點呼叫過 \`countNodes\`（下方有數字的那些），其餘都是靠公式一次算完的。`
          : `這棵樹很小，所以幾乎每個節點都被呼叫過；樹越大，公式省下的節點越多。`),
      views: views(null),
      vars: { 答案: ans },
      result: py(ans),
    });
    return t.frames;
  },
});
