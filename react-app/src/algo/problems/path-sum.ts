import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        if not root:
            return False
        remain = targetSum - root.val
        if not root.left and not root.right:  # 葉節點：剛好扣完才算數
            return remain == 0
        return (self.hasPathSum(root.left, remain)
                or self.hasPathSum(root.right, remain))`;

export default defineProblem<{ root: (number | null)[]; targetSum: number }>({
  id: 112,
  summary:
    "給一棵二元樹和一個整數 `targetSum`，判斷樹裡有沒有一條**從根節點走到葉節點**的路徑，路徑上所有節點值加起來剛好等於 `targetSum`。\n\n葉節點指的是沒有任何小孩的節點；路徑一定要走到葉節點才算數。",
  examples: [
    { input: "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22", output: "true", note: "5 → 4 → 11 → 2" },
    { input: "root = [1,2,3], targetSum = 5", output: "false" },
    { input: "root = [], targetSum = 0", output: "false" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 5000", "-1000 ≤ Node.val、targetSum ≤ 1000"],
  idea:
    "與其一路把總和加上去，不如把目標**一路扣下來**：每經過一個節點，就把它的值從目標中扣掉，再把「剩下還需要多少」交給小孩。走到葉節點時，如果剛好扣到 0，這條路徑就是答案。",
  steps: [
    "空節點代表這個方向沒有路，回傳 `False`。",
    "`remain = targetSum - root.val`：扣掉自己之後還差多少。",
    "如果是葉節點，答案就是 `remain == 0`。",
    "否則把 `remain` 交給左、右子樹，只要有一邊回傳 `True` 就成立（`or` 會短路，左邊成功就不必再看右邊）。",
  ],
  pitfalls: [
    "一定要**走到葉節點**才能判斷。只有一個小孩的節點不是葉節點，就算當下剛好扣到 0 也不算。",
    "節點值可能是負數，所以不能因為「已經超過目標」就提早放棄。",
    "空樹沒有任何路徑，即使 `targetSum = 0` 也是 `False`。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        `,
  presets: [
    {
      label: "[5,4,8,11,null,13,4,7,2,null,null,null,1], 22",
      input: { root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], targetSum: 22 },
      expected: "True",
    },
    { label: "[1,2,3,4,null,null,5], 6", input: { root: [1, 2, 3, 4, null, null, 5], targetSum: 6 }, expected: "False" },
    { label: "[1,2], 1（根不是葉）", input: { root: [1, 2], targetSum: 1 }, expected: "False" },
  ],
  trace({ root: level0, targetSum }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    if (!root) {
      t.push({
        line: [3, 4],
        note: "空樹沒有任何根到葉的路徑，直接回傳 `False`。",
        views: [V.tree("tree", spec)],
        vars: { targetSum },
        result: "False",
      });
      return t.frames;
    }

    const path: BTNode[] = []; // 目前遞迴路徑上的節點
    const calls: string[] = []; // 呼叫堆疊
    const status: Record<string, Tone> = {}; // 已經回傳的節點
    const keep: Record<string, Tone> = {}; // 找到答案後，保留整條路徑的邊
    const leave = (ok: boolean) => {
      const node = path.pop()!;
      calls.pop();
      const parent = path[path.length - 1];
      if (ok && parent) keep[`${parent.id}>${node.id}`] = "good";
      return ok;
    };

    const views = (extra: Record<string, Tone> = {}, pathTone: Tone = "active", nullCall = false) => {
      const marks: Record<string, Tone> = { ...status };
      const edgeMarks: Record<string, Tone> = { ...keep };
      path.forEach((n, i) => {
        marks[n.id] = i === path.length - 1 && !nullCall ? "active" : "alt";
        if (i > 0) edgeMarks[`${path[i - 1].id}>${n.id}`] = pathTone;
      });
      const top = path[path.length - 1];
      return [
        V.tree("tree", spec, {
          marks: { ...marks, ...extra },
          edgeMarks,
          pointers: nullCall ? { root: null } : top ? { root: top.id } : {},
        }),
        V.stack("呼叫堆疊 hasPathSum(root, targetSum)", calls, { marks: calls.length ? { [calls.length - 1]: "active" } : {} }),
        V.array(
          "目前路徑",
          path.map((n) => n.val),
          { marks: path.length ? { [path.length - 1]: extra[top.id] ?? "active" } : {} },
        ),
      ];
    };
    const sumOf = () => path.reduce((s, n) => s + n.val, 0);

    const dfs = (node: BTNode | null, target: number, side: string): boolean => {
      if (!node) {
        calls.push(`(None, ${target})`);
        t.push({
          line: [3, 4],
          note: `${side}邊沒有節點，這個方向沒有路，回傳 \`False\`。`,
          views: views({}, "active", true),
          vars: { targetSum: target, 回傳: "False" },
        });
        calls.pop();
        return false;
      }

      path.push(node);
      calls.push(`(${node.val}, ${target})`);
      const remain = target - node.val;
      const isLeaf = !node.left && !node.right;

      t.push({
        line: [3, 5],
        note:
          `走到 \`${node.val}\`，這時還需要 \`${target}\`。扣掉自己：\`remain = ${target} - ${node.val < 0 ? `(${node.val})` : node.val} = ${remain}\`` +
          `（路徑總和目前是 ${sumOf()}）。`,
        views: views(),
        vars: { targetSum: target, remain },
      });

      if (isLeaf) {
        const ok = remain === 0;
        status[node.id] = ok ? "good" : "bad";
        t.push({
          line: [6, 7],
          note: ok
            ? `\`${node.val}\` 是葉節點，而且 \`remain\` 剛好是 0 —— 這條根到葉的路徑總和就是目標，回傳 \`True\`。`
            : `\`${node.val}\` 是葉節點，但 \`remain = ${remain}\` 不是 0，這條路徑的總和不對，回傳 \`False\`。`,
          views: views({ [node.id]: ok ? "good" : "bad" }, ok ? "good" : "active"),
          vars: { targetSum: target, remain, 回傳: py(ok) },
        });
        return leave(ok);
      }

      t.push({
        line: [6, 8],
        note:
          remain === 0
            ? `\`remain\` 已經是 0 了，但 \`${node.val}\` 還有小孩、**不是葉節點**，路徑不能停在這裡。照樣把 \`remain = 0\` 交給左子樹。`
            : `\`${node.val}\` 還有小孩，不是葉節點，現在不能下結論。先把 \`remain = ${remain}\` 交給左子樹。`,
        views: views(),
        vars: { targetSum: target, remain },
      });

      const left = dfs(node.left, remain, "左");
      if (left) {
        status[node.id] = "good";
        t.push({
          line: 8,
          note: `左子樹回傳 \`True\`，\`or\` 直接短路，不用再看右邊。\`${node.val}\` 也回傳 \`True\`。`,
          views: views({ [node.id]: "good" }, "good"),
          vars: { targetSum: target, remain, 回傳: "True" },
        });
        return leave(true);
      }

      t.push({
        line: 9,
        note: `回到 \`${node.val}\`：左邊找不到，換右子樹試試，一樣帶著 \`remain = ${remain}\`。`,
        views: views(),
        vars: { targetSum: target, remain },
      });

      const right = dfs(node.right, remain, "右");
      status[node.id] = right ? "good" : "muted";
      t.push({
        line: [8, 9],
        note: right
          ? `右子樹回傳 \`True\`，所以 \`${node.val}\` 也回傳 \`True\`。`
          : `左右兩邊都找不到總和剛好的路徑，\`${node.val}\` 回傳 \`False\`。`,
        views: views({ [node.id]: right ? "good" : "muted" }, right ? "good" : "active"),
        vars: { targetSum: target, remain, 回傳: py(right) },
      });
      return leave(right);
    };

    const ans = dfs(root, targetSum, "");
    const last = t.frames[t.frames.length - 1];
    last.result = py(ans);
    last.note += ans ? " 整棵樹的答案是 `True`。" : " 整棵樹的答案是 `False`。";
    return t.frames;
  },
});
