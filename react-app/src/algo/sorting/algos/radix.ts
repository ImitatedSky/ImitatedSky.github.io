import type { Cell, SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def radix_sort(a: list[int]) -> list[int]:
    exp = 1  # 目前看的位數：1 = 個位、10 = 十位、100 = 百位
    while max(a) // exp > 0:
        buckets = [[] for _ in range(10)]
        for x in a:
            buckets[x // exp % 10].append(x)  # 依這一位的數字分桶
        a = [x for b in buckets for x in b]  # 由 0 號桶到 9 號桶依序收回
        exp *= 10
    return a`;

const PLACE = ["個位數", "十位數", "百位數", "千位數"];

const algo: SortAlgo = {
  id: "radix",
  name: "Radix Sort",
  nameZh: "基數排序",
  tagline: "從個位數開始，一位一位分桶再收回",
  idea: "不直接比較整個數字，而是**一次只看一個位數**。LSD 作法從最低位（個位）開始：依這一位的數字 0–9 把元素分進十個桶，再由 0 號桶到 9 號桶依序收回；接著換十位、百位…。關鍵是每一輪的分桶都是**穩定**的，所以較高位相同的元素，會保留前面幾輪依低位排好的順序。",
  steps: [
    "`exp` 代表目前看的位數，`x // exp % 10` 取出那一位的數字。",
    "依這個數字把每個元素放進 0–9 號桶（同一桶內維持原本的先後順序）。",
    "由 0 號桶到 9 號桶依序收回，成為新的陣列。",
    "`exp *= 10` 換下一個位數，直到超過最大值的位數為止。",
    "共做 d 輪（d 為最大值的位數），每輪 O(n + k)，其中 k = 10 是桶數。",
  ],
  complexity: { best: "O(d(n + k))", avg: "O(d(n + k))", worst: "O(d(n + k))", space: "O(n + k)", stable: true },
  code,
  maxValue: 999,
  sample: [170, 45, 75, 90, 802, 24, 2, 66],
  trace(input) {
    const t = tracer();
    let a = [...input];
    let ids = a.map((_, i) => i);
    const n = a.length;
    const max = Math.max(...a);
    const digitOf = (x: number, exp: number) => Math.floor(x / exp) % 10;

    // 先算出所有輪次中最滿的桶有多高，讓桶的畫面大小固定
    let depth = 1;
    for (let e = 1; Math.floor(max / e) > 0; e *= 10) {
      const cnt = new Array(10).fill(0);
      for (const x of a) depth = Math.max(depth, ++cnt[digitOf(x, e)]);
    }

    let buckets: { v: number; id: number }[][] = Array.from({ length: 10 }, () => []);
    const colLabels = Array.from({ length: 10 }, (_, d) => d);
    const views = (
      exp: number,
      aMarks: Record<number, Tone> = {},
      pointers: Record<string, number> = {},
      digitMarks: Record<number, Tone> = {},
      gridMarks: Record<string, Tone> = {},
    ) => {
      const cells: Cell[][] = Array.from({ length: depth }, (_, r) => buckets.map((b) => (r < b.length ? b[r].v : "")));
      return [
        V.bars("a", a, { ids, marks: aMarks, pointers }),
        V.array("目前這一位的數字（x // exp % 10）", a.map((x) => digitOf(x, exp)), { ids, marks: digitMarks }),
        V.grid("buckets（每一直行是一個桶，上方是桶的編號）", cells, { colLabels, marks: gridMarks }),
      ];
    };
    const fill = (from: number, to: number, tone: Tone) => {
      const m: Record<number, Tone> = {};
      for (let p = from; p <= to; p++) m[p] = tone;
      return m;
    };
    const allCells = (tone: Tone) => {
      const m: Record<string, Tone> = {};
      buckets.forEach((b, d) => b.forEach((_, r) => (m[`${r},${d}`] = tone)));
      return m;
    };

    let exp = 1;
    const rounds = max === 0 ? 0 : String(max).length;
    t.push({
      line: 2,
      note:
        rounds === 0
          ? "所有元素都是 0，沒有任何位數需要處理。"
          : `最大值 ${max} 有 ${rounds} 位數，所以總共要做 ${rounds} 輪。從最低位（個位數）開始。`,
      views: views(exp),
      vars: { exp },
    });

    let round = 0;
    while (Math.floor(max / exp) > 0) {
      const place = PLACE[round] ?? `第 ${round + 1} 位數`;
      buckets = Array.from({ length: 10 }, () => []);
      t.push({
        line: [3, 4],
        note:
          `第 ${round + 1} 輪：看**${place}**（\`exp = ${exp}\`），準備 10 個空桶。` +
          (round > 0 ? "陣列目前已經依較低的位數排好，這個順序在分桶時會被保留下來。" : ""),
        views: views(exp, {}, {}, fill(0, n - 1, "alt")),
        vars: { exp },
      });
      for (let p = 0; p < n; p++) {
        const x = a[p];
        const d = digitOf(x, exp);
        buckets[d].push({ v: x, id: ids[p] });
        t.push({
          line: [5, 6],
          note: `\`x = ${x}\` 的${place}是 \`${x} // ${exp} % 10 = ${d}\`，放到 ${d} 號桶的最後面。`,
          views: views(
            exp,
            { ...fill(0, p - 1, "visited"), [p]: "active" },
            { x: p },
            { ...fill(0, p - 1, "visited"), [p]: "active" },
            { [`${buckets[d].length - 1},${d}`]: "active" },
          ),
          vars: { exp, x, digit: d },
        });
      }
      const flat = buckets.flat();
      a = flat.map((e) => e.v);
      ids = flat.map((e) => e.id);
      const last = Math.floor(max / (exp * 10)) === 0;
      t.push({
        line: [7, 8],
        note:
          `由 0 號桶到 9 號桶依序收回，陣列現在依${place}排好了。` +
          (round > 0 ? `${place}相同的元素維持上一輪的順序，所以整體等於依最低 ${round + 1} 位數排好。` : "") +
          (last ? "" : `接著 \`exp\` 乘 10，換看下一位。`),
        views: views(exp, last ? fill(0, n - 1, "good") : {}, {}, fill(0, n - 1, "alt"), allCells("alt")),
        vars: { exp: exp * 10 },
      });
      exp *= 10;
      round++;
    }

    const lastExp = Math.max(1, exp / 10);
    t.push({
      line: [3, 9],
      note:
        rounds === 0
          ? "`max(a) // exp` 是 0，迴圈一次都不用跑，陣列本來就是排好的。"
          : `\`max(a) // exp = ${max} // ${exp} = 0\`，已經沒有更高的位數，排序完成。`,
      views: views(lastExp, fill(0, n - 1, "good"), {}, {}, allCells("alt")),
      vars: { exp },
      result: py(a),
    });
    return t.frames;
  },
};
export default algo;
