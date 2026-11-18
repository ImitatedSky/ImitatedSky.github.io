import type { SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def selection_sort(a: list[int]) -> list[int]:
    n = len(a)
    for i in range(n - 1):
        m = i  # 未排序區中，目前最小值的位置
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        if m != i:
            a[i], a[m] = a[m], a[i]
    return a`;

const algo: SortAlgo = {
  id: "selection",
  name: "Selection Sort",
  nameZh: "選擇排序",
  tagline: "每輪挑出最小的，放到最前面",
  idea: "把陣列分成左邊的**已排序區**和右邊的**未排序區**。每一輪掃過整個未排序區找出最小值，把它和未排序區的第一個元素交換，已排序區就多了一個元素。",
  steps: [
    "第 `i` 輪：先假設 `a[i]` 是未排序區的最小值，用 `m` 記住它的位置。",
    "`j` 從 `i + 1` 掃到尾端，只要 `a[j] < a[m]` 就把 `m` 更新成 `j`。",
    "掃完後若 `m != i`，交換 `a[i]` 與 `a[m]`，最小值就定位了。",
    "不管輸入長什麼樣子都要掃完整個未排序區，所以比較次數固定是 n(n-1)/2；但每輪最多只交換一次。",
  ],
  complexity: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: false },
  code,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    let sorted = 0; // a[0..sorted-1] is final
    const view = (extra: Record<number, Tone> = {}, pointers: Record<string, number> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let k = 0; k < sorted; k++) marks[k] = "good";
      return V.bars("a", a, { ids, marks: { ...marks, ...extra }, pointers });
    };

    t.push({
      line: 2,
      note: `共 ${n} 個元素，要做 ${n - 1} 輪，每輪替一個位置選出該放的最小值。`,
      views: [view()],
      vars: { n },
    });

    for (let i = 0; i < n - 1; i++) {
      let m = i;
      t.push({
        line: [3, 4],
        note: `第 ${i + 1} 輪：要決定位置 ${i} 放誰。先假設 \`a[${i}] = ${a[i]}\` 就是未排序區的最小值。`,
        views: [view({ [i]: "active" }, { i, m })],
        vars: { i, m },
      });
      for (let j = i + 1; j < n; j++) {
        const smaller = a[j] < a[m];
        const old = m;
        if (smaller) m = j;
        t.push({
          line: smaller ? [6, 7] : 6,
          note: smaller
            ? `\`a[${j}] = ${a[j]}\` 比目前最小的 \`${a[old]}\` 還小，\`m\` 改指向 ${j}。`
            : `\`a[${j}] = ${a[j]}\` 沒有比目前最小的 \`${a[m]}\` 小，\`m\` 不變。`,
          views: [view(smaller ? { [old]: "compare", [j]: "active" } : { [m]: "active", [j]: "compare" }, { i, j, m })],
          vars: { i, j, m },
        });
      }
      if (m !== i) {
        [a[i], a[m]] = [a[m], a[i]];
        [ids[i], ids[m]] = [ids[m], ids[i]];
        sorted = i + 1;
        t.push({
          line: [8, 9],
          note: `未排序區的最小值是 \`${a[i]}\`，和 \`a[${i}]\` 交換。位置 ${i} 就定位了。`,
          views: [view({ [m]: "alt" }, { i, m })],
          vars: { i, m },
        });
      } else {
        sorted = i + 1;
        t.push({
          line: 8,
          note: `最小值 \`${a[i]}\` 本來就在位置 ${i}（\`m == i\`），不用交換。`,
          views: [view({}, { i, m })],
          vars: { i, m },
        });
      }
    }
    sorted = n;
    t.push({
      line: 10,
      note: "前 n-1 個位置都放好了，剩下的最後一個必然是最大值，排序完成。",
      views: [view()],
      result: py(a),
    });
    return t.frames;
  },
};
export default algo;
