import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []
        path = []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                res.append(path[:])       # 複製一份，path 之後還會變
                return
            for i in range(len(nums)):
                if used[i]:               # 這個數已經在 path 裡了
                    continue
                used[i] = True            # 選
                path.append(nums[i])
                backtrack()
                path.pop()                # 撤銷
                used[i] = False

        backtrack()
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

export default defineProblem<{ nums: number[] }>({
  id: 46,
  summary:
    "給一個**元素互不相同**的整數陣列 `nums`，列出它所有可能的**排列**（每個元素恰好用一次，順序不同就算不同的排列）。\n\n答案之間的順序不限。",
  summaryEn:
    "Given an integer array `nums` whose **elements are all distinct**, list every possible **permutation** of it (each element used exactly once; a different order counts as a different permutation).\n\nThe permutations can be returned in any order.",
  examples: [
    { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" },
    { input: "nums = [0,1]", output: "[[0,1],[1,0]]" },
    { input: "nums = [1]", output: "[[1]]" },
  ],
  constraints: ["1 ≤ nums.length ≤ 6", "nums 裡的整數互不相同"],
  constraintsEn: ["1 ≤ nums.length ≤ 6", "All integers in nums are distinct"],
  idea:
    "排列是一格一格填位置：第 1 格有 n 種選擇，第 2 格剩 n − 1 種…。跟「組合」不同，**順序有差**，所以每一層都要從頭掃過整個 `nums`，只是要跳過已經放進 `path` 的數 —— 用 `used[i]` 記錄誰被用掉了。",
  steps: [
    "`path` 是目前排好的前幾格，`used[i]` 表示 `nums[i]` 是否已經在 `path` 裡。",
    "`len(path) == len(nums)`：每一格都填好了，把 `path` 的複本收進 `res`。",
    "否則掃過每個 `i`：已經用過就跳過。",
    "沒用過的：標記 `used[i]`、`append` → 遞迴填下一格 → `pop`、取消標記。",
  ],
  pitfalls: [
    "撤銷要成對：`path.pop()` 和 `used[i] = False` 兩個都要做，少一個狀態就壞了。",
    "要存 `path[:]`（複本），不然 `res` 裡每一項都是同一個、最後被清空的串列。",
  ],
  complexity: { time: "O(n · n!)", space: "O(n)（遞迴深度與 used，不含輸出）" },
  code,
  starter: `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        `,
  presets: [
    {
      label: "[1,2,3]",
      input: { nums: [1, 2, 3] },
      expected: "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]",
    },
    { label: "[0,1]", input: { nums: [0, 1] }, expected: "[[0, 1], [1, 0]]" },
    { label: "[5]", input: { nums: [5] }, expected: "[[5]]" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    const res: number[][] = [];
    const path: number[] = [];
    const used: boolean[] = Array(n).fill(false);
    const tree = decisionTree("[]");
    // Short node labels: the whole path when every value is a single digit
    const compact = nums.every((v) => v >= 0 && v <= 9);

    const views = (i?: number, newest?: number[]) => {
      const marks: Record<number, Tone> = {};
      used.forEach((u, idx) => {
        if (u) marks[idx] = "muted";
      });
      if (i !== undefined) marks[i] = "active";
      return [
        V.array("nums（灰色 = 已經用掉）", nums, { marks, pointers: i !== undefined ? { i } : {} }),
        // no separate path array: the highlighted tree node *is* the current path
        tree.view("決策樹（節點 = 目前的 path，邊 = 選的數）"),
        V.array("res", res.map((p) => py(p)), { marks: newest ? { [res.length - 1]: "good" } : {} }),
      ];
    };

    t.push({
      line: [3, 4, 5, 20],
      note: `要把 ${n} 個數排進 ${n} 個位置。\`used\` 全部是 \`False\`，\`path\` 是空的，開始一格一格填。`,
      views: views(),
      vars: { path: py(path), used: py(used) },
    });

    const backtrack = () => {
      if (path.length === n) {
        res.push([...path]);
        tree.settle("good");
        t.push({
          line: [8, 9, 10],
          note: `\`path\` 長度到 ${n}，每一格都填好了 —— 把複本 \`${py(path)}\` 收進 \`res\`。`,
          views: views(undefined, path),
          vars: { path: py(path), 已收集: res.length },
        });
        return;
      }
      const pos = path.length;
      let skipped: number[] = [];
      for (let i = 0; i < n; i++) {
        if (used[i]) {
          skipped.push(nums[i]);
          continue;
        }
        used[i] = true;
        path.push(nums[i]);
        tree.down(compact ? path.join("") : nums[i], String(nums[i]));
        t.push({
          line: [11, 12, 14, 15, 16],
          note:
            `填第 ${pos + 1} 格。` +
            (skipped.length ? `${skipped.map((v) => `\`${v}\``).join("、")} 已經在 \`path\` 裡，跳過；` : "") +
            `\`nums[${i}] = ${nums[i]}\` 還沒用過，**選**它並標記 \`used[${i}] = True\`，再往下填下一格。`,
          views: views(i),
          vars: { i, path: py(path), used: py(used) },
        });
        skipped = [];
        backtrack();
        path.pop();
        used[i] = false;
        tree.up();
        const rest = nums.filter((_, j) => j > i && !used[j]);
        t.push({
          line: [17, 18],
          note:
            `**撤銷**：把 \`${nums[i]}\` 從 \`path\` 拿掉、\`used[${i}]\` 改回 \`False\`，\`path\` 變回 \`${py(path)}\`。` +
            (rest.length
              ? `第 ${pos + 1} 格接著換試 \`${rest[0]}\`。`
              : `第 ${pos + 1} 格能放的都試過了，返回上一層。`),
          views: views(i),
          vars: { i, path: py(path), used: py(used) },
        });
      }
    };
    backtrack();

    t.push({
      line: 21,
      note: `整棵樹走完，共 ${res.length} 個排列（${n}! = ${res.length}）。每一層的分支數比上一層少 1，因為用過的數不能再選。`,
      views: views(),
      vars: { 已收集: res.length },
      result: py(res),
    });
    return t.frames;
  },
});
