import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        res = []
        path = []

        def backtrack(open: int, close: int) -> None:
            if len(path) == 2 * n:        # 2n 個字元都放好了
                res.append("".join(path))
                return
            if open < n:                  # 左括號還有額度
                path.append("(")
                backtrack(open + 1, close)
                path.pop()
            if close < open:              # 有還沒配對的左括號，才能放右括號
                path.append(")")
                backtrack(open, close + 1)
                path.pop()

        backtrack(0, 0)
        return res`;

/** Decision tree that grows as the backtracking explores it */
function decisionTree(rootVal: Cell) {
  const nodes: TreeNodeSpec[] = [{ id: "r", val: rootVal, children: [] }];
  const done: Record<string, Tone> = {};
  const edgeLabels: Record<string, string> = {};
  const stack = ["r"];
  return {
    /** choose: add a child under the current node and step into it */
    down(val: Cell, edge: string) {
      const parent = stack[stack.length - 1];
      const id = `d${nodes.length}`;
      nodes.push({ id, val, children: [] });
      nodes.find((n) => n.id === parent)!.children!.push(id);
      edgeLabels[`${parent}>${id}`] = edge;
      stack.push(id);
    },
    /** how the current node ended (solution / dead end) */
    settle(tone: Tone) {
      done[stack[stack.length - 1]] = tone;
    },
    /** undo: step back to the parent */
    up() {
      const id = stack.pop()!;
      done[id] ??= "visited";
    },
    view(label: string) {
      const marks: Record<string, Tone> = { ...done };
      const edgeMarks: Record<string, Tone> = {};
      stack.forEach((id, k) => {
        marks[id] = k === stack.length - 1 ? (done[id] ?? "active") : "compare";
        if (k > 0) edgeMarks[`${stack[k - 1]}>${id}`] = "active";
      });
      return V.tree(label, { nodes, root: "r" }, { marks, edgeLabels, edgeMarks });
    },
  };
}

export default defineProblem<{ n: number }>({
  id: 22,
  summary:
    "給一個整數 `n`，代表有 `n` 對括號。列出所有由這 `n` 對括號組成的**合法括號字串**（每個左括號都有對應的右括號，而且順序正確）。\n\n答案之間的順序不限。",
  examples: [
    { input: "n = 3", output: '["((()))","(()())","(())()","()(())","()()()"]' },
    { input: "n = 1", output: '["()"]' },
  ],
  constraints: ["1 ≤ n ≤ 8"],
  idea:
    "不要先產生全部 2²ⁿ 種字串再檢查，而是**邊放邊保證合法**。一個字一個字往後放，只要守住兩條規則就不會走錯：左括號最多放 `n` 個（`open < n`）；右括號只能在「還有沒配對的左括號」時放（`close < open`）。照這樣走到長度 `2n` 的每一條路徑都是合法答案 —— 決策樹上**沒有死路**。",
  steps: [
    "`backtrack(open, close)`：目前 `path` 裡已經放了幾個左括號、幾個右括號。",
    "`len(path) == 2n`：放滿了，把 `path` 接成字串收進 `res`。",
    "`open < n` 時可以放 `(`：`append` → 遞迴 → `pop`。",
    "`close < open` 時可以放 `)`：`append` → 遞迴 → `pop`。",
  ],
  pitfalls: [
    "右括號的條件是 `close < open`，不是 `close < n` —— 後者會產生 `())(` 這種不合法的字串。",
    "兩個 `if` 是各自獨立的（不是 `if / else`）：同一個位置兩種括號都可能可以放，兩條分支都要走。",
  ],
  complexity: { time: "O(4ⁿ / √n)（第 n 個卡塔蘭數 × 長度）", space: "O(n)（遞迴深度，不含輸出）" },
  code,
  starter: `class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        `,
  presets: [
    {
      label: "n = 3",
      input: { n: 3 },
      expected: '["((()))", "(()())", "(())()", "()(())", "()()()"]',
    },
    { label: "n = 2", input: { n: 2 }, expected: '["(())", "()()"]' },
    { label: "n = 1", input: { n: 1 }, expected: '["()"]' },
  ],
  trace({ n }) {
    const t = tracer();
    const res: string[] = [];
    const path: string[] = [];
    const tree = decisionTree('""');

    // The tree nodes spell out `path` and the watch panel shows open / close, so the
    // stage is just the tree plus `res` (an array keeps its own row: no layout jump).
    const views = (newest?: string) => [
      tree.view("決策樹（節點 = 目前的 path，邊 = 放的括號）"),
      V.array("res", res, { marks: newest ? { [res.length - 1]: "good" } : {} }),
    ];
    const str = () => `"${path.join("")}"`;

    t.push({
      line: [3, 4, 19],
      note: `要放 ${2 * n} 個字元。用 \`open\`、\`close\` 記錄已經放了幾個左、右括號，從 \`backtrack(0, 0)\` 開始。`,
      views: views(),
      vars: { n, open: 0, close: 0, path: '""' },
    });

    const backtrack = (open: number, close: number) => {
      if (path.length === 2 * n) {
        const s = path.join("");
        res.push(s);
        tree.settle("good");
        t.push({
          line: [7, 8, 9],
          note: `\`path\` 長度到 ${2 * n} 了。一路上都守著兩條規則，所以它一定合法 —— 把 \`"${s}"\` 收進 \`res\`。`,
          views: views(s),
          vars: { open, close, path: `"${s}"`, 已收集: res.length },
        });
        return;
      }
      const canClose = close < open;
      if (open < n) {
        path.push("(");
        tree.down(path.join(""), "(");
        t.push({
          line: [10, 11, 12],
          note: `\`open = ${open} < ${n}\`，左括號還有額度。**放** \`(\`，\`path\` 變成 \`${str()}\`，繼續往下。`,
          views: views(),
          vars: { open: open + 1, close, path: str() },
        });
        backtrack(open + 1, close);
        path.pop();
        tree.up();
        t.push({
          line: 13,
          note:
            `**撤銷**剛才的 \`(\`，回到 \`${str()}\`（open = ${open}, close = ${close}）。` +
            (canClose
              ? `同一個位置還可以改放 \`)\`，因為 \`close = ${close} < open = ${open}\`。`
              : `這個位置不能放 \`)\`：\`close == open == ${open}\`，沒有等待配對的左括號。這一層結束。`),
          views: views(),
          vars: { open, close, path: str() },
        });
      }
      if (canClose) {
        path.push(")");
        tree.down(path.join(""), ")");
        t.push({
          line: [14, 15, 16],
          note:
            (open === n ? `\`open == ${n}\`，左括號已經用完，只剩一種選擇。` : "") +
            `\`close = ${close} < open = ${open}\`，還有 ${open - close} 個左括號等著配對。**放** \`)\`，\`path\` 變成 \`${str()}\`。`,
          views: views(),
          vars: { open, close: close + 1, path: str() },
        });
        backtrack(open, close + 1);
        path.pop();
        tree.up();
        t.push({
          line: 17,
          note: `**撤銷**剛才的 \`)\`，回到 \`${str()}\`。這個位置能放的括號都試過了，返回上一層。`,
          views: views(),
          vars: { open, close, path: str() },
        });
      }
    };
    backtrack(0, 0);

    t.push({
      line: 20,
      note: `全部走完，共 ${res.length} 個合法字串。注意樹上每一片葉子都是綠色 —— 兩條規則讓我們從頭到尾沒走過任何一條不合法的路。`,
      views: views(),
      vars: { n, 已收集: res.length },
      result: py(res),
    });
    return t.frames;
  },
});
