import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = cur = ListNode()
        carry = 0
        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next
            carry, digit = divmod(total, 10)
            cur.next = ListNode(digit)
            cur = cur.next
        return dummy.next`;

export default defineProblem<{ l1: number[]; l2: number[] }>({
  id: 2,
  summary:
    "兩條鏈結串列各代表一個非負整數，每個節點存一位數字，而且是**倒著存**的（頭節點是個位數）。把這兩個數相加，用同樣的格式回傳和。\n\n除了數字 0 本身以外，兩個數都不會有多餘的前導零。",
  examples: [
    { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", note: "342 + 465 = 807" },
    { input: "l1 = [0], l2 = [0]", output: "[0]" },
    { input: "l1 = [9,9,9,9], l2 = [9,9]", output: "[8,9,0,0,1]", note: "9999 + 99 = 10098" },
  ],
  constraints: ["每條串列有 1 ~ 100 個節點", "0 ≤ Node.val ≤ 9"],
  idea:
    "數字倒著存反而是好事：直式加法本來就是**從個位數開始、由低位往高位加**，剛好就是從頭節點往後走。每一位算 `l1 的數字 + l2 的數字 + 進位`，個位數寫進新節點，十位數留給下一位當進位。",
  steps: [
    "建一個 `dummy` 節點當結果串列的起點，`cur` 指著結果的尾巴；`carry = 0`。",
    "只要 `l1`、`l2` 還有節點，**或是還有進位沒處理**，就繼續算下一位。",
    "`total = carry` 加上還存在的那幾條串列的當前數字，加完就把該串列往後移一格。",
    "`divmod(total, 10)` 拆出新的進位 `carry` 和這一位的數字 `digit`，把 `digit` 接到結果尾巴。",
    "回傳 `dummy.next`。",
  ],
  pitfalls: [
    "迴圈條件別漏了 `or carry`：兩條串列都走完時如果還有進位（例如 5 + 5），要再多補一個節點。",
    "兩條串列長度可能不同，取值前要先確認該串列還有節點；走完的那條當作 0。",
  ],
  complexity: { time: "O(max(m, n))", space: "O(1)（不含回傳的串列）" },
  code,
  starter: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[2,4,3] + [5,6,4]", input: { l1: [2, 4, 3], l2: [5, 6, 4] }, expected: "[7, 0, 8]" },
    { label: "[9,9,9,9] + [9,9]", input: { l1: [9, 9, 9, 9], l2: [9, 9] }, expected: "[8, 9, 0, 0, 1]" },
    { label: "[5] + [5]", input: { l1: [5], l2: [5] }, expected: "[0, 1]" },
  ],
  trace({ l1: a, l2: b }) {
    const t = tracer();
    const out: number[] = [];
    const num = (xs: number[]) => [...xs].reverse().join("");

    const inputView = (name: string, xs: number[], i: number, tone?: Tone) =>
      V.list(`${name}（代表 ${num(xs)}）`, xs, {
        pointers: { [name]: i < xs.length ? String(i) : null },
        marks: {
          ...Object.fromEntries(xs.slice(0, i).map((_, k) => [String(k), "visited" as Tone])),
          ...(tone && i < xs.length ? { [String(i)]: tone } : {}),
        },
      });
    const resultView = (fresh = false, done = false) => {
      const nodes: ListNodeSpec[] = [{ id: "d", val: "D" }, ...out.map((v, k) => ({ id: `r${k}`, val: v }))];
      const marks: Record<string, Tone> = {};
      if (done) out.forEach((_, k) => (marks[`r${k}`] = "good"));
      else if (fresh && out.length) marks[`r${out.length - 1}`] = "good";
      return V.list("結果（D = dummy）", nodes, {
        pointers: done ? {} : { cur: out.length ? `r${out.length - 1}` : "d" },
        marks,
      });
    };

    let i = 0;
    let j = 0;
    let carry = 0;

    t.push({
      line: [3, 4],
      note:
        "頭節點是**個位數**，所以從頭開始加就等於直式加法從最右邊那一位開始。`dummy` 是結果串列的假頭，`cur` 永遠指著結果的尾巴；一開始沒有進位。",
      views: [inputView("l1", a, i), inputView("l2", b, j), resultView()],
      vars: { carry },
    });

    while (i < a.length || j < b.length || carry) {
      const hasA = i < a.length;
      const hasB = j < b.length;
      const total = carry + (hasA ? a[i] : 0) + (hasB ? b[j] : 0);
      const terms = [hasA ? `${a[i]}` : null, hasB ? `${b[j]}` : null, `${carry}（進位）`].filter(Boolean).join(" + ");
      let how: string;
      if (hasA && hasB) how = `這一位：\`l1\` 的 \`${a[i]}\`、\`l2\` 的 \`${b[j]}\`，再加上前一位的進位 \`${carry}\`。`;
      else if (hasA) how = `\`l2\` 已經走完，當作 0；這一位只有 \`l1\` 的 \`${a[i]}\` 加上進位 \`${carry}\`。`;
      else if (hasB) how = `\`l1\` 已經走完，當作 0；這一位只有 \`l2\` 的 \`${b[j]}\` 加上進位 \`${carry}\`。`;
      else how = "兩條串列都走完了，但**還有進位** `1` 沒處理，所以迴圈還要再跑一輪。";
      t.push({
        line: [5, 6, ...(hasA ? [7, 8] : []), ...(hasB ? [10, 11] : [])],
        note: `${how}\`total = ${terms} = ${total}\`。`,
        views: [inputView("l1", a, i, "active"), inputView("l2", b, j, "active"), resultView()],
        vars: { carry, total },
      });

      if (hasA) i++;
      if (hasB) j++;
      const digit = total % 10;
      const prevCarry = carry;
      carry = Math.floor(total / 10);
      out.push(digit);
      t.push({
        line: [...(hasA ? [9] : []), ...(hasB ? [12] : []), 13, 14, 15],
        note:
          `\`divmod(${total}, 10)\` → 進位 \`${carry}\`、這一位寫 \`${digit}\`。把 \`${digit}\` 接到結果尾巴，\`cur\` 跟上。` +
          (carry
            ? `${total} 超過 9，多出來的十位數要**帶到下一位**。`
            : prevCarry
              ? "這次沒有再進位了。"
              : ""),
        views: [inputView("l1", a, i), inputView("l2", b, j), resultView(true)],
        vars: { carry, total, digit },
      });
    }

    t.push({
      line: 16,
      note: `\`l1\`、\`l2\` 都走完，進位也是 0。跳過 \`dummy\` 回傳結果：${num(a)} + ${num(b)} = **${num(out)}**（倒著存）。`,
      views: [inputView("l1", a, i), inputView("l2", b, j), resultView(false, true)],
      vars: { carry },
      result: py(out),
    });
    return t.frames;
  },
});
