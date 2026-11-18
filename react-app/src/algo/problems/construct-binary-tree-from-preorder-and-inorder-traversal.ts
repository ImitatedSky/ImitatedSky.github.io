import { defineProblem } from "../types";
import type { Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        idx = {v: i for i, v in enumerate(inorder)}  # 值 -> 在 inorder 的位置
        self.pre = 0  # preorder 下一個要用的位置

        def build(lo, hi):  # 用 inorder[lo..hi] 建出一棵子樹
            if lo > hi:
                return None
            root = TreeNode(preorder[self.pre])
            self.pre += 1
            mid = idx[root.val]
            root.left = build(lo, mid - 1)
            root.right = build(mid + 1, hi)
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

export default defineProblem<{ preorder: number[]; inorder: number[] }>({
  id: 105,
  summary:
    "給同一棵二元樹的**前序走訪** `preorder` 和**中序走訪** `inorder`（節點值都不重複），把這棵樹還原出來，回傳根節點。",
  examples: [
    { input: "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]", output: "[3,9,20,null,null,15,7]" },
    { input: "preorder = [-1], inorder = [-1]", output: "[-1]" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 3000", "所有節點值互不相同", "兩個陣列保證是同一棵樹的前序與中序"],
  idea:
    "前序是「**根** → 左 → 右」，所以前序的第一個值一定是根。中序是「左 → **根** → 右」，在中序裡找到根的位置，它左邊那一段就是整棵左子樹、右邊那一段就是整棵右子樹。左右兩段各自又是同樣的問題，遞迴下去即可。用雜湊表記住每個值在中序的位置，找根只要 O(1)。",
  steps: [
    "建立 `idx`：值 → 它在 `inorder` 的索引。再用 `self.pre` 記住 `preorder` 用到哪裡。",
    "`build(lo, hi)` 負責用 `inorder[lo..hi]` 這一段建出子樹；`lo > hi` 代表這段是空的，回傳 `None`。",
    "取 `preorder[self.pre]` 當這棵子樹的根，`self.pre` 往後一格。",
    "`mid = idx[root.val]`：`inorder[lo..mid-1]` 是左子樹、`inorder[mid+1..hi]` 是右子樹。",
    "**先建左、再建右**（跟前序的順序一致），最後回傳 `root`。",
  ],
  pitfalls: [
    "一定要**先遞迴左子樹**：前序在根之後緊接著的是左子樹的節點，順序反了 `self.pre` 就會拿錯值。",
    "每次用 `inorder.index(...)` 找根、或切片 `preorder[1:mid+1]` 會讓複雜度變成 O(n²)；用雜湊表加上索引範圍才是 O(n)。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        `,
  presets: [
    {
      label: "pre=[3,9,20,15,7] in=[9,3,15,20,7]",
      input: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] },
      expected: "[3, 9, 20, None, None, 15, 7]",
    },
    {
      label: "pre=[1,2,4,5,3,6] in=[4,2,5,1,3,6]",
      input: { preorder: [1, 2, 4, 5, 3, 6], inorder: [4, 2, 5, 1, 3, 6] },
      expected: "[1, 2, 3, 4, 5, None, 6]",
    },
    {
      label: "pre=[1,2,3] in=[3,2,1]",
      input: { preorder: [1, 2, 3], inorder: [3, 2, 1] },
      expected: "[1, 2, None, 3]",
    },
  ],
  trace({ preorder, inorder }) {
    const t = tracer();
    const n = inorder.length;
    const idx = new Map<number, number>();
    inorder.forEach((v, i) => idx.set(v, i));
    let pre = 0;

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

    const views = (o: {
      lo: number;
      hi: number;
      mid?: number;
      active?: N;
      treeMarks?: Record<string, Tone>;
      preTone?: Tone;
      idxKey?: number;
      pending?: string;
    }) => {
      const { lo, hi, mid } = o;
      const preMarks: Record<number, Tone> = {};
      for (let i = 0; i < pre; i++) preMarks[i] = "visited";
      if (o.preTone && pre - 1 >= 0) preMarks[pre - 1] = o.preTone;

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
        V.array("preorder", preorder, { marks: preMarks, pointers: inside({ pre }) }),
        V.array("inorder", inorder, { marks: inMarks, ranges, pointers: inside({ lo, hi }) }),
        V.map("idx（值 → inorder 位置）", idx, {
          marks: o.idxKey !== undefined ? { [String(o.idxKey)]: "active" } : {},
        }),
        treeView(o.active, o.treeMarks),
        V.stack("呼叫堆疊", items, { marks: items.length ? { [items.length - 1]: "active" } : {} }),
      ];
    };

    t.push({
      line: [3, 4],
      note: "先把 `inorder` 每個值的位置記進雜湊表 `idx`，之後找「根在中序的哪裡」只要 O(1)。`self.pre = 0` 指向 `preorder` 下一個要拿來當根的值。",
      views: [
        V.array("preorder", preorder, { pointers: inside({ pre }) }),
        V.array("inorder", inorder),
        V.map("idx（值 → inorder 位置）", idx),
        treeView(),
        V.stack("呼叫堆疊", []),
      ],
      vars: { "self.pre": pre },
    });

    const build = (lo: number, hi: number, parent: N | null, side: 0 | 1): N | null => {
      const call: { lo: number; hi: number; node: N | null } = { lo, hi, node: null };
      calls.push(call);
      const zh = side === 0 ? "左" : "右";

      if (lo > hi) {
        t.push({
          line: [6, 7, 8],
          note: `\`build(${lo}, ${hi})\`：\`lo > hi\`，中序裡已經沒有屬於這一側的值了，所以 \`${parent!.val}\` **沒有${zh}小孩**，回傳 \`None\`。`,
          views: views({ lo, hi, active: parent ?? undefined, pending: " → None" }),
          vars: { lo, hi, "self.pre": pre },
        });
        calls.pop();
        return null;
      }

      const node: N = { id: `v${preorder[pre]}`, val: preorder[pre], left: null, right: null };
      const at = pre;
      pre++;
      call.node = node;
      created.push(node);
      if (parent) parentOf.set(node.id, { parent, side });
      t.push({
        line: [6, 7, 9, 10],
        note:
          `\`build(${lo}, ${hi})\`：要用 \`inorder[${lo}..${hi}]\` 建一棵子樹。前序是「根 → 左 → 右」，所以還沒用過的第一個值 \`preorder[${at}] = ${node.val}\` 就是**這棵子樹的根**。建立節點 \`${node.val}\`，\`self.pre\` 前進到 ${pre}。` +
          (parent ? `（它會是 \`${parent.val}\` 的${zh}小孩，等這次呼叫回傳才真正接上。）` : ""),
        views: views({ lo, hi, active: node, preTone: "active" }),
        vars: { lo, hi, "root.val": node.val, "self.pre": pre },
      });

      const mid = idx.get(node.val)!;
      const leftN = mid - lo;
      const rightN = hi - mid;
      t.push({
        line: 11,
        note:
          `查 \`idx[${node.val}] = ${mid}\`：根在中序的位置。` +
          (leftN === 0 && rightN === 0
            ? `這一段 \`inorder[${lo}..${hi}]\` 裡只有它自己，左右兩邊都沒有值 —— 它會是**葉節點**（接下來兩次遞迴都會拿到空區間）。`
            : `中序是「左 → 根 → 右」，所以在這一段裡，它左邊的 ${leftN ? `\`inorder[${lo}..${mid - 1}]\`（${leftN} 個值）` : "0 個值"}全屬於**左子樹**，右邊的 ${rightN ? `\`inorder[${mid + 1}..${hi}]\`（${rightN} 個值）` : "0 個值"}全屬於**右子樹**。`),
        views: views({ lo, hi, mid, active: node, idxKey: node.val }),
        vars: { lo, hi, mid, "root.val": node.val, "self.pre": pre },
      });

      node.left = build(lo, mid - 1, node, 0);
      node.right = build(mid + 1, hi, node, 1);

      done.add(node.id);
      if (parent) attached.add(node.id);
      t.push({
        line: parent ? [14, side === 0 ? 12 : 13] : 14,
        note:
          `\`${node.val}\` 的左、右子樹都處理完了（左：\`${node.left ? node.left.val : "None"}\`，右：\`${node.right ? node.right.val : "None"}\`），回傳節點 \`${node.val}\`。` +
          (parent ? `上一層把它接成 \`${parent.val}\` 的**${zh}小孩**。` : ""),
        views: views({ lo, hi, mid, active: node, treeMarks: { [node.id]: "good" }, pending: ` → ${node.val}` }),
        vars: { lo, hi, mid, "root.val": node.val, "self.pre": pre },
      });
      calls.pop();
      return node;
    };

    const root = build(0, n - 1, null, 0);
    const all: Record<number, Tone> = {};
    preorder.forEach((_, i) => (all[i] = "good"));
    t.push({
      line: 16,
      note: "`preorder` 的每個值都剛好當過一次根，整棵樹還原完成，回傳最外層 `build` 的結果。",
      views: [
        V.array("preorder", preorder, { marks: all, pointers: inside({ pre }) }),
        V.array("inorder", inorder, { marks: all }),
        V.map("idx（值 → inorder 位置）", idx),
        treeView(),
        V.stack("呼叫堆疊", []),
      ],
      vars: { "self.pre": pre },
      result: py(levelVals(root)),
    });
    return t.frames;
  },
});
