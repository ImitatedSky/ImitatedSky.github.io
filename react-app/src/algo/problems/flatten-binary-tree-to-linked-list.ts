import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        cur = root
        while cur:
            if cur.left:
                # 左子樹的最右節點：前序走訪中，排在 cur.right 正前面的那個
                pre = cur.left
                while pre.right:
                    pre = pre.right
                pre.right = cur.right  # 右子樹接到 pre 後面
                cur.right = cur.left   # 左子樹整棵搬到右邊
                cur.left = None
            cur = cur.right`;

/** 等同 prelude 的 tree_vals：層序輸出、去掉尾端的 None */
function levelVals(root: BTNode | null): (number | null)[] {
  const out: (number | null)[] = [];
  const q: (BTNode | null)[] = [root];
  while (q.length) {
    const n = q.shift()!;
    if (!n) {
      out.push(null);
      continue;
    }
    out.push(n.val);
    q.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

export default defineProblem<{ root: (number | null)[] }>({
  id: 114,
  summary:
    "給一棵二元樹，把它**原地**攤平成一條「鏈結串列」：每個節點的 `left` 都是 `None`，`right` 指向下一個節點，而且節點的順序要跟**前序走訪**（根 → 左 → 右）一樣。\n\n不需要回傳任何東西，直接修改原本的樹。進階要求是只用 O(1) 的額外空間。",
  examples: [
    { input: "root = [1,2,5,3,4,null,6]", output: "[1,null,2,null,3,null,4,null,5,null,6]" },
    { input: "root = []", output: "[]" },
    { input: "root = [0]", output: "[0]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 2000", "-100 ≤ Node.val ≤ 100"],
  idea:
    "前序是「根 → 左子樹 → 右子樹」，所以右子樹的第一個節點，一定緊接在**左子樹最後被走訪的節點**後面 —— 也就是左子樹一路往右走到底的那個節點 `pre`。把右子樹掛到 `pre.right`，再把整棵左子樹搬到右邊，`cur` 這一格就攤平了；接著往右走一步，重複同樣的事。",
  steps: [
    "`cur` 從 root 出發，沿著 `right` 一路往下走。",
    "如果 `cur` 有左子樹：從 `cur.left` 一直往右走到底，找到 `pre`。",
    "`pre.right = cur.right`：把原本的右子樹接到 `pre` 後面。",
    "`cur.right = cur.left`、`cur.left = None`：左子樹整棵搬到右邊。",
    "`cur = cur.right`，直到走完為止。",
  ],
  pitfalls: [
    "重接的順序不能反：要**先**把 `cur.right` 存到 `pre.right`，才能覆寫 `cur.right`，不然右子樹就弄丟了。",
    "別忘了 `cur.left = None`，否則左指標還留著，樹並沒有真的變成鏈。",
    "內層 `while` 看起來像 O(n²)，但每條邊最多只會被 `pre` 走過一次，整體仍是 O(n)。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        """直接修改 root，不需要回傳"""
        `,
  presets: [
    {
      label: "[1,2,5,3,4,null,6]",
      input: { root: [1, 2, 5, 3, 4, null, 6] },
      expected: "[1, None, 2, None, 3, None, 4, None, 5, None, 6]",
    },
    {
      label: "[1,2,3,4,5,6,7]",
      input: { root: [1, 2, 3, 4, 5, 6, 7] },
      expected: "[1, None, 2, None, 4, None, 5, None, 3, None, 6, None, 7]",
    },
    { label: "[1,null,2,3]", input: { root: [1, null, 2, 3] }, expected: "[1, None, 2, None, 3]" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0); // 全新建的樹，可以放心改指標

    if (!root) {
      t.push({
        line: [3, 4],
        note: "空樹，`cur` 一開始就是 `None`，迴圈完全不會執行。",
        views: [V.tree("tree", treeSpec(root))],
        result: "[]",
      });
      return t.frames;
    }

    // 目標順序：原樹的前序走訪
    const order: BTNode[] = [];
    const walk = (n: BTNode | null) => {
      if (!n) return;
      order.push(n);
      walk(n.left);
      walk(n.right);
    };
    walk(root);
    const target = order.map((n) => n.val);

    let k = 0; // cur 是前序中的第 k 個
    const views = (
      cur: BTNode | null,
      pre: BTNode | null,
      extra: Record<string, Tone> = {},
      edgeMarks: Record<string, Tone> = {},
    ) => {
      const marks: Record<string, Tone> = {};
      const tmarks: Record<number, Tone> = {};
      for (let i = 0; i < k; i++) {
        marks[order[i].id] = "good";
        tmarks[i] = "good";
      }
      for (let i = 0; i + 1 < k; i++) edgeMarks[`${order[i].id}>${order[i + 1].id}`] ??= "good";
      if (cur) {
        marks[cur.id] = "active";
        tmarks[k] = "active";
      }
      if (pre) marks[pre.id] = "compare";
      const smarks = Object.fromEntries(Object.entries(tmarks).map(([i, tone]) => [String(target[+i]), tone]));
      const pointers: Record<string, string | null> = {};
      if (cur) pointers.cur = cur.id;
      if (pre) pointers.pre = pre.id;
      return [
        V.tree("tree", treeSpec(root), { marks: { ...marks, ...extra }, pointers, edgeMarks }),
        V.set("前序順序（攤平後的目標）", target, { marks: smarks }),
      ];
    };

    let cur: BTNode | null = root;
    t.push({
      line: 3,
      note: "`cur` 從 root 出發。目標是讓整棵樹變成一條只往右走的鏈，順序和旁邊的前序走訪一樣。",
      views: views(cur, null),
    });

    while (cur) {
      if (cur.left) {
        let pre: BTNode = cur.left;
        t.push({
          line: [5, 7],
          note:
            `\`${cur.val}\` 有左子樹。前序裡左子樹要排在右子樹前面，所以得先找出左子樹**最後一個**被走訪的節點：` +
            `\`pre\` 從 \`cur.left = ${pre.val}\` 開始。`,
          views: views(cur, pre),
          vars: { cur: cur.val, pre: pre.val },
        });
        while (pre.right) {
          pre = pre.right;
          t.push({
            line: [8, 9],
            note: `\`pre\` 還有右小孩，繼續往右走到 \`${pre.val}\` —— 左子樹的前序走訪最後會結束在最右邊。`,
            views: views(cur, pre),
            vars: { cur: cur.val, pre: pre.val },
          });
        }

        const oldRight = cur.right;
        pre.right = cur.right;
        t.push({
          line: 10,
          note: oldRight
            ? `\`pre = ${pre.val}\` 沒有右小孩了，它就是左子樹的尾巴。把 \`cur\` 的右子樹（\`${oldRight.val}\` 開頭）接到 \`pre.right\`：` +
              `右子樹現在排在整棵左子樹之後。舊的 \`cur.right\`（紅線）下一步就會被覆寫。`
            : `\`pre = ${pre.val}\` 就是左子樹的尾巴。\`cur\` 沒有右子樹，所以 \`pre.right\` 接上的是 \`None\`，沒有變化。`,
          views: views(
            cur,
            pre,
            {},
            oldRight ? { [`${pre.id}>${oldRight.id}`]: "good", [`${cur.id}>${oldRight.id}`]: "bad" } : {},
          ),
          vars: { cur: cur.val, pre: pre.val },
        });

        cur.right = cur.left;
        cur.left = null;
        t.push({
          line: [11, 12],
          note: `把左子樹整棵搬到右邊（\`cur.right = cur.left\`），再把 \`cur.left\` 清成 \`None\`。\`${cur.val}\` 這一格只剩右指標了。`,
          views: views(cur, pre, {}, { [`${cur.id}>${cur.right.id}`]: "active" }),
          vars: { cur: cur.val, pre: pre.val },
        });
      } else {
        t.push({
          line: 5,
          note: `\`${cur.val}\` 沒有左子樹，這一格本來就符合「只有右指標」，不用動。`,
          views: views(cur, null),
          vars: { cur: cur.val },
        });
      }

      const from: BTNode = cur;
      cur = cur.right;
      k++;
      t.push({
        line: 13,
        note: cur
          ? `\`${from.val}\` 處理完畢，\`cur\` 往右走到 \`${cur.val}\`。綠色的部分已經是攤平好的鏈。`
          : `\`${from.val}\` 的右邊是 \`None\`，\`cur\` 走到盡頭。`,
        views: views(cur, null),
        vars: { cur: cur ? cur.val : "None" },
      });
    }

    t.push({
      line: 4,
      note: "`cur` 變成 `None`，迴圈結束。整棵樹已經原地攤平成一條往右的鏈，順序正好是前序走訪，而且沒有用到任何額外的堆疊。",
      views: views(null, null),
      result: py(levelVals(root)),
    });
    return t.frames;
  },
});
