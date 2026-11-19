import { defineProblem } from "../types";
import type { Tone, View } from "../types";
import { V, heapSpec, py, tracer } from "../trace";

const code = `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heappush(heap, (node.val, i))    # 每條串列先派「頭」進堆積
        dummy = tail = ListNode()
        while heap:
            val, i = heappop(heap)               # 所有串列頭裡最小的
            node = lists[i]
            tail.next = node                     # 接到答案的尾巴
            tail = node
            lists[i] = node.next                 # 第 i 條往前一格
            if lists[i]:
                heappush(heap, (lists[i].val, i))
        return dummy.next`;

type Entry = [number, number]; // (val, i)

const less = (a: Entry, b: Entry) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);

/** Same sift order as Python's heapq, so the drawn heap matches what Python holds */
function heappush(h: Entry[], x: Entry) {
  h.push(x);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (!less(h[i], h[p])) break;
    [h[i], h[p]] = [h[p], h[i]];
    i = p;
  }
}

function heappop(h: Entry[]): Entry {
  const top = h[0];
  const last = h.pop()!;
  if (h.length) {
    h[0] = last;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < h.length && less(h[l], h[m])) m = l;
      if (r < h.length && less(h[r], h[m])) m = r;
      if (m === i) break;
      [h[i], h[m]] = [h[m], h[i]];
      i = m;
    }
  }
  return top;
}

