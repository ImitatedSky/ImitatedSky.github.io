import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, heapSpec, py, tracer } from "../trace";

const code = `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []  # min-heap，只留「目前最大的 k 個」
        for x in nums:
            heappush(heap, x)
            if len(heap) > k:
                heappop(heap)  # 丟掉最小的：它不可能是第 k 大
        return heap[0]`;

interface Item {
  v: number;
  idx: number; // 在 nums 裡的位置，只用來上色
}

// 與 Python heapq 相同的 sift 流程，畫出來的陣列才會跟實際執行一致
function siftDown(h: Item[], start: number, pos: number) {
  const item = h[pos];
  while (pos > start) {
    const parent = (pos - 1) >> 1;
    if (item.v < h[parent].v) {
      h[pos] = h[parent];
      pos = parent;
    } else break;
  }
  h[pos] = item;
}
function heappush(h: Item[], item: Item) {
  h.push(item);
  siftDown(h, 0, h.length - 1);
}
function heappop(h: Item[]): Item {
  const last = h.pop()!;
  if (h.length === 0) return last;
  const top = h[0];
  let pos = 0;
  let child = 1;
  while (child < h.length) {
    if (child + 1 < h.length && !(h[child].v < h[child + 1].v)) child++;
    h[pos] = h[child];
    pos = child;
    child = 2 * pos + 1;
  }
  h[pos] = last;
  siftDown(h, 0, pos);
  return top;
}

export default defineProblem<{ nums: number[]; k: number }>({
  id: 215,
  summary:
    "給一個整數陣列 `nums` 和整數 `k`，回傳陣列中**第 k 大**的元素。\n\n這裡指的是排序後的第 k 個（重複的數各算一次），不是第 k 個「不同」的數。希望不要把整個陣列排序。",
  examples: [
    { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
    { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" },
  ],
  constraints: ["1 ≤ k ≤ nums.length ≤ 10⁵"],
  idea:
    "維護一個**大小固定為 k 的 min-heap**，裡面永遠放著「目前看過最大的 k 個數」。每來一個數就丟進去，超過 k 個就把堆頂（最小的）踢掉。全部看完後，堆頂就是這 k 個大數裡最小的那個 —— 正好是第 k 大。",
  steps: [
    "準備空的 min-heap。",
    "逐一把 `x` push 進 heap。",
    "若 heap 大小超過 `k`，pop 掉堆頂：此時至少有 k 個數比它大（或一樣大），它不可能是第 k 大。",
    "走完後 `heap[0]` 就是答案。",
  ],
  pitfalls: [
    "要找第 k **大**，用的卻是 **min**-heap：因為我們要能快速丟掉「k 個候選裡最小的」。",
    "heap 的陣列本身不是排好序的，只保證 `heap[0]` 最小、每個節點 ≤ 它的小孩。",
  ],
  complexity: { time: "O(n log k)", space: "O(k)" },
  code,
  starter: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        `,
  presets: [
    { label: "[3,2,1,5,6,4], k = 2", input: { nums: [3, 2, 1, 5, 6, 4], k: 2 }, expected: "5" },
    { label: "[3,2,3,1,2,4,5,5,6], k = 4", input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 }, expected: "4" },
    { label: "[7,4,9,1], k = 4（k = n）", input: { nums: [7, 4, 9, 1], k: 4 }, expected: "1" },
  ],
  trace({ nums, k }) {
    const t = tracer();
    const heap: Item[] = [];
    const dropped = new Set<number>();

    const views = (cur: number | null, heapMarks: Record<number, Tone> = {}, curTone: Tone = "active") => {
      const numMarks: Record<number, Tone> = {};
      dropped.forEach((i) => (numMarks[i] = "muted"));
      heap.forEach((it) => (numMarks[it.idx] = "alt"));
      if (cur !== null) numMarks[cur] = curTone;
      const treeMarks: Record<string, Tone> = {};
      for (const [pos, tone] of Object.entries(heapMarks)) treeMarks[`h${pos}`] = tone;
      const vals = heap.map((it) => it.v);
      return [
        V.array("nums", nums, { pointers: cur === null ? {} : { x: cur }, marks: numMarks }),
        V.tree("heap（min-heap，堆頂最小）", heapSpec(vals), { marks: treeMarks }),
        V.array("heap（實際儲存的陣列）", vals, { marks: heapMarks }),
      ];
    };

    t.push({
      line: 3,
      note: `建立空的 min-heap。目標：讓它永遠只裝著**目前最大的 ${k} 個數**，那麼堆頂（其中最小的）就是第 ${k} 大。下面同一個 heap 畫成樹和陣列兩種樣子。`,
      views: views(null),
      vars: { k, "len(heap)": 0 },
    });

    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];
      const item: Item = { v: x, idx: i };
      heappush(heap, item);
      const pos = heap.indexOf(item);
      const over = heap.length > k;
      t.push({
        line: [4, 5],
        note:
          `把 \`x = ${x}\` push 進 heap。` +
          (pos === 0
            ? heap.length === 1
              ? "heap 原本是空的，它就是堆頂。"
              : `它比原本的堆頂還小，一路上浮到**堆頂**。`
            : `它上浮到父節點不比它大的位置就停下（陣列索引 ${pos}）。`) +
          (over ? "" : ` 目前 ${heap.length} 個，還沒超過 \`k = ${k}\`，全部留著。`),
        views: views(i, { [pos]: "active" }),
        vars: { k, x, "len(heap)": heap.length },
      });

      if (over) {
        const top = heap[0];
        t.push({
          line: 6,
          note: `heap 有 ${heap.length} 個，超過 \`k = ${k}\`。堆頂 \`${top.v}\` 是這 ${heap.length} 個裡最小的 —— 已經有 ${k} 個數不比它小，所以它**不可能是第 ${k} 大**。`,
          views: views(i, { 0: "bad" }, top.idx === i ? "bad" : "active"),
          vars: { k, x, "len(heap)": heap.length },
        });
        heappop(heap);
        dropped.add(top.idx);
        t.push({
          line: 7,
          note: `pop 掉 \`${top.v}\`${top.idx === i ? "（就是剛放進去的那個）" : ""}，最後一個元素補到堆頂再下沉。heap 回到 ${k} 個，新的堆頂 \`${heap[0].v}\` 是「目前的第 ${k} 大」。`,
          views: views(top.idx === i ? null : i, { 0: "compare" }),
          vars: { k, x, "len(heap)": heap.length },
        });
      }
    }

    t.push({
      line: 8,
      note: `全部看完。heap 裡是最大的 ${k} 個數 \`${py(heap.map((it) => it.v).sort((a, b) => b - a))}\`，堆頂是其中最小的，也就是第 ${k} 大：回傳 \`heap[0] = ${heap[0].v}\`。`,
      views: views(null, { 0: "good" }),
      vars: { k, "len(heap)": heap.length },
      result: py(heap[0].v),
    });
    return t.frames;
  },
});
