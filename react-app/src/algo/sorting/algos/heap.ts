import type { SortAlgo, Tone } from "../../types";
import { V, heapSpec, py, tracer } from "../../trace";

const code = `def heap_sort(a: list[int]) -> list[int]:
    def sift_down(i: int, size: int) -> None:
        while True:
            largest = i
            l, r = 2 * i + 1, 2 * i + 2
            if l < size and a[l] > a[largest]:
                largest = l
            if r < size and a[r] > a[largest]:
                largest = r
            if largest == i:
                return
            a[i], a[largest] = a[largest], a[i]
            i = largest

    n = len(a)
    for i in range(n // 2 - 1, -1, -1):  # 由下往上建立最大堆積
        sift_down(i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]  # 最大值換到尾端，堆積縮小一格
        sift_down(0, end)
    return a`;

const algo: SortAlgo = {
  id: "heap",
  name: "Heap Sort",
  nameZh: "堆積排序",
  tagline: "建最大堆積，反覆把堆頂換到尾端",
  idea: "把陣列直接看成一棵**完全二元樹**（`a[i]` 的子節點是 `a[2i+1]`、`a[2i+2]`），先整理成**最大堆積**：每個父節點都不小於子節點，所以堆頂 `a[0]` 就是最大值。接著反覆把堆頂和堆積的最後一個元素交換，最大值就定位在尾端；堆積縮小一格後，再讓新的堆頂「下沉」恢復堆積性質。",
  steps: [
    "建堆：從最後一個非葉節點 `n // 2 - 1` 往前，對每個節點做 `sift_down`，整體只要 O(n)。",
    "`sift_down`：父節點和兩個子節點比，若最大的是子節點就交換，並沿著那條路繼續往下。",
    "把堆頂 `a[0]`（目前最大值）和 `a[end]` 交換，`a[end]` 就定位了。",
    "堆積大小減一，對新的堆頂做 `sift_down`；重複直到堆積只剩一個元素。",
    "交換會讓元素在樹上長距離跳動，相同的值順序可能改變，所以不穩定。",
  ],
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)", stable: false },
  code,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    let size = n; // a[0..size-1] is the heap, a[size..] is the sorted suffix

    const views = (extra: Record<number, Tone> = {}, pointers: Record<string, number> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let k = size; k < n; k++) marks[k] = "good";
      const treeMarks: Record<string, Tone> = {};
      for (const [k, tone] of Object.entries(extra)) if (+k < size) treeMarks[`h${k}`] = tone;
      const treePointers: Record<string, string> = {};
      for (const [name, k] of Object.entries(pointers)) if (k < size) treePointers[name] = `h${k}`;
      return [
        V.bars("a", a, {
          ids,
          marks: { ...marks, ...extra },
          pointers,
          ranges: size > 0 ? [{ from: 0, to: size - 1, tone: "alt", label: `堆積 a[0..${size - 1}]` }] : [],
        }),
        V.tree("堆積（樹狀）", heapSpec(a.slice(0, size)), { marks: treeMarks, pointers: treePointers }),
      ];
    };
    const swap = (x: number, y: number) => {
      [a[x], a[y]] = [a[y], a[x]];
      [ids[x], ids[y]] = [ids[y], ids[x]];
    };

    const siftDown = (start: number, intro: string, callLine: number) => {
      let i = start;
      let first = true;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l >= size) {
          // 葉節點：只有在一開始就是葉節點時才需要畫一格
          if (first) {
            t.push({
              line: [callLine, 10, 11],
              note: `${intro}\`a[${i}] = ${a[i]}\` 沒有子節點，不需要下沉。`,
              views: views({ [i]: "active" }, { i }),
              vars: { i, size, largest: i },
            });
          }
          return;
        }
        let largest = i;
        if (a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        const kids = r < size ? `\`a[${l}] = ${a[l]}\`、\`a[${r}] = ${a[r]}\`` : `\`a[${l}] = ${a[l]}\``;
        const marks: Record<number, Tone> = { [l]: "compare", [i]: "active" };
        const pointers: Record<string, number> = { i, l };
        if (r < size) {
          marks[r] = "compare";
          pointers.r = r;
        }
        const stop = largest === i;
        t.push({
          line: [...(first ? [callLine] : []), 6, 8, ...(stop ? [10, 11] : [])],
          note:
            `${first ? intro : ""}\`a[${i}] = ${a[i]}\` 和子節點 ${kids} 比較：` +
            (stop
              ? "父節點已經是最大的，符合堆積性質，停止下沉。"
              : `最大的是 \`a[${largest}] = ${a[largest]}\`，父節點比它小，要交換。`),
          views: views(marks, pointers),
          vars: { i, size, l, r, largest },
        });
        if (stop) return;
        swap(i, largest);
        t.push({
          line: [12, 13],
          note: `交換後 \`${a[i]}\` 上移、\`${a[largest]}\` 下沉到位置 ${largest}。${
            2 * largest + 1 < size ? "下沉後可能又比新的子節點小，繼續往下檢查。" : "它已經是葉節點，下沉結束。"
          }`,
          views: views({ [i]: "compare", [largest]: "active" }, { i: largest }),
          vars: { i: largest, size },
        });
        i = largest;
        first = false;
      }
    };

    t.push({
      line: 15,
      note: `把陣列看成一棵完全二元樹：\`a[i]\` 的左右子節點是 \`a[2i+1]\`、\`a[2i+2]\`。現在它還不是堆積。`,
      views: views(),
      vars: { n },
    });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      siftDown(i, `建堆（\`i = ${i}\`）：`, 17);
    }
    t.push({
      line: 18,
      note: `最大堆積建好了：每個父節點都不小於子節點，所以堆頂 \`a[0] = ${a[0]}\` 就是最大值。`,
      views: views({ 0: "active" }),
      vars: { n },
    });
    for (let end = n - 1; end > 0; end--) {
      swap(0, end);
      size = end;
      t.push({
        line: 19,
        note: `把堆頂 \`${a[end]}\` 和堆積最後一個元素 \`${a[0]}\` 交換：\`${a[end]}\` 定位在 \`a[${end}]\`，堆積縮小成 ${size} 個。`,
        views: views({ 0: "active" }, { end }),
        vars: { end, size },
      });
      siftDown(0, "新的堆頂可能破壞堆積性質：", 20);
    }
    size = 0;
    t.push({
      line: 21,
      note: "堆積只剩一個元素，它就是最小值，已經在 `a[0]`。排序完成。",
      views: views(),
      result: py(a),
    });
    return t.frames;
  },
};
export default algo;