export default defineProblem<{ lists: number[][] }>({
  id: 23,
  summary:
    "給 `k` 條**各自已經由小到大排好**的鏈結串列（放在陣列 `lists` 裡），把它們全部合併成**一條**排好的鏈結串列並回傳。\n\n`lists` 可能是空的，裡面的串列也可能是空的。",
  examples: [
    { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
    { input: "lists = []", output: "[]" },
    { input: "lists = [[]]", output: "[]" },
  ],
  constraints: ["0 ≤ k ≤ 10⁴", "每條串列長度 0 ~ 500，且已遞增排序", "所有節點總數不超過 10⁴"],
  idea:
    "每條串列都排好了，所以**下一個要接到答案的節點，一定是某一條串列的頭**。問題變成：「k 個頭裡面誰最小？」每次都掃一遍要 O(k)，改用**最小堆積**存 `(值, 第幾條)`，就能 O(log k) 拿到最小的；拿走之後，把同一條串列的下一個節點補進堆積。堆積裡永遠最多 k 個元素。",
  steps: [
    "把每條非空串列的頭以 `(node.val, i)` 放進最小堆積。",
    "建立 `dummy` 節點，`tail` 指著答案目前的尾巴。",
    "堆積不為空時：pop 出最小的 `(val, i)`，把 `lists[i]` 這個節點接到 `tail` 後面。",
    "`lists[i]` 往前一格；如果還有節點，把新的頭 `(lists[i].val, i)` push 進堆積。",
    "堆積空了就全部合併完，回傳 `dummy.next`。",
  ],
  pitfalls: [
    "堆積裡不要直接放 `(val, node)`：值相同時 Python 會去比較兩個 `ListNode`，而它沒有定義 `<`，會噴 `TypeError`。放索引 `i` 就不會有這個問題。",
    "空串列（`None`）不能 push，要先檢查。",
    "時間是 O(N log k) 而不是 O(N log N)：堆積的大小是串列數 k，不是節點總數 N。",
  ],
  complexity: { time: "O(N log k)（N 為節點總數）", space: "O(k)" },
  code,
  starter: `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        `,
  presets: [
    {
      label: "[[1,4,5],[1,3,4],[2,6]]",
      input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] },
      expected: "[1, 1, 2, 3, 4, 4, 5, 6]",
    },
    {
      label: "[[5],[],[1,3,9],[2]]",
      input: { lists: [[5], [], [1, 3, 9], [2]] },
      expected: "[1, 2, 3, 5, 9]",
    },
    { label: "[[],[]]", input: { lists: [[], []] }, expected: "[]" },
  ],
  trace({ lists: input }) {
    const t = tracer();
    const k = input.length;
    const pos = input.map(() => 0); // lists[i] currently points at input[i][pos[i]]
    const heap: Entry[] = [];
    const merged: { id: string; val: number }[] = [];
    const key = (e: Entry) => `${e[0]},${e[1]}`;

    const views = (o: { top?: boolean; pushed?: Entry; from?: number; fresh?: boolean } = {}): View[] => {
      // One compact grid instead of k stacked list views: row i = lists[i],
      // nodes already moved to the answer leave a dashed placeholder behind.
      const cols = Math.max(1, ...input.map((l) => l.length));
      const gm: Record<string, Tone> = {};
      const cells = input.map((vals, i) => {
        if (pos[i] < vals.length) {
          if (heap.some((e) => e[1] === i)) gm[`${i},${pos[i]}`] = "compare";
          if (o.from === i) gm[`${i},${pos[i]}`] = "active";
        }
        return Array.from({ length: cols }, (_, j) => (j >= pos[i] && j < vals.length ? vals[j] : ""));
      });
      const out: View[] = [
        V.grid("lists（每列一條串列，由左到右；黃色 = 在堆積裡的頭）", cells, {
          marks: gm,
          rowLabels: input.map((_, i) => `[${i}]`),
        }),
      ];
      const hm: Record<string, Tone> = {};
      if (o.top && heap.length) hm.h0 = "active";
      if (o.pushed) {
        const at = heap.findIndex((e) => e[0] === o.pushed![0] && e[1] === o.pushed![1]);
        if (at !== -1) hm[`h${at}`] = "compare";
      }
      out.push(V.tree("heap（最小堆積，節點 = val,i）", heapSpec(heap.map(key)), { marks: hm }));
      const mm: Record<string, Tone> = {};
      merged.forEach((m, j) => (mm[m.id] = j === merged.length - 1 && o.fresh ? "active" : "good"));
      out.push(
        V.list("合併結果（dummy.next）", merged, {
          marks: mm,
          pointers: merged.length ? { tail: merged[merged.length - 1].id } : {},
        }),
      );
      return out;
    };

    t.push({
      line: 3,
      note:
        k === 0
          ? "`lists` 是空的，沒有任何串列。"
          : `有 ${k} 條排好的串列。下一個最小的節點一定是某一條的**頭**，所以用最小堆積來管理這些頭。`,
      views: k === 0 ? [V.tree("heap（最小堆積，節點 = val,i）", heapSpec([])), V.list("合併結果（dummy.next）", [])] : views(),
      vars: { k },
    });

    for (let i = 0; i < k; i++) {
      if (input[i].length === 0) {
        t.push({
          line: [4, 5],
          note: `\`lists[${i}]\` 是空串列（\`None\`），沒有頭可以放，跳過。`,
          views: views(),
          vars: { i },
        });
        continue;
      }
      const e: Entry = [input[i][0], i];
      heappush(heap, e);
      t.push({
        line: [4, 5, 6],
        note: `把 \`lists[${i}]\` 的頭放進堆積：\`(${e[0]}, ${i})\`。後面的 \`${i}\` 記錄它來自第幾條，值相同時也靠它分出先後。`,
        views: views({ pushed: e }),
        vars: { i, "node.val": e[0], "len(heap)": heap.length },
      });
    }

    t.push({
      line: [7, 8],
      note: heap.length
        ? `建立 \`dummy\`（畫面上省略），\`tail\` 之後會指著答案的尾巴。堆積頂端永遠是所有串列頭裡最小的那個。`
        : `建立 \`dummy\`。堆積是空的 —— 沒有任何節點可以合併，迴圈一次都不會跑。`,
      views: views({ top: true }),
      vars: { "len(heap)": heap.length },
    });

    while (heap.length) {
      const [val, i] = heap[0];
      t.push({
        line: [8, 9, 10],
        note: `堆頂是 \`(${val}, ${i})\`：第 ${i} 條的頭 \`${val}\` 是目前全部串列頭裡最小的。把它 pop 出來，\`node = lists[${i}]\`。`,
        views: views({ top: true, from: i }),
        vars: { val, i, "len(heap)": heap.length },
      });
      heappop(heap);
      merged.push({ id: `${i}-${pos[i]}`, val });
      pos[i]++;
      const more = pos[i] < input[i].length;
      t.push({
        line: [11, 12, 13],
        note:
          `把 \`${val}\` 接到 \`tail\` 後面，\`tail\` 移到它身上；\`lists[${i}]\` 往前一格` +
          (more ? `，新的頭是 \`${input[i][pos[i]]}\`。` : `，變成 \`None\`。`),
        views: views({ fresh: true }),
        vars: { val, i, "len(heap)": heap.length },
      });
      if (more) {
        const e: Entry = [input[i][pos[i]], i];
        heappush(heap, e);
        t.push({
          line: [14, 15],
          note: `第 ${i} 條還有節點，把它的新頭 \`(${e[0]}, ${i})\` 補進堆積 —— 這樣堆積裡始終是「每條串列各一個頭」。`,
          views: views({ pushed: e }),
          vars: { val, i, "len(heap)": heap.length },
        });
      } else {
        t.push({
          line: 14,
          note: `第 ${i} 條已經用完了，沒有東西可以補，堆積少一個元素（剩 ${heap.length} 個）。`,
          views: views(),
          vars: { val, i, "len(heap)": heap.length },
        });
      }
    }

    t.push({
      line: 16,
      note: merged.length
        ? `堆積空了，${merged.length} 個節點全部接好。每個節點進出堆積各一次，堆積最多 ${k} 個元素，所以是 O(N log k)。`
        : "沒有任何節點，`dummy.next` 是 `None`，回傳空串列。",
      views: (() => {
        const v = views();
        const last = v[v.length - 1];
        if (last.type === "list") last.pointers = {};
        return v;
      })(),
      vars: { 節點總數: merged.length },
      result: py(merged.map((m) => m.val)),
    });
    return t.frames;
  },
});
