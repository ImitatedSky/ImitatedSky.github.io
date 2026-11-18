import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []  # min_stack[i] = stack[0..i] 之中的最小值

    def push(self, val: int) -> None:
        self.stack.append(val)
        self.min_stack.append(min(val, self.min_stack[-1]) if self.min_stack else val)

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]`;

type Op = "MinStack" | "push" | "pop" | "top" | "getMin";

const OPS = "操作 → 回傳值";
const MIN = "min_stack（每一層記「到這層為止的最小值」）";

export default defineProblem<{ ops: Op[]; args: (number | null)[] }>({
  id: 155,
  summary:
    "設計一個堆疊，除了一般的 `push`、`pop`、`top` 之外，還要支援 `getMin`：回傳目前堆疊中的**最小值**。\n\n四個操作都必須是 O(1)。輸入是一連串的操作，輸出是每個操作的回傳值（沒有回傳值的記為 `None`）。",
  examples: [
    {
      input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]',
      output: "[null,null,null,null,-3,null,0,-2]",
    },
  ],
  constraints: ["−2³¹ ≤ val ≤ 2³¹ − 1", "`pop`、`top`、`getMin` 只會在堆疊不為空時被呼叫", "最多 3 × 10⁴ 次操作"],
  idea:
    "只用一個變數記最小值不夠：最小值被 pop 掉之後，**「前一個最小值」是誰**就不知道了。因為堆疊只會從頂端增減，「堆疊高度為 i 時的最小值」永遠不會變 —— 所以用第二個堆疊 `min_stack` 同步記下每一層當下的最小值，兩個堆疊一起 push、一起 pop。",
  steps: [
    "`push(val)`：`stack` 放入 `val`；`min_stack` 放入 `min(val, 目前的最小值)`（若為空就放 `val`）。",
    "`pop()`：兩個堆疊各 pop 一次，保持高度一致。",
    "`top()`：回傳 `stack[-1]`。",
    "`getMin()`：回傳 `min_stack[-1]`，它就是目前所有元素的最小值。",
  ],
  pitfalls: [
    "`min_stack` 為空時不能取 `min_stack[-1]`，第一次 push 要特別處理。",
    "若想省空間改成「只有遇到新的最小值才 push 進 `min_stack`」，判斷要用 `<=` 而不是 `<`，否則重複的最小值 pop 一次就會遺失。",
  ],
  complexity: { time: "每個操作 O(1)", space: "O(n)" },
  code,
  starter: `class MinStack:
    def __init__(self):
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        pass

    def getMin(self) -> int:
        pass`,
  presets: [
    {
      label: "push -2, 0, -3 → getMin, pop, top, getMin",
      input: {
        ops: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
        args: [null, -2, 0, -3, null, null, null, null],
      },
      expected: "[None, None, None, None, -3, None, 0, -2]",
    },
    {
      label: "最小值重複：push 5, 3, 7, 3 再一路 pop",
      input: {
        ops: ["MinStack", "push", "push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin", "pop", "getMin"],
        args: [null, 5, 3, 7, 3, null, null, null, null, null, null, null],
      },
      expected: "[None, None, None, None, None, 3, None, 3, None, 3, None, 5]",
    },
    {
      label: "遞增：push 1, 2, 3 → getMin, top",
      input: {
        ops: ["MinStack", "push", "push", "push", "getMin", "top", "pop", "getMin"],
        args: [null, 1, 2, 3, null, null, null, null],
      },
      expected: "[None, None, None, None, 1, 3, None, 1]",
    },
  ],
  trace({ ops, args }) {
    const t = tracer();
    const stack: number[] = [];
    const minStack: number[] = [];
    const out: (number | null)[] = [];

    const name = (k: number) => `${k}. ${ops[k]}(${args[k] ?? ""})`;
    const opsView = (cur: number | null, curTone: Tone = "active") => {
      const entries: [Cell, Cell?][] = ops.map((_, k) =>
        k < out.length ? [name(k), out[k] === null ? "None" : out[k]] : [name(k)],
      );
      const marks: Record<string, Tone> = {};
      ops.forEach((_, k) => {
        if (k === cur) marks[name(k)] = curTone;
        else if (k >= out.length) marks[name(k)] = "muted";
      });
      return V.map(OPS, entries, { marks });
    };
    const views = (cur: number | null, sTop?: Tone, mTop?: Tone, curTone: Tone = "active") => [
      opsView(cur, curTone),
      V.stack("stack", stack, { marks: sTop && stack.length ? { [stack.length - 1]: sTop } : {} }),
      V.stack(MIN, minStack, { marks: mTop && minStack.length ? { [minStack.length - 1]: mTop } : {} }),
    ];

    for (let k = 0; k < ops.length; k++) {
      const op = ops[k];

      if (op === "MinStack") {
        out.push(null);
        t.push({
          line: [2, 3, 4],
          note: "建立兩個空堆疊：`stack` 放真正的資料；`min_stack` 和它**同高**，每一層記的是「堆疊堆到這一層時的最小值」。",
          views: views(k),
        });
      } else if (op === "push") {
        const val = args[k]!;
        stack.push(val);
        t.push({
          line: [6, 7],
          note: `\`push(${val})\`：先把 \`${val}\` 放進 \`stack\`。接著要決定 \`min_stack\` 這一層該記什麼。`,
          views: views(k, "active", minStack.length ? "compare" : undefined),
          vars: { val },
        });
        const prevMin = minStack.length ? minStack[minStack.length - 1] : null;
        const m = prevMin === null ? val : Math.min(val, prevMin);
        minStack.push(m);
        out.push(null);
        t.push({
          line: 8,
          note:
            prevMin === null
              ? `\`min_stack\` 是空的，\`${val}\` 是唯一的元素，當然就是最小值，直接記下 \`${val}\`。`
              : val <= prevMin
                ? `原本的最小值是 \`${prevMin}\`，新來的 \`${val}\` ${val < prevMin ? "更小" : "一樣小"}：\`min(${val}, ${prevMin}) = ${m}\`，這一層的最小值是 \`${m}\`。`
                : `原本的最小值是 \`${prevMin}\`，新來的 \`${val}\` 比較大：\`min(${val}, ${prevMin}) = ${m}\`，最小值沒變，但**還是要 push 一份** \`${m}\`，讓兩個堆疊保持同高。`,
          views: views(k, "active", "active"),
          vars: { val, 目前最小值: m },
        });
      } else if (op === "pop") {
        t.push({
          line: 10,
          note: `\`pop()\`：要移除 \`stack\` 頂端的 \`${stack[stack.length - 1]}\`。它對應的那一層最小值紀錄也跟著失效，兩邊要一起拿掉。`,
          views: views(k, "bad", "bad"),
        });
        stack.pop();
        minStack.pop();
        out.push(null);
        t.push({
          line: [11, 12],
          note: stack.length
            ? `兩個堆疊各 pop 一次。\`min_stack\` 的新頂端 \`${minStack[minStack.length - 1]}\` 正是剩下這 ${stack.length} 個元素的最小值 —— 完全不用重新掃描。`
            : "兩個堆疊各 pop 一次，現在都空了。",
          views: views(k, undefined, stack.length ? "compare" : undefined),
          vars: stack.length ? { 目前最小值: minStack[minStack.length - 1] } : {},
        });
      } else if (op === "top") {
        const v = stack[stack.length - 1];
        out.push(v);
        t.push({
          line: [14, 15],
          note: `\`top()\`：只看不拿，回傳 \`stack[-1] = ${v}\`。`,
          views: views(k, "good", undefined, "good"),
          vars: { 回傳: v },
        });
      } else {
        const v = minStack[minStack.length - 1];
        out.push(v);
        t.push({
          line: [17, 18],
          note: `\`getMin()\`：不用掃過整個 \`stack\`，\`min_stack\` 的頂端就是答案，回傳 \`${v}\`。O(1)。`,
          views: views(k, undefined, "good", "good"),
          vars: { 回傳: v },
        });
      }
    }

    t.push({
      note: "所有操作執行完畢。每個操作都只碰到堆疊頂端，所以全部是 O(1)；代價是多用一個同樣高度的 `min_stack`。",
      views: views(null),
      result: py(out),
    });
    return t.frames;
  },
});
