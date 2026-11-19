import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def mirror(a, b):
            if not a and not b:
                return True
            if not a or not b or a.val != b.val:
                return False
            return mirror(a.left, b.right) and mirror(a.right, b.left)

        return mirror(root.left, root.right)`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 101,
  summary:
    "給一棵二元樹的根節點，判斷這棵樹是不是**左右對稱**：沿著根節點畫一條垂直的中線，左半邊和右半邊要像照鏡子一樣互相對映。",
  summaryEn:
    "Given the root of a binary tree, decide whether it is **symmetric**: draw a vertical line through the root, and the left half must be the mirror image of the right half.",
  examples: [
    { input: "root = [1,2,2,3,4,4,3]", output: "true" },
    { input: "root = [1,2,2,null,3,null,3]", output: "false", note: "兩個 3 都掛在右邊，沒有互為鏡像", noteEn: "both 3s hang on the right, so they do not mirror each other" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 1000", "-100 ≤ Node.val ≤ 100"],
  constraintsEn: ["1 ≤ number of nodes ≤ 1000", "-100 ≤ Node.val ≤ 100"],
  idea:
    "對稱不是「左子樹等於右子樹」，而是「左子樹是右子樹的**鏡像**」。同時拿兩個節點 `a`、`b` 比：值要相等，而且 `a` 的**外側**要對 `b` 的外側（`a.left` ↔ `b.right`）、`a` 的**內側**要對 `b` 的內側（`a.right` ↔ `b.left`）。",
  steps: [
    "寫一個 `mirror(a, b)`，判斷以 `a`、`b` 為根的兩棵子樹是否互為鏡像。",
    "兩個都空：對稱，回傳 `True`。只有一個空，或值不同：回傳 `False`。",
    "否則遞迴比外側 `mirror(a.left, b.right)` 與內側 `mirror(a.right, b.left)`，兩個都成立才是鏡像。",
    "答案就是 `mirror(root.left, root.right)`。",
  ],
  pitfalls: [
    "最常見的錯誤是寫成 `mirror(a.left, b.left)` —— 那是在判斷「兩棵樹相同」（LC 100），不是鏡像。",
    "只比每一層的值是否回文是不夠的，`[1,2,2,null,3,null,3]` 每一層的值都對稱，但空位的位置不對稱。",
  ],
  complexity: { time: "O(n)", space: "O(h)，h 為樹高（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        `,
  presets: [
    { label: "[1,2,2,3,4,4,3]", input: { root: [1, 2, 2, 3, 4, 4, 3] }, expected: "True" },
    { label: "[1,2,2,null,3,null,3]", input: { root: [1, 2, 2, null, 3, null, 3] }, expected: "False" },
    { label: "[1,2,2,3,4,5,3]", input: { root: [1, 2, 2, 3, 4, 5, 3] }, expected: "False" },
  ],
  trace({ root: level }) {
    const t = tracer();
    const root = buildTree(level)!;
    const spec = treeSpec(root);

    const calls: [BTNode | null, BTNode | null][] = [];
    const settled: Record<string, Tone> = { [root.id]: "muted" }; // the root sits on the mirror line
    const name = (n: BTNode | null) => (n ? String(n.val) : "None");

    const views = (tone: Tone, suffix = "") => {
      const marks: Record<string, Tone> = { ...settled };
      calls.slice(0, -1).forEach(([a, b]) => {
        if (a) marks[a.id] = "visited";
        if (b) marks[b.id] = "visited";
      });
      const top = calls[calls.length - 1];
      const [a, b] = top ?? [null, null];
      if (a) marks[a.id] = tone;
      if (b) marks[b.id] = tone;
      const items = calls.map(([x, y]) => `mirror(${name(x)}, ${name(y)})`);
      if (suffix && items.length) items[items.length - 1] += suffix;
      return [
        V.tree("tree（虛線 = 正在比對的鏡像配對）", spec, {
          marks,
          pointers: top ? { a: a?.id ?? null, b: b?.id ?? null } : {},
          links: a && b ? [{ from: a.id, to: b.id, tone }] : [],
        }),
        V.stack("呼叫堆疊", items, { marks: items.length ? { [items.length - 1]: tone } : {} }),
      ];
    };
    const vars = (a: BTNode | null, b: BTNode | null) => ({ a: name(a), b: name(b) });
    const settle = (a: BTNode | null, b: BTNode | null, tone: Tone) => {
      if (a) settled[a.id] = tone;
      if (b) settled[b.id] = tone;
    };

    t.push({
      line: 10,
      note: `根節點 \`${root.val}\` 在中線上，自己跟自己對稱。真正要檢查的是：它的左子樹和右子樹是不是**互為鏡像** —— 呼叫 \`mirror(root.left, root.right)\`。`,
      views: views("active"),
      vars: { "root.left": name(root.left), "root.right": name(root.right) },
    });

    const mirror = (a: BTNode | null, b: BTNode | null, where: string): boolean => {
      calls.push([a, b]);
      const done = (ans: boolean) => {
        calls.pop();
        return ans;
      };

      if (!a && !b) {
        t.push({
          line: [4, 5],
          note: `${where}：兩邊**都是空的**，空位對空位也算對稱，回傳 \`True\`。`,
          views: views("good", " → True"),
          vars: vars(a, b),
        });
        return done(true);
      }
      if (!a || !b) {
        settle(a, b, "bad");
        t.push({
          line: [6, 7],
          note: `${where}：\`a\` 是 \`${name(a)}\`、\`b\` 是 \`${name(b)}\` —— 一邊有節點，鏡子另一邊卻是空的，**形狀不對稱**，回傳 \`False\`。`,
          views: views("bad", " → False"),
          vars: vars(a, b),
        });
        return done(false);
      }
      if (a.val !== b.val) {
        settle(a, b, "bad");
        t.push({
          line: [6, 7],
          note: `${where}：兩邊都有節點，但 \`${a.val} ≠ ${b.val}\`，鏡子兩邊的**值不同**，回傳 \`False\`。`,
          views: views("bad", " → False"),
          vars: vars(a, b),
        });
        return done(false);
      }

      t.push({
        line: [4, 6, 8],
        note: `${where}：\`a\`、\`b\` 都存在而且 \`${a.val} == ${b.val}\`，這一對沒問題。接下來要比它們的小孩：先比**外側**（\`a.left\` ↔ \`b.right\`），再比**內側**（\`a.right\` ↔ \`b.left\`）。`,
        views: views("compare"),
        vars: vars(a, b),
      });

      const outer = mirror(a.left, b.right, `外側配對（\`${a.val}\` 的左 ↔ \`${b.val}\` 的右）`);
      if (!outer) {
        settle(a, b, "bad");
        t.push({
          line: 8,
          note: `回到 \`mirror(${a.val}, ${b.val})\`：外側已經不對稱，\`and\` **短路**，內側不用再比，直接回傳 \`False\`。`,
          views: views("bad", " → False"),
          vars: { ...vars(a, b), 外側: "False" },
        });
        return done(false);
      }
      t.push({
        line: 8,
        note: `回到 \`mirror(${a.val}, ${b.val})\`：外側是鏡像（\`True\`），接著比內側 \`a.right\` ↔ \`b.left\`。`,
        views: views("compare"),
        vars: { ...vars(a, b), 外側: "True" },
      });

      const inner = mirror(a.right, b.left, `內側配對（\`${a.val}\` 的右 ↔ \`${b.val}\` 的左）`);
      settle(a, b, inner ? "good" : "bad");
      t.push({
        line: 8,
        note: inner
          ? `回到 \`mirror(${a.val}, ${b.val})\`：值相等、外側和內側也都是鏡像，所以這兩棵子樹**互為鏡像**，回傳 \`True\`。`
          : `回到 \`mirror(${a.val}, ${b.val})\`：內側不對稱，\`True and False\` 是 \`False\`，往上回傳。`,
        views: views(inner ? "good" : "bad", inner ? " → True" : " → False"),
        vars: { ...vars(a, b), 外側: "True", 內側: py(inner) },
      });
      return done(inner);
    };

    const ans = mirror(root.left, root.right, "根的左右小孩");
    if (ans) settled[root.id] = "good";
    t.push({
      line: 10,
      note: ans
        ? "最外層的 `mirror` 回傳 `True`：左子樹和右子樹互為鏡像，整棵樹是對稱的。"
        : "最外層的 `mirror` 回傳 `False`：只要有一對鏡像位置對不上，整棵樹就不對稱。",
      views: views("active"),
      result: py(ans),
    });
    return t.frames;
  },
});
