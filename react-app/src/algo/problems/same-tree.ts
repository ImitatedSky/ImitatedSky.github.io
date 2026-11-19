import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p and not q:
            return True
        if not p or not q or p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`;

type Level = (number | null)[];

export default defineProblem<{ p: Level; q: Level }>({
  id: 100,
  summary:
    "給兩棵二元樹的根節點 `p` 和 `q`，判斷它們是不是**同一棵樹**。\n\n「相同」的意思是：形狀完全一樣，而且每個對應位置上的節點值也都相等。",
  summaryEn:
    "Given the roots `p` and `q` of two binary trees, decide whether they are **the same tree**.\n\nThe same means identical shape, and equal values at every matching position.",
  examples: [
    { input: "p = [1,2,3], q = [1,2,3]", output: "true" },
    { input: "p = [1,2], q = [1,null,2]", output: "false", note: "值一樣但形狀不同：一個是左小孩，一個是右小孩", noteEn: "same values, different shape: one is a left child, the other a right child" },
    { input: "p = [1,2,1], q = [1,1,2]", output: "false" },
  ],
  constraints: ["0 ≤ 兩棵樹的節點數 ≤ 100", "-10⁴ ≤ Node.val ≤ 10⁴"],
  constraintsEn: ["0 ≤ number of nodes in each tree ≤ 100", "-10⁴ ≤ Node.val ≤ 10⁴"],
  idea:
    "兩棵樹**同步往下走**：同一時間各拿一個節點出來比。兩個都空 → 這個位置相同；只有一邊空或值不同 → 不同；否則這一格沒問題，把「左對左、右對右」交給遞迴，兩邊都相同才算相同。",
  steps: [
    "`p`、`q` 同時為空：這個位置一樣，回傳 `True`。",
    "只有一邊為空，或兩邊的值不同：回傳 `False`。",
    "否則遞迴比較 `(p.left, q.left)` 與 `(p.right, q.right)`，用 `and` 接起來。",
  ],
  pitfalls: [
    "兩個空節點的判斷要**放最前面**，不然後面讀 `p.val` 會對 `None` 取值而出錯。",
    "只比對走訪出來的值序列是不夠的：`[1,2]` 和 `[1,null,2]` 的前序都是 `1, 2`，但形狀不同。",
  ],
  complexity: { time: "O(min(m, n))", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        `,
  presets: [
    {
      label: "[1,2,3,4,5] vs [1,2,3,4,5]",
      input: { p: [1, 2, 3, 4, 5], q: [1, 2, 3, 4, 5] },
      expected: "True",
    },
    {
      label: "[1,2,3,4,5] vs [1,2,3,4,6]",
      input: { p: [1, 2, 3, 4, 5], q: [1, 2, 3, 4, 6] },
      expected: "False",
    },
    { label: "[1,2] vs [1,null,2]", input: { p: [1, 2], q: [1, null, 2] }, expected: "False" },
  ],
  trace({ p: pLevel, q: qLevel }) {
    const t = tracer();
    const pRoot = buildTree(pLevel);
    const qRoot = buildTree(qLevel);
    const pSpec = treeSpec(pRoot);
    const qSpec = treeSpec(qRoot);

    const calls: [BTNode | null, BTNode | null][] = [];
    const pMarks: Record<string, Tone> = {};
    const qMarks: Record<string, Tone> = {};
    const name = (n: BTNode | null) => (n ? String(n.val) : "None");
    const label = (a: BTNode | null, b: BTNode | null) => `isSameTree(${name(a)}, ${name(b)})`;

    const views = (tone: Tone, suffix = "") => {
      const [p, q] = calls[calls.length - 1];
      const pm: Record<string, Tone> = { ...pMarks };
      const qm: Record<string, Tone> = { ...qMarks };
      // Calls still waiting further down the stack
      calls.slice(0, -1).forEach(([a, b]) => {
        if (a) pm[a.id] = "visited";
        if (b) qm[b.id] = "visited";
      });
      if (p) pm[p.id] = tone;
      if (q) qm[q.id] = tone;
      const items = calls.map(([a, b]) => label(a, b));
      if (suffix) items[items.length - 1] += suffix;
      return [
        V.tree("p", pSpec, { marks: pm, pointers: pRoot ? { p: p?.id ?? null } : {} }),
        V.tree("q", qSpec, { marks: qm, pointers: qRoot ? { q: q?.id ?? null } : {} }),
        V.stack("呼叫堆疊", items, { marks: { [items.length - 1]: tone } }),
      ];
    };
    const vars = (p: BTNode | null, q: BTNode | null) => ({ p: name(p), q: name(q) });
    const settle = (p: BTNode | null, q: BTNode | null, tone: Tone) => {
      if (p) pMarks[p.id] = tone;
      if (q) qMarks[q.id] = tone;
    };

    const same = (p: BTNode | null, q: BTNode | null, where: string): boolean => {
      calls.push([p, q]);
      const done = (ans: boolean) => {
        calls.pop();
        return ans;
      };

      if (!p && !q) {
        t.push({
          line: [3, 4],
          note: `${where}：兩邊**都是空的**，這個位置長得一樣，回傳 \`True\`。`,
          views: views("good", " → True"),
          vars: vars(p, q),
        });
        return done(true);
      }
      if (!p || !q) {
        settle(p, q, "bad");
        t.push({
          line: [5, 6],
          note: `${where}：\`p\` 是 \`${name(p)}\`、\`q\` 是 \`${name(q)}\` —— 一邊有節點、另一邊是空的，**形狀不同**，回傳 \`False\`。`,
          views: views("bad", " → False"),
          vars: vars(p, q),
        });
        return done(false);
      }
      if (p.val !== q.val) {
        settle(p, q, "bad");
        t.push({
          line: [5, 6],
          note: `${where}：兩邊都有節點，但 \`${p.val} ≠ ${q.val}\`，**值不同**，回傳 \`False\`。`,
          views: views("bad", " → False"),
          vars: vars(p, q),
        });
        return done(false);
      }

      t.push({
        line: [3, 5, 7],
        note: `${where}：兩邊都有節點，而且 \`${p.val} == ${q.val}\`，這一格沒問題。但還不能下結論 —— 要繼續比它們的左子樹，再比右子樹。`,
        views: views("active"),
        vars: vars(p, q),
      });

      const left = same(p.left, q.left, `\`${p.val}\` 的左小孩`);
      if (!left) {
        settle(p, q, "bad");
        t.push({
          line: 7,
          note: `回到 \`${p.val}\`：左子樹已經不同了，\`and\` **短路**，右子樹連比都不用比，直接回傳 \`False\`。`,
          views: views("bad", " → False"),
          vars: { ...vars(p, q), 左子樹: "False" },
        });
        return done(false);
      }
      t.push({
        line: 7,
        note: `回到 \`${p.val}\`：左子樹完全相同（\`True\`）。\`and\` 的左邊成立，接著比右子樹。`,
        views: views("active"),
        vars: { ...vars(p, q), 左子樹: "True" },
      });

      const right = same(p.right, q.right, `\`${p.val}\` 的右小孩`);
      settle(p, q, right ? "good" : "bad");
      t.push({
        line: 7,
        note: right
          ? `回到 \`${p.val}\`：自己的值相同、左右子樹也都相同，所以以 \`${p.val}\` 為根的這兩棵子樹**完全相同**，回傳 \`True\`。`
          : `回到 \`${p.val}\`：右子樹不同，\`True and False\` 是 \`False\`，往上回傳 \`False\`。`,
        views: views(right ? "good" : "bad", right ? " → True" : " → False"),
        vars: { ...vars(p, q), 左子樹: "True", 右子樹: py(right) },
      });
      return done(right);
    };

    const ans = same(pRoot, qRoot, "從兩棵樹的根開始");
    const last = t.frames[t.frames.length - 1];
    last.note += ans ? "最外層的呼叫回傳 `True`：兩棵樹是同一棵。" : "`False` 一路傳回最外層：兩棵樹不相同。";
    last.result = py(ans);
    return t.frames;
  },
});
