import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        small_dummy = small = ListNode()    # 收集 < x 的節點
        large_dummy = large = ListNode()    # 收集 >= x 的節點
        while head:
            if head.val < x:
                small.next = head
                small = small.next
            else:
                large.next = head
                large = large.next
            head = head.next
        large.next = None                   # 斷開尾巴，避免成環
        small.next = large_dummy.next       # small 鏈後面接上 large 鏈
        return small_dummy.next`;

export default defineProblem<{ head: number[]; x: number }>({
  id: 86,
  summary:
    "給一條鏈結串列和一個數值 `x`，重新排列節點，讓**所有小於 `x` 的節點都排在大於等於 `x` 的節點前面**。\n\n兩邊各自內部的先後順序必須和原本一樣（不是排序，只是分成兩堆）。",
  examples: [
    { input: "head = [1,4,3,2,5,2], x = 3", output: "[1,2,2,4,3,5]" },
    { input: "head = [2,1], x = 2", output: "[1,2]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 200", "-100 ≤ Node.val ≤ 100", "-200 ≤ x ≤ 200"],
  idea:
    "不要在原串列裡搬來搬去。準備**兩條新的鏈**：一條收 `< x` 的節點、一條收 `≥ x` 的節點，照原順序走訪，每個節點接到所屬那條鏈的尾巴。因為是依序接上的，各自的相對順序自然保留。最後把 small 鏈的尾巴接到 large 鏈的開頭。",
  steps: [
    "建立兩個假頭 `small_dummy`、`large_dummy`，`small`、`large` 分別指著兩條鏈的尾巴。",
    "走訪原串列：`head.val < x` 就接到 `small` 後面，否則接到 `large` 後面，接完該尾巴往前一格。",
    "走完後，`large.next = None` 把 large 鏈的尾巴斷乾淨。",
    "`small.next = large_dummy.next` 把兩條鏈接起來，回傳 `small_dummy.next`。",
  ],
  pitfalls: [
    "**一定要 `large.next = None`**：large 鏈的最後一個節點還留著它在原串列裡的 `next`，可能指向某個已經排進 small 鏈的節點，不斷開就會形成環。",
    "條件是 `< x` 與 `>= x`：等於 `x` 的節點屬於後半段。",
    "small 鏈可能是空的；有假頭的話 `small_dummy.next` 會自動變成 large 鏈的開頭，不必特判。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[1,4,3,2,5,2], x = 3", input: { head: [1, 4, 3, 2, 5, 2], x: 3 }, expected: "[1, 2, 2, 4, 3, 5]" },
    { label: "[6,5,1,7,2], x = 5", input: { head: [6, 5, 1, 7, 2], x: 5 }, expected: "[1, 2, 6, 5, 7]" },
    { label: "[4,3,5], x = 2（沒有比 x 小的）", input: { head: [4, 3, 5], x: 2 }, expected: "[4, 3, 5]" },
  ],
  trace({ head: vals, x }) {
    const t = tracer();
    const n = vals.length;
    const id = (i: number) => `n${i}`;
    const smallIds: number[] = [];
    const largeIds: number[] = [];
    const SMALL = `small 鏈（< ${x}，S = small_dummy）`;
    const LARGE = `large 鏈（≥ ${x}，L = large_dummy）`;

    const node = (i: number): ListNodeSpec => ({ id: id(i), val: vals[i] });
    const views = (i: number, marks: Record<string, Tone> = {}) => {
      const pick = (list: number[]) => Object.fromEntries(list.filter((k) => marks[id(k)]).map((k) => [id(k), marks[id(k)]]));
      const restIdx = vals.map((_, k) => k).slice(i);
      return [
        V.list("原串列（還沒分類的部分）", restIdx.map(node), {
          pointers: { head: i < n ? id(i) : null },
          marks: pick(restIdx),
        }),
        V.list(SMALL, [{ id: "S", val: "S" }, ...smallIds.map(node)], {
          pointers: { small: smallIds.length ? id(smallIds[smallIds.length - 1]) : "S" },
          marks: pick(smallIds),
        }),
        V.list(LARGE, [{ id: "L", val: "L" }, ...largeIds.map(node)], {
          pointers: { large: largeIds.length ? id(largeIds[largeIds.length - 1]) : "L" },
          marks: pick(largeIds),
        }),
      ];
    };

    t.push({
      line: [3, 4],
      note: `準備兩條空的鏈，各有一個假頭：一條收 \`< ${x}\` 的節點，一條收 \`≥ ${x}\` 的節點。\`small\`、\`large\` 永遠指著各自的尾巴。`,
      views: views(0),
      vars: { x },
    });

    for (let i = 0; i < n; i++) {
      const v = vals[i];
      const isSmall = v < x;
      t.push({
        line: [5, 6],
        note: isSmall
          ? `\`head\` 是 \`${v}\`，\`${v} < ${x}\`，屬於 small 鏈。`
          : `\`head\` 是 \`${v}\`，\`${v} < ${x}\` 不成立（${v === x ? "相等也算後半段" : "比較大"}），屬於 large 鏈。`,
        views: views(i, { [id(i)]: isSmall ? "active" : "alt" }),
        vars: { x, "head.val": v },
      });
      (isSmall ? smallIds : largeIds).push(i);
      t.push({
        line: isSmall ? [7, 8, 12] : [10, 11, 12],
        note: isSmall
          ? `把 \`${v}\` 接到 \`small\` 後面，\`small\` 前進到它；\`head\` 往下一個節點。接在尾巴，所以 small 鏈內的順序和原串列一致。`
          : `把 \`${v}\` 接到 \`large\` 後面，\`large\` 前進到它；\`head\` 往下一個節點。`,
        views: views(i + 1, { [id(i)]: isSmall ? "active" : "alt" }),
        vars: { x },
      });
    }

    // What the last large node still points at in the original list
    const lastLarge = largeIds.length ? largeIds[largeIds.length - 1] : -1;
    const stale = lastLarge >= 0 && lastLarge + 1 < n ? lastLarge + 1 : -1;
    t.push({
      line: 13,
      note:
        lastLarge < 0
          ? "原串列走完了。large 鏈是空的，`large` 就是假頭本身，`large.next = None` 沒有影響。"
          : stale >= 0
            ? `原串列走完了。注意 large 鏈的尾巴 \`${vals[lastLarge]}\` 還留著原本的 \`next\`，指向 \`${vals[stale]}\` —— 那個節點現在在 small 鏈裡！不設成 \`None\` 的話，接起來之後就會**繞成一個環**。`
            : `原串列走完了。large 鏈的尾巴 \`${vals[lastLarge]}\` 原本就是最後一個節點，\`next\` 已經是 \`None\`；但這行不能省，因為大多數輸入的尾巴並不乾淨。`,
      views: views(n, {
        ...(lastLarge >= 0 ? { [id(lastLarge)]: "active" as Tone } : {}),
        ...(stale >= 0 ? { [id(stale)]: "bad" as Tone } : {}),
      }),
      vars: { x },
    });

    // Joined: draw everything in the small chain's view
    const order = [...smallIds, ...largeIds];
    const joined = (done: boolean) => {
      const marks: Record<string, Tone> = {};
      smallIds.forEach((k) => (marks[id(k)] = done ? "good" : "active"));
      largeIds.forEach((k) => (marks[id(k)] = done ? "good" : "alt"));
      return [
        V.list("原串列（還沒分類的部分）", [], done ? {} : { pointers: { head: null } }),
        V.list(SMALL, [{ id: "S", val: "S" }, ...order.map(node)], {
          pointers: done ? {} : { small: smallIds.length ? id(smallIds[smallIds.length - 1]) : "S" },
          marks,
        }),
        V.list(LARGE, [{ id: "L", val: "L", next: null }], {}),
      ];
    };
    t.push({
      line: 14,
      note:
        (largeIds.length
          ? `\`small.next = large_dummy.next\`：small 鏈的尾巴接上 large 鏈的第一個真節點 \`${vals[largeIds[0]]}\`（跳過假頭 \`L\`）。`
          : "`large_dummy.next` 是 `None`，small 鏈後面什麼都不用接。") +
        (smallIds.length ? "" : "small 鏈是空的，所以是假頭 `S` 直接指向 large 鏈 —— 不需要特判。") +
        "兩條鏈現在合成一條了（畫在上面那一列）。",
      views: joined(false),
      vars: { x },
    });

    t.push({
      line: 15,
      note: `回傳 \`small_dummy.next\`：所有 \`< ${x}\` 的節點都在前面，\`≥ ${x}\` 的在後面，而且兩邊各自維持原本的先後順序。`,
      views: joined(true),
      vars: { x },
      result: py(order.map((k) => vals[k])),
    });
    return t.frames;
  },
});
