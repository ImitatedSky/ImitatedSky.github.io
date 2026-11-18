import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def calculate(self, s: str) -> int:
        res, num, sign = 0, 0, 1
        stack = []
        for c in s:
            if c.isdigit():
                num = num * 10 + int(c)
            elif c in "+-":
                res += sign * num
                num = 0
                sign = 1 if c == "+" else -1
            elif c == "(":
                stack.append(res)
                stack.append(sign)
                res, sign = 0, 1
            elif c == ")":
                res += sign * num
                num = 0
                res *= stack.pop()  # 括號前的正負號
                res += stack.pop()  # 括號前累積的結果
        return res + sign * num`;

const STACK = "stack（進括號前存下的 res 與 sign）";
const signed = (x: number) => (x < 0 ? `(${x})` : String(x));
const signText = (x: number) => (x === 1 ? "+1" : "-1");

export default defineProblem<{ s: string }>({
  id: 224,
  summary:
    "給一個代表算式的字串 `s`，裡面只有數字、`+`、`-`、左右括號和空白，算出它的值。\n\n`-` 也可能當成負號使用（例如 `-1` 或 `-(2 + 3)`）。不可以使用 `eval` 這類直接把字串當程式執行的內建函式。",
  examples: [
    { input: 's = "1 + 1"', output: "2" },
    { input: 's = " 2-1 + 2 "', output: "3" },
    { input: 's = "(1+(4+5+2)-3)+(6+8)"', output: "23" },
  ],
  constraints: ["1 ≤ s.length ≤ 3 × 10⁵", "s 是合法的算式", "不會有連續兩個運算子；`+` 不會當成正號使用"],
  idea:
    "只有加減法，所以可以一路累加：用 `res` 記目前這一層的總和、`sign` 記下一個數字前面的正負號、`num` 累積正在讀的數字。遇到 `(` 就像**暫停外層、開一個全新的算式**：把外層的 `res` 和括號前的 `sign` 存進堆疊；遇到 `)` 再把括號內的結果乘上那個正負號、加回外層的進度。",
  steps: [
    "數字：`num = num * 10 + 這一位`，把多位數組起來。",
    "`+` / `-`：前一個數字讀完了，`res += sign * num`，然後 `num` 歸零、`sign` 換成新的正負號。",
    "`(`：把 `res`、`sign` 依序 push，再把 `res, sign` 重設成 `0, 1`，從頭計算括號內的部分。",
    "`)`：先把最後一個數字結算進 `res`；接著 pop 出正負號乘上去、再 pop 出外層的進度加上去。",
    "字串結束後還有最後一個數字沒結算，回傳 `res + sign * num`。",
  ],
  pitfalls: [
    "push 的順序是先 `res` 後 `sign`，所以 pop 時**先拿到 `sign`**（要乘）、再拿到 `res`（要加），順序反了答案就錯。",
    "遇到 `)` 和迴圈結束時，都要記得把最後一個還在 `num` 裡的數字結算掉。",
    "負號開頭（`-1`、`(-2)`）不用特判：此時 `num` 是 0，`res += sign * 0` 沒有影響，只會把 `sign` 設成 -1。",
  ],
  complexity: { time: "O(n)", space: "O(n)（括號的巢狀深度）" },
  code,
  starter: `class Solution:
    def calculate(self, s: str) -> int:
        `,
  presets: [
    { label: '"12-(3+4)+5"', input: { s: "12-(3+4)+5" }, expected: "10" },
    { label: '"(1+(4+5+2)-3)+(6+8)"', input: { s: "(1+(4+5+2)-3)+(6+8)" }, expected: "23" },
    { label: '"1 - (-2)"', input: { s: "1 - (-2)" }, expected: "3" },
  ],
  trace({ s }) {
    const t = tracer();
    let res = 0;
    let num = 0;
    let sign = 1;
    const stack: number[] = [];
    const open: number[] = []; // 還沒關上的 "(" 的索引（只用來上色）

    const vars = () => ({ res, sign: signText(sign), num });
    const views = (i: number | null, cur: Tone = "active", stackMarks: Record<number, Tone> = {}, extra: Record<number, Tone> = {}) => {
      // i = -1：還沒開始；i = null：已經全部讀完
      const marks: Record<number, Tone> = {};
      const upto = i === null ? s.length : Math.max(i, 0);
      const at = i !== null && i >= 0 ? i : null;
      for (let k = 0; k < upto; k++) marks[k] = "visited";
      open.forEach((k) => (marks[k] = "alt"));
      if (at !== null) marks[at] = cur;
      return [
        V.chars("s", s, { pointers: at !== null ? { i: at } : {}, marks: { ...marks, ...extra } }),
        V.stack(
          STACK,
          stack.map((v, k) => (k % 2 === 0 ? `res=${v}` : `sign=${signText(v)}`)),
          { marks: stackMarks },
        ),
      ];
    };

    t.push({
      line: [3, 4],
      note: "`res` 是目前這一層累積的總和，`num` 是正在讀的數字，`sign` 是這個數字前面的正負號（一開始當作 `+`）。堆疊留給括號使用。",
      views: views(-1),
      vars: vars(),
    });

    for (let i = 0; i < s.length; i++) {
      const c = s[i];

      if (c >= "0" && c <= "9") {
        const before = num;
        num = num * 10 + Number(c);
        t.push({
          line: [5, 6, 7],
          note:
            before === 0
              ? `讀到數字 \`${c}\`，\`num = ${num}\`。還不能結算，因為後面可能還有更多位數。`
              : `又是數字 \`${c}\`，接在前一位後面：\`${before} × 10 + ${c} = ${num}\`。`,
          views: views(i),
          vars: vars(),
        });
      } else if (c === "+" || c === "-") {
        const before = res;
        res += sign * num;
        const prevCh = s.slice(0, i).trimEnd().slice(-1); // 前一個非空白字元
        const text =
          prevCh === ")"
            ? `遇到 \`${c}\`。前面的括號剛結算完，\`num\` 是 0，所以 \`res += sign * num\` 不會改變 \`res\`（仍是 ${res}）。`
            : prevCh === "" || prevCh === "("
              ? `遇到 \`${c}\`，它前面沒有數字，是個**負號**。不用特別處理：\`num\` 是 0，\`res += sign * num\` 加的是 0，\`res\` 仍是 ${res}。`
              : `遇到 \`${c}\`，表示前一個數字讀完了，把它結算進總和：\`res = ${before} + ${signed(sign * num)} = ${res}\`。`;
        num = 0;
        sign = c === "+" ? 1 : -1;
        t.push({
          line: [5, 8, 9, 10, 11],
          note: text + `然後 \`num\` 歸零，並記住**下一個數字**的正負號是 \`${signText(sign)}\`。`,
          views: views(i),
          vars: vars(),
        });
      } else if (c === "(") {
        stack.push(res);
        stack.push(sign);
        const savedRes = res;
        const savedSign = sign;
        res = 0;
        sign = 1;
        open.push(i);
        t.push({
          line: [5, 12, 13, 14, 15],
          note: `遇到 \`(\`：括號內要先獨立算完。把外層的進度 \`res = ${savedRes}\` 和括號前的正負號 \`${signText(savedSign)}\` 存進堆疊，再把 \`res, sign\` 重設為 \`0, +1\`，像開始一個全新的算式。`,
          views: views(i, "active", { [stack.length - 1]: "active", [stack.length - 2]: "active" }),
          vars: vars(),
        });
      } else if (c === ")") {
        const before = res;
        res += sign * num;
        const lastNum = sign * num;
        num = 0;
        const openIdx = open[open.length - 1];
        t.push({
          line: [5, 16, 17, 18],
          note: `遇到 \`)\`：括號結束。先把括號內最後一個數字結算：\`res = ${before} + ${signed(lastNum)} = ${res}\`，這就是**括號內的值**。`,
          views: views(i, "active", { [stack.length - 1]: "compare", [stack.length - 2]: "compare" }, { [openIdx]: "compare" }),
          vars: vars(),
        });

        const inner = res;
        const sgn = stack.pop()!;
        const outer = stack.pop()!;
        res = inner * sgn + outer;
        open.pop();
        t.push({
          line: [19, 20],
          note: `接回外層：先 pop 出括號前的正負號 \`${signText(sgn)}\` 乘上去，再 pop 出外層原本的進度 \`${outer}\` 加上去：\`${signed(inner)} × ${signed(sgn)} + ${signed(outer)} = ${res}\`。`,
          views: views(i, "good", {}, { [openIdx]: "good" }),
          vars: vars(),
        });
      } else {
        t.push({
          line: 5,
          note: "空白不屬於任何一種情況，直接略過。",
          views: views(i, "muted"),
          vars: vars(),
        });
      }
    }

    const ans = res + sign * num;
    t.push({
      line: 21,
      note:
        num !== 0
          ? `字串讀完了，但最後一個數字 \`${num}\` 還沒結算（它後面沒有運算子來觸發）：\`${res} + ${signed(sign * num)} = ${ans}\`。`
          : `字串讀完了。\`num\` 是 0，\`res + sign * num\` 就是 \`res\` 本身：\`${ans}\`。`,
      views: views(null),
      vars: vars(),
      result: py(ans),
    });
    return t.frames;
  },
});
