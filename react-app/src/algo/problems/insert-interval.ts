import { defineProblem } from "../types";
import type { IntervalsView, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        res = []
        i, n = 0, len(intervals)
        while i < n and intervals[i][1] < newInterval[0]:  # 1. 完全在左邊
            res.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= newInterval[1]:  # 2. 有重疊：併進 newInterval
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1
        res.append(newInterval)
        while i < n:  # 3. 完全在右邊
            res.append(intervals[i])
            i += 1
        return res`;

type Points = NonNullable<IntervalsView["points"]>;

export default defineProblem<{ intervals: number[][]; newInterval: number[] }>({
  id: 57,
  summary:
    "給一組**已依起點排序、彼此不重疊**的區間，以及一個新區間 `newInterval`。把新區間插進去，讓結果仍然依起點排序而且互不重疊 —— 必要時要把重疊的區間合併起來。",
  examples: [
    { input: "intervals = [[1,3],[6,9]], newInterval = [2,5]", output: "[[1,5],[6,9]]" },
    {
      input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
      output: "[[1,2],[3,10],[12,16]]",
      note: "新區間和 [3,5]、[6,7]、[8,10] 都重疊",
    },
  ],
  constraints: ["0 ≤ intervals.length ≤ 10⁴", "intervals 已依起點遞增排序"],
  idea:
    "原本的區間已經排好而且不重疊，所以相對於新區間只會分成**三段**：完全在左邊的、有重疊的、完全在右邊的。左右兩段原封不動照抄，中間那段全部吸進新區間（起點取 `min`、終點取 `max`）再放進答案。一趟掃完，不用重新排序。",
  steps: [
    "**左邊**：只要 `intervals[i]` 的終點 < 新區間的起點，就直接放進 `res`。",
    "**重疊**：只要 `intervals[i]` 的起點 ≤ 新區間的終點，就把它併進新區間（擴大起點與終點）。",
    "把合併完的新區間放進 `res`。",
    "**右邊**：剩下的區間全部照抄。",
  ],
  pitfalls: [
    "第一段用 `<`、第二段用 `<=`：端點相碰（例如 `[1,5]` 和 `[5,8]`）算重疊，要合併。",
    "新區間要在第二段結束**之後**才放進 `res`，而且只放一次 —— 就算沒有任何區間和它重疊也要放。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        `,
  presets: [
    {
      label: "吃掉三個區間",
      input: { intervals: [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval: [4, 8] },
      expected: "[[1, 2], [3, 10], [12, 16]]",
    },
    {
      label: "[[1,3],[6,9]] + [2,5]",
      input: { intervals: [[1, 3], [6, 9]], newInterval: [2, 5] },
      expected: "[[1, 5], [6, 9]]",
    },
    {
      label: "剛好落在空隙",
      input: { intervals: [[1, 2], [8, 9]], newInterval: [4, 6] },
      expected: "[[1, 2], [4, 6], [8, 9]]",
    },
  ],
  trace({ intervals, newInterval: input }) {
    const t = tracer();
    const n = intervals.length;
    const newInterval = [...input];
    const all = [...intervals.flat(), ...input];
    // 讓 res 的數線和上面那條對齊：兩端各放一個不顯示的刻度
    const axis: Points = [
      { at: Math.min(...all), tone: "muted" },
      { at: Math.max(...all), tone: "muted" },
    ];
    const res: number[][] = [];
    const tones: (Tone | undefined)[] = intervals.map(() => undefined);
    let newTone: Tone = "alt";

    const views = (cur = -1, curTone: Tone = "active", points: Points = [], lastTone: Tone = "good") => [
      V.intervals(
        "intervals 與 newInterval",
        [
          ...intervals.map(([start, end], k) => ({ start, end, tone: k === cur ? curTone : tones[k] })),
          { start: newInterval[0], end: newInterval[1], tone: newTone, label: `new [${newInterval[0]}, ${newInterval[1]}]` },
        ],
        { points },
      ),
      V.intervals(
        "res",
        res.map(([start, end], k) => ({ start, end, tone: k === res.length - 1 ? lastTone : "good" })),
        { points: axis },
      ),
    ];
    const vars = (i: number) => ({ i, n, newInterval: py(newInterval) });

    let i = 0;
    t.push({
      line: [3, 4],
      note: `要把藍色的新區間 \`${py(newInterval)}\` 插進去。原本的區間已排序又不重疊，所以相對於它只會分成三段：完全在左邊、有重疊、完全在右邊。`,
      views: views(),
      vars: vars(i),
    });

    // 1. 完全在左邊
    while (i < n && intervals[i][1] < newInterval[0]) {
      res.push([...intervals[i]]);
      tones[i] = "good";
      t.push({
        line: [5, 6, 7],
        note: `\`${py(intervals[i])}\` 的終點 \`${intervals[i][1]} < ${newInterval[0]}\`（新區間的起點），整個在新區間**左邊**，碰不到，原封不動放進 \`res\`。`,
        views: views(i, "active", [{ at: newInterval[0], label: `newInterval[0] = ${newInterval[0]}`, tone: "alt" }], "active"),
        vars: vars(i),
      });
      i++;
    }

    // 2. 有重疊
    let merged = 0;
    while (i < n && intervals[i][0] <= newInterval[1]) {
      const [s, e] = intervals[i];
      const before = py(newInterval);
      const edge = newInterval[1];
      newInterval[0] = Math.min(newInterval[0], s);
      newInterval[1] = Math.max(newInterval[1], e);
      newTone = "active";
      merged++;
      t.push({
        line: [8, 9, 10, 11],
        note:
          `\`${py([s, e])}\` 的終點沒有落在新區間左邊，而且起點 \`${s} <= ${edge}\`（新區間的終點）→ **重疊**。把它吸進新區間：起點取 \`min\`、終點取 \`max\`，` +
          (before === py(newInterval)
            ? `它整個被新區間蓋住，新區間維持 \`${before}\`。`
            : `\`${before}\` 擴大成 \`${py(newInterval)}\`。`),
        views: views(i, "compare", [{ at: edge, label: `newInterval[1] = ${edge}`, tone: "compare" }]),
        vars: vars(i),
      });
      tones[i] = "muted";
      i++;
    }

    const stop =
      i < n
        ? `下一個區間 \`${py(intervals[i])}\` 的起點 \`${intervals[i][0]} > ${newInterval[1]}\`，已經在新區間右邊，不再重疊`
        : "後面沒有區間了";
    res.push([...newInterval]);
    newTone = "good";
    t.push({
      line: [8, 12],
      note: `${stop}。${merged ? `新區間吸收了 ${merged} 個區間，定案為` : "沒有任何區間和新區間重疊，它維持"} \`${py(newInterval)}\`，放進 \`res\`。`,
      views: views(-1, "active", i < n ? [{ at: newInterval[1], label: `newInterval[1] = ${newInterval[1]}`, tone: "compare" }] : [], "active"),
      vars: vars(i),
    });

    // 3. 完全在右邊
    while (i < n) {
      res.push([...intervals[i]]);
      tones[i] = "good";
      t.push({
        line: [13, 14, 15],
        note: `\`${py(intervals[i])}\` 在新區間**右邊**。原本的區間彼此不重疊，所以剩下的都不用再檢查，直接照抄。`,
        views: views(i, "active", [], "active"),
        vars: vars(i),
      });
      i++;
    }

    t.push({
      line: 16,
      note: "三段都處理完：左邊照抄、中間合併成一個、右邊照抄。結果仍然排序而且互不重疊。",
      views: views(),
      vars: vars(i),
      result: py(res),
    });
    return t.frames;
  },
});
