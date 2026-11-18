import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev = dummy
        for _ in range(left - 1):
            prev = prev.next
        cur = prev.next
        for _ in range(right - left):
            nxt = cur.next
            cur.next = nxt.next
            nxt.next = prev.next
            prev.next = nxt
        return dummy.next`;

export default defineProblem<{ head: number[]; left: number; right: number }>({
  id: 92,
  summary:
    "給一條單向鏈結串列的頭節點，以及兩個位置 `left ≤ right`（從 1 開始數）。把**第 left 個到第 right 個節點反轉**，回傳反轉後的串列。",
  examples: [
    { input: "head = [1,2,3,4,5], left = 2, right = 4", output: "[1,4,3,2,5]" },
    { input: "head = [5], left = 1, right = 1", output: "[5]" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 500", "1 ≤ left ≤ right ≤ 節點數"],
  idea:
    "**頭插法**：讓 `prev` 停在反轉區間的前一個節點，`cur` 是區間的第一個節點。每一輪把 `cur` 後面那個節點 `nxt` 拔出來，插到 `prev` 的正後方 —— 做 `right - left` 次，區間就反過來了。",
  steps: [
    "加一個 `dummy` 節點接在 head 前面，這樣 `left = 1` 時也不用特判。",
    "`prev` 從 `dummy` 往前走 `left - 1` 步，停在區間前一格；`cur = prev.next`。",
    "重複 `right - left` 次：`nxt = cur.next`，把 `nxt` 從原位拔掉（`cur.next = nxt.next`），再插到 `prev` 後面（`nxt.next = prev.next`、`prev.next = nxt`）。",
    "回傳 `dummy.next`。",
  ],
  pitfalls: [
    "三行指標重接的**順序不能換**：先接 `cur.next`，再接 `nxt.next`，最後才改 `prev.next`。",
    "`nxt.next` 要接到 `prev.next`（目前區間的最前面），不是接到 `cur`。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[1,2,3,4,5], 2, 4", input: { head: [1, 2, 3, 4, 5], left: 2, right: 4 }, expected: "[1, 4, 3, 2, 5]" },
    { label: "[1,2,3,4,5,6], 1, 6", input: { head: [1, 2, 3, 4, 5, 6], left: 1, right: 6 }, expected: "[6, 5, 4, 3, 2, 1]" },
    { label: "[3,5], 1, 2", input: { head: [3, 5], left: 1, right: 2 }, expected: "[5, 3]" },
  ],
  trace({ head, left, right }) {
    const t = tracer();
    // Simulate with an explicit `next` table. Node ids: "d" for dummy, "0".."n-1".
    const ids = ["d", ...head.map((_, i) => String(i))];
    const val: Record<string, number | string> = { d: "D" };
    head.forEach((v, i) => (val[String(i)] = v));
    const next: Record<string, string | null> = {};
    ids.forEach((id, i) => (next[id] = ids[i + 1] ?? null));

    // Draw nodes in their *current* chain order, so the reversal is visible
    const chain = () => {
      const order: string[] = [];
      for (let id: string | null = "d"; id; id = next[id]) order.push(id);
      return order.map<ListNodeSpec>((id) => ({ id, val: val[id], next: next[id] }));
    };
    const view = (pointers: Record<string, string | null>, marks: Record<string, Tone> = {}) =>
      V.list("串列（D = dummy）", chain(), { pointers, marks });

    t.push({
      line: [3, 4],
      note: `在 head 前面接上 \`dummy\`，\`prev\` 從 \`dummy\` 出發。要反轉第 ${left} ~ ${right} 個節點。`,
      views: [view({ prev: "d" })],
      vars: { left, right },
    });

    let prev = "d";
    for (let k = 0; k < left - 1; k++) {
      prev = next[prev]!;
      t.push({
        line: [5, 6],
        note: `\`prev\` 前進一步（第 ${k + 1} / ${left - 1} 步），目標是停在反轉區間的前一格。`,
        views: [view({ prev })],
        vars: { left, right },
      });
    }

    const cur = next[prev]!;
    t.push({
      line: 7,
      note: `\`cur = prev.next\`，它是區間的第一個節點 —— 反轉完會變成區間的**最後一個**。`,
      views: [view({ prev, cur }, { [cur]: "active" })],
      vars: { left, right },
    });

    for (let k = 0; k < right - left; k++) {
      const nxt = next[cur]!;
      t.push({
        line: 9,
        note: `第 ${k + 1} 輪：\`nxt = cur.next\`，這個節點要被搬到 \`prev\` 的正後方。`,
        views: [view({ prev, cur, nxt }, { [cur]: "active", [nxt]: "compare" })],
        vars: { left, right, 輪次: `${k + 1} / ${right - left}` },
      });
      next[cur] = next[nxt];
      next[nxt] = next[prev];
      next[prev] = nxt;
      t.push({
        line: [10, 11, 12],
        note: `把 \`nxt\` 拔出來插到 \`prev\` 後面：\`cur\` 跳過它、它指向原本的區間開頭、\`prev\` 指向它。`,
        views: [view({ prev, cur, nxt }, { [cur]: "active", [nxt]: "good" })],
        vars: { left, right, 輪次: `${k + 1} / ${right - left}` },
      });
    }

    const out: number[] = [];
    for (let id = next["d"]; id; id = next[id]) out.push(val[id] as number);
    const marks: Record<string, Tone> = {};
    chain()
      .slice(left, right + 1)
      .forEach((n) => (marks[n.id] = "good"));
    t.push({
      line: 13,
      note: "區間反轉完成，回傳 `dummy.next`。",
      views: [view({}, marks)],
      result: py(out),
    });
    return t.frames;
  },
});
