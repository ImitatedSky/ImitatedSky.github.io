import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:     # 0 或 1 個節點：本來就排好了
            return head
        # 1. 快慢指標找中點，把串列切成兩半
        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        mid = slow.next
        slow.next = None
        # 2. 兩半各自排序
        left = self.sortList(head)
        right = self.sortList(mid)
        # 3. 合併兩條排好的串列
        dummy = tail = ListNode()
        while left and right:
            if left.val <= right.val:
                tail.next = left
                left = left.next
            else:
                tail.next = right
                right = right.next
            tail = tail.next
        tail.next = left or right         # 剩下的那一段整個接上
        return dummy.next`;

export default defineProblem<{ head: number[] }>({
  id: 148,
  summary:
    "給一條單向鏈結串列的頭節點，把它依節點值**由小到大排序**後回傳。\n\n進階要求：時間 O(n log n)。",
  examples: [
    { input: "head = [4,2,1,3]", output: "[1,2,3,4]" },
    { input: "head = [-1,5,3,4,0]", output: "[-1,0,3,4,5]" },
    { input: "head = []", output: "[]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 5 × 10⁴", "-10⁵ ≤ Node.val ≤ 10⁵"],
  idea:
    "鏈結串列不能用索引隨機存取，快速排序、堆積排序都不好做，但**合併排序**非常適合：「找中點切兩半」用快慢指標走一趟就好；「合併兩條排好的串列」只需要改 `next` 指標，不用額外的陣列。切到只剩一個節點就一定是排好的，再兩兩合併回來。",
  steps: [
    "空串列或只有一個節點：直接回傳。",
    "`slow` 一次走一步、`fast` 一次走兩步；`fast` 走到底時 `slow` 停在前半段的最後一個節點。",
    "`mid = slow.next`，再把 `slow.next` 設成 `None`，把串列**真的切斷**成兩條。",
    "遞迴排序左半 `head` 和右半 `mid`。",
    "用 `dummy` 節點合併：每次把 `left`、`right` 中較小的那個接到 `tail` 後面，最後把還有剩的那一條整段接上。",
  ],
  pitfalls: [
    "`fast` 要從 `head.next` 出發。如果從 `head` 出發，兩個節點時 `slow` 會停在第二個，切出來的左半永遠是整條 → 無窮遞迴。",
    "一定要 `slow.next = None` 切斷，否則左半邊還連著右半邊。",
    "合併時用 `<=` 才是穩定排序（相等時先拿左邊的）。",
  ],
  complexity: { time: "O(n log n)", space: "O(log n)（遞迴堆疊）" },
  code,
  starter: `class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[4,2,1,3]", input: { head: [4, 2, 1, 3] }, expected: "[1, 2, 3, 4]" },
    { label: "[-1,5,3,4,0]", input: { head: [-1, 5, 3, 4, 0] }, expected: "[-1, 0, 3, 4, 5]" },
    { label: "[1]", input: { head: [1] }, expected: "[1]" },
  ],
  trace({ head: input }) {
    const t = tracer();
    const n = input.length;
    // Node ids are the original indices. `order` is the left→right drawing order:
    // the sublist a call works on always occupies one contiguous block of it.
    const val = (id: string) => input[+id];
    const next: Record<string, string | null> = {};
    input.forEach((_, i) => (next[String(i)] = i + 1 < n ? String(i + 1) : null));
    const order = input.map((_, i) => String(i));
    const calls: string[] = [];

    const view = (
      a: number,
      b: number,
      pointers: Record<string, string | null> = {},
      tones: Record<string, Tone> = {},
    ) => {
      const marks: Record<string, Tone> = {};
      order.forEach((id, pos) => {
        if (pos < a || pos >= b) marks[id] = "muted";
      });
      return [
        V.list(
          "串列（灰色 = 這一層遞迴管不到的部分）",
          order.map<ListNodeSpec>((id) => ({ id, val: val(id), next: next[id] })),
          { pointers, marks: { ...marks, ...tones } },
        ),
        V.stack("呼叫堆疊", calls),
      ];
    };
    const vals = (ids: string[]) => py(ids.map(val));
    const tone = (ids: string[], tn: Tone) => Object.fromEntries(ids.map((id) => [id, tn]));

    if (n === 0) {
      t.push({ line: [3, 4], note: "空串列，直接回傳。", views: view(0, 0), result: "[]" });
      return t.frames;
    }

    t.push({
      line: 2,
      note: `用合併排序：把串列不斷對半切，切到每段只剩一個節點，再兩兩合併成排好的串列。`,
      views: view(0, n, { head: order[0] }),
      vars: { 節點數: n },
    });

    /** Sorts the sublist drawn at positions [a, b); returns the id of its new head */
    const sort = (a: number, b: number): string => {
      const head = order[a];
      const len = b - a;
      calls.push(`sortList(${vals(order.slice(a, b))})`);

      if (len === 1) {
        t.push({
          line: [3, 4],
          note: `這一段只有 \`${val(head)}\` 一個節點 —— 一個節點本來就是排好的，直接回傳。`,
          views: view(a, b, { head }, { [head]: "good" }),
          vars: { 長度: 1 },
        });
        calls.pop();
        return head;
      }

      // 1. find the middle
      let slow = a;
      let fast: number | null = a + 1; // positions in `order`; null = None
      const ptr = (p: number | null) => (p === null ? null : order[p]);
      t.push({
        line: [5, 6],
        note: `排序 \`${vals(order.slice(a, b))}\`。先找中點：\`slow\` 從 \`head\` 出發，\`fast\` 從 \`head.next\` 出發（多一步的起跑差，讓 \`slow\` 最後停在**前半段的尾巴**）。`,
        views: view(a, b, { slow: ptr(slow), fast: ptr(fast) }),
        vars: { 長度: len },
      });
      while (fast !== null && fast + 1 < b) {
        slow += 1;
        fast = fast + 2 < b ? fast + 2 : null;
        t.push({
          line: [7, 8, 9],
          note:
            `\`fast\` 後面還有節點，所以 \`slow\` 走一步到 \`${val(order[slow])}\`，\`fast\` 走兩步` +
            (fast === null ? "，走出串列變成 `None`。" : `到 \`${val(order[fast])}\`。`),
          views: view(a, b, { slow: ptr(slow), fast: ptr(fast) }),
          vars: { 長度: len },
        });
      }
      const m = slow + 1; // position where the right half starts
      next[order[slow]] = null;
      const leftIds = order.slice(a, m);
      const rightIds = order.slice(m, b);
      t.push({
        line: [7, 10, 11],
        note:
          (fast === null ? "`fast` 已經是 `None`" : `\`fast\` 站在最後一個節點（\`fast.next\` 是 \`None\`）`) +
          `，迴圈結束，\`slow\` 停在 \`${val(order[slow])}\`。\`mid = slow.next\` 是右半的開頭，再把 \`slow.next\` 設成 \`None\` ` +
          `**切斷**：左半 \`${vals(leftIds)}\`、右半 \`${vals(rightIds)}\`。`,
        views: view(
          a,
          b,
          { head, slow: order[slow], mid: order[m] },
          { ...tone(leftIds, "active"), ...tone(rightIds, "alt") },
        ),
        vars: { 長度: len, 左半: leftIds.length, 右半: rightIds.length },
      });

      // 2. sort both halves
      sort(a, m);
      sort(m, b);

      // 3. merge
      const L = order.slice(a, m);
      const R = order.slice(m, b);
      const merged: string[] = [];
      let i = 0;
      let j = 0;
      const layout = () => {
        order.splice(a, len, ...merged, ...L.slice(i), ...R.slice(j));
      };
      const mergeView = (picked?: string) =>
        view(
          a,
          b,
          {
            ...(merged.length ? { tail: merged[merged.length - 1] } : {}),
            left: L[i] ?? null,
            right: R[j] ?? null,
          },
          {
            ...tone(merged, "good"),
            ...tone(L.slice(i), "active"),
            ...tone(R.slice(j), "alt"),
            ...(picked ? { [picked]: "compare" as Tone } : {}),
          },
        );

      t.push({
        line: [13, 14, 16],
        note: `回到 \`${calls[calls.length - 1]}\`：兩半都排好了，\`left = ${vals(L)}\`、\`right = ${vals(R)}\`。建立 \`dummy\`（畫面上省略），\`tail\` 指著合併結果的尾巴，開始合併。`,
        views: mergeView(),
        vars: { left: val(L[0]), right: val(R[0]) },
      });

      while (i < L.length && j < R.length) {
        const lv = val(L[i]);
        const rv = val(R[j]);
        const takeLeft = lv <= rv;
        const picked = takeLeft ? L[i] : R[j];
        if (merged.length) next[merged[merged.length - 1]] = picked;
        merged.push(picked);
        if (takeLeft) i++;
        else j++;
        layout();
        t.push({
          line: takeLeft ? [17, 18, 19, 20, 24] : [17, 18, 21, 22, 23, 24],
          note: takeLeft
            ? `比較兩條的開頭：\`${lv} <= ${rv}\`，\`left\` 的 \`${lv}\` 比較小（或相等），把它接到 \`tail\` 後面，\`left\` 往前一格。`
            : `比較兩條的開頭：\`${lv} > ${rv}\`，\`right\` 的 \`${rv}\` 比較小，把它接到 \`tail\` 後面，\`right\` 往前一格。`,
          views: mergeView(picked),
          vars: { "left.val": lv, "right.val": rv, 已合併: vals(merged) },
        });
      }

      const rest = i < L.length ? L.slice(i) : R.slice(j);
      const from = i < L.length ? "left" : "right";
      next[merged[merged.length - 1]] = rest[0];
      merged.push(...rest);
      i = L.length;
      j = R.length;
      layout();
      t.push({
        line: [17, 25, 26],
        note:
          `\`${from === "left" ? "right" : "left"}\` 用完了。\`${from}\` 剩下的 \`${vals(rest)}\` 本來就排好、而且都不小於已合併的部分，` +
          `所以**整段直接接上**，不用一個一個比。回傳 \`dummy.next\`：\`${vals(merged)}\`。`,
        views: view(a, b, { head: merged[0] }, tone(merged, "good")),
        vars: { 已合併: vals(merged) },
      });
      calls.pop();
      return merged[0];
    };
    sort(0, n);

    t.push({
      line: 26,
      note: `最外層的合併也完成了，整條串列由小到大排好。一共切了約 log₂(${n}) 層，每一層合併都只走過所有節點一次。`,
      views: view(0, n, { head: order[0] }, tone(order, "good")),
      vars: { 節點數: n },
      result: py(order.map(val)),
    });
    return t.frames;
  },
});
