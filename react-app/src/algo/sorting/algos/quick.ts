import type { SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def quick_sort(a: list[int]) -> list[int]:
    def partition(lo: int, hi: int) -> int:
        pivot = a[hi]
        i = lo
        for j in range(lo, hi):
            if a[j] < pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        return i

    def sort(lo: int, hi: int) -> None:
        if lo >= hi:
            return
        p = partition(lo, hi)
        sort(lo, p - 1)
        sort(p + 1, hi)

    sort(0, len(a) - 1)
    return a`;

const algo: SortAlgo = {
  id: "quick",
  name: "Quick Sort",
  nameZh: "快速排序",
  tagline: "選基準、分兩邊、遞迴",
  idea: "挑一個**基準 pivot**，把比它小的全部搬到左邊、其餘留在右邊（partition），pivot 就站到了最終位置。接著對左右兩段各自遞迴做同樣的事。",
  steps: [
    "Lomuto partition：以 `a[hi]` 為 pivot，`i` 指向「下一個小於 pivot 的元素該放的位置」。",
    "`j` 掃過區間，遇到 `a[j] < pivot` 就和 `a[i]` 交換，`i` 前進。",
    "掃完後把 pivot 換到 `i`，此時左邊都比它小、右邊都不小於它。",
    "遞迴處理 `[lo, p-1]` 與 `[p+1, hi]`。",
  ],
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: false },
  code,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const fixed = new Set<number>();
    const swap = (x: number, y: number) => {
      [a[x], a[y]] = [a[y], a[x]];
      [ids[x], ids[y]] = [ids[y], ids[x]];
    };
    const view = (lo: number, hi: number, extra: Record<number, Tone>, pointers: Record<string, number>) => {
      const marks: Record<number, Tone> = {};
      a.forEach((_, k) => {
        if (fixed.has(k)) marks[k] = "good";
        else if (k < lo || k > hi) marks[k] = "muted";
      });
      return V.bars("a", a, {
        ids,
        marks: { ...marks, ...extra },
        pointers,
        ranges: lo <= hi ? [{ from: lo, to: hi, label: `[${lo}, ${hi}]`, tone: "alt" }] : [],
      });
    };

    const sort = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        fixed.add(lo);
        t.push({
          line: [13, 14],
          note: `區間 \`[${lo}, ${hi}]\` 只有一個元素，本來就是排好的。`,
          views: [view(lo, hi, {}, {})],
          vars: { lo, hi },
        });
        return;
      }
      const pivot = a[hi];
      let i = lo;
      t.push({
        line: [3, 4],
        note: `處理區間 \`[${lo}, ${hi}]\`：選最右邊的 \`${pivot}\` 當 pivot。`,
        views: [view(lo, hi, { [hi]: "active" }, { i, pivot: hi })],
        vars: { lo, hi, pivot, i },
      });
      for (let j = lo; j < hi; j++) {
        const smaller = a[j] < pivot;
        t.push({
          line: 6,
          note: `\`a[${j}] = ${a[j]}\` ${smaller ? `< ${pivot}，屬於左半邊，換到位置 \`i = ${i}\`。` : `≥ ${pivot}，留在右邊不動。`}`,
          views: [view(lo, hi, { [hi]: "active", [j]: "compare" }, { i, j, pivot: hi })],
          vars: { lo, hi, pivot, i, j },
        });
        if (smaller) {
          swap(i, j);
          i++;
          t.push({
            line: [7, 8],
            note: `交換完成，\`i\` 前進到 ${i}。\`i\` 左邊的都比 pivot 小。`,
            views: [view(lo, hi, { [hi]: "active", [i - 1]: "alt" }, { i, j, pivot: hi })],
            vars: { lo, hi, pivot, i, j },
          });
        }
      }
      swap(i, hi);
      fixed.add(i);
      t.push({
        line: [9, 10],
        note: `把 pivot \`${pivot}\` 換到位置 ${i} —— 它就定位了：左邊都比它小，右邊都不小於它。`,
        views: [view(lo, hi, {}, { p: i })],
        vars: { lo, hi, pivot, p: i },
      });
      sort(lo, i - 1);
      sort(i + 1, hi);
    };

    t.push({
      line: 19,
      note: "從整個陣列開始。",
      views: [view(0, a.length - 1, {}, {})],
      vars: { lo: 0, hi: a.length - 1 },
    });
    sort(0, a.length - 1);
    t.push({ line: 20, note: "所有區間都處理完，排序完成。", views: [view(0, -1, {}, {})], result: py(a) });
    return t.frames;
  },
};
export default algo;
