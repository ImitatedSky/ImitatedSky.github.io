import { defineProblem } from "../types";
import type { ListNodeSpec, Tone, View } from "../types";
import { V, buildTree, py, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class Solution:
    def connect(self, root: 'Node') -> 'Node':
        cur = root
        while cur:
            dummy = tail = Node(0)  # 下一層串列的假頭
            while cur:  # 沿著 next 走完這一層
                if cur.left:
                    tail.next = cur.left
                    tail = tail.next
                if cur.right:
                    tail.next = cur.right
                    tail = tail.next
                cur = cur.next
            cur = dummy.next  # 下到下一層的最左邊
        return root`;

export default defineProblem<{ root: (number | null)[] }>({
  id: 117,
  summary:
    "二元樹的每個節點除了 `left`、`right` 之外還多一個 `next` 指標（一開始都是 `None`）。請把每個節點的 `next` 指向**同一層右邊緊鄰的那個節點**；如果右邊已經沒有節點，就維持 `None`。\n\n這棵樹不一定是完美二元樹，中間可能有缺口。進階要求：只能用常數的額外空間。",
  summaryEn:
    "Each binary tree node has, besides `left` and `right`, a `next` pointer that starts out as `None`. Point every node's `next` at **the node immediately to its right on the same level**; if there is nothing to its right, leave it as `None`.\n\nThe tree is not necessarily perfect and may have gaps. Follow-up: use only constant extra space.",
  examples: [
    {
      input: "root = [1,2,3,4,5,null,7]",
      output: "[1,#,2,3,#,4,5,7,#]",
      note: "每一層用 next 串起來：1 → None、2 → 3 → None、4 → 5 → 7 → None", noteEn: "each level is chained by next: 1 → None, 2 → 3 → None, 4 → 5 → 7 → None",
    },
    { input: "root = []", output: "[]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 6000", "-100 ≤ Node.val ≤ 100"],
  constraintsEn: ["0 ≤ number of nodes ≤ 6000", "-100 ≤ Node.val ≤ 100"],
  idea:
    "一層被 `next` 串好之後，它本身就是一條**鏈結串列** —— 可以直接沿著 `next` 由左走到右，不需要佇列。走的同時，把沿途遇到的小孩一個一個接到「下一層的串列」尾端。用一個 `dummy` 假頭當下一層串列的起點，就不用特判「下一層的第一個節點是誰」。",
  steps: [
    "`cur` 從 `root` 開始，代表目前這一層的最左邊節點。",
    "每一層開始時建立 `dummy`，`tail` 指向它 —— 這是下一層串列目前的尾巴。",
    "沿著 `cur = cur.next` 走過這一層：有左小孩就接到 `tail` 後面並把 `tail` 往後移，右小孩同理。",
    "這一層走完後，`dummy.next` 就是下一層的最左邊節點，令 `cur = dummy.next` 繼續；如果是 `None`，代表沒有下一層了。",
  ],
  pitfalls: [
    "`dummy` 每一層都要**重新建立**。沿用舊的，當下一層是空的時 `dummy.next` 還指著舊節點，會變成無窮迴圈。",
    "不能假設 `cur.left.next = cur.right`、`cur.right.next = cur.next.left`（那是 LC 116 完美二元樹的寫法）；這題有缺口，要用 `tail` 接「下一個實際存在的小孩」。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `# class Node:
#     def __init__(self, val=0, left=None, right=None, next=None):
#         self.val = val
#         self.left = left
#         self.right = right
#         self.next = next

class Solution:
    def connect(self, root: 'Node') -> 'Node':
        `,
  presets: [
    {
      label: "[1,2,3,4,5,null,7]",
      input: { root: [1, 2, 3, 4, 5, null, 7] },
      expected: "[[1], [2, 3], [4, 5, 7]]",
    },
    {
      label: "[1,2,3,4,null,null,5,6,null,null,7]",
      input: { root: [1, 2, 3, 4, null, null, 5, 6, null, null, 7] },
      expected: "[[1], [2, 3], [4, 5], [6, 7]]",
    },
    { label: "[]", input: { root: [] }, expected: "[]" },
  ],
  trace({ root: level0 }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    if (!root) {
      t.push({
        line: [3, 4, 15],
        note: "`root` 是 `None`，`while cur` 一次都不會執行，直接回傳。",
        views: [V.tree("tree（虛線箭頭 = next）", spec)],
        result: "[]",
      });
      return t.frames;
    }

    const byId = new Map<string, BTNode>();
    const index = (n: BTNode | null) => {
      if (!n) return;
      byId.set(n.id, n);
      index(n.left);
      index(n.right);
    };
    index(root);

    const next = new Map<string, string>(); // real node → real node
    const doneLevel = new Set<string>([root.id]); // nodes on levels that are fully linked
    let chain: BTNode[] = []; // the next level's list so far (after dummy)
    let levelNo = 1;

    const views = (o: { cur: BTNode | null; showDummy?: boolean; fresh?: BTNode; extra?: Record<string, Tone> }) => {
      const { cur, fresh } = o;
      const marks: Record<string, Tone> = {};
      doneLevel.forEach((id) => (marks[id] = "good"));
      chain.forEach((n) => {
        if (!doneLevel.has(n.id)) marks[n.id] = "compare";
      });
      if (cur) marks[cur.id] = "active";
      Object.assign(marks, o.extra ?? {});

      const links = [...next.entries()].map(([from, to]) => ({
        from,
        to,
        tone: (doneLevel.has(from) ? "good" : fresh && to === fresh.id ? "active" : "compare") as Tone,
      }));
      const tail = chain[chain.length - 1];
      const pointers: Record<string, string | null> = o.showDummy === false && !cur ? {} : { cur: cur?.id ?? null };
      if (o.showDummy !== false && tail) pointers.tail = tail.id;

      const out: View[] = [V.tree("tree（虛線箭頭 = next）", spec, { marks, pointers, links })];
      if (o.showDummy === false) return out; // dummy does not exist (yet / any more)
      const listNodes: ListNodeSpec[] = [{ id: "d", val: "D" }, ...chain.map((n) => ({ id: n.id, val: n.val }))];
      const listMarks: Record<string, Tone> = { d: "muted" };
      chain.forEach((n) => (listMarks[n.id] = doneLevel.has(n.id) ? "good" : "compare"));
      if (fresh) listMarks[fresh.id] = "active";
      out.push(
        V.list("下一層的串列（D = dummy）", listNodes, {
          marks: listMarks,
          pointers: { tail: tail ? tail.id : "d" },
        }),
      );
      return out;
    };

    let cur: BTNode | null = root;
    t.push({
      line: 3,
      note: `\`cur\` 從根節點 \`${root.val}\` 開始。第 1 層只有根自己，它的 \`next\` 本來就是 \`None\`，等於已經串好了。`,
      views: views({ cur, showDummy: false }),
      vars: { 層: levelNo },
    });

    while (cur) {
      chain = [];
      t.push({
        line: [4, 5],
        note: `\`cur\` 站在第 ${levelNo} 層的最左邊。這一層已經用 \`next\` 串好，可以當鏈結串列走。先建立一個 \`dummy\` 當**第 ${levelNo + 1} 層串列**的假頭，\`tail\` 指向它 —— 之後遇到的小孩都接在 \`tail\` 後面。`,
        views: views({ cur }),
        vars: { 層: levelNo, cur: cur.val, tail: "dummy" },
      });

      while (cur) {
        const node: BTNode = cur;
        let any = false;
        for (const side of ["left", "right"] as const) {
          const child = node[side];
          if (!child) continue;
          any = true;
          const tail = chain[chain.length - 1];
          if (tail) next.set(tail.id, child.id);
          chain.push(child);
          const zh = side === "left" ? "左" : "右";
          t.push({
            line: side === "left" ? [7, 8, 9] : [10, 11, 12],
            note: tail
              ? `\`${node.val}\` 有${zh}小孩 \`${child.val}\`：接到 \`tail\`（\`${tail.val}\`）後面，也就是 \`${tail.val}.next = ${child.val}\`${
                  side === "right" && tail.id === node.left?.id
                    ? ""
                    : " —— 它們不是同一個爸爸的小孩，但 `tail` 記得上一個接上的是誰，中間的缺口就這樣被跨過去"
                }。然後 \`tail\` 移到 \`${child.val}\`。`
              : `\`${node.val}\` 有${zh}小孩 \`${child.val}\`：\`tail\` 還在 \`dummy\`，所以 \`dummy.next = ${child.val}\` —— 它就是下一層的**第一個**節點。然後 \`tail\` 移到 \`${child.val}\`。`,
            views: views({ cur: node, fresh: child }),
            vars: { 層: levelNo, cur: node.val, tail: child.val },
          });
        }

        const nxt: BTNode | null = next.has(node.id) ? byId.get(next.get(node.id)!)! : null;
        cur = nxt;
        t.push({
          line: 13,
          note:
            (any ? "" : `\`${node.val}\` 沒有小孩，沒有東西要接。`) +
            (nxt
              ? `\`cur = cur.next\`：沿著這一層已經接好的 \`next\`，從 \`${node.val}\` 走到右邊的 \`${nxt.val}\`。`
              : `\`cur = cur.next\`：\`${node.val}\` 的 \`next\` 是 \`None\`，第 ${levelNo} 層走完了。`),
          views: views({ cur, extra: { [node.id]: "good" } }),
          vars: { 層: levelNo, cur: nxt ? nxt.val : "None", tail: chain.length ? chain[chain.length - 1].val : "dummy" },
        });
      }

      const first: BTNode | null = chain[0] ?? null;
      chain.forEach((n) => doneLevel.add(n.id));
      const lastVals = chain.map((n) => n.val);
      cur = first;
      levelNo++;
      t.push({
        line: 14,
        note: first
          ? `第 ${levelNo} 層已經串成 \`${lastVals.join(" → ")} → None\`。\`cur = dummy.next\`，下到這一層的最左邊節點 \`${first.val}\`，用同樣的方法去串再下一層。`
          : `\`dummy\` 後面什麼都沒接到，代表沒有第 ${levelNo} 層了。\`cur = dummy.next\` 是 \`None\`，外層迴圈結束。`,
        views: views({ cur }),
        vars: { 層: first ? levelNo : levelNo - 1, cur: first ? first.val : "None" },
      });
    }

    // Read the answer back by following next pointers from each level's leftmost node
    const levels: number[][] = [];
    let row: BTNode[] = [root];
    while (row.length) {
      const vals: number[] = [];
      for (let id: string | undefined = row[0].id; id; id = next.get(id)) vals.push(byId.get(id)!.val);
      levels.push(vals);
      row = row.flatMap((n) => [n.left, n.right]).filter((c): c is BTNode => c !== null);
    }

    t.push({
      line: 15,
      note: "每一層都用 `next` 由左到右串好了，而且全程只用了 `cur`、`dummy`、`tail` 三個指標，沒有佇列 —— 額外空間 O(1)。回傳 `root`。",
      views: views({ cur: null, showDummy: false }),
      result: py(levels),
    });
    return t.frames;
  },
});
