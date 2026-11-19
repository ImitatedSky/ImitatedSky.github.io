import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {")": "(", "]": "[", "}": "{"}  # 右括號 -> 對應的左括號
        stack = []
        for c in s:
            if c in pairs:  # 右括號：必須和堆疊頂端配成一對
                if not stack or stack.pop() != pairs[c]:
                    return False
            else:  # 左括號：先放著，等它的右括號出現
                stack.append(c)
        return not stack`;

const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

export default defineProblem<{ s: string }>({
  id: 20,
  summary:
    "給一個只由 `(`、`)`、`[`、`]`、`{`、`}` 組成的字串，判斷括號是否**合法**。\n\n合法的意思是：每個左括號都有同類型的右括號把它關起來，而且關閉的順序正確 —— 後開的要先關，不能交錯。",
  summaryEn:
    "You get a string made only of `(`, `)`, `[`, `]`, `{` and `}`. Decide whether the brackets are **valid**.\n\nValid means every opening bracket is closed by a bracket of the same type, and they close in the right order: the one opened last must be closed first, with no interleaving.",
  examples: [
    { input: 's = "()[]{}"', output: "true" },
    { input: 's = "(]"', output: "false" },
    { input: 's = "([)]"', output: "false", note: "括號交錯", noteEn: "the brackets interleave" },
    { input: 's = "{[]}"', output: "true" },
  ],
  constraints: ["1 ≤ s.length ≤ 10⁴"],
  constraintsEn: ["1 ≤ s.length ≤ 10⁴"],
  idea:
    "括號是巢狀的：**最後打開的一定要最先關上**，這正是堆疊「後進先出」的行為。遇到左括號就 push；遇到右括號，它唯一能配對的對象就是堆疊頂端那個還沒關的左括號。",
  steps: [
    "建立 `pairs`：右括號 → 它需要的左括號。",
    "走訪每個字元：左括號直接 push 進堆疊。",
    "右括號：若堆疊是空的（沒有人可以配），或 pop 出來的不是它需要的左括號，回傳 `False`。",
    "全部走完後，堆疊必須是空的 —— 還有東西代表有左括號沒被關上。",
  ],
  pitfalls: [
    "遇到右括號時要先確認**堆疊不是空的**再 pop，否則 `\")\"` 這種輸入會直接出錯。",
    "最後要回傳 `not stack` 而不是 `True`：`\"((\"` 走完迴圈都沒出事，但它不合法。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def isValid(self, s: str) -> bool:
        `,
  presets: [
    { label: '"{[()]}()"', input: { s: "{[()]}()" }, expected: "True" },
    { label: '"([)]"', input: { s: "([)]" }, expected: "False" },
    { label: '"(()"', input: { s: "(()" }, expected: "False" },
  ],
  trace({ s }) {
    const t = tracer();
    const stack: number[] = []; // 存索引，畫圖時再換成字元
    const settled: Record<number, Tone> = {};

    const views = (i: number | null, extra: Record<number, Tone> = {}, top?: Tone) => {
      const marks: Record<number, Tone> = { ...settled };
      stack.forEach((idx) => (marks[idx] = "alt")); // 還在等右括號的左括號
      return [
        V.chars("s", s, { pointers: i !== null ? { i } : {}, marks: { ...marks, ...extra } }),
        V.stack(
          "stack（還沒被關上的左括號）",
          stack.map((idx) => s[idx]),
          { marks: top && stack.length ? { [stack.length - 1]: top } : {} },
        ),
      ];
    };

    t.push({
      line: [3, 4],
      note: "`pairs` 記下每種右括號需要哪一種左括號。再準備一個空堆疊，用來放「已經打開、還沒關上」的左括號。",
      views: views(null),
    });

    for (let i = 0; i < s.length; i++) {
      const c = s[i];

      if (!(c in PAIRS)) {
        stack.push(i);
        t.push({
          line: [5, 6, 9, 10],
          note: `\`${c}\` 是左括號，現在還不知道它會不會被正確關上，先 push 進堆疊等待。它是目前**最後打開**的，所以必須最先被關。`,
          views: views(i, { [i]: "active" }, "active"),
          vars: { c },
        });
        continue;
      }

      const need = PAIRS[c];
      if (stack.length === 0) {
        t.push({
          line: [5, 6, 7, 8],
          note: `\`${c}\` 是右括號，需要一個 \`${need}\` 來配，但堆疊是**空的** —— 前面沒有任何還沒關的左括號，不合法。`,
          views: views(i, { [i]: "bad" }),
          vars: { c, "pairs[c]": need },
          result: py(false),
        });
        return t.frames;
      }

      const topIdx = stack[stack.length - 1];
      t.push({
        line: [5, 6, 7],
        note: `\`${c}\` 是右括號，它要關的只能是**最近打開、還沒關**的那個，也就是堆疊頂端的 \`${s[topIdx]}\`。它需要的是 \`${need}\`。`,
        views: views(i, { [i]: "active", [topIdx]: "compare" }, "compare"),
        vars: { c, "pairs[c]": need, 頂端: s[topIdx] },
      });

      stack.pop();
      if (s[topIdx] !== need) {
        t.push({
          line: [7, 8],
          note: `pop 出來的是 \`${s[topIdx]}\`，不是 \`${need}\`。\`${s[topIdx]}\` 還沒關就先遇到 \`${c}\`，括號交錯了，不合法。`,
          views: views(i, { [i]: "bad", [topIdx]: "bad" }),
          vars: { c, "pairs[c]": need, 彈出: s[topIdx] },
          result: py(false),
        });
        return t.frames;
      }

      settled[topIdx] = "good";
      settled[i] = "good";
      t.push({
        line: 7,
        note:
          `pop 出來的正是 \`${need}\`，和 \`${c}\` 配成一對，這兩個括號處理完畢。` +
          (stack.length ? `堆疊頂端換成更早打開的 \`${s[stack[stack.length - 1]]}\`。` : "堆疊清空了。"),
        views: views(i),
        vars: { c, "pairs[c]": need, 彈出: s[topIdx] },
      });
    }

    if (stack.length === 0) {
      t.push({
        line: 11,
        note: "字串走完，而且堆疊是空的：每個左括號都被正確關上了，回傳 `True`。",
        views: views(null),
        result: py(true),
      });
    } else {
      const left: Record<number, Tone> = {};
      stack.forEach((idx) => (left[idx] = "bad"));
      t.push({
        line: 11,
        note: `字串走完了，但堆疊裡還剩 ${stack.length} 個左括號沒有人關，\`not stack\` 是 \`False\`。`,
        views: [
          V.chars("s", s, { marks: { ...settled, ...left } }),
          V.stack(
            "stack（還沒被關上的左括號）",
            stack.map((idx) => s[idx]),
            { marks: Object.fromEntries(stack.map((_, k) => [k, "bad" as Tone])) },
          ),
        ],
        result: py(false),
      });
    }
    return t.frames;
  },
});
