import { defineProblem } from "../types";
import type { IntervalsView, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort()  # 依起點排序
        res = []
        for start, end in intervals:
            if res and start <= res[-1][1]:
                res[-1][1] = max(res[-1][1], end)  # 重疊：延伸最後一個區間
            else:
                res.append([start, end])  # 不重疊：開一個新的區間
        return res`;

type Items = IntervalsView["items"];
type Points = NonNullable<IntervalsView["points"]>;

export default defineProblem<{ intervals: number[][] }>({
  id: 56,
  summary:
    "給一組區間 `[start, end]`，把所有**互相重疊**的區間合併起來，回傳一組彼此不重疊、而且剛好涵蓋原本所有區間的結果。\n\n端點碰在一起也算重疊，例如 `[1,4]` 和 `[4,5]` 要合併成 `[1,5]`。",
  examples: [
    { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
    { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" },
  ],
  constraints: ["1 ≤ intervals.length ≤ 10⁴", "0 ≤ start ≤ end ≤ 10⁴"],
  idea:
    "先**依起點排序**。排序之後，會和目前這個區間重疊的，只可能是「結果裡的最後一個」—— 因為後面來的起點都不會更小。所以每個區間只要和 `res[-1]` 比一次：起點沒超過它的終點就併進去，否則另開一個。",
  steps: [
    "把 `intervals` 依起點排序。",
    "依序看每個 `[start, end]`：若 `res` 不為空而且 `start <= res[-1][1]`，表示重疊。",
    "重疊就把 `res[-1]` 的終點更新成 `max(res[-1][1], end)`。",
    "不重疊就把 `[start, end]` 加到 `res` 後面。",
  ],
  pitfalls: [
    "合併時終點要取 `max`：`[1,10]` 遇到 `[2,3]`，終點應該還是 10，不能直接蓋成 3。",
    "判斷重疊是 `<=` 不是 `<`，端點相碰也要合併。",
    "沒排序就直接掃是錯的。",
  ],
  complexity: { time: "O(n log n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        `,
  presets: [
    {
      label: "[[1,3],[2,6],[8,10],[15,18]]",
      input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] },
      expected: "[[1, 6], [8, 10], [15, 18]]",
    },
    {
      label: "未排序、有包含",
      input: { intervals: [[5, 7], [1, 4], [2, 3], [4, 6], [9, 10]] },
      expected: "[[1, 7], [9, 10]]",
    },
    { label: "端點相碰 [[1,4],[4,5]]", input: { intervals: [[1, 4], [4, 5]] }, expected: "[[1, 5]]" },
  ],
  trace({ intervals: input }) {
    const t = tracer();
    const lo = Math.min(...input.map((x) => x[0]));
    const hi = Math.max(...input.map((x) => x[1]));
    // 讓 res 的數線和上面那條對齊：兩端各放一個不顯示的刻度
    const axis: Points = [
      { at: lo, tone: "muted" },
      { at: hi, tone: "muted" },
    ];
    const sorted = input.map((x) => [...x]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const res: number[][] = [];

    const top = (list: number[][], cur: number, curTone: Tone, points: Points = []) => {
      const items: Items = list.map(([start, end], k) => ({
        start,
        end,
        tone: k < cur ? "visited" : k === cur ? curTone : undefined,
      }));
      return V.intervals("intervals", items, { points });
    };
    const bottom = (lastTone: Tone = "good") =>
      V.intervals(
        "res",
        res.map(([start, end], k) => ({ start, end, tone: k === res.length - 1 ? lastTone : "good" })),
        { points: axis },
      );

    const wasSorted = py(input) === py(sorted);
    t.push({
      line: 3,
      note: wasSorted
        ? "先依起點排序（這組輸入本來就排好了）。排序後，新來的區間只可能和「結果裡最後一個」重疊。"
        : `輸入的順序是亂的：\`${py(input)}\`。直接掃沒辦法判斷誰跟誰重疊，所以第一步是依起點排序。`,
      views: [top(input, -1, "active"), bottom()],
    });
    if (!wasSorted) {
      t.push({
        line: [3, 4],
        note: "排序完成。現在起點由小到大，新來的區間只可能和「結果裡最後一個」重疊，每個區間比一次就夠了。",
        views: [top(sorted, -1, "active"), bottom()],
      });
    }

    sorted.forEach(([start, end], k) => {
      if (!res.length) {
        res.push([start, end]);
        t.push({
          line: [5, 6, 8, 9],
          note: `\`res\` 還是空的，沒有東西可以合併，直接把 \`[${start}, ${end}]\` 放進去。`,
          views: [top(sorted, k, "active"), bottom("active")],
          vars: { start, end, res: py(res) },
        });
        return;
      }

      const last = res[res.length - 1];
      const lastEnd = last[1];
      const line: Points = [{ at: lastEnd, label: `終點 ${lastEnd}`, tone: "compare" }];
      const overlap = start <= lastEnd;
      t.push({
        line: [5, 6],
        note: overlap
          ? `看 \`[${start}, ${end}]\`：起點 \`${start} <= ${lastEnd}\`（\`res\` 最後一個區間的終點），落在橘線左邊${start === lastEnd ? "（剛好碰到也算）" : ""} → **重疊**。`
          : `看 \`[${start}, ${end}]\`：起點 \`${start} > ${lastEnd}\`，在橘線右邊，和 \`res\` 最後一個區間之間有空隙 → **不重疊**。`,
        views: [top(sorted, k, "compare", line), bottom("compare")],
        vars: { start, end, "res[-1]": py(last) },
      });

      if (overlap) {
        last[1] = Math.max(lastEnd, end);
        t.push({
          line: 7,
          note:
            end > lastEnd
              ? `合併：終點取 \`max(${lastEnd}, ${end}) = ${last[1]}\`，\`res[-1]\` 延伸成 \`[${last[0]}, ${last[1]}]\`。`
              : `合併：終點取 \`max(${lastEnd}, ${end}) = ${last[1]}\`。\`[${start}, ${end}]\` 整個被包在裡面，\`res[-1]\` 不變 —— 這就是為什麼要取 \`max\`。`,
          views: [top(sorted, k, "active"), bottom("active")],
          vars: { start, end, "res[-1]": py(last) },
        });
      } else {
        res.push([start, end]);
        t.push({
          line: [8, 9],
          note: `前一個區間 \`[${last[0]}, ${last[1]}]\` 不會再變了（後面的起點只會更大）。把 \`[${start}, ${end}]\` 當成新的一段加進 \`res\`。`,
          views: [top(sorted, k, "active"), bottom("active")],
          vars: { start, end, "res[-1]": py([start, end]) },
        });
      }
    });

    t.push({
      line: 10,
      note: `全部看完，${input.length} 個區間合併成 ${res.length} 個互不重疊的區間。`,
      views: [top(sorted, sorted.length, "active"), bottom()],
      vars: { res: py(res) },
      result: py(res),
    });
    return t.frames;
  },
});
