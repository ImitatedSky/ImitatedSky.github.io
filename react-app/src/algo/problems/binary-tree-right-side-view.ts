import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        res = []
        q = deque([root])
        while q:
            res.append(q[-1].val)  # 佇列尾端 = 這一層最右邊
            for _ in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
        return res`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 199,
  summary:
    "想像你站在一棵二元樹的**右邊**往左看，每一層只看得到最靠右的那個節點。\n\n給根節點 `root`，由上到下回傳你看得到的節點值。",
  summaryEn:
    "Imagine standing on the **right side** of a binary tree and looking left: on each level you can only see the rightmost node.\n\nGiven `root`, return the values you can see, from top to bottom.",
  examples: [
    { input: "root = [1,2,3,null,5,null,4]", output: "[1,3,4]" },
    { input: "root = [1,2,3,4,null,null,null,5]", output: "[1,3,4,5]", note: "右邊比較淺時，左子樹深處的節點會露出來", noteEn: "when the right side is shallower, deeper nodes of the left subtree show through" },
    { input: "root = []", output: "[]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 100"],
  constraintsEn: ["0 ≤ number of nodes ≤ 100"],
  idea:
    "「從右邊看到的」就是**每一層的最後一個節點**。用 BFS 一層一層走：每一輪開始時，佇列裡剛好裝著一整層（由左到右），所以佇列尾端 `q[-1]` 就是答案。",
  steps: [
    "空樹直接回傳 `[]`；否則把 root 放進佇列。",
    "每一輪開始時佇列 = 一整層，把尾端 `q[-1].val` 加進 `res`。",
    "把這一層的節點全部 pop 出來，並依「先左後右」把小孩 push 進去，組成下一層。",
    "佇列空了就回傳 `res`。",
  ],
  pitfalls: [
    "不能只沿著 `right` 指標一路往下走：右子樹比較淺時，左子樹深處的節點也看得到。",
    "小孩一定要**先左後右**進佇列，尾端才會是最右邊的節點。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        `,
  presets: [
    { label: "[1,2,3,null,5,null,4]", input: { root: [1, 2, 3, null, 5, null, 4] }, expected: "[1, 3, 4]" },
    {
      label: "左邊比較深 [1,2,3,4,null,null,null,5]",
      input: { root: [1, 2, 3, 4, null, null, null, 5] },
      expected: "[1, 3, 4, 5]",
    },
    { label: "[]", input: { root: [] }, expected: "[]" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    if (!root) {
      t.push({ line: [3, 4], note: "空樹，什麼都看不到，回傳空陣列。", views: [V.tree("tree", spec)], result: "[]" });
      return t.frames;
    }

    const res: number[] = [];
    const q: BTNode[] = [root];
    const done = new Set<string>();
    const seen = new Set<string>(); // 已經被選進 res 的節點
    const marks = (extra: Record<string, Tone> = {}) => {
      const m: Record<string, Tone> = {};
      done.forEach((id) => (m[id] = "visited"));
      q.forEach((n) => (m[n.id] = "compare"));
      seen.forEach((id) => (m[id] = "good"));
      return { ...m, ...extra };
    };
    const views = (o: { extra?: Record<string, Tone>; node?: BTNode; tail?: boolean } = {}) => [
      V.tree("tree", spec, { marks: marks(o.extra), pointers: o.node ? { node: o.node.id } : {} }),
      V.queue("q", q.map((n) => n.val), { marks: o.tail && q.length ? { [q.length - 1]: "good" } : {} }),
      V.array("res", res, { marks: o.tail ? { [res.length - 1]: "good" } : {} }),
    ];

    t.push({
      line: [5, 6],
      note: "把 root 放進佇列。接下來每一輪，佇列裡都會剛好裝著**一整層**的節點（由左到右）。",
      views: views(),
    });

    let depth = 0;
    while (q.length) {
      const last = q[q.length - 1];
      res.push(last.val);
      seen.add(last.id);
      t.push({
        line: [7, 8],
        note:
          q.length === 1
            ? `第 ${depth} 層只有 \`${last.val}\` 一個節點，從右邊看到的就是它，加進 \`res\`。`
            : `第 ${depth} 層由左到右是 ${q.map((n) => `\`${n.val}\``).join("、")}，佇列尾端 \`${last.val}\` 最靠右，會擋住同層其他節點 —— 加進 \`res\`。`,
        views: views({ tail: true }),
        vars: { 層: depth, "len(q)": q.length },
      });

      const size = q.length;
      for (let k = 0; k < size; k++) {
        const node = q.shift()!;
        const kids = [node.left, node.right].filter((c): c is BTNode => c !== null);
        q.push(...kids);
        t.push({
          line: kids.length ? [9, 10, 11, 12, 13, 14] : [9, 10],
          note:
            `取出 \`${node.val}\`（這一層第 ${k + 1} / ${size} 個）。` +
            (kids.length
              ? `小孩 ${kids.map((c) => `\`${c.val}\``).join("、")} 依先左後右排進佇列，成為下一層。`
              : "它沒有小孩，下一層不會多出節點。"),
          views: views({ extra: { [node.id]: "active" }, node }),
          vars: { 層: depth, "len(q)": q.length },
        });
        done.add(node.id);
      }
      depth++;
    }

    t.push({
      line: 15,
      note: `佇列空了。每一層最右邊的節點（綠色）合起來就是右視圖 \`${py(res)}\`。`,
      views: views(),
      result: py(res),
    });
    return t.frames;
  },
});
