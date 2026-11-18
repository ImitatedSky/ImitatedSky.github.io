import type { SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def insertion_sort(a: list[int]) -> list[int]:
    for i in range(1, len(a)):
        key = a[i]  # 這一輪要插入的元素
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]  # 比 key 大的往右挪一格
            j -= 1
        a[j + 1] = key
    return a`;

const algo: SortAlgo = {
  id: "insertion",
  name: "Insertion Sort",
  nameZh: "插入排序",
  tagline: "像整理撲克牌，一張一張插進去",
  idea: "左邊維持一段**已排序區**。每次從右邊拿一個新元素 `key`，由右往左和已排序區的元素比較，比它大的就往右挪一格，直到找到 `key` 該待的空位再放進去。",
  steps: [
    "`a[0]` 自己一個元素，本來就是排好的；從 `i = 1` 開始。",
    "取出 `key = a[i]`，`j` 從 `i - 1` 往左走。",
    "只要 `a[j] > key`，就把 `a[j]` 往右挪一格，`j` 再往左。",
    "遇到 `a[j] <= key` 或走到最左邊就停下，把 `key` 放進 `a[j + 1]`。用 `>` 而不是 `>=`，相同的值不會互換，所以是穩定排序。",
  ],
  complexity: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true },
  code,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    let done = false;
    const view = (sortedTo: number, extra: Record<number, Tone> = {}, pointers: Record<string, number> = {}) => {
      const marks: Record<number, Tone> = {};
      if (done) for (let k = 0; k < n; k++) marks[k] = "good";
      return V.bars("a", a, {
        ids,
        marks: { ...marks, ...extra },
        pointers,
        ranges: done ? [] : [{ from: 0, to: sortedTo, label: "已排序區", tone: "alt" }],
      });
    };

    t.push({
      line: 1,
      note: `\`a[0] = ${a[0]}\` 只有一個元素，本身就是已排序區。接下來把右邊的元素一個一個插進來。`,
      views: [view(0)],
    });

    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      t.push({
        line: [2, 3, 4],
        note: `拿起 \`key = a[${i}] = ${key}\`，準備由右往左在已排序區裡找它的位置。（動畫中 \`key\` 會跟著空位一起往左移。）`,
        views: [view(i - 1, { [i]: "active" }, { i, j })],
        vars: { i, key, j },
      });
      while (j >= 0) {
        const greater = a[j] > key;
        t.push({
          line: 5,
          note: greater
            ? `\`a[${j}] = ${a[j]}\` > \`key = ${key}\`，它應該排在 \`key\` 後面，要往右挪。`
            : `\`a[${j}] = ${a[j]}\` ≤ \`key = ${key}\`，再往左的只會更小，\`key\` 的位置找到了。`,
          views: [view(i - 1, { [j]: "compare", [j + 1]: "active" }, { i, j })],
          vars: { i, key, j },
        });
        if (!greater) break;
        // a[j + 1] = a[j]; the hole (shown holding key) moves to j
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        [ids[j], ids[j + 1]] = [ids[j + 1], ids[j]];
        j--;
        t.push({
          line: [6, 7],
          note: `\`${a[j + 2]}\` 往右挪到位置 ${j + 2}，空位換到位置 ${j + 1}，\`j\` 往左到 ${j}。`,
          views: [view(i - 1, { [j + 2]: "compare", [j + 1]: "active" }, { i, j })],
          vars: { i, key, j },
        });
      }
      t.push({
        line: 8,
        note:
          j + 1 === i
            ? `\`key = ${key}\` 不比左邊的小，留在原位。已排序區擴大到 \`a[0..${i}]\`。`
            : `${j < 0 ? "已經走到最左邊，" : ""}把 \`key = ${key}\` 放進位置 ${j + 1}。已排序區擴大到 \`a[0..${i}]\`。`,
        views: [view(i, { [j + 1]: "active" }, { i, j })],
        vars: { i, key, j },
      });
    }
    done = true;
    t.push({ line: 9, note: "所有元素都插入完畢，排序完成。", views: [view(n - 1)], result: py(a) });
    return t.frames;
  },
};
export default algo;
