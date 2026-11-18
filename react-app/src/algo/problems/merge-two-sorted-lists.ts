import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next
        tail.next = list1 or list2    # 剩下的整段直接接上
        return dummy.next`;

export default defineProblem<{ list1: number[]; list2: number[] }>({
  id: 21,
  summary:
    "給兩條**已經由小到大排好**的鏈結串列，把它們合併成一條同樣排好序的串列並回傳頭節點。\n\n新串列要用原本兩條串列的節點重新串接而成，不是另外建立新節點。",
  examples: [
    { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
    { input: "list1 = [], list2 = []", output: "[]" },
    { input: "list1 = [], list2 = [0]", output: "[0]" },
  ],
  constraints: ["每條串列有 0 ~ 50 個節點", "兩條串列都是非遞減排序"],
  idea:
    "兩條串列都排好序，所以**整體最小的節點一定是其中一條的頭**。每次只要比兩個頭、把小的那個摘下來接到結果尾巴，再重複同樣的事。其中一條用完時，另一條剩下的部分本來就有序，整段接上去即可。",
  steps: [
    "建一個 `dummy` 假頭，`tail` 指著合併結果的尾巴。",
    "兩條都還有節點時，比較 `list1.val` 和 `list2.val`，把較小的節點接到 `tail.next`，該串列的指標往後移。",
    "`tail` 前進到剛接上的節點。",
    "有一條用完後，把另一條剩下的整段接到 `tail.next`，回傳 `dummy.next`。",
  ],
  pitfalls: [
    "用 `dummy` 假頭就不必特判「結果的第一個節點是誰」。",
    "別忘了迴圈結束後接上剩下的那一段；它不需要逐個節點處理，一行就接完。",
    "用 `<=` 而不是 `<`：值相等時先拿 `list1` 的，合併才是穩定的。",
  ],
  complexity: { time: "O(m + n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[1,2,4] + [1,3,4]", input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expected: "[1, 1, 2, 3, 4, 4]" },
    { label: "[2,5,6,8,9] + [1,3]", input: { list1: [2, 5, 6, 8, 9], list2: [1, 3] }, expected: "[1, 2, 3, 5, 6, 8, 9]" },
    { label: "[] + [0,7]", input: { list1: [], list2: [0, 7] }, expected: "[0, 7]" },
  ],
  trace({ list1: a, list2: b }) {
    const t = tracer();
    // Node ids: a0.. / b0.. ; `merged` holds the ids already linked behind dummy, in order
    const val = (id: string) => (id[0] === "a" ? a : b)[+id.slice(1)];
    const merged: string[] = [];
    let i = 0;
    let j = 0;

    const rest = (name: "list1" | "list2", xs: number[], from: number, tone?: Tone) => {
      const p = name === "list1" ? "a" : "b";
      const nodes: ListNodeSpec[] = xs.slice(from).map((v, k) => ({ id: `${p}${from + k}`, val: v }));
      return V.list(`${name}（還沒合併的部分）`, nodes, {
        pointers: { [name]: from < xs.length ? `${p}${from}` : null },
        marks: tone && from < xs.length ? { [`${p}${from}`]: tone } : {},
      });
    };
    const mergedView = (marks: Record<string, Tone> = {}, showTail = true) =>
      V.list("合併結果（D = dummy）", [{ id: "d", val: "D" }, ...merged.map((id) => ({ id, val: val(id) }))], {
        pointers: showTail ? { tail: merged.length ? merged[merged.length - 1] : "d" } : {},
        marks,
      });

    t.push({
      line: 3,
      note:
        "`dummy` 是結果的假頭，`tail` 指著結果的尾巴。兩條串列各自有序，所以**目前最小的節點一定是某一條的頭** —— 每次只需要比這兩個頭。",
      views: [rest("list1", a, i), rest("list2", b, j), mergedView()],
    });

    while (i < a.length && j < b.length) {
      const x = a[i];
      const y = b[j];
      const takeA = x <= y;
      t.push({
        line: [4, 5],
        note: takeA
          ? `比較兩個頭：\`${x} <= ${y}\`，\`list1\` 的 \`${x}\` 是剩下所有節點裡最小的${x === y ? "（一樣大時先拿 `list1` 的）" : ""}。`
          : `比較兩個頭：\`${x} > ${y}\`，\`list2\` 的 \`${y}\` 是剩下所有節點裡最小的。`,
        views: [
          rest("list1", a, i, takeA ? "good" : "compare"),
          rest("list2", b, j, takeA ? "compare" : "good"),
          mergedView(),
        ],
        vars: { "list1.val": x, "list2.val": y },
      });

      const id = takeA ? `a${i}` : `b${j}`;
      if (takeA) i++;
      else j++;
      merged.push(id);
      t.push({
        line: takeA ? [6, 7, 11] : [9, 10, 11],
        note: `把 \`${val(id)}\` 接到 \`tail\` 後面，\`${takeA ? "list1" : "list2"}\` 往後移一格，\`tail\` 前進到新的尾巴。`,
        views: [rest("list1", a, i), rest("list2", b, j), mergedView({ [id]: "good" })],
      });
    }

    const restA = i < a.length;
    const restName = restA ? "list1" : "list2";
    const restIds = restA
      ? a.slice(i).map((_, k) => `a${i + k}`)
      : b.slice(j).map((_, k) => `b${j + k}`);
    const restMarks = Object.fromEntries(restIds.map((id) => [id, "alt" as Tone]));
    const emptied = restA ? "list2" : "list1";
    const restViews = (marks: Record<string, Tone> = {}) =>
      (["list1", "list2"] as const).map((name) => {
        const p = name === "list1" ? "a" : "b";
        const xs = name === "list1" ? a : b;
        const from = name === "list1" ? i : j;
        const nodes: ListNodeSpec[] = xs.slice(from).map((v, k) => ({ id: `${p}${from + k}`, val: v }));
        return V.list(`${name}（還沒合併的部分）`, nodes, {
          pointers: { [name]: nodes.length ? nodes[0].id : null },
          marks: nodes.length ? marks : {},
        });
      });
    t.push({
      line: 4,
      note: restIds.length
        ? `\`${emptied}\` 已經用完（\`None\`），迴圈結束。\`${restName}\` 剩下的節點本來就排好序${merged.length ? "，而且每一個都不小於 `tail`" : ""}。`
        : "兩條串列都沒有節點了，迴圈結束。",
      views: [...restViews(restMarks), mergedView()],
    });

    // The rest is now reachable from dummy: draw it in the merged chain.
    // `tail` does not move, and list1 / list2 still points at the first node of that rest.
    const tailId = merged.length ? merged[merged.length - 1] : "d";
    merged.push(...restIds);
    const finalView = (marks: Record<string, Tone>, withPointers: boolean) => [
      V.list("list1（還沒合併的部分）", [], restA || !withPointers ? {} : { pointers: { list1: null } }),
      V.list("list2（還沒合併的部分）", [], !restA || !withPointers ? {} : { pointers: { list2: null } }),
      V.list("合併結果（D = dummy）", [{ id: "d", val: "D" }, ...merged.map((id) => ({ id, val: val(id) }))], {
        pointers: withPointers
          ? { tail: tailId, ...(restIds.length ? { [restName]: restIds[0] } : {}) }
          : {},
        marks,
      }),
    ];
    t.push({
      line: 12,
      note: restIds.length
        ? `\`list1 or list2\` 會取到還沒用完的 \`${restName}\`，把 \`tail.next\` 指過去，**整段**就一次接上了 —— 不需要一個一個搬。`
        : "`list1 or list2` 是 `None`，`tail.next` 維持空的。",
      views: finalView(restMarks, true),
    });

    t.push({
      line: 13,
      note: "跳過 `dummy`，回傳 `dummy.next` 就是合併好的串列。",
      views: finalView(Object.fromEntries(merged.map((id) => [id, "good" as Tone])), false),
      result: py(merged.map(val)),
    });
    return t.frames;
  },
});
