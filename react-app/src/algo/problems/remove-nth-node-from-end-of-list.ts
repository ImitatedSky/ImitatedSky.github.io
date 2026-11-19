import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        slow = fast = dummy
        for _ in range(n):          # fast 先走 n 步，拉開距離
            fast = fast.next
        while fast.next:            # 一起走到 fast 停在最後一個節點
            slow = slow.next
            fast = fast.next
        slow.next = slow.next.next  # slow 的下一個就是倒數第 n 個
        return dummy.next`;

export default defineProblem<{ head: number[]; n: number }>({
  id: 19,
  summary:
    "給一條鏈結串列的頭節點，把**從尾巴數回來的第 n 個節點**刪掉，回傳刪除後的串列。\n\n題目保證 `n` 不會超過節點數。希望只走訪一趟就完成。",
  summaryEn:
    "Given the head of a linked list, delete the **n-th node counting from the end** and return the resulting list.\n\n`n` is guaranteed not to exceed the number of nodes. Ideally, do it in a single pass.",
  examples: [
    { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
    { input: "head = [1], n = 1", output: "[]" },
    { input: "head = [1,2], n = 1", output: "[1]" },
  ],
  constraints: ["1 ≤ 節點數 ≤ 30", "1 ≤ n ≤ 節點數", "進階：只走訪一趟"],
  constraintsEn: ["1 ≤ number of nodes ≤ 30", "1 ≤ n ≤ number of nodes", "Follow-up: do it in one pass"],
  idea:
    "單向串列沒辦法從尾巴往回數，但可以用兩個指標**維持固定的間距**：讓 `fast` 先走 `n` 步，之後 `slow`、`fast` 一起走。當 `fast` 停在最後一個節點時，落後 `n` 步的 `slow` 剛好停在目標的**前一個**節點，改一條 `next` 就能把目標跳過。",
  steps: [
    "在 head 前面接一個 `dummy`，`slow`、`fast` 都從 `dummy` 出發。",
    "`fast` 先走 `n` 步，兩個指標之間隔了 `n` 個節點的距離。",
    "兩個指標一起往前，直到 `fast.next` 是 `None`（`fast` 在最後一個節點）。",
    "此時 `slow.next` 就是倒數第 `n` 個節點：`slow.next = slow.next.next` 把它跳過。",
    "回傳 `dummy.next`。",
  ],
  pitfalls: [
    "刪除節點需要的是它的**前一個**節點，所以兩個指標要從 `dummy` 出發，而不是從 `head`。",
    "要刪的剛好是頭節點時（`n` 等於長度），沒有 `dummy` 就得特判；有了 `dummy`，`slow` 會停在 `dummy` 上，寫法完全一樣。",
    "回傳 `dummy.next` 而不是 `head` —— `head` 可能就是被刪掉的那個。",
  ],
  complexity: { time: "O(L)，L 為串列長度，只走訪一趟", space: "O(1)" },
  code,
  starter: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[1,2,3,4,5], n = 2", input: { head: [1, 2, 3, 4, 5], n: 2 }, expected: "[1, 2, 3, 5]" },
    { label: "[1,2,3], n = 3（刪頭）", input: { head: [1, 2, 3], n: 3 }, expected: "[2, 3]" },
    { label: "[7], n = 1", input: { head: [7], n: 1 }, expected: "[]" },
  ],
  trace({ head, n }) {
    const t = tracer();
    const ids = ["d", ...head.map((_, i) => String(i))];
    const val: Record<string, number | string> = { d: "D" };
    head.forEach((v, i) => (val[String(i)] = v));
    const next: Record<string, string | null> = {};
    ids.forEach((id, i) => (next[id] = ids[i + 1] ?? null));
    let shown = [...ids]; // drawing order; the removed node stays visible for one frame

    const view = (pointers: Record<string, string | null>, marks: Record<string, Tone> = {}) =>
      V.list(
        "串列（D = dummy）",
        shown.map<ListNodeSpec>((id) => ({ id, val: val[id], next: next[id] })),
        { pointers, marks },
      );

    let slow = "d";
    let fast = "d";
    t.push({
      line: [3, 4],
      note:
        "接上 `dummy`，`slow`、`fast` 都從 `dummy` 出發。要刪一個節點得站在它的**前一格**；從 `dummy` 起跑，就算要刪的是頭節點也有「前一格」可站。",
      views: [view({ slow, fast })],
      vars: { n, 間距: 0 },
    });

    for (let s = 1; s <= n; s++) {
      fast = next[fast]!;
      t.push({
        line: [5, 6],
        note:
          s < n
            ? `\`fast\` 先單獨走第 ${s} / ${n} 步，把兩個指標的距離拉開。`
            : `\`fast\` 走完 ${n} 步。現在 \`fast\` 領先 \`slow\` 剛好 ${n} 步，之後兩個一起走，這個間距就不會變。`,
        views: [view({ slow, fast }, { [fast]: "alt" })],
        vars: { n, 間距: s },
      });
    }

    while (next[fast] !== null) {
      slow = next[slow]!;
      fast = next[fast]!;
      t.push({
        line: [7, 8, 9],
        note: `\`fast\` 後面還有節點，兩個指標各走一步，間距維持 ${n}。`,
        views: [view({ slow, fast }, { [slow]: "active", [fast]: "alt" })],
        vars: { n, 間距: n },
      });
    }

    const target = next[slow]!;
    t.push({
      line: 7,
      note: `\`fast.next\` 是 \`None\`，\`fast\` 站在最後一個節點。\`slow\` 落後 ${n} 步，所以它的下一個 \`${val[target]}\` 正是**倒數第 ${n} 個**節點。`,
      views: [view({ slow, fast }, { [slow]: "active", [fast]: "alt", [target]: "bad" })],
      vars: { n, 間距: n },
    });

    next[slow] = next[target];
    t.push({
      line: 10,
      note:
        `\`slow.next = slow.next.next\`：\`slow\` 直接指向 \`${val[target]}\` 的下一個` +
        (next[target] === null ? "（`None`）" : `（\`${val[next[target]!]}\`）`) +
        `，從 \`dummy\` 出發再也走不到 \`${val[target]}\`，它就等於被刪掉了。`,
      views: [view({ slow, fast }, { [slow]: "active", [target]: "muted" })],
      vars: { n },
    });

    shown = shown.filter((id) => id !== target);
    const out: number[] = [];
    const marks: Record<string, Tone> = {};
    for (let id = next["d"]; id; id = next[id]) {
      out.push(val[id] as number);
      marks[id] = "good";
    }
    t.push({
      line: 11,
      note:
        target === "0"
          ? "回傳 `dummy.next`。被刪的剛好是原本的頭節點，所以不能回傳 `head` —— 這就是 `dummy` 的用處。"
          : "回傳 `dummy.next`，整個過程只走訪了一趟。",
      views: [view({}, marks)],
      vars: { n },
      result: py(out),
    });
    return t.frames;
  },
});
