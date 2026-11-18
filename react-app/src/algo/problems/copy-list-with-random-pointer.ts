import { defineProblem } from "../types";
import type { Cell, ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        old_to_new = {None: None}   # 舊節點 -> 新節點
        cur = head
        while cur:                  # 第一趟：只建立節點
            old_to_new[cur] = Node(cur.val)
            cur = cur.next
        cur = head
        while cur:                  # 第二趟：接上 next 與 random
            copy = old_to_new[cur]
            copy.next = old_to_new[cur.next]
            copy.random = old_to_new[cur.random]
            cur = cur.next
        return old_to_new[head]`;

type Pair = [number, number | null];

export default defineProblem<{ head: Pair[] }>({
  id: 138,
  summary:
    "一條鏈結串列的每個節點除了 `next` 以外，還多一個 `random` 指標，可以指向串列中**任何一個節點**（包含自己），也可以是空的。請做出這條串列的**深複製**：全部都是新建立的節點，而且新節點的 `next`、`random` 都只能指向新節點，不能指回原串列。\n\n輸入輸出用 `[val, random_index]` 表示每個節點，`random_index` 是 `random` 所指節點的索引（沒有就是 `null`）。",
  examples: [
    { input: "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]", output: "[[7,null],[13,0],[11,4],[10,2],[1,0]]" },
    { input: "head = [[1,1],[2,1]]", output: "[[1,1],[2,1]]" },
    { input: "head = [[3,null],[3,0],[3,null]]", output: "[[3,null],[3,0],[3,null]]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 1000", "`random` 是 `null` 或指向串列中的某個節點"],
  idea:
    "麻煩在於 `random` 可能指向**還沒複製出來**的節點。解法是拆成兩趟：第一趟先把每個節點的分身建好，並用雜湊表記住「舊節點 → 新節點」；第二趟所有分身都已經存在，舊節點指向誰，就查表把新節點指向對應的分身。",
  steps: [
    "準備雜湊表 `old_to_new`，先放一筆 `None → None`，之後查到空指標就不必特判。",
    "第一趟走訪原串列：每個節點建立一個值相同的新節點，存進 `old_to_new`（這時新節點還沒接任何指標）。",
    "第二趟再走訪一次：`copy.next = old_to_new[cur.next]`、`copy.random = old_to_new[cur.random]`。",
    "回傳 `old_to_new[head]`。",
  ],
  pitfalls: [
    "雜湊表的 key 是**節點物件本身**，不是節點的值 —— 值可能重複。",
    "`cur.next` 或 `cur.random` 是 `None` 時直接查表會 `KeyError`，所以要先放 `None → None`（或改用 `.get()`）。",
    "新節點的指標絕對不能指向舊節點，否則就不是深複製了。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        `,
  presets: [
    {
      label: "[[7,null],[13,0],[11,4],[10,2],[1,0]]",
      input: { head: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] },
      expected: "[[7, None], [13, 0], [11, 4], [10, 2], [1, 0]]",
    },
    { label: "[[1,1],[2,1]]", input: { head: [[1, 1], [2, 1]] }, expected: "[[1, 1], [2, 1]]" },
    {
      label: "[[3,null],[3,0],[3,null]]",
      input: { head: [[3, null], [3, 0], [3, null]] },
      expected: "[[3, None], [3, 0], [3, None]]",
    },
  ],
  trace({ head }) {
    const t = tracer();
    const n = head.length;
    const o = (i: number) => `o${i}`;
    const c = (i: number) => `c${i}`;
    // Names used in the map view: the same value can appear twice, so nodes are named by position
    const oldName = (i: number | null) => (i === null || i >= n ? "None" : `舊#${i}（${head[i][0]}）`);
    const newName = (i: number | null) => (i === null || i >= n ? "None" : `新#${i}（${head[i][0]}）`);

    const original: ListNodeSpec[] = head.map(([val, r], i) => ({
      id: o(i),
      val,
      next: i + 1 < n ? o(i + 1) : null,
      random: r === null ? null : o(r),
    }));
    let created = 0; // copies that exist
    let linked = 0; // copies whose next / random are set
    const copies = (): ListNodeSpec[] =>
      head.slice(0, created).map(([val, r], i) => ({
        id: c(i),
        val,
        next: i < linked && i + 1 < n ? c(i + 1) : null,
        random: i < linked && r !== null ? c(r) : null,
      }));
    const mapEntries = (): [Cell, Cell][] => [
      ["None", "None"],
      ...head.slice(0, created).map((_, i) => [oldName(i), newName(i)] as [Cell, Cell]),
    ];

    const views = (
      cur: number | null,
      opt: { oMarks?: Record<string, Tone>; cMarks?: Record<string, Tone>; mMarks?: Record<string, Tone>; copy?: number; done?: boolean } = {},
    ) => [
      V.list("原串列（下方弧線 = random）", original, {
        pointers: opt.done ? {} : { cur: cur === null || cur >= n ? null : o(cur) },
        marks: opt.oMarks ?? {},
      }),
      V.list("複本（新節點）", copies(), {
        pointers: opt.copy !== undefined ? { copy: c(opt.copy) } : {},
        marks: opt.cMarks ?? {},
      }),
      V.map("old_to_new", mapEntries(), { marks: opt.mMarks ?? {} }),
    ];

    t.push({
      line: [3, 4],
      note:
        "雜湊表 `old_to_new` 記錄「舊節點 → 它的分身」。先放一筆 `None → None`：之後遇到空的 `next` / `random`，查表會自然得到 `None`，不用特判。",
      views: views(n ? 0 : null),
    });

    // Pass 1
    for (let i = 0; i < n; i++) {
      created = i + 1;
      t.push({
        line: [5, 6],
        note:
          `第一趟：替 \`${head[i][0]}\` 建一個值相同的新節點，記進表裡。新節點的 \`next\`、\`random\` **先不接** —— ` +
          (i === 0 ? "因為它們要指向的分身可能還不存在。" : "這一趟只負責讓每個舊節點都有分身。"),
        views: views(i, {
          oMarks: { [o(i)]: "active" },
          cMarks: { [c(i)]: "good" },
          mMarks: { [oldName(i)]: "active" },
        }),
        vars: { 階段: "第一趟：建立節點" },
      });
    }

    t.push({
      line: [5, 8],
      note: n
        ? "`cur` 走到 `None`，第一趟結束：每個舊節點都查得到分身了，但分身之間還沒有任何連結。把 `cur` 拉回 `head`，開始第二趟。"
        : "空串列，沒有節點要複製。",
      views: views(n ? 0 : null),
      vars: { 階段: "第二趟：接上指標" },
    });

    // Pass 2
    for (let i = 0; i < n; i++) {
      const r = head[i][1];
      const nx = i + 1 < n ? i + 1 : null;
      t.push({
        line: 10,
        note: `第二趟：查表拿到 \`${head[i][0]}\` 的分身 \`copy\`。接下來「舊節點指向誰，分身就指向那個誰的分身」。`,
        views: views(i, {
          oMarks: { [o(i)]: "active" },
          cMarks: { [c(i)]: "active" },
          mMarks: { [oldName(i)]: "active" },
          copy: i,
        }),
        vars: { 階段: "第二趟：接上指標", "cur.next": oldName(nx), "cur.random": oldName(r) },
      });

      linked = i + 1;
      const oMarks: Record<string, Tone> = { [o(i)]: "active" };
      const cMarks: Record<string, Tone> = { [c(i)]: "active" };
      const mMarks: Record<string, Tone> = {};
      if (nx !== null) {
        oMarks[o(nx)] = "compare";
        cMarks[c(nx)] = "compare";
      }
      mMarks[oldName(nx)] = "compare";
      if (r !== null && r !== i) {
        oMarks[o(r)] = "alt";
        cMarks[c(r)] = "alt";
      }
      mMarks[oldName(r)] = "alt";
      const nextPart =
        nx === null
          ? "`cur.next` 是 `None`，查表得到 `None`"
          : `\`cur.next\` 是 ${oldName(nx)}，查表得到 ${newName(nx)}，接成 \`copy.next\``;
      const randPart =
        r === null
          ? "`cur.random` 是 `None`，`copy.random` 也是 `None`"
          : `\`cur.random\` 是 ${oldName(r)}${r === i ? "（它自己）" : ""}，查表得到 ${newName(r)}，接成 \`copy.random\``;
      t.push({
        line: [11, 12],
        note: `${nextPart}；${randPart}。`,
        views: views(i, { oMarks, cMarks, mMarks, copy: i }),
        vars: { 階段: "第二趟：接上指標", "cur.next": oldName(nx), "cur.random": oldName(r) },
      });
    }

    const all: Record<string, Tone> = {};
    for (let i = 0; i < n; i++) all[c(i)] = "good";
    t.push({
      line: 14,
      note:
        "複本的形狀和原串列一模一樣，而且每一條 `next`、`random` 都只在新節點之間。回傳 `head` 的分身 `old_to_new[head]`。",
      views: views(null, { cMarks: all, done: true }),
      result: py(head),
    });
    return t.frames;
  },
});
