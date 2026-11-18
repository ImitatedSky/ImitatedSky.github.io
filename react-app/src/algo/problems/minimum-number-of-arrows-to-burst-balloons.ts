import { defineProblem } from "../types";
import type { IntervalsView, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        points.sort(key=lambda p: p[1])  # 依右端點排序
        arrows = 0
        arrow = -inf  # 上一支箭射在哪個 x
        for start, end in points:
            if start > arrow:  # 上一支箭射不到這顆
                arrows += 1
                arrow = end  # 貼著右端點射，往右能涵蓋最多
        return arrows`;

type Points = NonNullable<IntervalsView["points"]>;

export default defineProblem<{ points: number[][] }>({
  id: 452,
  summary:
    "牆上貼著一些氣球，每顆氣球用它在 x 軸上佔據的範圍 `[x_start, x_end]` 表示。從某個 x 位置垂直往上射一支箭，所有範圍包含這個 x 的氣球都會被射破（端點也算）。\n\n問**最少**要射幾支箭，才能把所有氣球都射破。",
  examples: [
    { input: "points = [[10,16],[2,8],[1,6],[7,12]]", output: "2", note: "x = 6 射破 [2,8]、[1,6]；x = 12 射破 [10,16]、[7,12]" },
    { input: "points = [[1,2],[3,4],[5,6],[7,8]]", output: "4" },
    { input: "points = [[1,2],[2,3],[3,4],[4,5]]", output: "2" },
  ],
  constraints: ["1 ≤ points.length ≤ 10⁵", "−2³¹ ≤ x_start < x_end ≤ 2³¹ − 1"],
  idea:
    "貪心：依**右端點**排序。右端點最小的那顆氣球一定要有一支箭負責，而這支箭射在它的右端點最划算 —— 再往右就射不到它，往左只會少涵蓋後面的氣球。射完之後，起點沒超過這支箭的氣球都順便破了；第一顆起點超過箭的，再用同樣的道理補一支。",
  steps: [
    "把氣球依右端點由小到大排序。",
    "用 `arrow` 記住上一支箭的位置，一開始是負無限大（還沒射）。",
    "依序看每顆氣球：若 `start > arrow`，上一支箭射不到它，就在它的右端點 `end` 補一支箭。",
    "否則它已經被上一支箭射破，什麼都不用做。",
  ],
  pitfalls: [
    "是 `start > arrow` 才需要新的箭；`start == arrow` 時箭剛好擦到邊，也算射破。",
    "要依**右端點**排序。依左端點排序再射右端點是錯的：後面可能有一顆很短的氣球，右端點比這支箭還左邊。",
  ],
  complexity: { time: "O(n log n)", space: "O(1)（不含排序）" },
  code,
  starter: `class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        `,
  presets: [
    { label: "[[10,16],[2,8],[1,6],[7,12]]", input: { points: [[10, 16], [2, 8], [1, 6], [7, 12]] }, expected: "2" },
    { label: "端點相碰", input: { points: [[1, 2], [2, 3], [3, 4], [4, 5]] }, expected: "2" },
    {
      label: "大氣球包小氣球",
      input: { points: [[1, 10], [3, 5], [6, 8], [2, 4], [9, 12]] },
      expected: "3",
    },
  ],
  trace({ points: input }) {
    const t = tracer();
    const points = input.map((p) => [...p]).sort((a, b) => a[1] - b[1]);
    const shots: number[] = [];
    const tones: (Tone | undefined)[] = points.map(() => undefined);

    const view = (list: number[][], cur = -1, curTone: Tone = "active") => {
      const marks: Points = shots.map((at, k) => ({
        at,
        label: `箭 ${k + 1}`,
        tone: k === shots.length - 1 ? "bad" : "visited",
      }));
      return [
        V.intervals(
          "points",
          list.map(([start, end], k) => ({ start, end, tone: k === cur ? curTone : tones[k] })),
          { points: marks },
        ),
      ];
    };

    const wasSorted = py(input) === py(points);
    t.push({
      line: 3,
      note: wasSorted
        ? "每一條橫槓是一顆氣球佔據的 x 範圍。先依**右端點**排序（這組輸入剛好已經排好）。"
        : "每一條橫槓是一顆氣球佔據的 x 範圍。先依**右端點**排序，才能確定「最早結束的那顆」是誰。",
      views: view(input),
    });

    let arrows = 0;
    let arrow = -Infinity;
    const show = () => (arrow === -Infinity ? "-inf" : arrow);
    t.push({
      line: [3, 4, 5],
      note: `排序後的順序：\`${py(points)}\`，右端點越來越大。\`arrow\` 記上一支箭的位置，還沒射所以是負無限大。`,
      views: view(points),
      vars: { arrows, arrow: show() },
    });

    points.forEach(([start, end], k) => {
      if (start > arrow) {
        const prev = arrow;
        arrows++;
        arrow = end;
        shots.push(end);
        tones[k] = "good";
        t.push({
          line: [6, 7, 8, 9],
          note:
            (prev === -Infinity
              ? `\`[${start}, ${end}]\` 是右端點最小的氣球，一定要有一支箭負責它。`
              : `\`[${start}, ${end}]\` 的起點 \`${start} > ${prev}\`，上一支箭射不到它，必須再補一支。`) +
            `射在它的右端點 \`x = ${end}\`：再往右就射不到它，而越靠右越能順便射到後面的氣球。`,
          views: view(points, k, "active"),
          vars: { start, end, arrows, arrow: show() },
        });
      } else {
        tones[k] = "good";
        t.push({
          line: [6, 7],
          note: `\`[${start}, ${end}]\` 的起點 \`${start} <= ${arrow}\`，而它的右端點又不比箭小（排過序），所以 \`x = ${arrow}\` 這支箭${start === arrow ? "剛好擦到它的左端點，也算" : "正好穿過它，"}射破，不用多花一支。`,
          views: view(points, k, "compare"),
          vars: { start, end, arrows, arrow: show() },
        });
      }
    });

    t.push({
      line: 10,
      note: `所有氣球都破了，總共射了 ${arrows} 支箭。每支箭都是「不得不射」的，所以這就是最少的數量。`,
      views: view(points),
      vars: { arrows, arrow: show() },
      result: py(arrows),
    });
    return t.frames;
  },
});
