import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
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
            res.append(level)
        return res`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 102,
  summary:
    "給一棵二元樹的根節點，回傳它的**層序走訪**結果：由上到下、每一層由左到右，每一層的節點值各自放在一個陣列裡。",
  summaryEn:
    "Given the root of a binary tree, return its **level order traversal**: top to bottom, left to right within each level, with each level's values in their own array.",
  examples: [
    { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
    { input: "root = []", output: "[]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 2000"],
  constraintsEn: ["0 ≤ number of nodes ≤ 2000"],
  idea:
    "BFS 用佇列。關鍵是**每一輪開始時先記下佇列長度**：那正好是「這一層」的節點數，照這個數量 pop，就能把一層一層切開。",
  steps: [
    "空樹直接回傳 `[]`；否則把 root 放進佇列。",
    "佇列不為空時，記下目前長度 `len(q)` —— 這一層有幾個節點。",
    "pop 出這麼多個節點：把值放進 `level`，並把它的左右小孩 push 進佇列（它們是下一層）。",
    "這一層處理完，把 `level` 加進答案。",
  ],
  pitfalls: ["`range(len(q))` 的長度在迴圈開始時就固定了，迴圈中新 push 的小孩不會被算進這一層。"],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        `,
  presets: [
    { label: "[3,9,20,null,null,15,7]", input: { root: [3, 9, 20, null, null, 15, 7] }, expected: "[[3], [9, 20], [15, 7]]" },
    { label: "[1,2,3,4,5,null,6]", input: { root: [1, 2, 3, 4, 5, null, 6] }, expected: "[[1], [2, 3], [4, 5, 6]]" },
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
    const marks = (extra: Record<string, Tone> = {}) => {
      const m: Record<string, Tone> = {};
      done.forEach((id) => (m[id] = "visited"));
      q.forEach((n) => (m[n.id] = "compare"));
      return { ...m, ...extra };
    };
    const views = (level: number[], extra: Record<string, Tone> = {}, node?: BTNode) => [
      V.tree("tree", spec, { marks: marks(extra), pointers: node ? { node: node.id } : {} }),
      V.queue("q", q.map((n) => n.val)),
      V.array("level", level),
    ];

    t.push({
      line: [5, 6],
      note: "把 root 放進佇列，準備開始一層一層走。",
      views: views([]),
      vars: { res: py(res) },
    });

    while (q.length) {
      const size = q.length;
      const level: number[] = [];
      t.push({
        line: [7, 8, 9],
        note: `佇列裡有 ${size} 個節點 —— 這就是**這一層**的全部節點。`,
        views: views(level),
        vars: { "len(q)": size, res: py(res) },
      });

      for (let k = 0; k < size; k++) {
        const node = q.shift()!;
        level.push(node.val);
        const kids = [node.left, node.right].filter((c): c is BTNode => c !== null);
        q.push(...kids);
        t.push({
          line: kids.length ? [10, 11, 12, 13, 14, 15] : [10, 11],
          note:
            `取出 \`${node.val}\` 放進 \`level\`。` +
            (kids.length
              ? `它的小孩 ${kids.map((c) => `\`${c.val}\``).join("、")} 排進佇列，留到下一層處理。`
              : "它沒有小孩。"),
          views: views(level, { [node.id]: "active" }, node),
          vars: { "len(q)": q.length, res: py(res) },
        });
        done.add(node.id);
      }

      res.push(level);
      t.push({
        line: 16,
        note: `這一層走完，把 \`${py(level)}\` 加進答案。`,
        views: views(level),
        vars: { res: py(res) },
      });
    }

    const all: Record<string, Tone> = {};
    spec.nodes.forEach((n) => (all[n.id] = "good"));
    t.push({
      line: 17,
      note: "佇列空了，所有層都處理完畢。",
      views: [V.tree("tree", spec, { marks: all }), V.queue("q", [])],
      vars: { res: py(res) },
      result: py(res),
    });
    return t.frames;
  },
});
