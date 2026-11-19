import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if not node:
            return None
        clones = {node: Node(node.val)}  # 原節點 -> 它的複製品
        q = deque([node])
        while q:
            cur = q.popleft()
            for nei in cur.neighbors:
                if nei not in clones:
                    clones[nei] = Node(nei.val)
                    q.append(nei)
                clones[cur].neighbors.append(clones[nei])
        return clones[node]`;

const GRAPH_LABEL = "左：原圖　右：複製品（箭頭 = neighbors 裡的一筆）";

export default defineProblem<{ adjList: number[][] }>({
  id: 133,
  summary:
    "給一張**連通的無向圖**裡的某個節點，每個節點有一個值 `val` 和一份鄰居清單 `neighbors`。請做出整張圖的**深拷貝**：每個節點都要是全新的物件，彼此之間的連線關係和原圖一模一樣，最後回傳對應的那個新節點。\n\n這裡用相鄰串列表示圖：第 `i` 個清單是節點 `i + 1` 的鄰居，函式拿到的是值為 1 的節點。",
  summaryEn:
    "You are given one node of a **connected undirected graph**; each node has a value `val` and a list of `neighbors`. Make a **deep copy** of the whole graph: every node must be a brand-new object, wired together exactly like the original, and return the copy of the node you were given.\n\nThe graph is written as an adjacency list: list `i` holds the neighbors of node `i + 1`, and the function receives the node with value 1.",
  examples: [
    { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]", note: "四個節點圍成一圈", noteEn: "four nodes in a ring" },
    { input: "adjList = [[]]", output: "[[]]", note: "只有一個節點、沒有鄰居", noteEn: "a single node with no neighbors" },
    { input: "adjList = []", output: "[]", note: "空圖，回傳 None", noteEn: "an empty graph, return None" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 100", "節點值各不相同，沒有重邊與自環", "整張圖是連通的"],
  constraintsEn: ["0 ≤ number of nodes ≤ 100", "Node values are distinct; no repeated edges or self-loops", "The graph is connected"],
  idea:
    "圖有環，同一個節點會從不同的鄰居被走到好幾次。用一張雜湊表記住**原節點 → 複製品**：第一次遇到才建立新節點，之後再遇到就直接拿表裡那一個來接線，這樣每個節點只會被複製一次，也不會繞圈繞不出來。",
  steps: [
    "空圖直接回傳 `None`。",
    "先複製起點，放進 `clones`，並把起點放進佇列。",
    "每次取出一個原節點 `cur`，逐一看它的鄰居 `nei`。",
    "`nei` 還沒有複製品 → 建一個、記進 `clones`，並把 `nei` 排進佇列（它的鄰居之後也要處理）。",
    "不管是不是新建的，都把 `clones[nei]` 接到 `clones[cur].neighbors` 後面。",
    "佇列清空後回傳 `clones[node]`。",
  ],
  pitfalls: [
    "`clones` 同時扮演 **visited** 的角色：少了它，遇到環就會不停地重複複製。",
    "接線那一行要放在 `if` **外面**：鄰居已經複製過時不用新建，但這條邊還是要接。",
    "新節點的 `neighbors` 必須指向**複製品**，不能直接塞原圖的節點，否則就不是深拷貝。",
  ],
  complexity: { time: "O(V + E)", space: "O(V)" },
  code,
  starter: `class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        `,
  presets: [
    { label: "四個節點圍成一圈", input: { adjList: [[2, 4], [1, 3], [2, 4], [1, 3]] }, expected: "[[2, 4], [1, 3], [2, 4], [1, 3]]" },
    {
      label: "三角形加一條尾巴",
      input: { adjList: [[2, 3], [1, 3, 4], [1, 2], [2, 5], [4]] },
      expected: "[[2, 3], [1, 3, 4], [1, 2], [2, 5], [4]]",
    },
    { label: "只有一個節點", input: { adjList: [[]] }, expected: "[[]]" },
  ],
  trace({ adjList }) {
    const t = tracer();
    const n = adjList.length;

    // 原圖畫在左半、複製品畫在右半，同一個節點在兩邊的相對位置一樣
    const at = (i: number, right: boolean) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n);
      const r = n === 1 ? 0 : 1;
      return { x: (right ? 0.81 : 0.19) + r * 0.18 * Math.cos(a), y: 0.52 + r * 0.46 * Math.sin(a) };
    };
    const origNodes = adjList.map((_, i) => ({ id: String(i + 1), label: i + 1, ...at(i, false) }));
    // neighbors 是有方向的清單，所以原圖每條無向邊畫成一來一回兩個箭頭
    const origEdges = adjList.flatMap((ns, i) => ns.map((j) => ({ from: String(i + 1), to: String(j) })));

    if (n === 0) {
      t.push({
        line: [3, 4],
        note: "傳進來的是 `None`（空圖），沒有東西可以複製，直接回傳 `None`。",
        views: [V.graph(GRAPH_LABEL, { nodes: [], edges: [] })],
        result: py(null),
      });
      return t.frames;
    }

    const clones = new Set<number>(); // 已經有複製品的原節點
    const cloneAdj: Record<number, number[]> = {};
    const q: number[] = [];
    const done = new Set<number>(); // 鄰居全部接完的節點
    const neighborsText = (v: number) => `[${cloneAdj[v].map((w) => `${w}′`).join(", ")}]`;

    const views = (
      o: { cur?: number; nei?: number; fresh?: number; edge?: [number, number] } = {},
    ) => {
      const om: Record<string, Tone> = {};
      const cm: Record<string, Tone> = {};
      clones.forEach((v) => {
        om[v] = done.has(v) ? "good" : "visited";
        cm[`c${v}`] = done.has(v) ? "good" : "visited";
      });
      if (o.nei !== undefined) {
        om[o.nei] = "compare";
        if (clones.has(o.nei)) cm[`c${o.nei}`] = "compare";
      }
      if (o.cur !== undefined) {
        om[o.cur] = "active";
        cm[`c${o.cur}`] = "active";
      }
      if (o.fresh !== undefined) cm[`c${o.fresh}`] = "alt";

      const cloneNodes = [...clones].map((v) => ({ id: `c${v}`, label: `${v}′`, ...at(v - 1, true) }));
      const cloneEdges = [...clones].flatMap((v) => cloneAdj[v].map((w) => ({ from: `c${v}`, to: `c${w}` })));
      const edgeMarks: Record<string, Tone> = {};
      if (o.cur !== undefined && o.nei !== undefined) edgeMarks[`${o.cur}>${o.nei}`] = "compare";
      if (o.edge) edgeMarks[`c${o.edge[0]}>c${o.edge[1]}`] = "active";
      const mapMarks: Record<string, Tone> = {};
      if (o.nei !== undefined && clones.has(o.nei)) mapMarks[String(o.nei)] = o.fresh === o.nei ? "alt" : "compare";
      else if (o.fresh !== undefined) mapMarks[String(o.fresh)] = "alt";

      return [
        V.graph(GRAPH_LABEL, { nodes: [...origNodes, ...cloneNodes], edges: [...origEdges, ...cloneEdges] }, {
          directed: true,
          marks: { ...om, ...cm },
          edgeMarks,
          pointers: { ...(o.cur !== undefined ? { cur: String(o.cur) } : {}), ...(o.nei !== undefined ? { nei: String(o.nei) } : {}) },
        }),
        V.map("clones（原節點 → 複製品）", [...clones].map((v) => [v, `${v}′`] as [number, string]), { marks: mapMarks }),
        V.queue("q", q),
      ];
    };

    clones.add(1);
    cloneAdj[1] = [];
    q.push(1);
    t.push({
      line: [5, 6],
      note: "先複製起點：建立 `1′`，記進 `clones`，並把起點放進佇列。這張表既用來**查複製品**，也用來判斷節點**有沒有處理過**。",
      views: views({ fresh: 1 }),
      vars: { 已複製節點數: clones.size },
    });

    while (q.length) {
      const cur = q.shift()!;
      t.push({
        line: [7, 8, 9],
        note:
          `取出 \`${cur}\`。它的複製品 \`${cur}′\` 已經存在，但 \`neighbors\` 還是空的 —— 現在照著原圖的鄰居 ${py(adjList[cur - 1])} 一條一條補上。` +
          (adjList[cur - 1].length ? "" : "它沒有鄰居，什麼都不用接。"),
        views: views({ cur }),
        vars: { cur, 已複製節點數: clones.size },
      });

      for (const nei of adjList[cur - 1]) {
        if (!clones.has(nei)) {
          clones.add(nei);
          cloneAdj[nei] = [];
          q.push(nei);
          t.push({
            line: [10, 11, 12],
            note: `鄰居 \`${nei}\` 不在 \`clones\` 裡 → 第一次遇到。建立 \`${nei}′\` 並記進表中，再把 \`${nei}\` 排進佇列，晚點輪到它接自己的鄰居。`,
            views: views({ cur, nei, fresh: nei }),
            vars: { cur, nei, 已複製節點數: clones.size },
          });
          cloneAdj[cur].push(nei);
          t.push({
            line: 13,
            note: `接線：把 \`${nei}′\` 加進 \`${cur}′.neighbors\`。注意接的是**複製品**，不是原圖的 \`${nei}\`。`,
            views: views({ cur, nei, edge: [cur, nei] }),
            vars: { cur, nei, [`${cur}′.neighbors`]: neighborsText(cur) },
          });
        } else {
          cloneAdj[cur].push(nei);
          t.push({
            line: [10, 13],
            note: `鄰居 \`${nei}\` **已經在 \`clones\` 裡**：不再新建、也不再入列，直接拿表裡的 \`${nei}′\` 接到 \`${cur}′.neighbors\`。圖裡有環也不會重複複製，靠的就是這一步。`,
            views: views({ cur, nei, edge: [cur, nei] }),
            vars: { cur, nei, [`${cur}′.neighbors`]: neighborsText(cur) },
          });
        }
      }
      done.add(cur);
    }

    const out = adjList.map((_, i) => cloneAdj[i + 1] ?? []);
    t.push({
      line: 14,
      note: `佇列空了：${clones.size} 個節點都各有一個複製品，每條邊也都接好了。回傳 \`clones[node]\`，也就是 \`1′\`。`,
      views: views(),
      vars: { 已複製節點數: clones.size },
      result: py(out),
    });
    return t.frames;
  },
});
