import type { Cell, SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def bucket_sort(a: list[int], k: int = 5) -> list[int]:
    size = max(a) // k + 1  # 每個桶涵蓋的數值寬度
    buckets = [[] for _ in range(k)]
    for x in a:  # 分配：依數值範圍丟進對應的桶
        buckets[x // size].append(x)
    i = 0
    for b in buckets:
        b.sort()  # 桶內各自排序（元素少，常用插入排序）
        for x in b:  # 依桶的順序倒回原陣列
            a[i] = x
            i += 1
    return a`;

const K = 5;

const algo: SortAlgo = {
  id: "bucket",
  name: "Bucket Sort",
  nameZh: "桶排序",
  tagline: "先按範圍分桶，桶內排好再依序倒回",
  idea: "把數值範圍平均切成 `k` 段，每段對應一個**桶**。先把每個元素丟進它所屬範圍的桶，因為桶與桶之間已經有大小順序，只要把每個桶內部各自排好，再照桶的順序倒出來就是排序結果。資料分布越平均，每個桶裡的元素越少，速度越接近線性。",
  steps: [
    "算出每個桶涵蓋的寬度 `size = max(a) // k + 1`，元素 `x` 屬於第 `x // size` 個桶。",
    "分配：掃一遍 `a`，把每個元素放進對應的桶。",
    "每個桶內部各自排序（用穩定的排序法，整體就穩定）。",
    "收集：由 0 號桶開始，依序把桶裡的元素寫回 `a`。",
    "最差情況是所有元素擠進同一個桶，這時就退化成桶內排序法的複雜度。",
  ],
  complexity: { best: "O(n + k)", avg: "O(n + k)", worst: "O(n²)", space: "O(n + k)", stable: true },
  code,
  maxValue: 99,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    const size = Math.floor(Math.max(...a) / K) + 1;
    const buckets: { v: number; id: number }[][] = Array.from({ length: K }, () => []);
    const colLabels = buckets.map((_, b) => (size === 1 ? `${b}` : `${b * size}–${(b + 1) * size - 1}`));
    // 桶的顯示高度固定為「最滿的桶」的大小，畫面才不會忽大忽小
    const depth = Math.max(1, ...buckets.map((_, b) => a.filter((x) => Math.floor(x / size) === b).length));

    const grid = (marks: Record<string, Tone> = {}) => {
      const cells: Cell[][] = Array.from({ length: depth }, (_, r) => buckets.map((b) => (r < b.length ? b[r].v : "")));
      return V.grid("buckets（每一直行是一個桶，上方是它的數值範圍）", cells, { colLabels, marks });
    };
    const column = (b: number, tone: Tone) => {
      const m: Record<string, Tone> = {};
      buckets[b].forEach((_, r) => (m[`${r},${b}`] = tone));
      return m;
    };
    const views = (
      aMarks: Record<number, Tone> = {},
      pointers: Record<string, number> = {},
      gridMarks: Record<string, Tone> = {},
    ) => [V.bars("a", a, { ids, marks: aMarks, pointers }), grid(gridMarks)];
    const fill = (from: number, to: number, tone: Tone) => {
      const m: Record<number, Tone> = {};
      for (let p = from; p <= to; p++) m[p] = tone;
      return m;
    };

    t.push({
      line: [2, 3],
      note: `最大值是 ${Math.max(...a)}，分成 ${K} 個桶，每個桶涵蓋 \`size = ${size}\` 個數值。元素 \`x\` 屬於第 \`x // ${size}\` 個桶。`,
      views: views(),
      vars: { k: K, size },
    });

    for (let p = 0; p < n; p++) {
      const x = a[p];
      const b = Math.floor(x / size);
      buckets[b].push({ v: x, id: ids[p] });
      t.push({
        line: [4, 5],
        note: `\`x = ${x}\`：\`${x} // ${size} = ${b}\`，放進 ${b} 號桶（範圍 ${colLabels[b]}）。`,
        views: views({ ...fill(0, p - 1, "visited"), [p]: "active" }, { x: p }, { [`${buckets[b].length - 1},${b}`]: "active" }),
        vars: { size, x, "x // size": b },
      });
    }

    let i = 0;
    let collected: Record<string, Tone> = {};
    // a[0..i-1] 已寫回（定位）；a[i..] 是還沒被覆寫的舊值，以灰色表示
    const aState = () => ({ ...fill(0, i - 1, "good"), ...fill(i, n - 1, "muted") });
    for (let b = 0; b < K; b++) {
      const bucket = buckets[b];
      if (bucket.length === 0) {
        t.push({
          line: i === 0 && b === 0 ? [6, 7] : 7,
          note: `${b} 號桶（${colLabels[b]}）是空的，跳過。`,
          views: views(aState(), { i }, collected),
          vars: { i },
        });
        continue;
      }
      const before = bucket.map((e) => e.v);
      bucket.sort((p, q) => p.v - q.v); // stable, like list.sort()
      const after = bucket.map((e) => e.v);
      t.push({
        line: i === 0 && b === 0 ? [6, 7, 8] : [7, 8],
        note:
          bucket.length === 1
            ? `${b} 號桶只有 \`${after[0]}\` 一個元素，不用排。`
            : before.join() === after.join()
              ? `${b} 號桶 \`${py(after)}\` 剛好已經有序。桶內元素少，排序很便宜。`
              : `${b} 號桶內部排序：\`${py(before)}\` → \`${py(after)}\`。桶內元素少，排序很便宜。`,
        views: views(aState(), { i }, { ...collected, ...column(b, "active") }),
        vars: { i },
      });
      const from = i;
      for (const e of bucket) {
        // a[i] = x —— 畫面上讓那根長條滑到位置 i，被擠開的舊值之後反正會被覆寫
        const p = ids.indexOf(e.id);
        [a[i], a[p]] = [a[p], a[i]];
        [ids[i], ids[p]] = [ids[p], ids[i]];
        i++;
      }
      collected = { ...collected, ...column(b, "good") };
      t.push({
        line: [9, 10, 11],
        note: `把 ${b} 號桶的 ${bucket.length} 個元素依序寫回 \`a[${from}${i - 1 > from ? `..${i - 1}` : ""}]\`。前面的桶數值範圍都比較小，所以這些位置已經定位。`,
        views: views({ ...aState(), ...fill(from, i - 1, "active") }, { i }, collected),
        vars: { i },
      });
    }

    t.push({
      line: 12,
      note: "所有桶都倒回陣列了，排序完成。",
      views: views(fill(0, n - 1, "good"), {}, collected),
      result: py(a),
    });
    return t.frames;
  },
};
export default algo;
