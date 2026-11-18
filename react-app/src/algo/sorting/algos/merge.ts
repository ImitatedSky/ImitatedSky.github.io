import type { SortAlgo, Tone } from "../../types";
import { V, py, tracer } from "../../trace";

const code = `def merge_sort(a: list[int]) -> list[int]:
    def sort(lo: int, hi: int) -> None:
        if lo >= hi:
            return
        mid = (lo + hi) // 2
        sort(lo, mid)
        sort(mid + 1, hi)
        # 合併兩段已排序的 a[lo..mid] 與 a[mid+1..hi]
        tmp = []
        i, j = lo, mid + 1
        while i <= mid and j <= hi:
            if a[i] <= a[j]:  # 用 <= 才能保持穩定
                tmp.append(a[i])
                i += 1
            else:
                tmp.append(a[j])
                j += 1
        tmp += a[i:mid + 1]  # 把還沒用完的那一段接上去
        tmp += a[j:hi + 1]
        a[lo:hi + 1] = tmp

    sort(0, len(a) - 1)
    return a`;

type Range = { from: number; to: number; tone?: Tone; label?: string };

const algo: SortAlgo = {
  id: "merge",
  name: "Merge Sort",
  nameZh: "合併排序",
  tagline: "切一半、各自排好、再合併",
  idea: "**分治法**：把陣列從中間切成兩半，分別遞迴排好，再把兩段**已排序**的序列合併成一段。合併時只要不斷比較兩段最前面的元素、取較小的那個，所以合併是線性時間。",
  steps: [
    "區間只剩一個元素時不用排，直接返回。",
    "取中點 `mid`，遞迴排序 `[lo, mid]` 與 `[mid+1, hi]`。",
    "用兩個指標 `i`、`j` 分別指向左右兩段的開頭，每次把較小的放進暫存陣列 `tmp`。",
    "其中一段用完後，把另一段剩下的直接接到 `tmp` 後面，再整段寫回 `a[lo..hi]`。",
    "相等時先取左邊的（`<=`），相同的值維持原本的先後順序，所以是穩定排序。",
  ],
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: true },
  code,
  trace(input) {
    const t = tracer();
    const a = [...input];
    const ids = a.map((_, i) => i);
    const n = a.length;
    let tmp: number[] = [];
    let tmpIds: number[] = [];
    let done = false;

    const views = (
      lo: number,
      hi: number,
      ranges: Range[],
      extra: Record<number, Tone> = {},
      pointers: Record<string, number> = {},
      tmpMarks: Record<number, Tone> = {},
    ) => {
      const marks: Record<number, Tone> = {};
      for (let k = 0; k < n; k++) {
        if (done) marks[k] = "good";
        else if (k < lo || k > hi) marks[k] = "muted";
      }
      return [
        V.bars("a", a, { ids, marks: { ...marks, ...extra }, pointers, ranges }),
        V.array("tmp（合併用的暫存陣列）", tmp, { ids: tmpIds, marks: tmpMarks }),
      ];
    };
    const halves = (lo: number, mid: number, hi: number): Range[] => [
      { from: lo, to: mid, tone: "alt", label: "左半" },
      { from: mid + 1, to: hi, tone: "compare", label: "右半" },
    ];

    const sort = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const mid = Math.floor((lo + hi) / 2);
      tmp = [];
      tmpIds = [];
      t.push({
        line: 5,
        note: `區間 \`[${lo}, ${hi}]\` 從中點 \`mid = ${mid}\` 切成 \`[${lo}, ${mid}]\` 和 \`[${mid + 1}, ${hi}]\`，先各自遞迴排好。${
          hi - lo === 1 ? "兩邊都只剩一個元素，不用再切。" : ""
        }`,
        views: views(lo, hi, halves(lo, mid, hi), {}, { lo, mid, hi }),
        vars: { lo, hi, mid },
      });
      sort(lo, mid);
      sort(mid + 1, hi);

      tmp = [];
      tmpIds = [];
      let i = lo;
      let j = mid + 1;
      const taken = () => {
        const m: Record<number, Tone> = {};
        for (let k = lo; k < i; k++) m[k] = "visited";
        for (let k = mid + 1; k < j; k++) m[k] = "visited";
        return m;
      };
      t.push({
        line: [9, 10],
        note: `\`[${lo}, ${mid}]\` 和 \`[${mid + 1}, ${hi}]\` 都已各自排好，開始合併：\`i\`、\`j\` 分別指向兩段的開頭。`,
        views: views(lo, hi, halves(lo, mid, hi), {}, { i, j }),
        vars: { lo, hi, mid, i, j },
      });
      while (i <= mid && j <= hi) {
        const left = a[i] <= a[j];
        const src = left ? i : j;
        const marks = { ...taken(), [i]: "compare" as Tone, [j]: "compare" as Tone };
        tmp.push(a[src]);
        tmpIds.push(ids[src]);
        t.push({
          line: left ? [12, 13] : [12, 16],
          note: left
            ? `\`a[${i}] = ${a[i]}\` ≤ \`a[${j}] = ${a[j]}\`，左邊的${a[i] === a[j] ? "先放（相等時取左邊才穩定）" : "較小"}，把 \`${a[i]}\` 放進 \`tmp\`，\`i\` 前進。`
            : `\`a[${i}] = ${a[i]}\` > \`a[${j}] = ${a[j]}\`，右邊的較小，把 \`${a[j]}\` 放進 \`tmp\`，\`j\` 前進。`,
          views: views(lo, hi, halves(lo, mid, hi), marks, { i, j }, { [tmp.length - 1]: "active" }),
          vars: { lo, hi, mid, i, j },
        });
        if (left) i++;
        else j++;
      }
      // 其中一段用完了，另一段剩下的整段接上
      const restFrom = i <= mid ? i : j;
      const restTo = i <= mid ? mid : hi;
      const leftRest = i <= mid;
      const before = tmp.length;
      const restMarks = taken();
      const restTmpMarks: Record<number, Tone> = {};
      for (let k = restFrom; k <= restTo; k++) {
        restMarks[k] = "active";
        restTmpMarks[tmp.length] = "active";
        tmp.push(a[k]);
        tmpIds.push(ids[k]);
      }
      t.push({
        line: leftRest ? 18 : 19,
        note: `${leftRest ? "右半" : "左半"}已經用完，${leftRest ? "左半" : "右半"}剩下的 ${tmp.length - before} 個元素本來就有序，而且都不小於 \`tmp\` 裡的，直接接到後面。`,
        views: views(lo, hi, halves(lo, mid, hi), restMarks, { i, j }, restTmpMarks),
        vars: { lo, hi, mid, i, j },
      });

      for (let k = lo; k <= hi; k++) {
        a[k] = tmp[k - lo];
        ids[k] = tmpIds[k - lo];
      }
      const whole = lo === 0 && hi === n - 1;
      const written: Record<number, Tone> = {};
      const tmpAll: Record<number, Tone> = {};
      for (let k = lo; k <= hi; k++) {
        written[k] = whole ? "good" : "active";
        tmpAll[k - lo] = "visited";
      }
      t.push({
        line: 20,
        note: `把 \`tmp\` 寫回 \`a[${lo}..${hi}]\`，這個區間現在是有序的${whole ? "。" : "，回到上一層繼續合併。"}`,
        views: views(lo, hi, [{ from: lo, to: hi, tone: "good", label: `[${lo}, ${hi}] 已合併` }], written, {}, tmpAll),
        vars: { lo, hi, mid },
      });
    };

    t.push({
      line: 22,
      note: `從整個區間 \`[0, ${n - 1}]\` 開始：不斷對半切，切到每段只剩一個元素，再兩兩合併回來。`,
      views: views(0, n - 1, [{ from: 0, to: n - 1, tone: "alt", label: `[0, ${n - 1}]` }], {}, { lo: 0, hi: n - 1 }),
      vars: { lo: 0, hi: n - 1 },
    });
    sort(0, n - 1);
    done = true;
    tmp = [];
    tmpIds = [];
    t.push({ line: 23, note: "最上層的合併完成，整個陣列排序完成。", views: views(0, n - 1, []), result: py(a) });
    return t.frames;
  },
};
export default algo;
