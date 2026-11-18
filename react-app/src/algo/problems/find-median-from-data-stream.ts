import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, heapSpec, tracer } from "../trace";

const code = `class MedianFinder:
    def __init__(self):
        self.small = []  # max-heap（存負數）：較小的那一半
        self.large = []  # min-heap：較大的那一半

    def addNum(self, num: int) -> None:
        heappush(self.small, -num)
        # small 的最大值搬去 large，保證 small 的每個數 <= large 的每個數
        heappush(self.large, -heappop(self.small))
        if len(self.large) > len(self.small):
            heappush(self.small, -heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2`;

type Op = "MedianFinder" | "addNum" | "findMedian";

interface Item {
  num: number;
  id: number; // 第幾個加入的數，讓格子在畫面上能滑動
}

// 與 Python heapq 相同的 sift 流程；key 決定是 min-heap 還是 max-heap
type Key = (it: Item) => number;
const minKey: Key = (it) => it.num;
const maxKey: Key = (it) => -it.num; // 對應 Python 裡存負數的做法

function siftDown(h: Item[], start: number, pos: number, key: Key) {
  const item = h[pos];
  while (pos > start) {
    const parent = (pos - 1) >> 1;
    if (key(item) < key(h[parent])) {
      h[pos] = h[parent];
      pos = parent;
    } else break;
  }
  h[pos] = item;
}
function heappush(h: Item[], item: Item, key: Key) {
  h.push(item);
  siftDown(h, 0, h.length - 1, key);
}
function heappop(h: Item[], key: Key): Item {
  const last = h.pop()!;
  if (h.length === 0) return last;
  const top = h[0];
  let pos = 0;
  let child = 1;
  while (child < h.length) {
    if (child + 1 < h.length && !(key(h[child]) < key(h[child + 1]))) child++;
    h[pos] = h[child];
    pos = child;
    child = 2 * pos + 1;
  }
  h[pos] = last;
  siftDown(h, 0, pos, key);
  return top;
}

/** Python 印 float 的樣子：2 → "2.0"、1.5 → "1.5" */
const pyFloat = (x: number) => (Number.isInteger(x) ? `${x}.0` : String(x));

const OPS = "操作（+x = addNum(x)）";
const OUT = "回傳值";
const SMALL = "small（max-heap：較小的一半，堆頂最大）";
const LARGE = "large（min-heap：較大的一半，堆頂最小）";
const ALL = "兩個 heap 的內容各自排序後並排";

