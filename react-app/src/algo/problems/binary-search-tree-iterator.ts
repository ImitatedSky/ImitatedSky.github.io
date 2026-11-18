import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, buildTree, tracer, treeSpec } from "../trace";
import type { BTNode } from "../trace";

const code = `class BSTIterator:
    def __init__(self, root: Optional[TreeNode]):
        self.stack = []
        self._push_left(root)

    def _push_left(self, node):
        # 把 node 和它一路往左的節點全部壓進堆疊
        while node:
            self.stack.append(node)
            node = node.left

    def next(self) -> int:
        node = self.stack.pop()
        self._push_left(node.right)
        return node.val

    def hasNext(self) -> bool:
        return len(self.stack) > 0`;

type Op = "next" | "hasNext";

export default defineProblem<{ root: (number | null)[]; ops: Op[] }>({
  id: 173,
  summary:
    "設計一個二元搜尋樹（BST）的迭代器，依照**中序走訪**的順序（也就是由小到大）一次吐出一個節點值。\n\n`BSTIterator(root)` 用 BST 的根節點初始化；`next()` 回傳下一個最小的值；`hasNext()` 回傳後面還有沒有值。進階要求：`next()` 和 `hasNext()` 平均 O(1) 時間，且只用 O(h) 的空間（h 是樹高）。",
  examples: [
    {
      input: 'root = [7,3,15,null,null,9,20]，依序呼叫 next, next, hasNext, next, hasNext, next, hasNext, next, hasNext',
      output: "[3, 7, true, 9, true, 15, true, 20, false]",
    },
  ],
  constraints: ["1 ≤ 節點數 ≤ 10⁵", "最多呼叫 10⁵ 次 next / hasNext", "呼叫 next 時保證還有下一個值"],
  idea:
    "把「用堆疊做中序走訪」的迴圈**拆開、暫停**在每次輸出之間。堆疊裡放的是「左邊已經處理完、自己還沒輸出」的節點 —— 也就是從目前位置一路往左的那條**左脊**，所以堆疊頂端永遠是下一個最小值。pop 出一個節點後，它的右子樹才輪到，於是把右小孩的左脊補進堆疊。",
  steps: [
    "`_push_left(node)`：從 `node` 一路往左走，把經過的節點都壓進堆疊。",
    "建構時對 root 做一次 `_push_left`，此時頂端是整棵樹的最小值。",
    "`next()`：pop 出頂端節點；對它的右小孩做 `_push_left`；回傳它的值。",
    "`hasNext()`：堆疊不為空就還有。",
  ],
  pitfalls: [
    "不要在建構時把整棵樹中序攤平成陣列 —— 那樣空間是 O(n)，不符合 O(h) 的要求。",
    "pop 之後是對 **`node.right`** 補左脊，不是對 `node` 本身。",
    "單次 `next()` 可能要壓很多節點，但每個節點一輩子只進出堆疊一次，所以平均（攤銷）是 O(1)。",
  ],
  complexity: { time: "next / hasNext 平均 O(1)", space: "O(h)，h 為樹高" },
  code,
  starter: `class BSTIterator:
    def __init__(self, root: Optional[TreeNode]):
        pass

    def next(self) -> int:
        pass

    def hasNext(self) -> bool:
        pass`,
  presets: [
    {
      label: "[7,3,15,null,null,9,20]",
      input: {
        root: [7, 3, 15, null, null, 9, 20],
        ops: ["next", "next", "hasNext", "next", "hasNext", "next", "hasNext", "next", "hasNext"],
      },
      expected: "[3, 7, True, 9, True, 15, True, 20, False]",
    },
    {
      label: "[8,3,10,1,6,null,14,null,null,4,7,13]",
      input: {
        root: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13],
        ops: ["next", "next", "next", "next", "next", "next", "next", "next", "next", "hasNext"],
      },
      expected: "[1, 3, 4, 6, 7, 8, 10, 13, 14, False]",
    },
    {
      label: "[1]（單一節點）",
      input: { root: [1], ops: ["hasNext", "next", "hasNext"] },
      expected: "[True, 1, False]",
    },
  ],
  trace({ root: level0, ops }) {
    const t = tracer();
    const root = buildTree(level0);
    const spec = treeSpec(root);

    const stack: BTNode[] = [];
    const emitted = new Set<string>();
    const out: Cell[] = []; // 以 Python 的樣子顯示
    let opIdx = -1;

    const views = (extra: Record<string, Tone> = {}, pointers: Record<string, string | null> = {}, topTone?: Tone) => {
      const marks: Record<string, Tone> = {};
      emitted.forEach((id) => (marks[id] = "good"));
      stack.forEach((n) => (marks[n.id] = "compare"));
      const opMarks: Record<number, Tone> = {};
      ops.forEach((_, i) => {
        if (i < opIdx) opMarks[i] = "visited";
        else if (i === opIdx) opMarks[i] = "active";
      });
      return [
        V.tree("BST", spec, { marks: { ...marks, ...extra }, pointers }),
        V.stack(
          "self.stack（還沒輸出的左脊）",
          stack.map((n) => n.val),
          { marks: topTone && stack.length ? { [stack.length - 1]: topTone } : {} },
        ),
        V.array("操作", ops, {
          marks: opMarks,
          pointers: opIdx >= 0 && opIdx < ops.length ? { 現在: opIdx } : {},
        }),
        V.array("輸出", out, { marks: out.length ? { [out.length - 1]: "good" } : {} }),
      ];
    };

    /** 模擬 _push_left，每壓一個節點一個畫面 */
    const pushLeft = (start: BTNode | null, why: string) => {
      let node = start;
      let first = true;
      while (node) {
        stack.push(node);
        const nxt: BTNode | null = node.left;
        t.push({
          line: [8, 9, 10],
          note:
            (first ? why : "") +
            `把 \`${node.val}\` 壓進堆疊` +
            (nxt
              ? `，再往左走到 \`${nxt.val}\` —— 左邊的值更小，要比 \`${node.val}\` 先輸出。`
              : `。它沒有左小孩了，左脊到此為止，\`${node.val}\` 就是接下來最小的值。`),
          views: views({ [node.id]: "active" }, { node: node.id }, "active"),
        });
        node = nxt;
        first = false;
      }
    };

    t.push({
      line: [2, 3],
      note: "建構迭代器：先準備一個空堆疊。我們不會一次把整棵樹走完，只記住「接下來要輸出誰」所需的最少資訊。",
      views: views(),
    });
    if (root) {
      t.push({
        line: 4,
        note: "中序是「左 → 自己 → 右」，最小值在最左下角。所以從 root 一路往左，把沿途節點（左脊）都壓進堆疊。",
        views: views({ [root.id]: "active" }, { node: root.id }),
      });
      pushLeft(root, "");
    }

    for (opIdx = 0; opIdx < ops.length; opIdx++) {
      const op = ops[opIdx];
      if (op === "hasNext") {
        const has = stack.length > 0;
        out.push(has ? "True" : "False");
        t.push({
          line: [17, 18],
          note: has
            ? `\`hasNext()\`：堆疊裡還有 ${stack.length} 個節點等著輸出，回傳 \`True\`。`
            : "`hasNext()`：堆疊空了，代表每個節點都輸出過了，回傳 `False`。",
          views: views({}, {}, has ? "compare" : undefined),
          vars: { "len(self.stack)": stack.length, 回傳: has ? "True" : "False" },
        });
        continue;
      }

      if (!stack.length) {
        out.push("None");
        t.push({
          line: 12,
          note: "堆疊是空的，已經沒有下一個值了（題目保證不會在這種時候呼叫 `next()`）。",
          views: views(),
        });
        continue;
      }

      const node = stack.pop()!;
      t.push({
        line: [12, 13],
        note: `\`next()\`：pop 出堆疊頂端的 \`${node.val}\`。它左邊的節點都已經輸出過，所以它就是目前最小的。`,
        views: views({ [node.id]: "active" }, { node: node.id }),
        vars: { node: node.val },
      });

      if (node.right) {
        t.push({
          line: 14,
          note:
            `\`${node.val}\` 有右子樹。中序裡，緊接在 \`${node.val}\` 之後的是**右子樹的最小值**，` +
            `所以從右小孩 \`${node.right.val}\` 開始，把它的左脊補進堆疊。`,
          views: views({ [node.id]: "active", [node.right.id]: "alt" }, { node: node.id }),
          vars: { node: node.val },
        });
        pushLeft(node.right, "");
      }

      emitted.add(node.id);
      out.push(node.val);
      t.push({
        line: node.right ? 15 : [14, 15],
        note:
          (node.right
            ? `右子樹的左脊補好了，堆疊頂端的 \`${stack[stack.length - 1].val}\` 會是下一個輸出的值。`
            : `\`${node.val}\` 沒有右子樹，\`_push_left(None)\` 什麼都不做；下一個就是堆疊裡原本排在它下面的節點。`) +
          `回傳 \`${node.val}\`。`,
        views: views({ [node.id]: "good" }, { node: node.id }, "compare"),
        vars: { node: node.val, 回傳: node.val },
      });
    }

    opIdx = ops.length;
    t.push({
      note: "所有操作執行完畢。每個節點只進出堆疊一次，堆疊最多同時放一條左脊，也就是 O(h) 的空間。",
      views: views(),
      result: `[${out.join(", ")}]`,
    });
    return t.frames;
  },
});
