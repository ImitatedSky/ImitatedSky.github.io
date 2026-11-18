import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        node = root
        while stack or node:
            while node:  # 一路往左走到底，沿途的節點先存起來
                stack.append(node)
                node = node.left
            node = stack.pop()  # 還沒數過的節點中最小的
            k -= 1
            if k == 0:
                return node.val
            node = node.right`;

export default defineProblem<{ root: (number | null)[]; k: number }>({
  id: 230,
  summary:
    "給一棵**二元搜尋樹**（BST）的根節點和一個整數 `k`，回傳樹中**第 k 小**的值（k 從 1 開始數）。",
  examples: [
    { input: "root = [3,1,4,null,2], k = 1", output: "1" },
    { input: "root = [5,3,6,2,4,null,null,1], k = 3", output: "3" },
  ],
  constraints: ["1 ≤ k ≤ 節點數 ≤ 10⁴", "0 ≤ Node.val ≤ 10⁴"],
  idea:
    "BST 的中序走訪會**由小到大**吐出每個值，所以第 k 個被走訪到的節點就是答案。用**明確的堆疊**做迭代版中序走訪，數到第 k 個就能立刻 `return`，不用把整棵樹走完。",
  steps: [
    "`node` 從 root 出發，準備一個空堆疊。",
    "只要 `node` 不是空的，就把它 push 進堆疊並往左走 —— 左邊的值更小，要先處理。",
    "走到底後 pop 出堆疊頂端：它是目前還沒數過的最小值，`k -= 1`。",
    "若 `k == 0`，這個節點就是第 k 小，回傳；否則轉向它的右子樹，回到步驟 2。",
  ],
  pitfalls: [
    "外層條件是 `stack or node`：堆疊空了但 `node` 還指著右子樹時，走訪還沒結束。",
    "pop 之後要走 `node.right`（可能是 `None`）；若是 `None`，下一輪會直接從堆疊 pop 出更上層的祖先。",
  ],
  complexity: { time: "O(h + k)，h 為樹高", space: "O(h)" },
  code,
  starter: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        `,
  presets: [
    { label: "[5,3,6,2,4,null,null,1], k = 3", input: { root: [5, 3, 6, 2, 4, null, null, 1], k: 3 }, expected: "3" },
    { label: "[5,3,8,2,4,7,9], k = 6", input: { root: [5, 3, 8, 2, 4, 7, 9], k: 6 }, expected: "8" },
    { label: "[3,1,4,null,2], k = 1", input: { root: [3, 1, 4, null, 2], k: 1 }, expected: "1" },
  ],
  trace({ root: level0, k: k0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    let k = k0;
    const stack: BTNode[] = [];
    const counted: BTNode[] = [];
    let node: BTNode | null = root;

    const views = (o: { tone?: Tone; top?: Tone; last?: Tone } = {}) => {
      const m: Record<string, Tone> = {};
      counted.forEach((n) => (m[n.id] = "visited"));
      stack.forEach((n) => (m[n.id] = "compare"));
      if (node) m[node.id] = o.tone ?? "active";
      return [
        V.tree("BST", spec, { marks: m, pointers: { node: node ? node.id : null } }),
        V.stack("stack", stack.map((n) => n.val), {
          marks: o.top && stack.length ? { [stack.length - 1]: o.top } : {},
        }),
        V.array("已數過（由小到大）", counted.map((n) => n.val), {
          marks: o.last && counted.length ? { [counted.length - 1]: o.last } : {},
        }),
      ];
    };

    t.push({
      line: [3, 4],
      note: `\`node\` 從 root 出發。BST 的中序走訪是由小到大，所以目標是找出**第 ${k0} 個**被走訪到的節點。`,
      views: views(),
      vars: { k },
    });

    while (stack.length || node) {
      while (node) {
        const cur: BTNode = node;
        stack.push(cur);
        node = cur.left;
        t.push({
          line: [6, 7, 8],
          note:
            `\`${cur.val}\` 先放進堆疊等著 —— 它的左子樹裡都是更小的值，要先數完。` +
            (cur.left ? `往左走到 \`${cur.left.val}\`。` : "左邊沒有節點了，`node = None`，往左的路走到底。"),
          views: views({ top: "active" }),
          vars: { k },
        });
      }

      node = stack.pop()!;
      k -= 1;
      counted.push(node);
      if (k === 0) {
        t.push({
          line: [9, 10],
          note: `pop 出 \`${node.val}\`：它是還沒數過的節點中最小的，也就是第 ${counted.length} 小。\`k\` 減 1 變成 \`0\`。`,
          views: views({ last: "active" }),
          vars: { k },
        });
        t.push({
          line: [11, 12],
          note: `\`k == 0\`，剛好數到第 ${k0} 個，答案就是 \`${node.val}\`。剩下的節點完全不用走。`,
          views: views({ tone: "good", last: "good" }),
          vars: { k },
          result: py(node.val),
        });
        return t.frames;
      }
      t.push({
        line: [9, 10, 11],
        note: `pop 出 \`${node.val}\`：它是還沒數過的節點中最小的，也就是第 ${counted.length} 小。\`k\` 減 1 變成 \`${k}\`，還沒到 0，繼續。`,
        views: views({ last: "active" }),
        vars: { k },
      });

      const cur: BTNode = node;
      node = cur.right;
      t.push({
        line: 13,
        note: cur.right
          ? `比 \`${cur.val}\` 大的下一個值在它的右子樹裡，轉向 \`${cur.right.val}\`，接著再一路往左找那棵子樹的最小值。`
          : `\`${cur.val}\` 沒有右子樹（\`node = None\`），內層 \`while\` 不會執行；下一個最小值就是堆疊頂端的祖先。`,
        views: views({ top: cur.right ? undefined : "active" }),
        vars: { k },
      });
    }

    // k 合法時不會走到這裡
    t.push({ line: 5, note: "整棵樹走完仍不足 k 個節點。", views: views(), vars: { k }, result: "None" });
    return t.frames;
  },
});
