import type { SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def bubble_sort(a: list[int]) -> list[int]:
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a`;

const algo: SortAlgo = {
  id: "bubble",
  name: "Bubble Sort",
  nameZh: "氣泡排序",
  tagline: "相鄰兩兩比較，大的往後浮",
  idea: "每一輪由左到右比較**相鄰的兩個元素**，順序錯了就交換。一輪下來，最大的元素會像氣泡一樣「浮」到最右邊。重複 n-1 輪，或某一輪完全沒交換就可以提早結束。",
  steps: [
    "第 `i` 輪只需要比較前 `n - 1 - i` 對，因為右邊 `i` 個已經就定位。",
    "相鄰的 `a[j] > a[j+1]` 就交換。",
    "若整輪都沒有交換，代表已經排好，直接結束（最佳情況 O(n)）。",
  ],
  complexity: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true },
  code,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    let sortedFrom = n; // a[sortedFrom..] is final
    const marks = (extra: Record<number, Tone> = {}) => {
      const m: Record<number, Tone> = {};
      for (let k = sortedFrom; k < n; k++) m[k] = "good";
      return { ...m, ...extra };
    };
    const view = (extra: Record<number, Tone> = {}, pointers: Record<string, number> = {}) =>
      V.bars("a", a, { ids, marks: marks(extra), pointers });

    t.push({ line: 2, note: `共 ${n} 個元素，最多需要 ${Math.max(0, n - 1)} 輪。`, views: [view()], vars: { n } });

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        const bigger = a[j] > a[j + 1];
        t.push({
          line: 6,
          note: `第 ${i + 1} 輪：比較 \`a[${j}] = ${a[j]}\` 和 \`a[${j + 1}] = ${a[j + 1]}\`${bigger ? "，左邊比較大，要交換。" : "，順序正確。"}`,
          views: [view({ [j]: "compare", [j + 1]: "compare" }, { j, "j+1": j + 1 })],
          vars: { i, j, swapped },
        });
        if (bigger) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          [ids[j], ids[j + 1]] = [ids[j + 1], ids[j]];
          swapped = true;
          t.push({
            line: [7, 8],
            note: `交換，\`${a[j + 1]}\` 往右浮一格。`,
            views: [view({ [j]: "active", [j + 1]: "active" }, { j, "j+1": j + 1 })],
            vars: { i, j, swapped },
          });
        }
      }
      sortedFrom = n - 1 - i;
      t.push({
        line: 9,
        note: `第 ${i + 1} 輪結束，\`${a[sortedFrom]}\` 已經浮到正確位置。${swapped ? "" : "這一輪沒有任何交換 —— 陣列已排好，提早結束。"}`,
        views: [view()],
        vars: { i, swapped },
      });
      if (!swapped) break;
    }
    sortedFrom = 0;
    t.push({ line: 11, note: "排序完成。", views: [view()], result: py(a) });
    return t.frames;
  },
};
export default algo;
