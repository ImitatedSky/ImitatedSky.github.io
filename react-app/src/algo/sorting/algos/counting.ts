import type { Cell, SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def counting_sort(a: list[int]) -> list[int]:
    k = max(a) + 1
    count = [0] * k
    for x in a:  # 統計每個值出現幾次
        count[x] += 1
    for v in range(1, k):  # 前綴和：count[v] = 小於等於 v 的元素個數
        count[v] += count[v - 1]
    out = [None] * len(a)
    for x in reversed(a):  # 由右往左放，才能保持穩定
        count[x] -= 1
        out[count[x]] = x
    a[:] = out
    return a`;

const algo: SortAlgo = {
  id: "counting",
  name: "Counting Sort",
  nameZh: "計數排序",
  tagline: "不比較，直接數每個值出現幾次",
  idea: "當數值是**範圍不大的非負整數**時，根本不需要兩兩比較：開一個長度為 `k`（最大值 + 1）的 `count` 陣列，數出每個值出現幾次；再做一次前綴和，`count[v]` 就變成「小於等於 `v` 的元素有幾個」，也就是值 `v` 在排序結果中的結尾位置。最後照這個位置把元素放進輸出陣列。",
  steps: [
    "掃一遍 `a`，`count[x] += 1`。",
    "對 `count` 做前綴和：`count[v] += count[v - 1]`。",
    "**由右往左**掃 `a`：`count[x]` 減 1 後就是 `x` 該放的索引，寫進 `out`。",
    "由右往左放，相同的值會維持原本的先後順序，所以是穩定排序（這也是基數排序能運作的前提）。",
    "時間與空間都和數值範圍 `k` 有關，`k` 遠大於 `n` 時就不划算。",
  ],
  complexity: { best: "O(n + k)", avg: "O(n + k)", worst: "O(n + k)", space: "O(n + k)", stable: true },
  code,
  maxValue: 20,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    const k = Math.max(...a) + 1;
    const count: number[] = new Array(k).fill(0);
    let out: Cell[] = [];
    let outIds: number[] = [];

    const views = (
      aMarks: Record<number, Tone> = {},
      aPointers: Record<string, number> = {},
      countMarks: Record<number, Tone> = {},
      countPointers: Record<string, number> = {},
      outMarks: Record<number, Tone> = {},
    ) => [
      V.bars("a", a, { ids, marks: aMarks, pointers: aPointers }),
      V.array("count（索引 = 數值）", count, { marks: countMarks, pointers: countPointers }),
      V.array("out", out, { marks: outMarks }),
    ];
    const seen = (from: number, to: number) => {
      const m: Record<number, Tone> = {};
      for (let p = from; p <= to; p++) m[p] = "visited";
      return m;
    };

    t.push({
      line: [2, 3],
      note: `最大值是 ${k - 1}，所以開一個長度 \`k = ${k}\` 的 \`count\` 陣列，\`count[v]\` 用來記錄值 \`v\` 的個數。`,
      views: views(),
      vars: { k },
    });

    for (let p = 0; p < n; p++) {
      const x = a[p];
      count[x]++;
      t.push({
        line: [4, 5],
        note: `讀到 \`x = ${x}\`，\`count[${x}]\` 加 1 變成 ${count[x]}。不用和任何元素比較，值本身就是索引。`,
        views: views({ ...seen(0, p - 1), [p]: "active" }, { x: p }, { [x]: "active" }, { x }),
        vars: { x },
      });
    }

    for (let v = 1; v < k; v++) {
      const before = count[v];
      count[v] += count[v - 1];
      t.push({
        line: [6, 7],
        note: `前綴和：\`count[${v}] = ${before} + ${count[v - 1]} = ${count[v]}\`，代表小於等於 ${v} 的元素共有 ${count[v]} 個。`,
        views: views(seen(0, n - 1), {}, { [v - 1]: "compare", [v]: "active" }, { v }),
        vars: { v },
      });
    }

    out = new Array(n).fill(null);
    outIds = new Array(n).fill(-1);
    t.push({
      line: 8,
      note: "現在 `count[v]` 表示「值 `v` 的最後一個要放在第 `count[v] - 1` 格」。準備一個一樣長的輸出陣列 `out`。",
      views: views(),
      vars: { k },
    });

    const placed: Record<number, Tone> = {};
    for (let p = n - 1; p >= 0; p--) {
      const x = a[p];
      count[x]--;
      const pos = count[x];
      out[pos] = x;
      outIds[pos] = ids[p];
      t.push({
        line: [9, 10, 11],
        note: `由右往左讀到 \`x = ${x}\`：\`count[${x}]\` 減 1 變成 ${pos}，所以把它放進 \`out[${pos}]\`。${
          a.indexOf(x) < p ? `左邊還有的 ${x} 之後會放在它的左邊，原本的先後順序不變。` : ""
        }`,
        views: views({ ...seen(p + 1, n - 1), [p]: "active" }, { x: p }, { [x]: "active" }, { x }, { ...placed, [pos]: "active" }),
        vars: { x, "count[x]": pos },
      });
      placed[pos] = "good";
    }

    for (let p = 0; p < n; p++) {
      a[p] = out[p] as number;
      ids[p] = outIds[p];
    }
    const good: Record<number, Tone> = {};
    for (let p = 0; p < n; p++) good[p] = "good";
    t.push({
      line: [12, 13],
      note: "把 `out` 整個寫回 `a`，排序完成。全程沒有做過任何一次元素間的比較。",
      views: views(good, {}, {}, {}, good),
      result: py(a),
    });
    return t.frames;
  },
};
export default algo;
