import type { SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def shell_sort(a: list[int]) -> list[int]:
    n = len(a)
    gap = n // 2
    while gap > 0:
        # 對每一組「相隔 gap」的元素做插入排序
        for i in range(gap, n):
            key = a[i]
            j = i
            while j >= gap and a[j - gap] > key:
                a[j] = a[j - gap]
                j -= gap
            a[j] = key
        gap //= 2
    return a`;

const algo: SortAlgo = {
  id: "shell",
  name: "Shell Sort",
  nameZh: "希爾排序",
  tagline: "先跳著排，再縮小間隔的插入排序",
  idea: "插入排序一次只能把元素挪一格，遇到離目標很遠的元素就很慢。希爾排序先用很大的**間隔 gap** 把相隔 gap 的元素當成一組做插入排序，讓元素一次跳很遠；之後不斷把 gap 減半，最後 `gap = 1` 就是一般的插入排序，但此時陣列已經「幾乎排好」，所以很快。",
  steps: [
    "`gap` 從 `n // 2` 開始，每一輪減半，直到變成 0。",
    "對每個 `i >= gap`：取出 `key = a[i]`，和同組前面的 `a[j - gap]` 比較。",
    "`a[j - gap] > key` 就把它往後挪 `gap` 格，`j` 往前跳 `gap`。",
    "找到位置後放入 `key`。最後一輪 `gap = 1` 保證結果一定正確。",
    "元素會跨組跳躍，相同的值可能被換到彼此的另一邊，所以不穩定。",
  ],
  complexity: { best: "O(n log n)", avg: "約 O(n^1.5)", worst: "O(n²)", space: "O(1)", stable: false },
  code,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    let done = false;
    const view = (
      extra: Record<number, Tone> = {},
      pointers: Record<string, number> = {},
      range?: { from: number; to: number; gap: number },
    ) => {
      const marks: Record<number, Tone> = {};
      if (done) for (let k = 0; k < n; k++) marks[k] = "good";
      return V.bars("a", a, {
        ids,
        marks: { ...marks, ...extra },
        pointers,
        ranges: range ? [{ from: range.from, to: range.to, label: `gap = ${range.gap}`, tone: "alt" }] : [],
      });
    };
    /** 同一組（索引對 gap 同餘）且已經處理過的元素 */
    const group = (i: number, gap: number) => {
      const m: Record<number, Tone> = {};
      for (let k = i % gap; k <= i; k += gap) m[k] = "alt";
      return m;
    };

    let gap = Math.floor(n / 2);
    t.push({
      line: [2, 3],
      note: `共 ${n} 個元素，第一個間隔取 \`n // 2 = ${gap}\`。`,
      views: [view({}, {}, { from: 0, to: gap, gap })],
      vars: { n, gap },
    });

    let first = true;
    while (gap > 0) {
      t.push({
        line: first ? 4 : [13, 4],
        note:
          gap === 1
            ? "`gap = 1`：最後一輪就是一般的插入排序。前面幾輪已經把陣列整理得差不多，需要挪動的次數很少。"
            : `\`gap = ${gap}\`：把索引相差 ${gap} 的元素視為同一組（共 ${gap} 組），各組分別做插入排序，元素一次可以跳 ${gap} 格。`,
        views: [view({}, {}, { from: 0, to: gap, gap })],
        vars: { n, gap },
      });
      first = false;
      for (let i = gap; i < n; i++) {
        const key = a[i];
        let j = i;
        let firstCmp = true;
        while (j >= gap) {
          const greater = a[j - gap] > key;
          t.push({
            line: firstCmp ? [7, 8, 9] : 9,
            note:
              (firstCmp ? `取出 \`key = a[${i}] = ${key}\`。` : "") +
              (greater
                ? `同組前一個 \`a[${j - gap}] = ${a[j - gap]}\` > \`${key}\`，要往後挪 ${gap} 格。`
                : `同組前一個 \`a[${j - gap}] = ${a[j - gap]}\` ≤ \`${key}\`，${j === i ? "不用動。" : "停在這裡。"}`),
            views: [
              view({ ...group(i, gap), [j - gap]: "compare", [j]: "active" }, { i, j }, { from: j - gap, to: j, gap }),
            ],
            vars: { gap, i, key, j },
          });
          firstCmp = false;
          if (!greater) break;
          [a[j], a[j - gap]] = [a[j - gap], a[j]];
          [ids[j], ids[j - gap]] = [ids[j - gap], ids[j]];
          j -= gap;
          t.push({
            line: [10, 11],
            note: `\`${a[j + gap]}\` 往後跳到位置 ${j + gap}，\`key\` 的空位往前跳到位置 ${j}。`,
            views: [view({ ...group(i, gap), [j]: "active" }, { i, j }, { from: j, to: j + gap, gap })],
            vars: { gap, i, key, j },
          });
        }
        if (j !== i) {
          t.push({
            line: 12,
            note: `把 \`key = ${key}\` 放進位置 ${j}${j < gap ? "（同組前面已經沒有元素了）" : ""}。這一組到 \`a[${i}]\` 為止是排好的。`,
            views: [view({ ...group(i, gap), [j]: "active" }, { i, j }, { from: i - gap, to: i, gap })],
            vars: { gap, i, key, j },
          });
        }
      }
      gap = Math.floor(gap / 2);
    }
    done = true;
    t.push({
      line: [13, 14],
      note: "`gap` 減半後變成 0，迴圈結束。`gap = 1` 那一輪保證了整個陣列有序，排序完成。",
      views: [view()],
      vars: { gap },
      result: py(a),
    });
    return t.frames;
  },
};
export default algo;
