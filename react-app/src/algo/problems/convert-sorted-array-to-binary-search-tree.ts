import { defineProblem } from "../types";
import type { Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def build(lo: int, hi: int) -> Optional[TreeNode]:
            if lo > hi:                       # 空區間 → 沒有節點
                return None
            mid = (lo + hi) // 2              # 取中間當根，左右兩邊才會一樣多
            root = TreeNode(nums[mid])
            root.left = build(lo, mid - 1)    # 左半邊都比它小
            root.right = build(mid + 1, hi)   # 右半邊都比它大
            return root

        return build(0, len(nums) - 1)`;

interface Built {
  mid: number;
  left: Built | null;
  right: Built | null;
}

export default defineProblem<{ nums: number[] }>({
  id: 108,
  summary:
    "給一個**由小到大排好**的整數陣列 `nums`，把它轉成一棵**高度平衡**的二元搜尋樹（BST）。\n\n高度平衡的意思是：每個節點的左右子樹高度差不超過 1。符合條件的樹可能不只一棵，回傳任何一棵都可以。",
  examples: [
    { input: "nums = [-10,-3,0,5,9]", output: "[0,-10,5,null,-3,null,9]", note: "[0,-3,9,-10,null,5] 也是正確答案" },
    { input: "nums = [1,3]", output: "[1,null,3]", note: "[3,1] 也可以" },
  ],
  constraints: ["1 ≤ nums.length ≤ 10⁴", "nums 嚴格遞增"],
  idea:
    "BST 的中序走訪剛好是排序好的陣列，所以反過來：**挑中間的數當根**，它左邊的數全部比它小 → 組成左子樹，右邊的數全部比它大 → 組成右子樹。每次都從正中間切，左右兩邊的數量最多差 1，樹自然就平衡。對左右兩半遞迴做同一件事。",
  steps: [
    "`build(lo, hi)` 負責把 `nums[lo..hi]` 這一段建成一棵子樹並回傳它的根。",
    "`lo > hi`：區間是空的，回傳 `None`。",
    "取 `mid = (lo + hi) // 2`，用 `nums[mid]` 建立節點。",
    "左子樹是 `build(lo, mid - 1)`，右子樹是 `build(mid + 1, hi)`，接好後回傳節點。",
  ],
  pitfalls: [
    "用索引 `lo / hi` 傳區間，不要每次切片 `nums[:mid]` —— 切片會多花 O(n log n) 的時間和空間。",
    "左右區間都要**排除 `mid`**（`mid - 1`、`mid + 1`），否則同一個數會被用兩次，而且遞迴不會停。",
  ],
  complexity: { time: "O(n)", space: "O(log n)（遞迴深度，不含輸出的樹）" },
  code,
  starter: `class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        `,
  presets: [
    {
      label: "[-10,-3,0,5,9]",
      input: { nums: [-10, -3, 0, 5, 9] },
      expected: "[0, -10, 5, None, -3, None, 9]",
    },
    {
      label: "[1,2,3,4,5,6,7]",
      input: { nums: [1, 2, 3, 4, 5, 6, 7] },
      expected: "[4, 2, 6, 1, 3, 5, 7]",
    },
    { label: "[1,3]", input: { nums: [1, 3] }, expected: "[1, None, 3]" },
  ],
  trace({ nums }) {
    const t = tracer();
    const n = nums.length;
    const id = (mid: number) => `m${mid}`;

    // Tree drawn so far: node id → [left, right]
    const kids = new Map<string, [string | null, string | null]>();
    let rootId: string | null = null;
    const finished = new Set<number>();
    const calls: { lo: number; hi: number; mid?: number }[] = [];

    const views = (lo: number, hi: number, mid?: number) => {
      const am: Record<number, Tone> = {};
      nums.forEach((_, i) => {
        if (kids.has(id(i))) am[i] = finished.has(i) ? "good" : "visited";
      });
      if (mid !== undefined) am[mid] = "active";
      const pointers: Record<string, number> = { lo, hi };
      if (mid !== undefined) pointers.mid = mid;

      const tm: Record<string, Tone> = {};
      kids.forEach((_, key) => (tm[key] = "visited"));
      finished.forEach((i) => (tm[id(i)] = "good"));
      calls.forEach((c, k) => {
        if (c.mid !== undefined && !finished.has(c.mid)) tm[id(c.mid)] = k === calls.length - 1 ? "active" : "compare";
      });
      const specs: TreeNodeSpec[] = [...kids.entries()].map(([key, [l, r]]) => ({
        id: key,
        val: nums[+key.slice(1)],
        children: l === null && r === null ? [] : [l, r],
      }));

      return [
        V.array("nums", nums, {
          marks: am,
          pointers,
          ranges: lo <= hi ? [{ from: lo, to: hi, tone: "active", label: "目前區間" }] : [],
        }),
        V.tree("BST", { nodes: specs, root: rootId }, { marks: tm }),
        V.stack(
          "呼叫堆疊",
          calls.map((c) => `build(${c.lo}, ${c.hi})`),
        ),
      ];
    };

    t.push({
      line: 12,
      note: `陣列已經排好序。呼叫 \`build(0, ${n - 1})\`，把整段 \`nums[0..${n - 1}]\` 建成一棵樹。`,
      views: views(0, n - 1),
      vars: { lo: 0, hi: n - 1 },
    });

    const build = (lo: number, hi: number, parent: number | null, side: "left" | "right" | null): Built | null => {
      const where = parent === null ? "" : `\`${nums[parent]}\` 的${side === "left" ? "左" : "右"}子樹`;
      calls.push({ lo, hi });
      if (lo > hi) {
        t.push({
          line: [side === "right" ? 9 : 8, 4, 5],
          note: `\`build(${lo}, ${hi})\`：\`lo > hi\`，${where}沒有任何數可以用，回傳 \`None\`。`,
          views: views(lo, hi),
          vars: { lo, hi },
        });
        calls.pop();
        return null;
      }
      const mid = Math.floor((lo + hi) / 2);
      calls[calls.length - 1].mid = mid;
      kids.set(id(mid), [null, null]);
      if (parent === null) rootId = id(mid);
      else kids.get(id(parent))![side === "left" ? 0 : 1] = id(mid);
      const leftCount = mid - lo;
      const rightCount = hi - mid;
      t.push({
        line: [4, 6, 7],
        note:
          `${where ? `建 ${where}：` : ""}區間 \`[${lo}..${hi}]\` 的中點是 \`mid = (${lo} + ${hi}) // 2 = ${mid}\`，用 \`nums[${mid}] = ${nums[mid]}\` 當根。` +
          `它左邊有 ${leftCount} 個數、右邊有 ${rightCount} 個數，數量最多只差 1，所以兩邊的高度也最多差 1。`,
        views: views(lo, hi, mid),
        vars: { lo, hi, mid, "nums[mid]": nums[mid] },
      });

      const left = build(lo, mid - 1, mid, "left");
      const right = build(mid + 1, hi, mid, "right");
      finished.add(mid);
      t.push({
        line: 10,
        note:
          `\`${nums[mid]}\` 的左右子樹都建好了` +
          `（左：${left ? `\`${nums[left.mid]}\`` : "`None`"}，右：${right ? `\`${nums[right.mid]}\`` : "`None`"}），回傳這個節點` +
          (parent === null ? "，它就是整棵樹的根。" : `，接到 \`${nums[parent]}\` 的 \`${side}\`。`),
        views: views(lo, hi, mid),
        vars: { lo, hi, mid, "nums[mid]": nums[mid] },
      });
      calls.pop();
      return { mid, left, right };
    };
    const root = build(0, n - 1, null, null);

    // LeetCode level-order output, trailing None trimmed
    const out: (number | null)[] = [];
    const q: (Built | null)[] = [root];
    while (q.length) {
      const node = q.shift()!;
      if (!node) {
        out.push(null);
        continue;
      }
      out.push(nums[node.mid]);
      q.push(node.left, node.right);
    }
    while (out.length && out[out.length - 1] === null) out.pop();

    t.push({
      line: 12,
      note: `整棵樹完成。每個節點左邊的數都比它小、右邊都比它大，而且每一層都是從中間切開，所以是一棵高度平衡的 BST。`,
      views: views(0, n - 1),
      vars: { 節點數: n },
      result: py(out),
    });
    return t.frames;
  },
});
