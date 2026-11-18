import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()  # 出現過的數字
        while n != 1 and n not in seen:
            seen.add(n)
            n = sum(int(d) ** 2 for d in str(n))
        return n == 1`;

const CHAIN = "n 走過的路";
const DIGITS = "n 的每一位數";
const SQUARES = "各位數的平方";

export default defineProblem<{ n: number }>({
  id: 202,
  summary:
    "對一個正整數反覆做同一件事：把它**每一位數字的平方加起來**，得到新的數。\n\n如果最後會變成 1，它就是「快樂數」；如果永遠到不了 1（會陷入無窮循環），就不是。判斷 `n` 是不是快樂數。",
  examples: [
    { input: "n = 19", output: "true", note: "19 → 82 → 68 → 100 → 1" },
    { input: "n = 2", output: "false", note: "2 → 4 → 16 → … → 20 → 4，回到 4 開始繞圈" },
  ],
  constraints: ["1 ≤ n ≤ 2³¹ − 1"],
  idea:
    "數字不會無限變大（三位數以上做一次就會變小），所以這個過程只有兩種結局：**走到 1**，或是**走回某個出現過的數字**而開始繞圈。用一個 `set` 記住走過的數字，一旦重複就知道進了循環。",
  steps: [
    "準備空集合 `seen`。",
    "只要 `n` 不是 1、而且沒出現過：把 `n` 記進 `seen`，再把 `n` 換成各位數字的平方和。",
    "迴圈結束只有兩種原因：`n == 1`（快樂）或 `n` 重複出現（循環）。回傳 `n == 1`。",
  ],
  pitfalls: [
    "沒有偵測循環就只判斷 `n != 1`，遇到不快樂的數會變成無窮迴圈。",
    "這其實是「鏈結串列找環」的變形，也可以用快慢指標（Floyd）做到 O(1) 空間；`set` 版最直覺也最好寫。",
  ],
  complexity: { time: "O(log n)", space: "O(log n)" },
  code,
  starter: `class Solution:
    def isHappy(self, n: int) -> bool:
        `,
  presets: [
    { label: "n = 19", input: { n: 19 }, expected: "True" },
    { label: "n = 2", input: { n: 2 }, expected: "False" },
    { label: "n = 7", input: { n: 7 }, expected: "True" },
  ],
  trace({ n: n0 }) {
    const t = tracer();
    let n = n0;
    const seen: number[] = [];
    const order: number[] = [n]; // 依序走過的數字（不重複）
    let backTo: number | null = null; // 最後一個節點繞回去的目標

    const chain = (): ListNodeSpec[] =>
      order.map((v, i) => ({
        id: String(v),
        val: v,
        next: i + 1 < order.length ? String(order[i + 1]) : backTo !== null ? String(backTo) : null,
      }));
    const chainView = (extra: Record<string, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      seen.forEach((v) => (marks[String(v)] = "visited"));
      return V.list(CHAIN, chain(), { pointers: { n: String(n) }, marks: { ...marks, ...extra } });
    };
    const digitsOf = (x: number) => [...String(x)].map(Number);

    t.push({
      line: 3,
      note: `從 \`n = ${n}\` 出發。這個過程最後不是走到 1，就是繞回走過的數字，所以用 \`seen\` 把走過的數字都記下來。`,
      views: [chainView({ [String(n)]: "active" }), V.array(DIGITS, digitsOf(n)), V.set("seen", seen)],
      vars: { n },
    });

    while (n !== 1 && !seen.includes(n)) {
      seen.push(n);
      t.push({
        line: [4, 5],
        note: `\`${n}\` 不是 1，也還沒出現過，可以繼續。先把 \`${n}\` 記進 \`seen\`，之後再遇到它就知道繞圈了。`,
        views: [
          chainView({ [String(n)]: "active" }),
          V.array(DIGITS, digitsOf(n)),
          V.set("seen", seen, { marks: { [String(n)]: "active" } }),
        ],
        vars: { n },
      });

      const digits = digitsOf(n);
      const squares = digits.map((d) => d * d);
      const next = squares.reduce((a, b) => a + b, 0);
      const prev = n;
      if (order.includes(next)) backTo = next;
      else order.push(next);
      n = next;
      const formula = digits.map((d) => `${d}²`).join(" + ");
      t.push({
        line: 6,
        note:
          `把 \`${prev}\` 拆成各位數，平方後相加：${formula} = ${squares.join(" + ")}${squares.length > 1 ? ` = ${next}` : ""}。新的 \`n = ${next}\`。` +
          (backTo !== null ? `咦，箭頭指回了前面走過的 \`${next}\`。` : ""),
        views: [
          chainView({ [String(n)]: backTo !== null ? "bad" : "active" }),
          V.array(DIGITS, digits, { marks: Object.fromEntries(digits.map((_, i) => [i, "compare" as Tone])) }),
          V.array(SQUARES, squares, { marks: Object.fromEntries(squares.map((_, i) => [i, "active" as Tone])) }),
          V.set("seen", seen),
        ],
        vars: { n, 平方和: next },
      });
    }

    const happy = n === 1;
    if (happy) {
      t.push({
        line: 4,
        note:
          n0 === 1
            ? "`n` 一開始就是 1，`while` 的條件 `n != 1` 不成立，迴圈一次都不用跑。"
            : "`n` 變成 1 了，`while` 的條件 `n != 1` 不成立，離開迴圈。（1 的平方還是 1，再算下去也不會變。）",
        views: [chainView({ "1": "good" }), V.array(DIGITS, digitsOf(n)), V.set("seen", seen)],
        vars: { n },
      });
    } else {
      t.push({
        line: 4,
        note: `\`${n}\` 已經在 \`seen\` 裡 —— 我們繞回走過的地方了。同一個數字接下來一定走出同一條路，所以會永遠在這個圈裡打轉，到不了 1。`,
        views: [
          chainView({ [String(n)]: "bad" }),
          V.array(DIGITS, digitsOf(n)),
          V.set("seen", seen, { marks: { [String(n)]: "bad" } }),
        ],
        vars: { n },
      });
    }

    const finalMarks: Record<string, Tone> = {};
    if (happy) order.forEach((v) => (finalMarks[String(v)] = "good"));
    else {
      // 圈上的節點標成 bad，進圈前的尾巴維持 visited
      order.slice(order.indexOf(n)).forEach((v) => (finalMarks[String(v)] = "bad"));
    }
    t.push({
      line: 7,
      note: happy
        ? `回傳 \`n == 1\`，也就是 \`True\`：${n0} 是快樂數。`
        : `離開迴圈時 \`n = ${n}\` 不是 1，回傳 \`False\`：${n0} 不是快樂數。`,
      views: [chainView(finalMarks), V.array(DIGITS, digitsOf(n)), V.set("seen", seen)],
      vars: { n },
      result: py(happy),
    });
    return t.frames;
  },
});
