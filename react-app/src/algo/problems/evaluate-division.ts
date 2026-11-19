import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, tracer } from "../trace";

const code = `class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = defaultdict(dict)
        for (a, b), v in zip(equations, values):
            graph[a][b] = v      # a / b = v
            graph[b][a] = 1 / v  # b / a = 1 / v

        def bfs(src, dst):
            if src not in graph or dst not in graph:
                return -1.0
            q = deque([(src, 1.0)])  # (變數, src / 變數 的值)
            seen = {src}
            while q:
                node, prod = q.popleft()
                if node == dst:
                    return prod
                for nei, w in graph[node].items():
                    if nei not in seen:
                        seen.add(nei)
                        q.append((nei, prod * w))
            return -1.0

        return [bfs(a, b) for a, b in queries]`;

/** Python 印 float 的樣子：整數值也帶 `.0` */
const pyFloat = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
/** 畫面上用的精簡寫法（避免 0.30000000000000004 這種尾巴） */
const show = (x: number) => pyFloat(+x.toFixed(4));

interface Input {
  equations: string[][];
  values: number[];
  queries: string[][];
}

export default defineProblem<Input>({
  id: 399,
  summary:
    "給一些除法等式，例如 `a / b = 2.0`、`b / c = 3.0`，每個變數都代表一個非零實數。接著有一批查詢 `x / y = ?`，請利用已知等式算出每個查詢的值。\n\n如果答案推不出來（變數沒出現過，或兩個變數之間沒有任何等式能串起來），該筆回傳 `-1.0`。",
  summaryEn:
    "You get some division equations such as `a / b = 2.0` and `b / c = 3.0`, where each variable stands for a non-zero real number. Then comes a batch of queries `x / y = ?`; answer each one using the known equations.\n\nIf an answer cannot be derived (a variable never appeared, or no chain of equations connects the two variables), return `-1.0` for that query.",
  examples: [
    {
      input: 'equations = [["a","b"],["b","c"]], values = [2.0,3.0], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]',
      output: "[6.0, 0.5, -1.0, 1.0, -1.0]",
      note: "a / c = (a / b) × (b / c) = 2 × 3", noteEn: "a / c = (a / b) × (b / c) = 2 × 3",
    },
    {
      input: 'equations = [["a","b"]], values = [0.5], queries = [["a","b"],["b","a"],["a","c"],["x","y"]]',
      output: "[0.5, 2.0, -1.0, -1.0]",
    },
  ],
  constraints: ["1 ≤ equations.length ≤ 20", "1 ≤ queries.length ≤ 20", "0.0 < values[i] ≤ 20.0", "輸入保證不會有矛盾，也不會除以零"],
  constraintsEn: ["1 ≤ equations.length ≤ 20", "1 ≤ queries.length ≤ 20", "0.0 < values[i] ≤ 20.0", "The input never contradicts itself and never divides by zero"],
  idea:
    "把每個變數當成節點，`a / b = v` 畫成一條 `a → b`、權重 `v` 的邊，再補一條反向邊 `b → a`、權重 `1 / v`。這樣 **`x / y` 就是從 `x` 走到 `y` 的路徑上所有權重相乘**（中間的變數會一路約掉），問題就變成在圖上找路徑。",
  steps: [
    "建圖：每個等式加兩條有向邊，權重分別是 `v` 和 `1 / v`。",
    "對每個查詢 `(src, dst)`：任何一個變數不在圖裡 → `-1.0`。",
    "否則從 `src` 做 BFS，佇列裡放 `(變數, 目前累積的乘積)`，起點的乘積是 `1.0`。",
    "每走一條邊就把乘積乘上邊的權重；走到 `dst` 時，累積的乘積就是答案。",
    "整個連通區塊都走完還沒碰到 `dst` → 兩個變數沒有關聯，回傳 `-1.0`。",
  ],
  pitfalls: [
    "`x / x` 不一定是 `1.0`：如果 `x` 根本沒在等式裡出現過，答案是 `-1.0`，所以要先檢查變數在不在圖裡。",
    "別忘了加**反向邊**，否則 `b / a` 這類查詢會找不到路。",
    "每筆查詢都要用新的 `seen`，不能跨查詢共用。",
  ],
  complexity: { time: "O(Q · (V + E))，Q 為查詢數", space: "O(V + E)" },
  code,
  starter: `class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        `,
  presets: [
    {
      label: "a/b = 2, b/c = 3",
      input: {
        equations: [["a", "b"], ["b", "c"]],
        values: [2.0, 3.0],
        queries: [["a", "c"], ["b", "a"], ["a", "e"], ["a", "a"], ["x", "x"]],
      },
      expected: "[6.0, 0.5, -1.0, 1.0, -1.0]",
    },
    {
      label: "兩個不相連的區塊",
      input: {
        equations: [["a", "b"], ["b", "c"], ["bc", "cd"]],
        values: [1.5, 2.5, 5.0],
        queries: [["a", "c"], ["c", "b"], ["a", "cd"], ["cd", "bc"]],
      },
      expected: "[3.75, 0.4, -1.0, 0.2]",
    },
    {
      label: "只有一個等式",
      input: {
        equations: [["a", "b"]],
        values: [0.5],
        queries: [["a", "b"], ["b", "a"], ["a", "c"], ["x", "y"]],
      },
      expected: "[0.5, 2.0, -1.0, -1.0]",
    },
  ],
  trace({ equations, values, queries }) {
    const t = tracer();
    const names: string[] = [];
    for (const [a, b] of equations) for (const x of [a, b]) if (!names.includes(x)) names.push(x);
    const nodes = names.map((id) => ({ id, label: id }));

    const graph = new Map<string, Map<string, number>>();
    const edges = () =>
      [...graph].flatMap(([from, m]) => [...m].map(([to, w]) => ({ from, to, label: +w.toFixed(3) })));
    const ans: number[] = [];
    const queryText = queries.map(([a, b]) => `${a} / ${b}`);

    const views = (
      o: {
        qi?: number;
        q?: [string, number][];
        marks?: Record<string, Tone>;
        edgeMarks?: Record<string, Tone>;
        pointers?: Record<string, string | null>;
      } = {},
    ) => {
      const qMarks: Record<number, Tone> = {};
      ans.forEach((v, i) => (qMarks[i] = v === -1 ? "bad" : "good"));
      if (o.qi !== undefined && o.qi >= ans.length) qMarks[o.qi] = "active";
      return [
        V.graph("graph（邊 x → y 上的數字 = x / y）", { nodes, edges: edges() }, {
          directed: true,
          marks: o.marks ?? {},
          edgeMarks: o.edgeMarks ?? {},
          pointers: o.pointers ?? {},
        }),
        V.queue("q（變數, 累積乘積）", (o.q ?? []).map(([x, p]) => `(${x}, ${show(p)})`)),
        V.array("queries", queryText, { marks: qMarks }),
        V.array("答案", ans.map(pyFloat)),
      ];
    };

    t.push({
      line: 3,
      note: "把每個變數當成一個節點。接下來每個等式 `a / b = v` 會變成兩條有向邊：`a → b`（權重 `v`）和 `b → a`（權重 `1 / v`）。",
      views: views(),
    });

    equations.forEach(([a, b], i) => {
      const v = values[i];
      if (!graph.has(a)) graph.set(a, new Map());
      if (!graph.has(b)) graph.set(b, new Map());
      graph.get(a)!.set(b, v);
      graph.get(b)!.set(a, 1 / v);
      t.push({
        line: [4, 5, 6],
        note: `等式 \`${a} / ${b} = ${pyFloat(v)}\`：加上 \`${a} → ${b}\`（權重 ${show(v)}），以及反過來的 \`${b} → ${a}\`（權重 1 / ${show(v)} = ${show(1 / v)}）。有了反向邊，兩個方向的查詢都答得出來。`,
        views: views({
          marks: { [a]: "active", [b]: "active" },
          edgeMarks: { [`${a}>${b}`]: "active", [`${b}>${a}`]: "alt" },
        }),
        vars: { a, b, v: pyFloat(v) },
      });
    });

    queries.forEach(([src, dst], qi) => {
      const ptr = (extra: Record<string, string | null> = {}) => {
        const p: Record<string, string | null> = { ...extra };
        if (graph.has(src)) p.src = src;
        if (graph.has(dst)) p.dst = dst;
        return p;
      };

      if (!graph.has(src) || !graph.has(dst)) {
        const missing = [src, dst].filter((x, k, arr) => !graph.has(x) && arr.indexOf(x) === k);
        ans.push(-1);
        t.push({
          line: [23, 9, 10],
          note: `查詢 \`${src} / ${dst}\`：${missing.map((x) => `\`${x}\``).join("、")} 從來沒在等式裡出現過，完全不知道它的值，直接回答 \`-1.0\`。${src === dst ? "即使是自己除以自己也一樣。" : ""}`,
          views: views({ qi, pointers: ptr() }),
          vars: { src, dst, 回傳: "-1.0" },
        });
        return;
      }

      const q: [string, number][] = [[src, 1]];
      const seen = new Set<string>([src]);
      const parent = new Map<string, string>();
      const base = (cur?: string) => {
        const m: Record<string, Tone> = {};
        seen.forEach((x) => (m[x] = "visited"));
        m[dst] = seen.has(dst) ? "visited" : "compare";
        if (cur) m[cur] = "active";
        return m;
      };
      const treeEdges = () => {
        const m: Record<string, Tone> = {};
        parent.forEach((p, c) => (m[`${p}>${c}`] = "visited"));
        return m;
      };

      t.push({
        line: [23, 11, 12],
        note: `查詢 \`${src} / ${dst}\`：兩個變數都在圖裡。從 \`${src}\` 出發做 BFS，佇列放 \`(${src}, 1.0)\` —— 意思是「\`${src} / ${src} = 1\`」，之後每走一條邊就乘上它的權重。`,
        views: views({ qi, q, marks: base(), pointers: ptr() }),
        vars: { src, dst },
      });

      let found: number | null = null;
      while (q.length) {
        const [node, prod] = q.shift()!;
        if (node === dst) {
          found = prod;
          const marks = base();
          const em = treeEdges();
          const path: string[] = [node];
          for (let x = node; parent.has(x); x = parent.get(x)!) {
            em[`${parent.get(x)!}>${x}`] = "good";
            path.unshift(parent.get(x)!);
          }
          path.forEach((x) => (marks[x] = "good"));
          ans.push(prod);
          t.push({
            line: [14, 15, 16],
            note:
              `取出 \`(${node}, ${show(prod)})\`：\`${node}\` 就是終點！` +
              (path.length > 1
                ? `沿著 ${path.map((x) => `\`${x}\``).join(" → ")} 把權重乘起來，中間的變數全部約掉，得到 \`${src} / ${dst} = ${show(prod)}\`。`
                : `起點就是終點，\`${src} / ${dst} = 1.0\`。`),
            views: views({ q, marks, edgeMarks: em, pointers: ptr({ node }) }),
            vars: { src, dst, node, prod: show(prod), 回傳: pyFloat(prod) },
          });
          break;
        }

        const em = treeEdges();
        const parts: string[] = [];
        for (const [nei, w] of graph.get(node)!) {
          if (seen.has(nei)) {
            parts.push(`\`${nei}\` 已經看過，跳過`);
            continue;
          }
          seen.add(nei);
          parent.set(nei, node);
          q.push([nei, prod * w]);
          em[`${node}>${nei}`] = "active";
          parts.push(`\`${nei}\` 沒看過 → 乘積 ${show(prod)} × ${show(w)} = ${show(prod * w)}（也就是 \`${src} / ${nei}\`），入列`);
        }
        t.push({
          line: [14, 15, 17, 18, 19, 20],
          note: `取出 \`(${node}, ${show(prod)})\`，還不是終點 \`${dst}\`，看它的鄰居：${parts.join("；")}。`,
          views: views({ qi, q, marks: base(node), edgeMarks: em, pointers: ptr({ node }) }),
          vars: { src, dst, node, prod: show(prod) },
        });
      }

      if (found === null) {
        ans.push(-1);
        const marks: Record<string, Tone> = {};
        seen.forEach((x) => (marks[x] = "visited"));
        marks[dst] = "bad";
        t.push({
          line: 21,
          note: `佇列空了：從 \`${src}\` 走得到的變數全部看過了，還是沒遇到 \`${dst}\`。兩者在不同的連通區塊，沒有等式能把它們串起來 → \`-1.0\`。`,
          views: views({ marks, edgeMarks: treeEdges(), pointers: ptr() }),
          vars: { src, dst, 回傳: "-1.0" },
        });
      }
    });

    const result = `[${ans.map(pyFloat).join(", ")}]`;
    t.push({
      line: 23,
      note: `所有查詢都回答完了，依序收集成 \`${result}\`。`,
      views: views(),
      result,
    });
    return t.frames;
  },
});
