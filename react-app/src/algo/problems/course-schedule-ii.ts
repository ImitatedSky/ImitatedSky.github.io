import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses
        for course, pre in prerequisites:
            graph[pre].append(course)  # 邊 pre → course
            indegree[course] += 1      # course 多一門還沒修的先修課

        q = deque(i for i in range(numCourses) if indegree[i] == 0)
        order = []
        while q:
            cur = q.popleft()
            order.append(cur)
            for nxt in graph[cur]:
                indegree[nxt] -= 1  # cur 修完了，nxt 少一個門檻
                if indegree[nxt] == 0:
                    q.append(nxt)
        return order if len(order) == numCourses else []`;

export default defineProblem<{ numCourses: number; prerequisites: number[][] }>({
  id: 210,
  summary:
    "一共有 `numCourses` 門課，編號 `0` 到 `numCourses - 1`。`prerequisites` 裡的每一組 `[a, b]` 表示想修 `a` 必須先修完 `b`。\n\n請回傳一個**能把所有課修完的順序**。合法的順序如果不只一種，回傳任何一種都可以；如果根本修不完，回傳空陣列。",
  examples: [
    { input: "numCourses = 2, prerequisites = [[1,0]]", output: "[0,1]" },
    {
      input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
      output: "[0,1,2,3]",
      note: "[0,2,1,3] 也是正確答案",
    },
    { input: "numCourses = 1, prerequisites = []", output: "[0]" },
  ],
  constraints: ["1 ≤ numCourses ≤ 2000", "0 ≤ prerequisites.length ≤ numCourses · (numCourses − 1)", "每組先修關係都不重複"],
  idea:
    "**入度** = 這門課還有幾門先修課沒修。入度是 0 的課現在就能修；修完之後，把它指向的課入度各減 1，就會有新的課變成 0。一直重複「挑入度 0 的課來修」（Kahn 演算法），修課的先後就是一個拓撲排序。如果有課永遠降不到 0，代表它們卡在環裡。",
  steps: [
    "建圖 `pre → course`，同時統計每門課的入度。",
    "把所有入度為 0 的課放進佇列。",
    "取出一門課 `cur`，加進 `order`。",
    "對 `cur` 指向的每門課 `nxt`：入度減 1；減到 0 就放進佇列。",
    "佇列空了以後，`order` 裡有全部的課就回傳它，否則有環，回傳 `[]`。",
  ],
  pitfalls: [
    "邊的方向要想清楚：`[a, b]` 是 `b → a`，被加入度的是 `a`。",
    "最後一定要檢查 `len(order) == numCourses`：有環時，環上的課入度永遠不會歸零，`order` 會少掉它們。",
    "合法順序不唯一，佇列換成堆疊也對，只是排出來的順序不同。",
  ],
  complexity: { time: "O(V + E)", space: "O(V + E)" },
  code,
  starter: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        `,
  presets: [
    {
      label: "4 門課，菱形",
      input: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] },
      expected: "[0, 1, 2, 3]",
    },
    {
      label: "6 門課，兩個起點",
      input: { numCourses: 6, prerequisites: [[2, 0], [2, 1], [3, 2], [4, 2], [5, 3], [5, 4]] },
      expected: "[0, 1, 2, 3, 4, 5]",
    },
    {
      label: "有環，修不完",
      input: { numCourses: 4, prerequisites: [[1, 0], [2, 1], [3, 2], [1, 3]] },
      expected: "[]",
    },
  ],
  trace({ numCourses, prerequisites }) {
    const t = tracer();
    const n = numCourses;
    const graph: number[][] = Array.from({ length: n }, () => []);
    const indegree: number[] = new Array(n).fill(0);
    const nodes = Array.from({ length: n }, (_, i) => ({ id: String(i), label: i }));
    const edges: { from: string; to: string }[] = [];
    const q: number[] = [];
    const order: number[] = [];
    const removed = new Set<string>(); // 已經「拆掉」的邊

    const views = (
      o: {
        cur?: number;
        nxt?: number;
        edge?: string;
        marks?: Record<string, Tone>;
        inMarks?: Record<number, Tone>;
      } = {},
    ) => {
      const marks: Record<string, Tone> = {};
      const im: Record<number, Tone> = {};
      order.forEach((x) => (marks[x] = im[x] = "good"));
      q.forEach((x) => (marks[x] = im[x] = "compare"));
      if (o.cur !== undefined) marks[o.cur] = "active";
      if (o.nxt !== undefined && !q.includes(o.nxt)) marks[o.nxt] = im[o.nxt] = "alt";
      const em: Record<string, Tone> = {};
      removed.forEach((k) => (em[k] = "muted"));
      if (o.edge) em[o.edge] = "active";
      const pointers: Record<string, string> = {};
      if (o.cur !== undefined) pointers.cur = String(o.cur);
      if (o.nxt !== undefined) pointers.nxt = String(o.nxt);
      return [
        V.graph("graph（pre → course）", { nodes, edges }, {
          directed: true,
          marks: { ...marks, ...o.marks },
          edgeMarks: em,
          pointers,
        }),
        V.queue("q（現在就能修的課）", q),
        V.array("indegree（還有幾門先修沒修）", indegree, {
          marks: { ...im, ...o.inMarks },
          pointers: o.nxt !== undefined ? { nxt: o.nxt } : {},
        }),
        V.array("order", order),
      ];
    };

    t.push({
      line: [3, 4],
      note: `${n} 門課各是一個節點，\`indegree\` 全部從 0 開始。接下來把先修關係一條一條畫成邊。`,
      views: views(),
      vars: { numCourses },
    });

    for (const [course, pre] of prerequisites) {
      graph[pre].push(course);
      indegree[course]++;
      edges.push({ from: String(pre), to: String(course) });
      t.push({
        line: [5, 6, 7],
        note: `\`[${course}, ${pre}]\`：要先修 \`${pre}\` 才能修 \`${course}\`，畫一條 \`${pre} → ${course}\`。\`${course}\` 多了一門先修課，\`indegree[${course}] = ${indegree[course]}\`。`,
        views: views({
          edge: `${pre}>${course}`,
          marks: { [pre]: "active", [course]: "alt" },
          inMarks: { [course]: "active" },
        }),
        vars: { course, pre },
      });
    }

    for (let i = 0; i < n; i++) if (indegree[i] === 0) q.push(i);
    t.push({
      line: [9, 10],
      note: q.length
        ? `入度是 0 的課沒有任何先修要求，**現在就能修**：${q.map((x) => `\`${x}\``).join("、")}，全部放進佇列。`
        : "沒有任何一門課的入度是 0 —— 每門課都在等別的課，佇列一開始就是空的。",
      views: views(),
      vars: { 已修課數: 0 },
    });

    while (q.length) {
      const cur = q.shift()!;
      order.push(cur);
      t.push({
        line: [11, 12, 13],
        note:
          `取出 \`${cur}\` 來修，排進 \`order\`。` +
          (graph[cur].length
            ? `修完它之後，以它為先修的 ${graph[cur].map((v) => `\`${v}\``).join("、")} 都少了一個門檻。`
            : "沒有任何課以它為先修，不用更新入度。"),
        views: views({ cur }),
        vars: { cur, 已修課數: order.length },
      });

      for (const nxt of graph[cur]) {
        indegree[nxt]--;
        removed.add(`${cur}>${nxt}`);
        const ready = indegree[nxt] === 0;
        if (ready) q.push(nxt);
        t.push({
          line: ready ? [14, 15, 16, 17] : [14, 15, 16],
          note:
            `拆掉 \`${cur} → ${nxt}\` 這條邊：\`indegree[${nxt}]\` 減 1 變成 ${indegree[nxt]}。` +
            (ready
              ? `歸零了，\`${nxt}\` 的先修課全部修完，可以排進佇列。`
              : `還不是 0，\`${nxt}\` 還有別的先修課沒修，先不能排。`),
          views: views({ cur, nxt, edge: `${cur}>${nxt}`, inMarks: { [nxt]: ready ? "compare" : "active" } }),
          vars: { cur, nxt, 已修課數: order.length },
        });
      }
    }

    if (order.length === n) {
      t.push({
        line: 18,
        note: `佇列空了，\`order\` 裡剛好有全部 ${n} 門課，每門課都排在它的先修課後面。回傳 \`${py(order)}\`。`,
        views: views(),
        vars: { 已修課數: order.length },
        result: py(order),
      });
    } else {
      const stuck: Record<string, Tone> = {};
      const stuckIn: Record<number, Tone> = {};
      for (let i = 0; i < n; i++) if (!order.includes(i)) stuck[i] = stuckIn[i] = "bad";
      t.push({
        line: 18,
        note: `佇列空了，但只修了 ${order.length} 門（共 ${n} 門）。剩下的課入度永遠降不到 0 —— 它們互相等待，卡在環裡。修不完，回傳 \`[]\`。`,
        views: views({ marks: stuck, inMarks: stuckIn }),
        vars: { 已修課數: order.length },
        result: "[]",
      });
    }
    return t.frames;
  },
});
