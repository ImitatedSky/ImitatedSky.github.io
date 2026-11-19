import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def sumNumbers(self, root: Optional[TreeNode]) -> int:
        def dfs(node, cur):
            if not node:
                return 0
            cur = cur * 10 + node.val  # 把這一位數接到尾巴
            if not node.left and not node.right:
                return cur             # 葉節點：一個完整的數字
            return dfs(node.left, cur) + dfs(node.right, cur)

        return dfs(root, 0)`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 129,
  summary:
    "一棵二元樹的每個節點都是 `0`～`9` 的一位數。從根節點走到任何一個葉節點，把沿路的數字依序串起來就是一個整數（例如 `1 → 2 → 3` 代表 `123`）。\n\n把**所有**根到葉路徑代表的整數加總後回傳。",
  summaryEn:
    "Every node of a binary tree holds a single digit `0`–`9`. Reading the digits along a path from the root to a leaf gives an integer (for example `1 → 2 → 3` is `123`).\n\nReturn the sum of the integers formed by **all** root-to-leaf paths.",
  examples: [
    { input: "root = [1,2,3]", output: "25", note: "12 + 13 = 25", noteEn: "12 + 13 = 25" },
    { input: "root = [4,9,0,5,1]", output: "1026", note: "495 + 491 + 40 = 1026", noteEn: "495 + 491 + 40 = 1026" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 1000", "0 ≤ Node.val ≤ 9", "樹的深度不超過 10"],
  constraintsEn: ["1 ≤ number of nodes ≤ 1000", "0 ≤ Node.val ≤ 9", "The tree depth is at most 10"],
  idea:
    "往下走的時候把「到目前為止組出來的數字」`cur` 當參數帶著：每到一個節點就 `cur = cur * 10 + node.val`，等於在尾巴接上一位。走到葉節點時 `cur` 就是一個完整的數字；往回走時，每個節點把左右子樹回傳的總和加起來往上交。",
  steps: [
    "`dfs(node, cur)`：`cur` 是從根走到 `node` 的父節點為止組出的數字。",
    "空節點貢獻 `0`。",
    "`cur = cur * 10 + node.val`，把自己這一位接上去。",
    "葉節點直接回傳 `cur`；其他節點回傳 `dfs(左, cur) + dfs(右, cur)`。",
  ],
  pitfalls: [
    "只有**葉節點**才回傳 `cur`。如果在空節點回傳 `cur`，只有一個小孩的節點會把自己的前綴多算一次。",
    "`cur` 是用參數往下傳的值，左右兩邊拿到的是同一個前綴，互不影響，不需要手動「復原」。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def sumNumbers(self, root: Optional[TreeNode]) -> int:
        `,
  presets: [
    { label: "[4,9,0,5,1]", input: { root: [4, 9, 0, 5, 1] }, expected: "1026" },
    { label: "[1,2,3]", input: { root: [1, 2, 3] }, expected: "25" },
    { label: "[1,0,3,null,5]", input: { root: [1, 0, 3, null, 5] }, expected: "118" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    if (!root) {
      t.push({
        line: [11, 4, 5],
        note: "空樹：`dfs(None, 0)` 直接回傳 `0`。",
        views: [V.tree("tree", spec)],
        result: "0",
      });
      return t.frames;
    }

    const path: BTNode[] = [];
    const calls: string[] = [];
    const done: Record<string, Tone> = {};
    const ret: Record<string, number> = {}; // 各節點已回傳的值
    const numbers: number[] = []; // 已經組出的完整數字

    const views = (extra: Record<string, Tone> = {}, nullCall = false, fresh = false) => {
      const marks: Record<string, Tone> = { ...done };
      const edgeMarks: Record<string, Tone> = {};
      path.forEach((n, i) => {
        marks[n.id] = i === path.length - 1 && !nullCall ? "active" : "alt";
        if (i > 0) edgeMarks[`${path[i - 1].id}>${n.id}`] = "active";
      });
      Object.assign(marks, extra);
      const top = path[path.length - 1];
      const retSpec = {
        root: spec.root,
        nodes: spec.nodes.map((n) => ({ ...n, val: (n.id in ret ? ret[n.id] : "·") as Cell })),
      };
      const retMarks: Record<string, Tone> = {};
      Object.keys(ret).forEach((id) => (retMarks[id] = "good"));
      if (top && !(top.id in ret)) retMarks[top.id] = "active";
      return [
        V.tree("tree", spec, { marks, edgeMarks, pointers: nullCall ? { node: null } : top ? { node: top.id } : {} }),
        V.tree("dfs 回傳值（這棵子樹裡所有數字的和）", retSpec, { marks: retMarks }),
        V.array("已完成的數字", numbers, { marks: fresh ? { [numbers.length - 1]: "good" } : {} }),
        V.stack("呼叫堆疊 dfs(node, cur)", calls, { marks: calls.length ? { [calls.length - 1]: "active" } : {} }),
      ];
    };

    t.push({
      line: 11,
      note: "從根節點出發，一開始還沒有任何位數，所以 `cur = 0`。",
      views: views(),
    });

    const dfs = (node: BTNode | null, cur0: number, side: string): number => {
      if (!node) {
        calls.push(`(None, ${cur0})`);
        t.push({
          line: [4, 5],
          note: `${side}邊沒有節點，沒有數字可以貢獻，回傳 \`0\`（加法裡的 0 不影響總和）。`,
          views: views({}, true),
          vars: { cur: cur0, 回傳: 0 },
        });
        calls.pop();
        return 0;
      }

      path.push(node);
      calls.push(`(${node.val}, ${cur0})`);
      const cur = cur0 * 10 + node.val;
      t.push({
        line: [4, 6],
        note: `走到 \`${node.val}\`：把它接在 \`${cur0}\` 的尾巴，\`cur = ${cur0} × 10 + ${node.val} = ${cur}\`。`,
        views: views(),
        vars: { cur },
      });

      if (!node.left && !node.right) {
        ret[node.id] = cur;
        done[node.id] = "good";
        numbers.push(cur);
        t.push({
          line: [7, 8],
          note: `\`${node.val}\` 是葉節點，根到這裡的路徑組成一個完整的數字 **${cur}**，直接回傳。`,
          views: views({ [node.id]: "good" }, false, true),
          vars: { cur, 回傳: cur },
        });
        path.pop();
        calls.pop();
        return cur;
      }

      t.push({
        line: [7, 9],
        note: `\`${node.val}\` 不是葉節點，數字還沒組完。把前綴 \`cur = ${cur}\` 先帶去左子樹。`,
        views: views(),
        vars: { cur },
      });
      const left = dfs(node.left, cur, "左");
      t.push({
        line: 9,
        note: `回到 \`${node.val}\`：左子樹的總和是 \`${left}\`。右子樹要用**同一個**前綴 \`cur = ${cur}\` 再走一次。`,
        views: views(),
        vars: { cur, left },
      });
      const right = dfs(node.right, cur, "右");
      const total = left + right;
      ret[node.id] = total;
      done[node.id] = "visited";
      t.push({
        line: 9,
        note: `\`${node.val}\` 的左右都回來了：\`${left} + ${right} = ${total}\`，這是經過 \`${node.val}\` 的所有數字的總和，往上回傳。`,
        views: views({ [node.id]: "good" }),
        vars: { cur, left, right, 回傳: total },
      });
      path.pop();
      calls.pop();
      return total;
    };

    const ans = dfs(root, 0, "");
    t.push({
      line: 11,
      note: `根節點回傳 \`${ans}\`${numbers.length > 1 ? `（${numbers.join(" + ")}）` : ""}，就是所有根到葉數字的總和。`,
      views: views(),
      vars: { 答案: ans },
      result: py(ans),
    });
    return t.frames;
  },
});
