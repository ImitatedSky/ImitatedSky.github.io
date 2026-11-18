import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        n, tail = 1, head
        while tail.next:            # 找到尾巴，順便數長度
            tail = tail.next
            n += 1
        tail.next = head            # 頭尾相接，變成一個環
        for _ in range(n - k % n):  # 走到新的尾巴
            tail = tail.next
        head = tail.next            # 新尾巴的下一個就是新的頭
        tail.next = None            # 把環剪開
        return head`;

export default defineProblem<{ head: number[]; k: number }>({
  id: 61,
  summary:
    "給一條鏈結串列和非負整數 `k`，把串列**向右旋轉 k 次**：每旋轉一次，最後一個節點會被搬到最前面。回傳旋轉後的頭節點。\n\n`k` 可能比串列長度大很多。",
  examples: [
    { input: "head = [1,2,3,4,5], k = 2", output: "[4,5,1,2,3]" },
    { input: "head = [0,1,2], k = 4", output: "[2,0,1]", note: "長度 3，轉 4 次等於轉 1 次" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 500", "0 ≤ k ≤ 2 × 10⁹"],
  idea:
    "向右轉 `k` 次，其實就是把**最後 `k % n` 個節點整段搬到前面**。與其真的搬，不如先把尾巴接回頭變成一個環 —— 環上的相對順序完全沒變，只差「從哪裡剪開」。新的尾巴是原本的第 `n - k % n` 個節點，在它後面剪一刀就完成了。",
  steps: [
    "空串列或只有一個節點，怎麼轉都一樣，直接回傳。",
    "從 `head` 走到最後一個節點 `tail`，同時數出長度 `n`。",
    "`tail.next = head`，把串列接成環。",
    "從舊尾巴再走 `n - k % n` 步，就會停在**新的尾巴**。",
    "新的頭是 `tail.next`；再把 `tail.next` 設成 `None` 剪開環，回傳新的頭。",
  ],
  pitfalls: [
    "`k` 可能遠大於長度，一定要先 `k % n`，否則會白白繞很多圈（甚至超時）。",
    "要先記下新的頭 `tail.next`，**再**把 `tail.next` 設成 `None`，順序反了就找不到新的頭。",
    "`k % n == 0` 時走 `n` 步會剛好繞一整圈回到舊尾巴，結果就是原串列，不需要特判。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[1,2,3,4,5], k = 2", input: { head: [1, 2, 3, 4, 5], k: 2 }, expected: "[4, 5, 1, 2, 3]" },
    { label: "[0,1,2], k = 4", input: { head: [0, 1, 2], k: 4 }, expected: "[2, 0, 1]" },
    { label: "[1,2,3,4], k = 8（剛好繞回原樣）", input: { head: [1, 2, 3, 4], k: 8 }, expected: "[1, 2, 3, 4]" },
  ],
  trace({ head: vals, k }) {
    const t = tracer();
    const len = vals.length;
    const id = (i: number) => String(i);
    const next: (number | null)[] = vals.map((_, i) => (i + 1 < len ? i + 1 : null));
    let order = vals.map((_, i) => i); // drawing order
    const view = (pointers: Record<string, number | null>, marks: Record<number, Tone> = {}) =>
      V.list(
        "串列",
        order.map<ListNodeSpec>((i) => ({ id: id(i), val: vals[i], next: next[i] === null ? null : id(next[i]!) })),
        {
          pointers: Object.fromEntries(Object.entries(pointers).map(([name, i]) => [name, i === null ? null : id(i)])),
          marks: Object.fromEntries(Object.entries(marks).map(([i, tn]) => [id(+i), tn])),
        },
      );

    if (len <= 1) {
      t.push({
        line: [3, 4],
        note: len ? "只有一個節點，怎麼旋轉都一樣，直接回傳。" : "空串列，直接回傳。",
        views: [view(len ? { head: 0 } : {})],
        vars: { k },
        result: py(vals),
      });
      return t.frames;
    }

    let head = 0;
    let tail = 0;
    let n = 1;
    t.push({
      line: [3, 5],
      note: `串列至少有兩個節點，才需要旋轉。\`tail\` 從 \`head\` 出發去找最後一個節點，\`n\` 用來數長度（目前算了 1 個）。`,
      views: [view({ head, tail })],
      vars: { k, n },
    });

    while (next[tail] !== null) {
      tail = next[tail]!;
      n++;
      t.push({
        line: [6, 7, 8],
        note:
          next[tail] === null
            ? `\`tail\` 走到 \`${vals[tail]}\`，後面沒有節點了：它就是尾巴，長度 \`n = ${n}\`。`
            : `\`tail\` 往後走一步到 \`${vals[tail]}\`，\`n = ${n}\`。`,
        views: [view({ head, tail }, { [tail]: "active" })],
        vars: { k, n },
      });
    }

    const r = k % n;
    const stepsTotal = n - r;
    next[tail] = head;
    t.push({
      line: 9,
      note:
        "`tail.next = head`：尾巴接回頭，整條串列變成一個**環**（下方的弧線）。旋轉不會改變節點在環上的相對順序，只是換一個地方當開頭。",
      views: [view({ head, tail }, { [tail]: "active", [head]: "alt" })],
      vars: { k, n },
    });

    const newTail = (len - r - 1 + len) % len;
    const moved: Record<number, Tone> = {};
    for (let i = 0; i < r; i++) moved[len - 1 - i] = "compare";
    t.push({
      line: 10,
      note:
        (k >= n ? `\`k = ${k}\` 比長度大，每轉 ${n} 次就回到原樣，所以實際只需要轉 \`k % n = ${r}\` 次。` : `\`k % n = ${r}\`。`) +
        (r
          ? `向右轉 ${r} 次 = 最後 ${r} 個節點搬到前面，所以新的尾巴是 \`${vals[newTail]}\`：從舊尾巴沿著環再走 \`n - k % n = ${stepsTotal}\` 步就到。`
          : `等於不用轉；程式不特判，照樣走 \`n - 0 = ${stepsTotal}\` 步，會剛好繞一圈回到原地。`),
      views: [view({ head, tail }, moved)],
      vars: { k, n, "k % n": r, 要走幾步: stepsTotal },
    });

    for (let s = 1; s <= stepsTotal; s++) {
      const wrapped = tail === len - 1;
      tail = next[tail]!;
      t.push({
        line: [10, 11],
        note:
          `第 ${s} / ${stepsTotal} 步：\`tail\` 走到 \`${vals[tail]}\`` +
          (wrapped ? "（沿著剛接上的那條線，從尾巴繞回頭）" : "") +
          (s === stepsTotal ? "。走完了，這裡就是**新的尾巴**。" : "。"),
        views: [view({ head, tail }, { ...moved, [tail]: "active" })],
        vars: { k, n, "k % n": r, 要走幾步: stepsTotal },
      });
    }

    head = next[tail]!;
    t.push({
      line: 12,
      note: `新尾巴的下一個節點 \`${vals[head]}\` 就是新的頭，先用 \`head\` 把它記下來 —— 等一下剪斷之後就找不到它了。`,
      views: [view({ head, tail }, { [tail]: "active", [head]: "good" })],
      vars: { k, n, "k % n": r },
    });

    next[tail] = null;
    t.push({
      line: 13,
      note: `\`tail.next = None\`：在 \`${vals[tail]}\` 後面剪一刀，環又變回一條直線${r ? `，只是起點換成了 \`${vals[head]}\`` : "，而且剪開的位置就是原本的尾巴"}。`,
      views: [view({ head, tail }, { [tail]: "active", [head]: "good" })],
      vars: { k, n, "k % n": r },
    });

    order = [];
    for (let i: number | null = head; i !== null; i = next[i]) order.push(i);
    t.push({
      line: 14,
      note:
        (r
          ? `從新的 \`head\` 把串列拉直來看：原本最後 ${r} 個節點跑到了最前面，正是向右旋轉 ${k} 次的結果。`
          : "新的頭就是原本的頭，串列和一開始一模一樣。") + "回傳 `head`。",
      views: [view({ head }, Object.fromEntries(order.map((i) => [i, (!r || moved[i] ? "good" : "alt") as Tone])))],
      vars: { k, n },
      result: py(order.map((i) => vals[i])),
    });
    return t.frames;
  },
});
