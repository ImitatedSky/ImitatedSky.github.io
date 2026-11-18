import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        prev = None  # 中序走訪的上一個值
        ans = inf

        def inorder(node):
            nonlocal prev, ans
            if not node:
                return
            inorder(node.left)
            if prev is not None:
                ans = min(ans, node.val - prev)
            prev = node.val
            inorder(node.right)

        inorder(root)
        return ans`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 530,
  summary:
    "給一棵**二元搜尋樹**（BST）的根節點，找出樹中**任意兩個不同節點**的值相差的絕對值最小是多少。",
  examples: [
    { input: "root = [4,2,6,1,3]", output: "1" },
    { input: "root = [1,0,48,null,null,12,49]", output: "1" },
  ],
  constraints: ["2 ≤ 節點數 ≤ 10⁴", "0 ≤ Node.val ≤ 10⁵"],
  idea:
    "BST 的**中序走訪會得到由小到大的序列**，而排序後的數列裡，差距最小的一對一定是**相鄰**的兩個。所以只要在中序走訪時記住上一個值 `prev`，每到一個節點就算 `node.val - prev`，取最小值即可。",
  steps: [
    "`prev = None`（還沒有上一個值）、`ans = inf`。",
    "中序走訪：先遞迴走完左子樹（所有比自己小的值）。",
    "輪到自己：若 `prev` 存在，用 `node.val - prev` 更新 `ans`；接著 `prev = node.val`。",
    "再遞迴走右子樹，最後回傳 `ans`。",
  ],
  pitfalls: [
    "只比較父子節點是錯的：最接近的兩個值可能隔了好幾層（例如根節點與左子樹的最右節點）。",
    "第一個節點沒有 `prev`，要跳過比較；用 `prev is not None` 判斷，因為值可能是 `0`。",
    "中序序列已經遞增，`node.val - prev` 一定 > 0，不需要 `abs`。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        `,
  presets: [
    { label: "[10,4,20,1,null,17,22]", input: { root: [10, 4, 20, 1, null, 17, 22] }, expected: "2" },
    { label: "[4,2,6,1,3]", input: { root: [4, 2, 6, 1, 3] }, expected: "1" },
    { label: "最近的不是父子 [10,5,null,1,9]", input: { root: [10, 5, null, 1, 9] }, expected: "1" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    let prev: BTNode | null = null;
    let ans = Infinity;
    let best: [BTNode, BTNode] | null = null;
    const order: BTNode[] = []; // 已經走訪過的節點（中序）
    const stack: BTNode[] = [];
    const showAns = () => (ans === Infinity ? "inf" : ans);

    const views = (node: BTNode | null, o: { comparing?: boolean; improved?: boolean } = {}) => {
      const m: Record<string, Tone> = {};
      order.forEach((n) => (m[n.id] = "visited"));
      if (best) {
        m[best[0].id] = "good";
        m[best[1].id] = "good";
      }
      if (node) m[node.id] = "active";
      if (o.comparing && prev) m[prev.id] = o.improved ? "good" : "compare";
      if (o.comparing && node) m[node.id] = o.improved ? "good" : "active";
      const pointers: Record<string, string> = {};
      if (prev) pointers.prev = prev.id;
      if (node) pointers.node = node.id;

      // 中序序列：把正在比較的相鄰兩格標出來
      const seq = order.map((n) => n.val);
      const sm: Record<number, Tone> = {};
      if (best) {
        const i = order.indexOf(best[1]);
        if (i >= 1) sm[i - 1] = sm[i] = "good";
      }
      const shown = o.comparing && node ? [...seq, node.val] : seq;
      if (o.comparing && node && prev) {
        sm[shown.length - 2] = o.improved ? "good" : "compare";
        sm[shown.length - 1] = o.improved ? "good" : "active";
      } else if (o.comparing && node) {
        sm[shown.length - 1] = "active";
      }
      return [
        V.tree("BST", spec, { marks: m, pointers }),
        V.array("中序序列（由小到大）", shown, { marks: sm }),
        V.stack("遞迴堆疊", stack.map((n) => `inorder(${n.val})`)),
      ];
    };

    t.push({
      line: [3, 4],
      note: "BST 的中序走訪是遞增序列，最小差距一定出現在**相鄰**的兩個值之間。用 `prev` 記住上一個走訪到的值。",
      views: views(null),
      vars: { prev: "None", ans: "inf" },
    });

    const inorder = (node: BTNode | null) => {
      if (!node) return;
      stack.push(node);
      if (node.left) {
        t.push({
          line: [8, 10],
          note: `來到 \`${node.val}\`，但還不能處理它：左子樹裡的值都比它小，要先走完（中序 = 左 → 自己 → 右）。`,
          views: views(node),
          vars: { prev: prev ? prev.val : "None", ans: showAns() },
        });
      }
      inorder(node.left);

      const lead = node.left ? `左子樹走完，回到 \`${node.val}\`。` : `\`${node.val}\` 沒有左子樹，直接輪到它。`;
      if (prev === null) {
        t.push({
          line: [11, 13],
          note: `${lead}它是整棵樹最小的值，前面還沒有任何數（\`prev\` 是 \`None\`），不用比較，只要記下 \`prev = ${node.val}\`。`,
          views: views(node, { comparing: true }),
          vars: { prev: "None", ans: showAns() },
        });
      } else {
        const diff = node.val - prev.val;
        const improved = diff < ans;
        const old = showAns();
        if (improved) {
          ans = diff;
          best = [prev, node];
        }
        t.push({
          line: [11, 12, 13],
          note:
            `${lead}它在排序後緊接在 \`prev = ${prev.val}\` 後面，差距 \`${node.val} - ${prev.val} = ${diff}\`` +
            (improved ? `，比 \`${old}\` 小，更新 \`ans = ${diff}\`。` : `，沒有比 \`ans = ${old}\` 小，不更新。`) +
            `接著 \`prev = ${node.val}\`。`,
          views: views(node, { comparing: true, improved }),
          vars: { prev: prev.val, "node.val - prev": diff, ans: showAns() },
        });
      }
      order.push(node);
      prev = node;

      if (node.right) {
        t.push({
          line: 14,
          note: `\`${node.val}\` 處理完，往右子樹走：那裡的值都比 \`${node.val}\` 大，其中最小的會是下一個和 \`prev = ${node.val}\` 相比的對象。`,
          views: views(node),
          vars: { prev: node.val, ans: showAns() },
        });
      }
      inorder(node.right);
      stack.pop();
    };
    inorder(root);

    t.push({
      line: [16, 17],
      note: best
        ? `走訪結束。相鄰差距最小的是 \`${(best as [BTNode, BTNode])[0].val}\` 和 \`${(best as [BTNode, BTNode])[1].val}\`，答案是 \`${ans}\`。`
        : "走訪結束。",
      views: views(null),
      vars: { ans: showAns() },
      result: py(ans),
    });
    return t.frames;
  },
});
