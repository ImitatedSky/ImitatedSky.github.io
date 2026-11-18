import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        for course, pre in prerequisites:
            graph[pre].append(course)  # 邊 pre → course

        state = [0] * numCourses  # 0 沒走過、1 走訪中、2 已確認安全

        def dfs(u):
            if state[u] == 1:
                return False  # 走回目前路徑上的點 → 有環
            if state[u] == 2:
                return True   # 之前檢查過，不用再走
            state[u] = 1
            for v in graph[u]:
                if not dfs(v):
                    return False
            state[u] = 2
            return True

        return all(dfs(u) for u in range(numCourses))`;

export default defineProblem<{ numCourses: number; prerequisites: number[][] }>({
  id: 207,
  summary:
    "一共有 `numCourses` 門課，編號 `0` 到 `numCourses - 1`。`prerequisites` 裡的每一組 `[a, b]` 表示：**想修 `a`，必須先修完 `b`**。\n\n判斷有沒有辦法把所有課都修完，可以就回傳 `True`，否則回傳 `False`。",
  examples: [
    { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", note: "先修 0 再修 1" },
    { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", note: "兩門課互為先修，誰都沒辦法先開始" },
  ],
  constraints: ["1 ≤ numCourses ≤ 2000", "0 ≤ prerequisites.length ≤ 5000", "每組先修關係都不重複"],
  idea:
    "把「先修 `b` 才能修 `a`」畫成有向邊 `b → a`，修不完的唯一原因就是**圖裡有環**。用 DFS 配三種狀態找環：沒走過（0）、**正在目前這條遞迴路徑上**（1）、已確認安全（2）。走訪途中如果又踩到狀態 1 的點，代表繞回了自己的路徑，環就出現了。",
  steps: [
    "建立相鄰串列：`graph[pre]` 記下所有需要 `pre` 當先修的課。",
    "`state` 全部設為 0，對每門課呼叫 `dfs`。",
    "進入 `u`：狀態是 1 → 有環，回傳 `False`；狀態是 2 → 之前確認過，直接回傳 `True`。",
    "否則把 `u` 標成 1，往每個後繼 `v` 遞迴；只要其中一個回傳 `False` 就立刻往上傳。",
    "後繼全部沒問題，把 `u` 標成 2（從 `u` 出發不會遇到環），回傳 `True`。",
  ],
  pitfalls: [
    "只用一個 `visited` 布林值不夠：分不出「這條路徑上正在走的點」和「別條路徑早就走完的點」，會把沒有環的圖誤判成有環。",
    "狀態 2 是效能關鍵：沒有它，同一個點會被重複展開，最壞情況變成指數時間。",
    "圖可能不連通，所以要對**每一門課**都啟動一次 DFS。",
    "另一種同樣標準的寫法是 Kahn 演算法（用入度做 BFS），可以參考「課程表 II」。",
  ],
  complexity: { time: "O(V + E)", space: "O(V + E)" },
  code,
  starter: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        `,
  presets: [
    {
      label: "5 門課，沒有環",
      input: { numCourses: 5, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]] },
      expected: "True",
    },
    {
      label: "4 門課，1 → 2 → 3 → 1 繞成環",
      input: { numCourses: 4, prerequisites: [[1, 0], [2, 1], [3, 2], [1, 3]] },
      expected: "False",
    },
    { label: "3 門課，沒有任何先修", input: { numCourses: 3, prerequisites: [] }, expected: "True" },
  ],
  trace({ numCourses, prerequisites }) {
    const t = tracer();
    const n = numCourses;
    const graph: number[][] = Array.from({ length: n }, () => []);
    for (const [course, pre] of prerequisites) graph[pre].push(course);

    const nodes = Array.from({ length: n }, (_, i) => ({ id: String(i), label: i }));
    const edges = graph.flatMap((vs, u) => vs.map((v) => ({ from: String(u), to: String(v) })));
    const state: number[] = new Array(n).fill(0);
    const stack: number[] = [];

    const views = (
      o: { u?: number; edge?: [number, number]; edgeTone?: Tone; cycle?: number[] } = {},
    ) => {
      const marks: Record<string, Tone> = {};
      const sm: Record<number, Tone> = {};
      state.forEach((s, i) => {
        if (s === 1) marks[i] = sm[i] = "active";
        if (s === 2) marks[i] = sm[i] = "good";
      });
      const em: Record<string, Tone> = {};
      for (let k = 0; k + 1 < stack.length; k++) em[`${stack[k]}>${stack[k + 1]}`] = "active";
      if (o.edge) em[`${o.edge[0]}>${o.edge[1]}`] = o.edgeTone ?? "compare";
      if (o.cycle) {
        o.cycle.forEach((x, k) => {
          marks[x] = sm[x] = "bad";
          em[`${x}>${o.cycle![(k + 1) % o.cycle!.length]}`] = "bad";
        });
      }
      return [
        V.graph("graph（pre → course）", { nodes, edges }, {
          directed: true,
          marks,
          edgeMarks: em,
          pointers: o.u !== undefined ? { u: String(o.u) } : {},
        }),
        V.array("state（0 沒走過／1 走訪中／2 安全）", state, { marks: sm, pointers: o.u !== undefined ? { u: o.u } : {} }),
        V.stack("目前的遞迴路徑", stack),
      ];
    };

    t.push({
      line: [3, 4, 5],
      note: prerequisites.length
        ? "把每組 `[course, pre]` 畫成一條 `pre → course` 的有向邊：箭頭的意思是「修完前面那門，才能修後面那門」。能不能全部修完，等於在問這張圖**有沒有環**。"
        : "沒有任何先修關係，圖上一條邊都沒有。",
      views: views(),
      vars: { numCourses },
    });
    t.push({
      line: 7,
      note: "每門課一個狀態，一開始都是 `0`（沒走過）。`1` 代表「正在目前這條遞迴路徑上」，`2` 代表「從它出發確定不會遇到環」。",
      views: views(),
      vars: { numCourses },
    });

    let cycle: number[] | null = null;
    const dfs = (u: number, from: number | null): boolean => {
      const edge: [number, number] | undefined = from === null ? undefined : [from, u];
      const via = from === null ? `從頭檢查課程 \`${u}\`：` : `沿著 \`${from} → ${u}\` 往下走：`;
      if (state[u] === 1) {
        cycle = stack.slice(stack.indexOf(u));
        t.push({
          line: [10, 11],
          note: `${via}\`state[${u}] = 1\`，表示 \`${u}\` **還在目前的遞迴路徑上**。路徑又繞回自己：${[...cycle, u].map((x) => `\`${x}\``).join(" → ")} 是一個環，這幾門課互相卡住，回傳 \`False\`。`,
          views: views({ u, cycle }),
          vars: { u, 回傳: "False" },
        });
        return false;
      }
      if (state[u] === 2) {
        t.push({
          line: [12, 13],
          note: `${via}\`state[${u}] = 2\`，之前已經確認過從 \`${u}\` 出發不會遇到環，不用再走一次，直接回傳 \`True\`。`,
          views: views({ u, edge, edgeTone: "good" }),
          vars: { u, 回傳: "True" },
        });
        return true;
      }
      state[u] = 1;
      stack.push(u);
      t.push({
        line: [14, 15],
        note:
          `${via}第一次來到 \`${u}\`，把它標成 \`1\`（走訪中）並放上路徑。` +
          (graph[u].length
            ? `接著檢查需要它當先修的課：${graph[u].map((v) => `\`${v}\``).join("、")}。`
            : "沒有任何課需要它當先修，沒有邊可以走。"),
        views: views({ u }),
        vars: { u },
      });
      for (const v of graph[u]) {
        if (!dfs(v, u)) return false;
      }
      state[u] = 2;
      stack.pop();
      t.push({
        line: [18, 19],
        note: `\`${u}\` 的後繼全部檢查完都沒問題 → 從 \`${u}\` 出發不可能繞回來。標成 \`2\`（安全）、離開路徑，回傳 \`True\`。`,
        views: views({ u }),
        vars: { u, 回傳: "True" },
      });
      return true;
    };

    for (let u = 0; u < n; u++) {
      if (!dfs(u, null)) {
        t.push({
          line: [16, 17, 21],
          note: "`False` 沿著遞迴一層一層往上傳，`all(...)` 一拿到 `False` 就停。圖裡有環，不可能修完所有課。",
          views: views({ cycle: cycle ?? [] }),
          result: py(false),
        });
        return t.frames;
      }
    }

    t.push({
      line: 21,
      note: `每門課的 \`dfs\` 都回傳 \`True\`，${n} 門課全部是狀態 \`2\`：圖裡沒有環，一定排得出修課順序。`,
      views: views(),
      result: py(true),
    });
    return t.frames;
  },
});
