import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1               # 總油量不夠，怎麼出發都繞不完
        start = 0
        tank = 0
        for i in range(len(gas)):
            tank += gas[i] - cost[i]
            if tank < 0:            # 從 start 出發，撐不到 i + 1
                start = i + 1       # start ~ i 都不可能是起點
                tank = 0
        return start`;

export default defineProblem<{ gas: number[]; cost: number[] }>({
  id: 134,
  summary:
    "環狀路線上有 `n` 個加油站，第 `i` 站可以加 `gas[i]` 的油，從第 `i` 站開到下一站要花 `cost[i]` 的油。油箱一開始是空的、容量無限。\n\n問從哪一站出發可以**順時針繞完一整圈**？回傳那一站的索引；如果辦不到就回傳 `-1`。題目保證有解時答案唯一。",
  summaryEn:
    "There are `n` gas stations on a circular route. Station `i` gives you `gas[i]` fuel, and driving from station `i` to the next one burns `cost[i]` fuel. The tank starts empty and has unlimited capacity.\n\nFrom which station can you **drive one full loop clockwise**? Return its index, or `-1` if no station works. When a solution exists, it is guaranteed to be unique.",
  examples: [
    { input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", output: "3" },
    { input: "gas = [2,3,4], cost = [3,4,3]", output: "-1" },
  ],
  constraints: ["1 ≤ n ≤ 10⁵", "0 ≤ gas[i], cost[i] ≤ 10⁴"],
  constraintsEn: ["1 ≤ n ≤ 10⁵", "0 ≤ gas[i], cost[i] ≤ 10⁴"],
  idea:
    "兩個觀察：① 只要**總油量 ≥ 總花費**就一定有解。② 如果從 `start` 出發，開到第 `i` 站之後油箱變負的，那麼 `start` 到 `i` 之間**任何一站**都不可能是起點 —— 因為從 `start` 開到它們時油箱至少是 0，帶著更多油都撐不過去，從那裡空手出發更不行。所以直接把起點跳到 `i + 1`。",
  steps: [
    "先比總和：`sum(gas) < sum(cost)` 直接回傳 `-1`。",
    "`start = 0`、`tank = 0`，由左到右走訪每一站。",
    "每站把淨值 `gas[i] - cost[i]` 加進 `tank`。",
    "若 `tank < 0`：`start ~ i` 全部淘汰，`start = i + 1`，`tank` 歸零重新累計。",
    "走完之後的 `start` 就是答案。",
  ],
  pitfalls: [
    "不需要真的繞回頭驗證：總和檢查已經保證有解，而被淘汰的站都不是答案，剩下的 `start` 就是唯一解。",
    "淘汰時是跳到 `i + 1`，不是 `start + 1` —— 後者會退化成 O(n²)。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        `,
  presets: [
    { label: "[1,2,3,4,5] / [3,4,5,1,2]", input: { gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] }, expected: "3" },
    { label: "[5,1,2,3,4] / [4,4,1,5,1]", input: { gas: [5, 1, 2, 3, 4], cost: [4, 4, 1, 5, 1] }, expected: "4" },
    { label: "[2,3,4] / [3,4,3]（無解）", input: { gas: [2, 3, 4], cost: [3, 4, 3] }, expected: "-1" },
  ],
  trace({ gas, cost }) {
    const t = tracer();
    const n = gas.length;
    const diff = gas.map((g, i) => g - cost[i]);
    const sumGas = gas.reduce((a, b) => a + b, 0);
    const sumCost = cost.reduce((a, b) => a + b, 0);
    const DIFF = "淨值 gas[i] - cost[i]";

    t.push({
      line: 3,
      note: `先看整體：總油量 \`sum(gas) = ${sumGas}\`，總花費 \`sum(cost) = ${sumCost}\`。把每站的 \`gas[i] - cost[i]\` 算成「淨值」，正的代表這站有賺、負的代表虧油。`,
      views: [V.array("gas", gas), V.array("cost", cost), V.array(DIFF, diff)],
      vars: { "sum(gas)": sumGas, "sum(cost)": sumCost },
    });

    if (sumGas < sumCost) {
      const bad: Record<number, Tone> = {};
      for (let k = 0; k < n; k++) bad[k] = "bad";
      t.push({
        line: [3, 4],
        note: `\`${sumGas} < ${sumCost}\`，整圈加起來油就是不夠，不管從哪一站出發都一定會在某處沒油，回傳 \`-1\`。`,
        views: [V.array("gas", gas), V.array("cost", cost), V.array(DIFF, diff, { marks: bad })],
        vars: { "sum(gas)": sumGas, "sum(cost)": sumCost },
        result: py(-1),
      });
      return t.frames;
    }

    let start = 0;
    let tank = 0;
    t.push({
      line: [5, 6],
      note: `\`${sumGas} ≥ ${sumCost}\`，所以**一定有解**，剩下的問題只是「從哪一站」。先假設從第 0 站出發，油箱是空的。`,
      views: [V.array("gas", gas), V.array("cost", cost), V.array(DIFF, diff, { pointers: { start } })],
      vars: { start, tank },
    });

    const marksFor = (i: number, cur: Tone) => {
      const m: Record<number, Tone> = {};
      for (let k = 0; k < start && k < n; k++) m[k] = "muted";
      for (let k = start; k < i; k++) m[k] = "good";
      m[i] = cur;
      return m;
    };

    for (let i = 0; i < n; i++) {
      const before = tank;
      tank += diff[i];
      const d = diff[i];
      t.push({
        line: [7, 8],
        note:
          `第 ${i} 站加 ${gas[i]}、開到下一站花 ${cost[i]}，淨值 ${d >= 0 ? "+" : ""}${d}：\`tank = ${before} ${d >= 0 ? "+" : "−"} ${Math.abs(d)} = ${tank}\`。` +
          (tank >= 0 ? "油箱沒有變負，可以繼續往下一站開。" : "油箱變負了，代表開不到下一站！"),
        views: [
          V.array("gas", gas, { marks: { [i]: "active" } }),
          V.array("cost", cost, { marks: { [i]: "active" } }),
          V.array(DIFF, diff, {
            pointers: { start, i },
            marks: marksFor(i, tank >= 0 ? "active" : "bad"),
            ranges: [{ from: start, to: i, tone: tank >= 0 ? "good" : "bad", label: `tank = ${tank}` }],
          }),
        ],
        vars: { start, i, tank },
      });

      if (tank < 0) {
        const from = start;
        start = i + 1;
        tank = 0;
        const m: Record<number, Tone> = {};
        for (let k = 0; k <= i; k++) m[k] = "muted";
        t.push({
          line: [9, 10, 11],
          note:
            (from === i
              ? `第 ${i} 站自己就虧油，不可能當起點。`
              : `從第 ${from} 站出發撐不過第 ${i} 站；而 ${from} ~ ${i} 中間的站更不行 —— 從 ${from} 開到它們時油箱至少是 0，帶著油都過不去，空手出發更過不去。`) +
            `整段淘汰，\`start = ${start}\`，油箱歸零重新開始。`,
          views: [
            V.array("gas", gas),
            V.array("cost", cost),
            V.array(DIFF, diff, { pointers: { start, i }, marks: m }),
          ],
          vars: { start, i, tank },
        });
      }
    }

    const m: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) m[k] = k < start ? "muted" : "good";
    t.push({
      line: 12,
      note: `走完了。前面的站都被淘汰，而總油量保證有解，所以答案只能是 \`start = ${start}\`：從這裡出發累積的油，足夠補回前面那段虧掉的量。`,
      views: [
        V.array("gas", gas, { marks: { [start]: "good" } }),
        V.array("cost", cost, { marks: { [start]: "good" } }),
        V.array(DIFF, diff, { pointers: { start }, marks: m }),
      ],
      vars: { start, tank },
      result: py(start),
    });
    return t.frames;
  },
});