export default defineProblem<{ ops: Op[]; args: (number | null)[] }>({
  id: 295,
  summary:
    "設計一個資料結構，能一邊接收不斷加入的整數，一邊隨時回答**目前所有數字的中位數**。\n\n`addNum(num)` 加入一個數；`findMedian()` 回傳中位數（個數為偶數時是中間兩個數的平均）。輸入是一連串操作，輸出是每個操作的回傳值（沒有回傳值的記為 `None`）。",
  examples: [
    {
      input: '["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]\n[[],[1],[2],[],[3],[]]',
      output: "[null,null,null,1.5,null,2.0]",
    },
  ],
  constraints: ["−10⁵ ≤ num ≤ 10⁵", "呼叫 `findMedian` 時至少已加入一個數", "最多 5 × 10⁴ 次操作"],
  idea:
    "中位數只跟「正中間」的一兩個數有關，不需要整個排序。把數字切成兩半：**較小的一半放 max-heap `small`，較大的一半放 min-heap `large`**。只要維持兩邊個數相等（或 `small` 多一個），中間的數就永遠在兩個堆頂，O(1) 就能讀到。",
  steps: [
    "`addNum`：先把 `num` 丟進 `small`。",
    "再把 `small` 的最大值搬到 `large` —— 這一步保證 `small` 裡每個數都 ≤ `large` 裡每個數。",
    "如果 `large` 變得比 `small` 多，把 `large` 的最小值搬回 `small`，維持 `small` 的個數 = `large` 或多一個。",
    "`findMedian`：`small` 比較多（總數奇數）就回傳 `small` 的堆頂；否則回傳兩個堆頂的平均。",
  ],
  pitfalls: [
    "Python 的 `heapq` 只有 min-heap，`small` 要存**負數**；搬動時記得 `-heappop(...)` 把正負號轉回來。",
    "不能只看大小就決定丟哪一邊然後不管：一定要經過「先進 `small`、再把最大值搬走」這一步，順序才不會亂。",
    "總數為奇數時直接回傳堆頂，要包成 `float`。",
  ],
  complexity: { time: "addNum O(log n)、findMedian O(1)", space: "O(n)" },
  code,
  starter: `class MedianFinder:
    def __init__(self):
        pass

    def addNum(self, num: int) -> None:
        pass

    def findMedian(self) -> float:
        pass`,
  presets: [
    {
      label: "加入 5, 2, 8, 1, 9, 4，中途查三次",
      input: {
        ops: ["MedianFinder", "addNum", "addNum", "addNum", "findMedian", "addNum", "findMedian", "addNum", "addNum", "findMedian"],
        args: [null, 5, 2, 8, null, 1, null, 9, 4, null],
      },
      expected: "[None, None, None, None, 5.0, None, 3.5, None, None, 4.5]",
    },
    {
      label: "LeetCode 範例：1, 2 → 查 → 3 → 查",
      input: {
        ops: ["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"],
        args: [null, 1, 2, null, 3, null],
      },
      expected: "[None, None, None, 1.5, None, 2.0]",
    },
    {
      label: "負數與重複：-1, -1, -3",
      input: {
        ops: ["MedianFinder", "addNum", "findMedian", "addNum", "findMedian", "addNum", "findMedian"],
        args: [null, -1, null, -1, null, -3, null],
      },
      expected: "[None, None, -1.0, None, -1.0, None, -1.0]",
    },
  ],
  trace({ ops, args }) {
    const t = tracer();
    const small: Item[] = [];
    const large: Item[] = [];
    const out: (number | null)[] = [];
    let nextId = 0;

    const opLabels: Cell[] = ops.map((op, k) => (op === "MedianFinder" ? "new" : op === "addNum" ? `+${args[k]}` : "中位"));
    const fmtOut = (v: number | null) => (v === null ? "None" : pyFloat(v));

    /** tones 以 Item.id 為 key，三個畫面（兩棵樹 + 並排陣列）一起上色 */
    const views = (step: number, tones: Record<number, Tone> = {}) => {
      const opMarks: Record<number, Tone> = {};
      for (let k = 0; k < ops.length; k++) opMarks[k] = k < step ? "visited" : k === step ? "active" : "muted";
      if (step >= ops.length) for (let k = 0; k < ops.length; k++) opMarks[k] = "visited";
      const outCells: Cell[] = ops.map((_, k) => (k < out.length ? fmtOut(out[k]) : ""));
      const outMarks: Record<number, Tone> = {};
      out.forEach((v, k) => {
        if (v !== null) outMarks[k] = "good";
      });

      const treeMarks = (h: Item[]) => {
        const m: Record<string, Tone> = {};
        h.forEach((it, pos) => {
          if (tones[it.id]) m[`h${pos}`] = tones[it.id];
        });
        return m;
      };
      const byNum = (a: Item, b: Item) => a.num - b.num || a.id - b.id;
      const line = [...[...small].sort(byNum), ...[...large].sort(byNum)];
      const lineMarks: Record<number, Tone> = {};
      line.forEach((it, pos) => {
        if (tones[it.id]) lineMarks[pos] = tones[it.id];
      });
      const s = small.length;

      return [
        V.array(OPS, opLabels, { marks: opMarks, pointers: step < ops.length ? { op: step } : {} }),
        V.array(OUT, outCells, { marks: outMarks }),
        V.tree(SMALL, heapSpec(small.map((it) => it.num)), { marks: treeMarks(small) }),
        V.tree(LARGE, heapSpec(large.map((it) => it.num)), { marks: treeMarks(large) }),
        V.array(
          ALL,
          line.map((it) => it.num),
          {
            ids: line.map((it) => it.id),
            marks: lineMarks,
            ranges: [
              { from: 0, to: s - 1, tone: "alt", label: "small" },
              { from: s, to: line.length - 1, tone: "compare", label: "large" },
            ],
          },
        ),
      ];
    };
    const sizes = () => ({ "len(small)": small.length, "len(large)": large.length });

    for (let step = 0; step < ops.length; step++) {
      const op = ops[step];

      if (op === "MedianFinder") {
        out.push(null);
        t.push({
          line: [2, 3, 4],
          note: "建立兩個空的 heap：`small` 是 max-heap，裝**較小的一半**；`large` 是 min-heap，裝**較大的一半**。畫面上的 `small` 直接顯示原本的數（Python 裡實際存的是負數）。",
          views: views(step),
          vars: sizes(),
        });
        continue;
      }

      if (op === "addNum") {
        const num = args[step] as number;
        const item: Item = { num, id: nextId++ };

        heappush(small, item, maxKey);
        t.push({
          line: [6, 7],
          note: `\`addNum(${num})\`：不管大小，先把 \`${num}\`（存成 \`${-num}\`）丟進 \`small\`。此時 \`small\` 裡可能混進了一個其實該屬於「大的那一半」的數。`,
          views: views(step, { [item.id]: "active" }),
          vars: { num, ...sizes() },
        });

        const up = heappop(small, maxKey);
        heappush(large, up, minKey);
        t.push({
          line: [8, 9],
          note:
            `把 \`small\` 的最大值 \`${up.num}\` 搬到 \`large\`` +
            (up.id === item.id ? "（就是剛加入的那個）" : `（剛加入的 \`${num}\` 留在 \`small\`）`) +
            `。這樣 \`small\` 裡剩下的每個數都 ≤ \`large\` 裡的每個數，左右兩半的**順序是對的**。`,
          views: views(step, { [item.id]: "active", [up.id]: "compare" }),
          vars: { num, ...sizes() },
        });

        if (large.length > small.length) {
          const down = heappop(large, minKey);
          heappush(small, down, maxKey);
          t.push({
            line: [10, 11],
            note: `\`large\` 有 ${large.length + 1} 個、\`small\` 只有 ${small.length - 1} 個，\`large\` 比較多。把 \`large\` 的最小值 \`${down.num}\` 搬回 \`small\`，**個數**重新平衡成 ${small.length} : ${large.length}。`,
            views: views(step, { [item.id]: "active", [down.id]: "compare" }),
            vars: { num, ...sizes() },
          });
        } else {
          t.push({
            line: 10,
            note: `\`large\` 有 ${large.length} 個、\`small\` 有 ${small.length} 個，\`large\` 沒有比較多，不用搬回來。個數維持 ${small.length} : ${large.length}。`,
            views: views(step, { [item.id]: "active" }),
            vars: { num, ...sizes() },
          });
        }
        out.push(null);
        continue;
      }

      // findMedian
      const a = small[0];
      if (small.length > large.length) {
        const ans = a.num;
        out.push(ans);
        t.push({
          line: [13, 14, 15],
          note: `\`findMedian()\`：\`small\` 有 ${small.length} 個、\`large\` 有 ${large.length} 個，總數是奇數，多出來的正中間那個數就在 \`small\` 的堆頂：回傳 \`${pyFloat(ans)}\`。`,
          views: views(step, { [a.id]: "good" }),
          vars: { ...sizes(), 中位數: pyFloat(ans) },
        });
      } else {
        const b = large[0];
        const ans = (a.num + b.num) / 2;
        out.push(ans);
        t.push({
          line: [13, 14, 16],
          note: `\`findMedian()\`：兩邊各 ${small.length} 個，總數是偶數。中間兩個數就是兩個堆頂 —— \`small\` 的最大值 \`${a.num}\` 和 \`large\` 的最小值 \`${b.num}\`：\`(${a.num} + ${b.num}) / 2 = ${pyFloat(ans)}\`。`,
          views: views(step, { [a.id]: "good", [b.id]: "good" }),
          vars: { ...sizes(), 中位數: pyFloat(ans) },
        });
      }
    }

    const result = `[${out.map(fmtOut).join(", ")}]`;
    t.push({
      note: `所有操作執行完畢。每次 \`addNum\` 只動到堆頂附近（O(log n)），\`findMedian\` 只看堆頂（O(1)）。回傳值依序是 \`${result}\`。`,
      views: views(ops.length),
      vars: sizes(),
      result,
    });
    return t.frames;
  },
});
