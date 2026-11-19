import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []
        for tok in tokens:
            if tok not in "+-*/":
                stack.append(int(tok))
                continue
            b = stack.pop()  # 先 pop 出來的是「右邊」的運算元
            a = stack.pop()
            if tok == "+":
                stack.append(a + b)
            elif tok == "-":
                stack.append(a - b)
            elif tok == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))  # 向零截斷，不能用 //
        return stack[0]`;

const OP_LINES: Record<string, number[]> = { "+": [10, 11], "-": [12, 13], "*": [14, 15], "/": [16, 17] };
const SYMBOL: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

export default defineProblem<{ tokens: string[] }>({
  id: 150,
  summary:
    "給一個用**逆波蘭表示法**（後序表示法）寫成的算式 `tokens`，算出它的值。\n\n後序的意思是運算子寫在兩個運算元的**後面**，例如 `2 1 +` 就是 `2 + 1`。運算子只有 `+`、`-`、`*`、`/`，其中除法的結果要**往 0 的方向捨去**小數。保證算式合法、不會除以 0。",
  summaryEn:
    "You get an expression `tokens` written in **Reverse Polish Notation** (postfix). Compute its value.\n\nPostfix means each operator comes **after** its two operands, so `2 1 +` means `2 + 1`. The only operators are `+`, `-`, `*` and `/`, and division **truncates toward zero**. The expression is guaranteed to be valid and never divides by zero.",
  examples: [
    { input: 'tokens = ["2","1","+","3","*"]', output: "9", note: "(2 + 1) × 3", noteEn: "(2 + 1) × 3" },
    { input: 'tokens = ["4","13","5","/","+"]', output: "6", note: "4 + (13 ÷ 5)", noteEn: "4 + (13 ÷ 5)" },
    {
      input: 'tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]',
      output: "22",
    },
  ],
  constraints: ["1 ≤ tokens.length ≤ 10⁴", "每個 token 是運算子或 [-200, 200] 之間的整數"],
  constraintsEn: ["1 ≤ tokens.length ≤ 10⁴", "Each token is an operator or an integer in [-200, 200]"],
  idea:
    "後序表示法不需要括號，因為每個運算子作用的對象永遠是**它前面最近的兩個還沒被用掉的值**。「最近的」就是堆疊頂端：數字 push，遇到運算子就 pop 兩個出來計算，再把結果 push 回去當成新的運算元。",
  steps: [
    "準備空堆疊，由左到右讀每個 token。",
    "是數字：轉成整數後 push。",
    "是運算子：先 pop 出 `b`（右運算元），再 pop 出 `a`（左運算元），計算 `a 運算 b`，把結果 push 回去。",
    "讀完後堆疊只剩一個值，就是答案。",
  ],
  pitfalls: [
    "**順序**：先 pop 出來的是右邊的運算元。減法和除法寫成 `b - a`、`b / a` 就錯了。",
    "**除法要向零截斷**：Python 的 `//` 是向下取整，`-7 // 2` 會得到 `-4`；題目要的是 `-3`，所以用 `int(a / b)`。",
    "判斷是不是數字不能只看第一個字元是不是 `-`：`\"-11\"` 是數字、`\"-\"` 才是運算子。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        `,
  presets: [
    { label: '["2","1","+","3","*"]', input: { tokens: ["2", "1", "+", "3", "*"] }, expected: "9" },
    {
      label: '["4","-13","5","/","+"]（負數除法）',
      input: { tokens: ["4", "-13", "5", "/", "+"] },
      expected: "2",
    },
    {
      label: '["10","6","9","3","+","-11","*","/","*","17","+","5","+"]',
      input: { tokens: ["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"] },
      expected: "22",
    },
  ],
  trace({ tokens }) {
    const t = tracer();
    const stack: number[] = [];
    const done: Record<number, Tone> = {};

    const views = (i: number | null, cur?: Tone, stackMarks: Record<number, Tone> = {}) => [
      V.array("tokens", tokens, {
        pointers: i !== null ? { i } : {},
        marks: i !== null && cur ? { ...done, [i]: cur } : { ...done },
      }),
      V.stack("stack（還沒被用掉的運算元）", stack, { marks: stackMarks }),
    ];

    t.push({
      line: 3,
      note: "準備一個空堆疊，用來放「已經讀到、還在等運算子」的數值。",
      views: views(null),
    });

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      if (!["+", "-", "*", "/"].includes(tok)) {
        stack.push(Number(tok));
        done[i] = "visited";
        t.push({
          line: [4, 5, 6, 7],
          note: `\`${tok}\` 是數字。現在還不知道它要和誰運算，先 push 進堆疊等運算子出現。`,
          views: views(i, "active", { [stack.length - 1]: "active" }),
          vars: { tok },
        });
        continue;
      }

      const b = stack[stack.length - 1];
      const a = stack[stack.length - 2];
      t.push({
        line: [4, 5, 8, 9],
        note: `\`${tok}\` 是運算子，它的對象是堆疊最上面的兩個值。**先 pop 出來的是右邊**的運算元 \`b = ${b}\`，再 pop 出左邊的 \`a = ${a}\`。`,
        views: views(i, "active", { [stack.length - 1]: "compare", [stack.length - 2]: "alt" }),
        vars: { tok, a, b },
      });

      stack.pop();
      stack.pop();
      let res: number;
      let extra = "";
      if (tok === "+") res = a + b;
      else if (tok === "-") res = a - b;
      else if (tok === "*") res = a * b;
      else {
        res = Math.trunc(a / b);
        if (Object.is(res, -0)) res = 0;
        if (a % b !== 0) {
          const approx = Math.round((a / b) * 100) / 100;
          extra =
            a / b < 0
              ? `實際大約是 ${approx}，要**往 0 的方向**捨去得到 \`${res}\`。用 \`//\` 會往下取整變成 \`${Math.floor(a / b)}\`，就錯了。`
              : `實際大約是 ${approx}，捨去小數得到 \`${res}\`。`;
        }
      }
      stack.push(res);
      done[i] = "visited";
      t.push({
        line: OP_LINES[tok],
        note:
          `計算 \`${a} ${SYMBOL[tok]} ${b} = ${res}\`。` +
          extra +
          `把結果 push 回堆疊：這一小段算式已經濃縮成一個數，可以當作後面運算子的運算元。`,
        views: views(i, "good", { [stack.length - 1]: "good" }),
        vars: { tok, a, b, 結果: res },
      });
    }

    t.push({
      line: 18,
      note: `所有 token 讀完，堆疊只剩一個值 \`${stack[0]}\`，它就是整個算式的結果。`,
      views: views(null, undefined, { 0: "good" }),
      result: py(stack[0]),
    });
    return t.frames;
  },
});
