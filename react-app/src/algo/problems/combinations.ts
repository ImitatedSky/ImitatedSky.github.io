import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        res = []
        path = []

        def backtrack(start: int) -> None:
            if len(path) == k:
                res.append(path[:])       # 複製一份，path 之後還會變
                return
            need = k - len(path)          # 還缺幾個數
            # 剪枝：x 最大只能到 n - need + 1，再大就湊不滿 k 個
            for x in range(start, n - need + 2):
                path.append(x)            # 選
                backtrack(x + 1)          # 只往更大的數挑，避免重複
                path.pop()                # 撤銷

        backtrack(1)
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

export default defineProblem<{ n: number; k: number }>({
  id: 77,
  summary:
    "給兩個整數 `n` 和 `k`，從 `1` 到 `n` 這些數字裡**挑出 k 個**，列出所有可能的組合。\n\n組合不看順序：`[1,2]` 和 `[2,1]` 算同一組，只能出現一次。答案之間的順序不限。",
  summaryEn:
    "Given two integers `n` and `k`, list every way to **pick k numbers** out of `1` through `n`.\n\nOrder inside a combination doesn't matter: `[1,2]` and `[2,1]` are the same pick and must appear only once. The combinations themselves can come in any order.",
  examples: [
    { input: "n = 4, k = 2", output: "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]" },
    { input: "n = 1, k = 1", output: "[[1]]" },
  ],
  constraints: ["1 ≤ n ≤ 20", "1 ≤ k ≤ n"],
  constraintsEn: ["1 ≤ n ≤ 20", "1 ≤ k ≤ n"],
  idea:
    "為了不產生 `[1,2]`、`[2,1]` 這種重複，規定**每次只能挑比上一個更大的數**：`backtrack(start)` 只從 `start` 往後選。再加一個剪枝 —— 還缺 `need` 個數時，`x` 最大只能到 `n - need + 1`，再大的話後面的數根本不夠湊滿 `k` 個。",
  steps: [
    "`path` 是目前挑好的數；`backtrack(start)` 表示接下來只能從 `start…n` 裡挑。",
    "`len(path) == k`：湊滿了，把 `path` 的**複本**收進 `res`。",
    "否則算出還缺 `need = k - len(path)` 個，讓 `x` 從 `start` 跑到 `n - need + 1`。",
    "對每個 `x`：`append(x)` → `backtrack(x + 1)` → `pop()`。",
  ],
  pitfalls: [
    "要存 `path[:]`（複本）。直接 `res.append(path)` 存的是同一個串列，最後全部都會變成空的。",
    "遞迴要傳 `x + 1` 而不是 `start + 1`，不然會挑到比 `x` 小的數，產生重複組合。",
    "`range` 的上界是開區間，所以寫成 `n - need + 2`。",
  ],
  complexity: { time: "O(C(n, k) · k)", space: "O(k)（遞迴深度，不含輸出）" },
  code,
  starter: `class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        `,
  presets: [
    {
      label: "n = 4, k = 2",
      input: { n: 4, k: 2 },
      expected: "[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]",
    },
    {
      label: "n = 4, k = 3",
      input: { n: 4, k: 3 },
      expected: "[[1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4]]",
    },
    { label: "n = 4, k = 4", input: { n: 4, k: 4 }, expected: "[[1, 2, 3, 4]]" },
  ],
  trace({ n, k }) {
    const t = tracer();
    const res: number[][] = [];
    const path: number[] = [];
    const tree = decisionTree("[]");
    const all = Array.from({ length: n }, (_, i) => i + 1);

    /** start…limit is what this level may still pick; `x` is the number in hand */
    const views = (start: number, limit: number, x?: number, newest?: number[]) => {
      const marks: Record<number, Tone> = {};
      all.forEach((v, idx) => {
        if (path.includes(v)) marks[idx] = "good";
        else if (v < start) marks[idx] = "muted";
        else if (v > limit) marks[idx] = "bad";
      });
      if (x !== undefined) marks[x - 1] = "active";
      return [
        // no separate path array: green cells here + the highlighted tree node show it
        V.array("候選數字 1…n（綠色 = 已在 path 裡）", all, { marks }),
        tree.view("決策樹（節點 = 目前的 path，邊 = 選的數）"),
        V.array("res", res.map((p) => py(p)), { marks: newest ? { [res.length - 1]: "good" } : {} }),
      ];
    };

    t.push({
      line: [3, 4, 17],
      note: `要從 \`1…${n}\` 挑 ${k} 個。規定每次只能挑**比前一個大**的數，這樣同一組數字只會以遞增的樣子出現一次。從 \`backtrack(1)\` 開始。`,
      views: views(1, n - k + 1),
      vars: { n, k, start: 1 },
    });

    const backtrack = (start: number) => {
      if (path.length === k) {
        res.push([...path]);
        tree.settle("good");
        t.push({
          line: [7, 8, 9],
          note: `\`path\` 已經有 ${k} 個數，是一組完整的組合。把**複本** \`${py(path)}\` 收進 \`res\`。`,
          views: views(start, n, undefined, path),
          vars: { start, "len(path)": path.length, 已收集: res.length },
        });
        return;
      }
      const need = k - path.length;
      const limit = n - need + 1;
      for (let x = start; x <= limit; x++) {
        path.push(x);
        tree.down(path.join(""), String(x));
        t.push({
          line: [10, 12, 13, 14],
          note:
            `還缺 ${need} 個數，所以 \`x\` 只能落在 \`${start}…${limit}\`` +
            (limit < n ? `（選到 ${limit + 1} 以後，剩下的數就不夠湊滿 ${k} 個了 —— 紅色是被剪掉的）` : "") +
            `。**選** \`${x}\`，接著只往比它大的數挑。`,
          views: views(start, limit, x),
          vars: { start, need, x, path: py(path) },
        });
        backtrack(x + 1);
        path.pop();
        tree.up();
        t.push({
          line: 15,
          note:
            `**撤銷** \`${x}\`，\`path\` 變回 \`${py(path)}\`。` +
            (x + 1 <= limit
              ? `同一個位置換試下一個數 \`${x + 1}\`。`
              : limit < n
                ? `\`x\` 最大只到 ${limit}，再大就湊不滿了（剪枝），這一層結束。`
                : `已經試到 \`${n}\`，這一層結束。`),
          views: views(start, limit),
          vars: { start, need, x, path: py(path) },
        });
      }
    };
    backtrack(1);

    t.push({
      line: 18,
      note: `全部走完，共 ${res.length} 組 —— 正好是 C(${n}, ${k})。每片綠色葉子就是一組答案，而且因為有剪枝，樹上沒有任何一條白走的路。`,
      views: views(1, n),
      vars: { n, k, 已收集: res.length },
      result: py(res),
    });
    return t.frames;
  },
});
