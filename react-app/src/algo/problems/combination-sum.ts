import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()                  # 排序後才能提早 break
        res = []
        path = []

        def backtrack(start: int, remain: int) -> None:
            if remain == 0:                # 剛好湊滿
                res.append(path[:])
                return
            for i in range(start, len(candidates)):
                x = candidates[i]
                if x > remain:             # 太大了，後面的只會更大
                    break
                path.append(x)             # 選
                backtrack(i, remain - x)   # 傳 i 不是 i + 1：同一個數可以再選
                path.pop()                 # 撤銷

        backtrack(0, target)
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
    /** true when nothing has been chosen below the current node */
    isLeaf() {
      const cur = stack[stack.length - 1];
      return nodes.find((n) => n.id === cur)!.children!.length === 0;
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

export default defineProblem<{ candidates: number[]; target: number }>({
  id: 39,
  summary:
    "給一組**互不相同**的正整數 `candidates` 和一個目標值 `target`，找出所有**總和等於 target** 的組合。\n\n同一個數可以**重複選任意多次**。組合不看順序，只要其中某個數被選的次數不同，就算不同的組合。",
  examples: [
    { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]", note: "2 + 2 + 3 = 7，7 = 7" },
    { input: "candidates = [2,3,5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]" },
    { input: "candidates = [2], target = 1", output: "[]" },
  ],
  constraints: ["1 ≤ candidates.length ≤ 30", "2 ≤ candidates[i] ≤ 40，互不相同", "1 ≤ target ≤ 40"],
  idea:
    "把狀態想成「**還差多少**」：每選一個數，`remain` 就減掉它，減到 0 就是一組答案。為了不重複，規定只能選「目前這個或更後面」的數（`start`）—— 遞迴時傳 `i` 而不是 `i + 1`，代表同一個數可以再選一次。先排序，遇到 `x > remain` 就能直接 `break`，因為後面只會更大。",
  steps: [
    "把 `candidates` 由小到大排序。",
    "`backtrack(start, remain)`：只能從 `candidates[start:]` 裡挑，還差 `remain`。",
    "`remain == 0`：把 `path` 的複本收進 `res`。",
    "由 `start` 往後掃：`x > remain` 就 `break`；否則 `append(x)` → `backtrack(i, remain - x)` → `pop()`。",
  ],
  pitfalls: [
    "遞迴傳 `i + 1` 會變成「每個數只能用一次」（那是 LC 40）；傳 `0` 則會產生 `[2,3]`、`[3,2]` 這種重複。",
    "`break` 只有在**排序過**才正確；沒排序的話只能 `continue`。",
    "記得存 `path[:]` 複本。",
  ],
  complexity: { time: "O(n^(target / min))（最壞情況）", space: "O(target / min)（遞迴深度）" },
  code,
  starter: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        `,
  presets: [
    { label: "[2,3,6,7], 7", input: { candidates: [2, 3, 6, 7], target: 7 }, expected: "[[2, 2, 3], [7]]" },
    {
      label: "[2,3,5], 8",
      input: { candidates: [2, 3, 5], target: 8 },
      expected: "[[2, 2, 2, 2], [2, 3, 3], [3, 5]]",
    },
    { label: "[5,3], 4", input: { candidates: [5, 3], target: 4 }, expected: "[]" },
  ],
  trace({ candidates: input, target }) {
    const t = tracer();
    const candidates = [...input].sort((a, b) => a - b);
    const n = candidates.length;
    const res: number[][] = [];
    const path: number[] = [];
    const tree = decisionTree(target);

    const views = (start: number, i?: number, tooBig = false, newest?: number[]) => {
      const marks: Record<number, Tone> = {};
      candidates.forEach((_, idx) => {
        if (idx < start) marks[idx] = "muted";
        else if (i !== undefined && tooBig && idx >= i) marks[idx] = "bad";
      });
      if (i !== undefined && !tooBig) marks[i] = "active";
      const pointers: Record<string, number> = { start };
      if (i !== undefined) pointers.i = i;
      return [
        V.array("candidates（已排序）", candidates, { marks, pointers }),
        V.array("path", path, { marks: path.length ? { [path.length - 1]: "active" } : {} }),
        tree.view("決策樹（節點 = 還差多少 remain，邊 = 選的數）"),
        V.set("res", res.map((p) => py(p)), { marks: newest ? { [py(newest)]: "good" } : {} }),
      ];
    };

    t.push({
      line: [3, 4, 5, 19],
      note: `先把 \`candidates\` 排序成 \`${py(candidates)}\`。目標是 ${target}，所以一開始 \`remain = ${target}\`，從 \`start = 0\` 開始挑。`,
      views: views(0),
      vars: { target, start: 0, remain: target },
    });

    const backtrack = (start: number, remain: number) => {
      if (remain === 0) {
        res.push([...path]);
        tree.settle("good");
        t.push({
          line: [8, 9, 10],
          note: `\`remain == 0\`，剛好湊滿 ${target}！把複本 \`${py(path)}\` 收進 \`res\`。`,
          views: views(start, undefined, false, path),
          vars: { start, remain, path: py(path), 已收集: res.length },
        });
        return;
      }
      for (let i = start; i < n; i++) {
        const x = candidates[i];
        if (x > remain) {
          const dead = tree.isLeaf();
          if (dead) tree.settle("bad");
          t.push({
            line: [12, 13, 14],
            note:
              `\`candidates[${i}] = ${x}\` 比 \`remain = ${remain}\` 還大，放進去就超過了。因為已經排序，後面的只會更大，直接 \`break\`。` +
              (dead ? `這個節點一個數都放不下 —— **死路**。` : ""),
            views: views(start, i, true),
            vars: { start, remain, i, x, path: py(path) },
          });
          break;
        }
        path.push(x);
        tree.down(remain - x, String(x));
        t.push({
          line: [11, 12, 15, 16],
          note:
            `還差 ${remain}，\`candidates[${i}] = ${x}\` 放得下。**選** \`${x}\`，\`remain\` 變成 \`${remain} - ${x} = ${remain - x}\`。` +
            `遞迴時 \`start\` 仍是 ${i}，所以 \`${x}\` 還可以再選。`,
          views: views(start, i),
          vars: { start, remain, i, x, path: py(path) },
        });
        backtrack(i, remain - x);
        path.pop();
        tree.up();
        t.push({
          line: 17,
          note:
            `**撤銷** \`${x}\`，\`path\` 變回 \`${py(path)}\`，\`remain\` 回到 ${remain}。` +
            (i + 1 < n
              ? `接著看下一個候選 \`candidates[${i + 1}] = ${candidates[i + 1]}\`。`
              : `候選數都試完了，返回上一層。`),
          views: views(start, i),
          vars: { start, remain, i, x, path: py(path) },
        });
      }
    };
    backtrack(0, target);

    t.push({
      line: 20,
      note:
        res.length > 0
          ? `搜尋結束，共 ${res.length} 組。綠色葉子是 \`remain\` 剛好減到 0 的路徑，紅色是差一點但再也放不下任何數的死路。`
          : `搜尋結束，沒有任何一條路徑能讓 \`remain\` 剛好減到 0，回傳空陣列。`,
      views: views(0),
      vars: { target, 已收集: res.length },
      result: py(res),
    });
    return t.frames;
  },
});
