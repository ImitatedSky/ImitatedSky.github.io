import { defineProblem } from "../types";
import type { Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def buildTree(self, inorder: List[int], postorder: List[int]) -> Optional[TreeNode]:
        idx = {v: i for i, v in enumerate(inorder)}  # 值 -> 在 inorder 的位置

        def build(lo, hi):  # 用 inorder[lo..hi] 建出一棵子樹
            if lo > hi:
                return None
            root = TreeNode(postorder.pop())  # 後序的最後一個就是根
            mid = idx[root.val]
            root.right = build(mid + 1, hi)  # 一定要先建右子樹
            root.left = build(lo, mid - 1)
            return root

        return build(0, len(inorder) - 1)`;

interface N {
  id: string;
  val: number;
  left: N | null;
  right: N | null;
}

/** Level-order values the way `tree_vals` prints a tree */
function levelVals(root: N | null): (number | null)[] {
  const out: (number | null)[] = [];
  const q: (N | null)[] = [root];
  while (q.length) {
    const n = q.shift()!;
    out.push(n ? n.val : null);
    if (n) q.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

export default defineProblem<{ inorder: number[]; postorder: number[] }>({
  id: 106,
  summary:
    "給同一棵二元樹的**中序走訪** `inorder` 和**後序走訪** `postorder`（節點值都不重複），把這棵樹還原出來，回傳根節點。",
  examples: [
    { input: "inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]", output: "[3,9,20,null,null,15,7]" },
    { input: "inorder = [-1], postorder = [-1]", output: "[-1]" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 3000", "所有節點值互不相同", "兩個陣列保證是同一棵樹的中序與後序"],
  idea:
    "後序是「左 → 右 → **根**」，所以後序的**最後一個**值一定是根。在中序（左 → 根 → 右）裡找到根，就能把它切成左子樹和右子樹兩段。從後序的尾巴一個一個往前拿，順序會是「根 → 右 → 左」，所以遞迴時要**先建右子樹、再建左子樹**。",
  steps: [
    "建立 `idx`：值 → 它在 `inorder` 的索引。",
    "`build(lo, hi)` 負責用 `inorder[lo..hi]` 這一段建出子樹；`lo > hi` 代表這段是空的，回傳 `None`。",
    "`postorder.pop()` 拿出尾巴的值當這棵子樹的根。",
    "`mid = idx[root.val]`：`inorder[mid+1..hi]` 是右子樹、`inorder[lo..mid-1]` 是左子樹。",
    "**先建右、再建左**，最後回傳 `root`。",
  ],
  pitfalls: [
    "跟 LC 105 最大的差別：這裡要**先遞迴右子樹**。後序從尾巴往前看，根的前一個是右子樹的根，先建左邊會 pop 到錯的值。",
    "`postorder.pop()` 會改到傳進來的陣列；如果不想動到輸入，可以改用一個從 `len - 1` 往前走的索引。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def buildTree(self, inorder: List[int], postorder: List[int]) -> Optional[TreeNode]:
        `,
  presets: [
    {
      label: "in=[9,3,15,20,7] post=[9,15,7,20,3]",
      input: { inorder: [9, 3, 15, 20, 7], postorder: [9, 15, 7, 20, 3] },
      expected: "[3, 9, 20, None, None, 15, 7]",
    },
    {
      label: "in=[4,2,5,1,3,6] post=[4,5,2,6,3,1]",
      input: { inorder: [4, 2, 5, 1, 3, 6], postorder: [4, 5, 2, 6, 3, 1] },
      expected: "[1, 2, 3, 4, 5, None, 6]",
    },
    {
      label: "in=[1,2,3] post=[3,2,1]",
      input: { inorder: [1, 2, 3], postorder: [3, 2, 1] },
      expected: "[1, None, 2, None, 3]",
    },
  ],
  trace({ inorder, postorder }) {
    const t = tracer();
    const n = inorder.length;
    const idx = new Map<number, number>();
    inorder.forEach((v, i) => idx.set(v, i));
    let remaining = postorder.length; // postorder[0..remaining-1] has not been popped yet

    // Tree drawn so far. A node appears as soon as it is created; the edge to its
    // parent is highlighted as "pending" until the call returns and it is really attached.
    const created: N[] = [];
    const parentOf = new Map<string, { parent: N; side: 0 | 1 }>();
    const attached = new Set<string>();
    const done = new Set<string>();
    const calls: { lo: number; hi: number; node: N | null }[] = [];

    const treeView = (active?: N, extra: Record<string, Tone> = {}) => {
      const kids = new Map<string, (string | null)[]>();
      parentOf.forEach(({ parent, side }, id) => {
        const k = kids.get(parent.id) ?? [null, null];
        k[side] = id;
        kids.set(parent.id, k);
      });
      const nodes: TreeNodeSpec[] = created.map((c) => ({ id: c.id, val: c.val, children: kids.get(c.id) ?? [] }));
      const marks: Record<string, Tone> = {};
      const edgeMarks: Record<string, Tone> = {};
      created.forEach((c) => (marks[c.id] = done.has(c.id) ? "good" : "visited"));
      parentOf.forEach(({ parent }, id) => {
        edgeMarks[`${parent.id}>${id}`] = attached.has(id) ? "good" : "compare";
      });
      if (active) marks[active.id] = "active";
      return V.tree("建出來的樹", { nodes, root: created[0]?.id ?? null }, {
        marks: { ...marks, ...extra },
        edgeMarks,
        pointers: active ? { root: active.id } : {},
      });
    };

    // Pointers outside the array would add padding and make the cells jump — only draw the ones inside
    const inside = (ptrs: Record<string, number>) =>
      Object.fromEntries(Object.entries(ptrs).filter(([, i]) => i >= 0 && i < n));

    const postView = (justPopped = false) => {
      const marks: Record<number, Tone> = {};
      for (let i = remaining; i < n; i++) marks[i] = "muted";
      if (justPopped) marks[remaining] = "active";
      return V.array("postorder（灰色 = 已經 pop 掉）", postorder, {
        marks,
        pointers: inside({ 尾端: remaining - 1 }),
      });
    };

    const views = (o: {
      lo: number;
      hi: number;
      mid?: number;
      active?: N;
      treeMarks?: Record<string, Tone>;
      justPopped?: boolean;
      pending?: string;
    }) => {
      const { lo, hi, mid } = o;
      const inMarks: Record<number, Tone> = {};
      for (let i = 0; i < n; i++) if (i < lo || i > hi) inMarks[i] = "muted";
      if (mid !== undefined) inMarks[mid] = "active";
      const ranges =
        mid === undefined
          ? [
              { from: lo, to: hi, tone: "active" as Tone, label: lo <= hi ? `lo..hi = ${lo}..${hi}` : "" },
              { from: lo, to: lo - 1, tone: "compare" as Tone, label: "" },
            ]
          : [
              { from: lo, to: mid - 1, tone: "alt" as Tone, label: lo <= mid - 1 ? "左子樹" : "" },
              { from: mid + 1, to: hi, tone: "compare" as Tone, label: mid + 1 <= hi ? "右子樹" : "" },
            ];

      const items = calls.map((c) => `build(${c.lo}, ${c.hi})${c.node ? `　root=${c.node.val}` : ""}`);
      if (o.pending) items[items.length - 1] += o.pending;
      return [
        postView(o.justPopped),
        V.array("inorder", inorder, { marks: inMarks, ranges, pointers: inside(lo === hi ? { "lo=hi": lo } : { lo, hi }) }),
        treeView(o.active, o.treeMarks),
        V.stack("呼叫堆疊", items, { marks: items.length ? { [items.length - 1]: "active" } : {} }),
      ];
    };

    t.push({
      line: 3,
      note: "先把 `inorder` 每個值的位置記進雜湊表 `idx`，之後找「根在中序的哪裡」只要 O(1)。後序是「左 → 右 → 根」，所以我們會從 `postorder` 的**尾巴**開始一個一個拿。",
      views: [
        postView(),
        V.array("inorder", inorder),
        treeView(),
        V.stack("呼叫堆疊", []),
      ],
    });

    const build = (lo: number, hi: number, parent: N | null, side: 0 | 1): N | null => {
      const call: { lo: number; hi: number; node: N | null } = { lo, hi, node: null };
      calls.push(call);
      const zh = side === 0 ? "左" : "右";

      if (lo > hi) {
        t.push({
          line: [5, 6, 7],
          note: `\`build(${lo}, ${hi})\`：\`lo > hi\`，中序裡已經沒有屬於這一側的值了，所以 \`${parent!.val}\` **沒有${zh}小孩**，回傳 \`None\`（不會 pop 任何東西）。`,
          views: views({ lo, hi, active: parent ?? undefined, pending: " → None" }),
          vars: { lo, hi, "len(postorder)": remaining },
        });
        calls.pop();
        return null;
      }

      remaining--;
      const val = postorder[remaining];
      const node: N = { id: `v${val}`, val, left: null, right: null };
      call.node = node;
      created.push(node);
      if (parent) parentOf.set(node.id, { parent, side });
      t.push({
        line: [5, 6, 8],
        note:
          `\`build(${lo}, ${hi})\`：後序是「左 → 右 → 根」，根永遠排在最後，所以 \`postorder.pop()\` 拿到的 \`${val}\` 就是 \`inorder[${lo}..${hi}]\` 這棵子樹的**根**。` +
          (parent ? `黃線：回傳後才接成 \`${parent.val}\` 的${zh}小孩。` : ""),
        views: views({ lo, hi, active: node, justPopped: true }),
        vars: { lo, hi, "root.val": val, "len(postorder)": remaining },
      });

      const mid = idx.get(val)!;
      const leftN = mid - lo;
      const rightN = hi - mid;
      t.push({
        line: 9,
        note:
          `查 \`idx[${val}] = ${mid}\`：根在中序的位置。` +
          (leftN === 0 && rightN === 0
            ? `這一段 \`inorder[${lo}..${hi}]\` 裡只有它自己，左右兩邊都沒有值 —— 它會是**葉節點**（接下來兩次遞迴都會拿到空區間）。`
            : `在這一段裡，它右邊的 ${rightN ? `\`inorder[${mid + 1}..${hi}]\`（${rightN} 個值）` : "0 個值"}全屬於**右子樹**，左邊的 ${leftN ? `\`inorder[${lo}..${mid - 1}]\`（${leftN} 個值）` : "0 個值"}全屬於**左子樹**。`) +
          (rightN > 0
            ? "後序的尾巴現在緊接著的是右子樹的節點，所以**先建右邊**。"
            : leftN > 0
              ? "照樣先呼叫右邊（會拿到空區間、不會 pop），之後尾巴上的值才輪到左子樹。"
              : ""),
        views: views({ lo, hi, mid, active: node }),
        vars: { lo, hi, mid, "root.val": val, "len(postorder)": remaining },
      });

      node.right = build(mid + 1, hi, node, 1);
      node.left = build(lo, mid - 1, node, 0);

      done.add(node.id);
      if (parent) attached.add(node.id);
      t.push({
        line: parent ? [12, side === 1 ? 10 : 11] : 12,
        note:
          `\`${val}\` 的右、左子樹都處理完了（右：\`${node.right ? node.right.val : "None"}\`，左：\`${node.left ? node.left.val : "None"}\`），回傳節點 \`${val}\`。` +
          (parent ? `上一層把它接成 \`${parent.val}\` 的**${zh}小孩**。` : ""),
        views: views({ lo, hi, mid, active: node, treeMarks: { [node.id]: "good" }, pending: ` → ${val}` }),
        vars: { lo, hi, mid, "root.val": val, "len(postorder)": remaining },
      });
      calls.pop();
      return node;
    };

    const root = build(0, n - 1, null, 0);
    const all: Record<number, Tone> = {};
    inorder.forEach((_, i) => (all[i] = "good"));
    t.push({
      line: 14,
      note: "`postorder` 被 pop 光了：每個值都剛好當過一次根，整棵樹還原完成，回傳最外層 `build` 的結果。",
      views: [
        postView(),
        V.array("inorder", inorder, { marks: all }),
        treeView(),
        V.stack("呼叫堆疊", []),
      ],
      vars: { "len(postorder)": remaining },
      result: py(levelVals(root)),
    });
    return t.frames;
  },
});
