import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next          # 烏龜走一步
            fast = fast.next.next     # 兔子走兩步
            if slow is fast:
                return True
        return False`;

export default defineProblem<{ head: number[]; pos: number }>({
  id: 141,
  summary:
    "給一條單向鏈結串列的頭節點，判斷它裡面**有沒有環**：也就是從某個節點出發，一直沿著 `next` 走，會不會又繞回走過的節點。\n\n輸入裡的 `pos` 只是用來描述測資（尾巴接回第 `pos` 個節點，`-1` 代表沒有環），函式本身拿不到它。",
  summaryEn:
    "Given the head of a singly linked list, decide whether it **contains a cycle**: if you keep following `next` from some node, do you ever come back to a node you already visited?\n\nThe `pos` in the input only describes the test case (the tail links back to node `pos`, and `-1` means no cycle); your function never sees it.",
  examples: [
    { input: "head = [3,2,0,-4], pos = 1", output: "true", note: "尾巴 -4 的 next 接回索引 1 的節點 2", noteEn: "the tail -4 links back to node 2 at index 1" },
    { input: "head = [1,2], pos = 0", output: "true" },
    { input: "head = [1], pos = -1", output: "false" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 10⁴", "pos 為 -1 或串列中的有效索引", "進階：只用 O(1) 額外空間"],
  constraintsEn: ["0 ≤ number of nodes ≤ 10⁴", "pos is -1 or a valid index in the list", "Follow-up: use only O(1) extra space"],
  idea:
    "**Floyd 龜兔賽跑**：`slow` 一次走一步、`fast` 一次走兩步。沒有環的話，`fast` 會先走到盡頭；有環的話，兩者遲早都會進到環裡，之後 `fast` 每一輪都比 `slow` 多追近一步，距離一定會縮到 0 —— 也就是相遇。",
  steps: [
    "`slow`、`fast` 都從 `head` 出發。",
    "只要 `fast` 和 `fast.next` 都還存在，就讓 `slow` 走一步、`fast` 走兩步。",
    "走完如果兩個指標指到**同一個節點**，代表有環，回傳 `True`。",
    "迴圈結束代表 `fast` 走到了盡頭，沒有環，回傳 `False`。",
  ],
  pitfalls: [
    "迴圈條件要同時檢查 `fast` 和 `fast.next`，否則 `fast.next.next` 會對 `None` 取屬性而出錯。",
    "比較的是**節點本身**（`is`），不是節點的值 —— 串列裡可以有重複的值。",
    "要先移動再比較：一開始兩個指標都在 `head`，先比的話會直接誤判成有環。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        `,
  presets: [
    { label: "[3,2,0,-4], pos = 1", input: { head: [3, 2, 0, -4], pos: 1 }, expected: "True" },
    { label: "[1,2,3,4,5,6,7], pos = 3", input: { head: [1, 2, 3, 4, 5, 6, 7], pos: 3 }, expected: "True" },
    { label: "[1,2,3,4,5], pos = -1", input: { head: [1, 2, 3, 4, 5], pos: -1 }, expected: "False" },
  ],
  trace({ head, pos }) {
    const t = tracer();
    const n = head.length;
    const id = (i: number) => String(i);
    // next[i] = index of the next node, or null
    const next = (i: number): number | null => (i + 1 < n ? i + 1 : pos >= 0 ? pos : null);
    const nodes: ListNodeSpec[] = head.map((v, i) => {
      const nx = next(i);
      return { id: id(i), val: v, next: nx === null ? null : id(nx) };
    });
    const label = pos >= 0 ? `串列（尾巴接回索引 ${pos}）` : "串列（沒有環）";
    const inCycle = (i: number) => pos >= 0 && i >= pos;
    const cycleLen = pos >= 0 ? n - pos : 0;

    const view = (slow: number | null, fast: number | null, meet = false) => {
      const marks: Record<string, Tone> = {};
      if (fast !== null) marks[id(fast)] = "alt";
      if (slow !== null) marks[id(slow)] = meet ? "good" : "active";
      return V.list(label, nodes, {
        marks,
        pointers: { slow: slow === null ? null : id(slow), fast: fast === null ? null : id(fast) },
      });
    };

    let slow: number | null = n ? 0 : null;
    let fast: number | null = n ? 0 : null;
    let round = 0;

    t.push({
      line: 3,
      note:
        "`slow`（烏龜）和 `fast`（兔子）都從 `head` 出發。我們沒辦法直接「看到」環，只能靠兩個速度不同的指標去試探。",
      views: [view(slow, fast)],
      vars: { 輪次: round },
    });

    while (fast !== null && next(fast) !== null) {
      round++;
      slow = next(slow!)!;
      fast = next(next(fast)!);
      const moved = view(slow, fast);
      const both = fast !== null && inCycle(slow) && inCycle(fast);
      const gap = both ? (((slow - fast!) % cycleLen) + cycleLen) % cycleLen : 0;

      if (slow === fast) {
        t.push({
          line: [5, 6],
          note: `第 ${round} 輪：\`slow\` 走一步、\`fast\` 走兩步，兩個指標落在同一個節點上。`,
          views: [moved],
          vars: { 輪次: round },
        });
        t.push({
          line: [7, 8],
          note:
            "`slow is fast` 成立！沒有環的串列裡，走得快的 `fast` 永遠在前面，不可能被 `slow` 碰到；能相遇就代表 `fast` 繞了一圈回來 —— **有環**。",
          views: [view(slow, fast, true)],
          vars: { 輪次: round },
          result: py(true),
        });
        return t.frames;
      }

      let why: string;
      if (fast === null) why = "`fast` 已經走出串列，等一下迴圈條件就會擋下來。";
      else if (both)
        why = `兩者都在環裡了：\`fast\` 還要再追 ${gap} 步才追上 \`slow\`，而且每一輪固定追近 1 步，所以一定追得到。`;
      else if (inCycle(fast)) why = "`fast` 已經進到環裡繞圈，`slow` 還在路上。";
      else why = "還沒相遇，繼續走。";
      t.push({
        line: [5, 6, 7],
        note: `第 ${round} 輪：\`slow\` 走一步到 \`${head[slow]}\`，\`fast\` 走兩步${fast === null ? "走到了 `None`" : `到 \`${head[fast]}\``}。${why}`,
        views: [moved],
        vars: both ? { 輪次: round, 還差幾步: gap } : { 輪次: round },
      });
    }

    t.push({
      line: 4,
      note:
        fast === null
          ? "`fast` 是 `None`，迴圈條件不成立。能走到盡頭，就代表這條串列有終點。"
          : `\`fast\` 停在 \`${head[fast]}\`，但 \`fast.next\` 是 \`None\`，沒辦法再走兩步了。前面有盡頭，就代表這條串列有終點。`,
      views: [view(slow, fast)],
      vars: { 輪次: round },
    });
    t.push({
      line: 9,
      note: "有終點的串列不可能有環，回傳 `False`。",
      views: [view(slow, fast)],
      vars: { 輪次: round },
      result: py(false),
    });
    return t.frames;
  },
});
