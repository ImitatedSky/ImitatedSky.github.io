import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, heapSpec, py, tracer } from "../trace";

const code = `class Solution:
    def kSmallestPairs(self, nums1: List[int], nums2: List[int], k: int) -> List[List[int]]:
        res = []
        # 每個 i 先配 nums2[0]：這是「第 i 列」裡最小的和
        heap = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]
        while heap and len(res) < k:
            _, i, j = heappop(heap)
            res.append([nums1[i], nums2[j]])
            if j + 1 < len(nums2):
                heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
        return res`;

type Item = [sum: number, i: number, j: number];

// tuple 的字典序比較，和 Python 一樣
const lt = (a: Item, b: Item) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

// 與 Python heapq 相同的 sift 流程
function siftDown(h: Item[], start: number, pos: number) {
  const item = h[pos];
  while (pos > start) {
    const parent = (pos - 1) >> 1;
    if (lt(item, h[parent]) < 0) {
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
    if (child + 1 < h.length && !(lt(h[child], h[child + 1]) < 0)) child++;
    h[pos] = h[child];
    pos = child;
    child = 2 * pos + 1;
  }
  h[pos] = last;
  siftDown(h, 0, pos);
  return top;
}

const tup = (it: Item) => `(${it[0]}, ${it[1]}, ${it[2]})`;

export default defineProblem<{ nums1: number[]; nums2: number[]; k: number }>({
  id: 373,
  summary:
    "給兩個**由小到大排序**的整數陣列 `nums1`、`nums2` 和整數 `k`。從兩個陣列各挑一個數組成一對 `(u, v)`，回傳**和最小的 k 對**。\n\n如果總共不到 k 對，就全部回傳。",
  examples: [
    { input: "nums1 = [1,7,11], nums2 = [2,4,6], k = 3", output: "[[1,2],[1,4],[1,6]]" },
    { input: "nums1 = [1,1,2], nums2 = [1,2,3], k = 2", output: "[[1,1],[1,1]]" },
  ],
  constraints: ["1 ≤ nums1.length, nums2.length ≤ 10⁵", "1 ≤ k ≤ 10⁴", "兩個陣列都是非遞減排序"],
  idea:
    "把所有的和想成一張表格：第 `i` 列第 `j` 行是 `nums1[i] + nums2[j]`。因為 `nums2` 有序，**每一列都是由左到右遞增**，這就變成「合併好幾條有序串列」：heap 裡每一列只放一個代表（該列目前最左邊還沒取的那格），每次取出最小的，再把它右邊那格補進去。",
  steps: [
    "把前 `min(k, len(nums1))` 列的第一格 `(nums1[i] + nums2[0], i, 0)` 放進 min-heap。",
    "pop 出和最小的 `(sum, i, j)`，把 `[nums1[i], nums2[j]]` 加進答案。",
    "如果同一列右邊還有格子（`j + 1 < len(nums2)`），把 `(i, j + 1)` push 進去。",
    "重複直到拿滿 `k` 對，或 heap 空了。",
  ],
  pitfalls: [
    "不能把 m × n 個組合全部丟進 heap —— 會超時也超記憶體。heap 裡最多只需要 `min(k, m)` 個。",
    "只需要往**右**擴展（`j + 1`）。若同時往下（`i + 1`）也推，會把同一格推進去兩次，還得另外去重。",
    "初始的 list 已經依 sum 遞增（`nums1` 有序），本身就是合法的 heap，不必再 `heapify`。",
  ],
  complexity: { time: "O(k log min(k, m))", space: "O(min(k, m))" },
  code,
  starter: `class Solution:
    def kSmallestPairs(self, nums1: List[int], nums2: List[int], k: int) -> List[List[int]]:
        `,
  presets: [
    {
      label: "[1,7,11] × [2,4,6], k = 5",
      input: { nums1: [1, 7, 11], nums2: [2, 4, 6], k: 5 },
      expected: "[[1, 2], [1, 4], [1, 6], [7, 2], [7, 4]]",
    },
    {
      label: "[1,1,2] × [1,2,3], k = 3（有重複）",
      input: { nums1: [1, 1, 2], nums2: [1, 2, 3], k: 3 },
      expected: "[[1, 1], [1, 1], [1, 2]]",
    },
    { label: "[1,2] × [3], k = 5（不到 k 對）", input: { nums1: [1, 2], nums2: [3], k: 5 }, expected: "[[1, 3], [2, 3]]" },
  ],
  trace({ nums1, nums2, k }) {
    const t = tracer();
    const m = nums1.length;
    const n = nums2.length;
    const table = nums1.map((a) => nums2.map((b) => a + b));
    const res: number[][] = [];
    const taken = new Set<string>();
    let heap: Item[] = [];

    const views = (cellTones: Record<string, Tone> = {}, heapMarks: Record<number, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      taken.forEach((key) => (marks[key] = "good"));
      heap.forEach((it) => (marks[`${it[1]},${it[2]}`] = "compare"));
      Object.assign(marks, cellTones);
      const treeMarks: Record<string, Tone> = {};
      const mapMarks: Record<string, Tone> = {};
      for (const [pos, tone] of Object.entries(heapMarks)) {
        treeMarks[`h${pos}`] = tone;
        mapMarks[`heap[${pos}]`] = tone;
      }
      return [
        V.grid("所有的和：列 = nums1[i]，行 = nums2[j]", table, {
          marks,
          rowLabels: nums1.map((a, i) => `${a} (i=${i})`),
          colLabels: nums2.map((b) => b),
        }),
        V.tree("heap（min-heap，節點顯示 sum）", heapSpec(heap.map((it) => it[0])), { marks: treeMarks }),
        V.map(
          "heap 的內容 (sum, i, j)",
          heap.map((it, pos): [Cell, Cell] => [`heap[${pos}]`, tup(it)]),
          { marks: mapMarks },
        ),
        V.array("res", res.map((p) => `[${p[0]},${p[1]}]`)),
      ];
    };

    t.push({
      line: 3,
      note: `把每一對的和排成表格。\`nums2\` 有序，所以**每一列由左到右遞增**；\`nums1\` 有序，所以每一行由上到下遞增。全域最小一定在左上角，要取最小的 \`k = ${k}\` 個。`,
      views: views(),
      vars: { k, "len(res)": 0 },
    });

    const rows = Math.min(k, m);
    heap = Array.from({ length: rows }, (_, i): Item => [nums1[i] + nums2[0], i, 0]);
    t.push({
      line: [4, 5],
      note:
        `每一列先派**最左邊那格**當代表進 heap，共 ${rows} 個。` +
        (rows < m ? `（只要 ${k} 對，第 ${rows} 列之後不可能用到。）` : "") +
        `之後每一列在 heap 裡永遠只有一個代表。`,
      views: views(),
      vars: { k, "len(res)": 0 },
    });

    while (heap.length && res.length < k) {
      const top = heap[0];
      t.push({
        line: 6,
        note: `還差 ${k - res.length} 對。heap 裡是每一列「還沒取的最小值」，所以堆頂 \`${tup(top)}\` 就是**所有還沒取的格子裡最小的**。`,
        views: views({ [`${top[1]},${top[2]}`]: "active" }, { 0: "active" }),
        vars: { k, "len(res)": res.length },
      });

      const [s, i, j] = heappop(heap);
      res.push([nums1[i], nums2[j]]);
      taken.add(`${i},${j}`);
      t.push({
        line: [7, 8],
        note: `pop 出 \`i = ${i}, j = ${j}\`，把 \`[nums1[${i}], nums2[${j}]] = [${nums1[i]}, ${nums2[j]}]\`（和 ${s}）加進 \`res\`，這是第 ${res.length} 小的一對。`,
        views: views({ [`${i},${j}`]: "active" }),
        vars: { k, i, j, "len(res)": res.length },
      });

      if (j + 1 < n) {
        const item: Item = [nums1[i] + nums2[j + 1], i, j + 1];
        heappush(heap, item);
        const pos = heap.indexOf(item);
        t.push({
          line: [9, 10],
          note: `第 ${i} 列的代表被拿走了，換它**右邊那格**遞補：push \`${tup(item)}\`。同一列裡它是下一個最小的。`,
          views: views({ [`${i},${j + 1}`]: "active" }, { [pos]: "active" }),
          vars: { k, i, j, "len(res)": res.length },
        });
      } else {
        t.push({
          line: 9,
          note: `\`j + 1 = ${j + 1}\` 已經超出 \`nums2\`，第 ${i} 列整列取完了，沒有東西可以遞補。`,
          views: views(),
          vars: { k, i, j, "len(res)": res.length },
        });
      }
    }

    t.push({
      line: [6, 11],
      note:
        res.length >= k
          ? `\`res\` 已經有 ${k} 對，結束。每次都是從各列的代表裡挑最小的，所以取出的順序就是和由小到大的順序。`
          : `heap 空了：總共只有 ${m * n} 對，不到 \`k = ${k}\`，全部回傳。`,
      views: views(),
      vars: { k, "len(res)": res.length },
      result: py(res),
    });
    return t.frames;
  },
});
