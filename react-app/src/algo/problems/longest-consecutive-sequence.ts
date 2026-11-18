import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        best = 0
        for x in num_set:
            if x - 1 not in num_set:  # x 是一段連續數字的起點
                y = x
                while y + 1 in num_set:
                    y += 1
                best = max(best, y - x + 1)
        return best`;

const LINE = "數線示意（由小到大排好只是方便觀察，演算法本身沒有排序）";

export default defineProblem<{ nums: number[] }>({
  id: 128,
  summary:
    "給一個**沒有排序**的整數陣列 `nums`，找出其中的數字能組成的**最長連續整數序列**有多長（例如 1、2、3、4），數字在陣列中的位置不需要相鄰。\n\n要求時間複雜度 O(n)，所以不能排序。",
  examples: [
    { input: "nums = [100,4,200,1,3,2]", output: "4", note: "最長的是 1, 2, 3, 4" },
    { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9" },
    { input: "nums = [1,0,1,2]", output: "3" },
  ],
  constraints: ["0 ≤ nums.length ≤ 10⁵", "−10⁹ ≤ nums[i] ≤ 10⁹"],
  idea:
    "把所有數字丟進 `set`，就能 O(1) 問「某個數在不在」。關鍵是**只從每一段的起點開始往右數**：如果 `x - 1` 也在集合裡，`x` 就不是起點，直接跳過。這樣每個數字最多只會被往右走到一次，總共 O(n)。",
  steps: [
    "`num_set = set(nums)`：去掉重複，並且能 O(1) 查詢。",
    "走訪集合中的每個 `x`，若 `x - 1` 在集合裡就跳過（它屬於別人開頭的那一段）。",
    "`x` 是起點時，令 `y = x`，只要 `y + 1` 在集合裡就一直往右走。",
    "這一段的長度是 `y - x + 1`，用它更新 `best`。",
  ],
  pitfalls: [
    "少了「是不是起點」的判斷，每個數都往右數一次，遇到 `[1,2,3,…,n]` 會退化成 O(n²)。",
    "要走訪 `num_set` 而不是 `nums`：陣列裡若有大量重複的起點，同一段會被重數很多次而超時。",
    "空陣列要回傳 0，`best` 的初值設成 0 就自然處理掉了。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[100,4,200,1,3,2]", input: { nums: [100, 4, 200, 1, 3, 2] }, expected: "4" },
    { label: "[0,3,7,2,5,8,4,6,0,1]", input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] }, expected: "9" },
    { label: "[5,1,6,2,9,1,7]", input: { nums: [5, 1, 6, 2, 9, 1, 7] }, expected: "3" },
  ],
  trace({ nums }) {
    const t = tracer();
    const numSet = [...new Set(nums)]; // 依第一次出現的順序
    const has = (v: number) => numSet.includes(v);
    const sorted = [...numSet].sort((a, b) => a - b);
    const pos = new Map(sorted.map((v, i) => [v, i] as [number, number]));
    let best = 0;
    let bestRun: [number, number] | null = null;
    const doneStarts = new Set<number>(); // 已經處理過的數（淡化）

    type Run = { x: number; y: number; tone: Tone };
    const views = (setMarks: Record<string, Tone>, lineMarks: Record<number, Tone>, run?: Run) => {
      const sm: Record<string, Tone> = {};
      const lm: Record<number, Tone> = {};
      doneStarts.forEach((v) => {
        sm[String(v)] = "visited";
        lm[pos.get(v)!] = "visited";
      });
      return [
        V.array("nums", nums),
        V.set("num_set", numSet, { marks: { ...sm, ...setMarks } }),
        V.array(LINE, sorted, {
          marks: { ...lm, ...lineMarks },
          ranges: run
            ? [
                {
                  from: pos.get(run.x)!,
                  to: pos.get(run.y)!,
                  tone: run.tone,
                  ...(run.y > run.x ? { label: `長度 ${run.y - run.x + 1}` } : {}),
                },
              ]
            : [],
        }),
      ];
    };

    t.push({
      line: [3, 4],
      note:
        `把 \`nums\` 全部放進 \`num_set\`${numSet.length < nums.length ? "（重複的數字只留一個）" : ""}，之後查「某個數在不在」只要 O(1)。` +
        "`best` 從 0 開始。（集合的走訪順序其實不固定，這裡依出現順序示範，答案不受影響。）",
      views: views({}, {}),
      vars: { best },
    });

    for (const x of numSet) {
      if (has(x - 1)) {
        t.push({
          line: [5, 6],
          note: `看 \`x = ${x}\`。\`${x - 1}\` 在集合裡，所以 \`${x}\` 不是起點 —— 它會在從更小的數出發的那一段裡被數到，現在數只是重複做工，**跳過**。`,
          views: views(
            { [String(x)]: "active", [String(x - 1)]: "compare" },
            { [pos.get(x)!]: "active", [pos.get(x - 1)!]: "compare" },
          ),
          vars: { x, "x - 1": x - 1, best },
        });
        doneStarts.add(x);
        continue;
      }

      let y = x;
      t.push({
        line: [5, 6, 7],
        note: `看 \`x = ${x}\`。\`${x - 1}\` **不在**集合裡，\`${x}\` 的左邊沒有鄰居，它是某一段連續數字的**起點**。令 \`y = ${x}\`，準備往右數。`,
        views: views({ [String(x)]: "good" }, { [pos.get(x)!]: "good" }, { x, y, tone: "good" }),
        vars: { x, y, best },
      });

      const chainMarks = () => {
        const sm: Record<string, Tone> = {};
        const lm: Record<number, Tone> = {};
        for (let v = x; v <= y; v++) {
          sm[String(v)] = "good";
          lm[pos.get(v)!] = "good";
        }
        return { sm, lm };
      };

      while (has(y + 1)) {
        y += 1;
        const { sm, lm } = chainMarks();
        t.push({
          line: [8, 9],
          note: `\`${y}\` 在集合裡，可以接下去，\`y\` 前進到 ${y}。目前這一段是 ${x} ~ ${y}。`,
          views: views({ ...sm, [String(y)]: "active" }, { ...lm, [pos.get(y)!]: "active" }, { x, y, tone: "good" }),
          vars: { x, y, best },
        });
      }

      const len = y - x + 1;
      const improved = len > best;
      if (improved) {
        best = len;
        bestRun = [x, y];
      }
      const { sm, lm } = chainMarks();
      t.push({
        line: [8, 10],
        note:
          `\`${y + 1}\` 不在集合裡，這一段到 ${y} 為止，長度 \`${y} - ${x} + 1 = ${len}\`。` +
          (improved ? `比原本的紀錄長，\`best\` 更新為 ${best}。` : `沒有超過目前的 \`best = ${best}\`，不更新。`),
        views: views(sm, lm, { x, y, tone: improved ? "good" : "compare" }),
        vars: { x, y, "y - x + 1": len, best },
      });
      for (let v = x; v <= y; v++) doneStarts.add(v);
    }

    const sm: Record<string, Tone> = {};
    const lm: Record<number, Tone> = {};
    if (bestRun) {
      for (let v = bestRun[0]; v <= bestRun[1]; v++) {
        sm[String(v)] = "good";
        lm[pos.get(v)!] = "good";
      }
    }
    doneStarts.clear();
    t.push({
      line: 11,
      note: bestRun
        ? `每個數字都看過了。最長的連續序列是 ${bestRun[0]} ~ ${bestRun[1]}，長度 ${best}。每個數最多被「往右走到」一次，所以整體是 O(n)。`
        : "陣列是空的，沒有任何序列，回傳 0。",
      views: views(sm, lm, bestRun ? { x: bestRun[0], y: bestRun[1], tone: "good" } : undefined),
      vars: { best },
      result: py(best),
    });
    return t.frames;
  },
});
