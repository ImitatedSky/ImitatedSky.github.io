import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        res = []
        q = deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            if len(res) % 2 == 1:  # 奇數層（從 0 算起）要右到左
                level.reverse()
            res.append(level)
        return res`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 103,
  summary:
    "給一棵二元樹的根節點，回傳它的**鋸齒狀層序走訪**：第一層由左到右，第二層由右到左，第三層再由左到右…… 方向一層一層交替。每一層的值各自放在一個陣列裡。",
  summaryEn:
    "Given the root of a binary tree, return its **zigzag level order traversal**: the first level left to right, the second right to left, the third left to right again, and so on, alternating each level. Each level's values go in their own array.",
  examples: [
    { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[20,9],[15,7]]" },
    { input: "root = [1]", output: "[[1]]" },
    { input: "root = []", output: "[]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 2000"],
  constraintsEn: ["0 ≤ number of nodes ≤ 2000"],
  idea:
    "走訪本身完全照一般的 BFS 層序（永遠由左到右、先左後右進佇列），**只在收集完一層之後決定要不要反轉**。`len(res)` 剛好是目前的層數，奇數層就把 `level` 反過來。",
  steps: [
    "空樹回傳 `[]`；否則把 root 放進佇列。",
    "每一輪依佇列長度 pop 出一整層，值依序放進 `level`，小孩先左後右 push 進佇列。",
    "若 `len(res)` 是奇數（第 1、3、5… 層），把 `level` 反轉。",
    "把 `level` 加進 `res`。",
  ],
  pitfalls: [
    "只反轉**輸出**，不要改變小孩進佇列的順序 —— 佇列的順序一亂，下一層的左右關係就錯了。",
    "用 `len(res)` 判斷層數，就不用另外維護方向旗標。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        `,
  presets: [
    {
      label: "[3,9,20,null,null,15,7]",
      input: { root: [3, 9, 20, null, null, 15, 7] },
      expected: "[[3], [20, 9], [15, 7]]",
    },
    {
      label: "四層 [1,2,3,4,5,6,7,8,null,null,9]",
      input: { root: [1, 2, 3, 4, 5, 6, 7, 8, null, null, 9] },
      expected: "[[1], [3, 2], [4, 5, 6, 7], [9, 8]]",
    },
    { label: "[]", input: { root: [] }, expected: "[]" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    if (!root) {
      t.push({ line: [3, 4], note: "空樹，直接回傳空陣列。", views: [V.tree("tree", spec)], result: "[]" });
      return t.frames;
    }

    const res: number[][] = [];
    const q: BTNode[] = [root];
    const done = new Set<string>();
    const views = (
      level: BTNode[],
      o: { node?: BTNode; levelTone?: Tone; treeLevel?: boolean } = {},
    ) => {
      const m: Record<string, Tone> = {};
      done.forEach((id) => (m[id] = "visited"));
      q.forEach((n) => (m[n.id] = "compare"));
      if (o.treeLevel) level.forEach((n) => (m[n.id] = o.levelTone ?? "good"));
      if (o.node) m[o.node.id] = "active";
      const lm: Record<number, Tone> = {};
      if (o.levelTone) level.forEach((_, i) => (lm[i] = o.levelTone!));
      return [
        V.tree("tree", spec, { marks: m, pointers: o.node ? { node: o.node.id } : {} }),
        V.queue("q", q.map((n) => n.val)),
        // ids 讓反轉時格子滑到新位置
        V.array("level", level.map((n) => n.val), { ids: level.map((n) => n.id), marks: lm }),
      ];
    };
    const dir = () => (res.length % 2 === 1 ? "右 → 左" : "左 → 右");

    t.push({
      line: [5, 6],
      note: "把 root 放進佇列。走訪方式和一般層序一模一樣，鋸齒只是**輸出時**的處理。",
      views: views([]),
      vars: { res: py(res) },
    });

    while (q.length) {
      const size = q.length;
      const level: BTNode[] = [];
      t.push({
        line: [7, 8, 9],
        note: `佇列裡的 ${size} 個節點就是第 ${res.length} 層（\`len(res) = ${res.length}\`）。這一層最後要以「${dir()}」的方向輸出。`,
        views: views(level),
        vars: { "len(res)": res.length, 方向: dir(), res: py(res) },
      });

      for (let k = 0; k < size; k++) {
        const node = q.shift()!;
        level.push(node);
        const kids = [node.left, node.right].filter((c): c is BTNode => c !== null);
        q.push(...kids);
        t.push({
          line: kids.length ? [10, 11, 12, 13, 14, 15] : [10, 11],
          note:
            `取出 \`${node.val}\` 接到 \`level\` 後面（先照左到右收集）。` +
            (kids.length
              ? `小孩 ${kids.map((c) => `\`${c.val}\``).join("、")} 照常先左後右進佇列。`
              : "它沒有小孩。"),
          views: views(level, { node }),
          vars: { "len(res)": res.length, 方向: dir(), res: py(res) },
        });
        done.add(node.id);
      }

      if (res.length % 2 === 1) {
        const before = py(level.map((n) => n.val));
        level.reverse();
        t.push({
          line: [16, 17],
          note: `\`len(res) = ${res.length}\` 是奇數，這一層要由右到左：把 \`${before}\` 反轉成 \`${py(level.map((n) => n.val))}\`。`,
          views: views(level, { levelTone: "alt", treeLevel: true }),
          vars: { "len(res)": res.length, 方向: dir(), res: py(res) },
        });
      } else {
        t.push({
          line: 16,
          note: `\`len(res) = ${res.length}\` 是偶數，這一層維持由左到右，不用反轉。`,
          views: views(level, { levelTone: "compare", treeLevel: true }),
          vars: { "len(res)": res.length, 方向: dir(), res: py(res) },
        });
      }

      const vals = level.map((n) => n.val);
      res.push(vals);
      t.push({
        line: 18,
        note: `把 \`${py(vals)}\` 加進 \`res\`。下一層的方向會跟著 \`len(res)\` 的奇偶自動翻轉。`,
        views: views(level, { levelTone: "good", treeLevel: true }),
        vars: { "len(res)": res.length, res: py(res) },
      });
    }

    const all: Record<string, Tone> = {};
    spec.nodes.forEach((n) => (all[n.id] = "good"));
    t.push({
      line: 19,
      note: "佇列空了，所有層都依鋸齒方向收集完畢。",
      views: [V.tree("tree", spec, { marks: all }), V.queue("q", []), V.array("level", [])],
      vars: { res: py(res) },
      result: py(res),
    });
    return t.frames;
  },
});
