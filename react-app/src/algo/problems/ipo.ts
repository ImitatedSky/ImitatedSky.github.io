import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, heapSpec, py, tracer } from "../trace";

const code = `class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        projects = sorted(zip(capital, profits))  # 依門檻由低到高
        heap = []  # max-heap（存負數）：目前做得起的專案的利潤
        i = 0
        for _ in range(k):
            while i < len(projects) and projects[i][0] <= w:
                heappush(heap, -projects[i][1])
                i += 1
            if not heap:
                break  # 沒有做得起的專案了
            w -= heappop(heap)  # 做利潤最高的那個
        return w`;

interface Item {
  key: number; // -profit，和 Python 存的一樣
  col: number; // 在排序後 projects 裡的位置，只用來上色
}

// 與 Python heapq 相同的 sift 流程
function siftDown(h: Item[], start: number, pos: number) {
  const item = h[pos];
  while (pos > start) {
    const parent = (pos - 1) >> 1;
    if (item.key < h[parent].key) {
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
    if (child + 1 < h.length && !(h[child].key < h[child + 1].key)) child++;
    h[pos] = h[child];
    pos = child;
    child = 2 * pos + 1;
  }
  h[pos] = last;
  siftDown(h, 0, pos);
  return top;
}

export default defineProblem<{ k: number; w: number; profits: number[]; capital: number[] }>({
  id: 502,
  summary:
    "手上有初始資金 `w`，最多可以做 `k` 個專案。第 `i` 個專案需要**至少 `capital[i]` 的資金才能啟動**（資金不會被扣掉），做完後資金增加 `profits[i]`，每個專案只能做一次。\n\n挑選並安排專案，讓最後的資金最大，回傳這個最大值。",
  examples: [
    { input: "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]", output: "4", note: "先做專案 0（資金變 1），再做專案 2（資金變 4）" },
    { input: "k = 3, w = 0, profits = [1,2,3], capital = [0,1,2]", output: "6" },
  ],
  constraints: ["1 ≤ k ≤ 10⁵", "0 ≤ w ≤ 10⁹", "1 ≤ n ≤ 10⁵"],
  idea:
    "貪心：每一輪都在**現在做得起的專案**裡挑利潤最高的。因為做專案不花錢、資金只會變多，選最賺的絕對不吃虧，而且能解鎖的專案只會越來越多。把專案依門檻排序，用一個指標把「剛解鎖」的專案倒進 max-heap，每輪從堆頂拿一個。",
  steps: [
    "把 `(capital, profit)` 依 capital 由小到大排序。",
    "每一輪先移動指標 `i`：所有 `capital <= w` 的專案都把利潤 push 進 max-heap。",
    "heap 是空的就代表沒有專案做得起，提前結束。",
    "否則 pop 出最大利潤加到 `w`，進入下一輪。",
    "做滿 `k` 輪後回傳 `w`。",
  ],
  pitfalls: [
    "Python 的 `heapq` 只有 min-heap，要存**負的利潤**來模擬 max-heap，所以取出時是 `w -= heappop(heap)`。",
    "指標 `i` 不會回頭：已經解鎖的專案會一直留在 heap 裡，之後幾輪還能選。",
    "啟動資金是門檻，不是花費，做專案不會扣掉 `capital`。",
  ],
  complexity: { time: "O(n log n + k log n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        `,
  presets: [
    {
      label: "k = 3, w = 1, 五個專案",
      input: { k: 3, w: 1, profits: [2, 3, 5, 1, 8], capital: [1, 2, 3, 0, 6] },
      expected: "16",
    },
    { label: "k = 2, w = 0, [1,2,3] / [0,1,1]", input: { k: 2, w: 0, profits: [1, 2, 3], capital: [0, 1, 1] }, expected: "4" },
    {
      label: "k = 3, w = 0（資金不夠，提前結束）",
      input: { k: 3, w: 0, profits: [4, 2, 6], capital: [0, 5, 9] },
      expected: "4",
    },
  ],
  trace({ k, w: w0, profits, capital }) {
    const t = tracer();
    let w = w0;
    // sorted(zip(capital, profits))：先比 capital，再比 profit
    const projects = capital.map((c, idx) => [c, profits[idx]] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const n = projects.length;
    const heap: Item[] = [];
    const done = new Set<number>();
    let i = 0;

    const views = (colTones: Record<number, Tone> = {}, heapMarks: Record<number, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      const paint = (col: number, tone: Tone) => {
        marks[`0,${col}`] = tone;
        marks[`1,${col}`] = tone;
      };
      done.forEach((c) => paint(c, "good"));
      heap.forEach((it) => paint(it.col, "compare"));
      for (const [c, tone] of Object.entries(colTones)) paint(+c, tone);
      const treeMarks: Record<string, Tone> = {};
      for (const [pos, tone] of Object.entries(heapMarks)) treeMarks[`h${pos}`] = tone;
      return [
        V.grid("projects（依 capital 排序）", [projects.map((p) => p[0]), projects.map((p) => p[1])], {
          marks,
          pointers: i < n ? { i: [0, i] } : {},
          rowLabels: ["capital", "profit"],
          colLabels: projects.map((_, c) => c),
        }),
        V.tree("heap（max-heap，這裡顯示利潤）", heapSpec(heap.map((it) => -it.key)), { marks: treeMarks }),
        V.array("heap（Python 實際存的是負數）", heap.map((it) => it.key), { marks: heapMarks }),
      ];
    };

    t.push({
      line: 3,
      note: `把每個專案寫成 \`(capital, profit)\`，依**啟動門檻**由低到高排好。這樣資金一變多，新解鎖的專案一定是緊接在後面的那幾個。`,
      views: views(),
      vars: { k, w },
    });
    t.push({
      line: [4, 5],
      note: `準備一個 max-heap 放「**現在做得起**的專案的利潤」，指標 \`i\` 指向下一個還沒解鎖的專案。手上資金 \`w = ${w}\`，最多做 \`k = ${k}\` 個。`,
      views: views(),
      vars: { k, w, i },
    });

    for (let round = 1; round <= k; round++) {
      const label = `${round} / ${k}`;
      while (i < n && projects[i][0] <= w) {
        const [c, p] = projects[i];
        const item: Item = { key: -p, col: i };
        heappush(heap, item);
        const pos = heap.indexOf(item);
        const col = i;
        i++;
        t.push({
          line: [7, 8, 9],
          note: `第 ${round} 輪：專案 ${col} 的門檻 \`${c} <= w = ${w}\`，做得起 → 把它的利潤 \`${p}\`（存成 \`${-p}\`）push 進 heap，\`i\` 往右。`,
          views: views({ [col]: "active" }, { [pos]: "active" }),
          vars: { k, w, i, 輪次: label },
        });
      }

      const why =
        i === n
          ? "所有專案都已經解鎖"
          : `專案 ${i} 的門檻 \`${projects[i][0]} > w = ${w}\`，還做不起（後面的門檻只會更高）`;
      if (heap.length === 0) {
        t.push({
          line: [7, 10, 11],
          note: `第 ${round} 輪：${why}，而 heap 是空的 —— 沒有任何做得起的專案，資金再也不會增加，提前結束。`,
          views: views(i < n ? { [i]: "bad" } : {}),
          vars: { k, w, i, 輪次: label },
        });
        break;
      }

      t.push({
        line: [7, 10],
        note: `第 ${round} 輪：${why}，停止解鎖。heap 裡有 ${heap.length} 個做得起的專案，堆頂 \`${-heap[0].key}\` 是其中**利潤最高**的。`,
        views: views({}, { 0: "compare" }),
        vars: { k, w, i, 輪次: label },
      });

      const top = heappop(heap);
      const p = -top.key;
      const before = w;
      w += p;
      done.add(top.col);
      t.push({
        line: 12,
        note:
          `做專案 ${top.col}：\`heappop\` 拿到 \`${top.key}\`，\`w -= ${top.key}\` 也就是 \`${before} + ${p} = ${w}\`。` +
          (heap.length ? "其他已解鎖的專案留在 heap 裡，之後還能選。" : "heap 清空了。"),
        views: views({ [top.col]: "good" }),
        vars: { k, w, i, 輪次: label },
      });
    }

    t.push({
      line: 13,
      note: `結束，一共做了 ${done.size} 個專案，資金從 \`${w0}\` 變成 \`${w}\`。每一輪都拿「做得起的裡面最賺的」，所以這就是最大值。`,
      views: views(),
      vars: { k, w, i },
      result: py(w),
    });
    return t.frames;
  },
});
