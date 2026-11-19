import { defineProblem } from "../types";
import type { ArrayView, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        rev = 0
        while x > rev:
            rev = rev * 10 + x % 10  # 把 x 的個位數接到 rev 後面
            x //= 10
        return x == rev or x == rev // 10`;

export default defineProblem<{ x: number }>({
  id: 9,
  summary:
    "給一個整數 `x`，判斷它是不是**回文數**：從左讀到右和從右讀到左完全一樣（例如 `121`）。\n\n進階要求是不要把整數轉成字串。",
  summaryEn:
    "Given an integer `x`, decide whether it is a **palindrome**: it reads the same left to right as right to left (like `121`).\n\nFollow-up: do it without converting the integer to a string.",
  examples: [
    { input: "x = 121", output: "true" },
    { input: "x = -121", output: "false", note: "反過來讀是 121-，負號對不上", noteEn: "Backwards it reads 121-, so the minus sign doesn't match" },
    { input: "x = 10", output: "false", note: "反過來讀是 01", noteEn: "Backwards it reads 01" },
  ],
  constraints: ["−2³¹ ≤ x ≤ 2³¹ − 1"],
  constraintsEn: ["−2³¹ ≤ x ≤ 2³¹ − 1"],
  idea:
    "不用把整個數反轉，**只反轉後半段**就夠了：不斷把 `x` 的個位數拔下來接到 `rev` 後面，等 `rev` 追上 `x`（`x <= rev`）就代表已經處理到中間。這時前半段 `x` 和反轉後的後半段 `rev` 相等就是回文；位數是奇數時 `rev` 會多帶一個正中間的數字，用 `rev // 10` 丟掉它再比。",
  steps: [
    "先排除一定不是回文的：負數，以及個位是 0 但本身不是 0 的數（最高位不可能是 0）。",
    "`rev = 0`。只要 `x > rev`：`rev = rev * 10 + x % 10`，`x //= 10`。",
    "迴圈停下時已過半：偶數位數比 `x == rev`，奇數位數比 `x == rev // 10`。",
  ],
  pitfalls: [
    "個位是 0 的數一定要先排除：例如 `10` 會跑成 `x = 0, rev = 1`，`x == rev // 10` 會誤判成回文。",
    "反轉整個數在其他語言可能溢位；只反轉一半就沒有這個問題。",
    "轉成字串比 `s == s[::-1]` 也能過，但不符合進階要求。",
  ],
  complexity: { time: "O(log₁₀ x)（只走一半的位數）", space: "O(1)" },
  code,
  starter: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        `,
  presets: [
    { label: "12321", input: { x: 12321 }, expected: "True" },
    { label: "1231", input: { x: 1231 }, expected: "False" },
    { label: "10", input: { x: 10 }, expected: "False" },
  ],
  trace({ x: x0 }) {
    const t = tracer();
    const chars = [...String(x0)];
    const n = chars.length;
    const digitsOf = (v: number) => (v === 0 ? [] : [...String(v)].map(Number));

    // 原數字：左邊括起來的是還留在 x 裡的部分，右邊是已經搬到 rev 的部分
    const original = (k: number, marks: Record<number, Tone> = {}, showRanges = true): ArrayView =>
      V.chars("原本的數字", String(x0), {
        marks,
        ranges: showRanges
          ? [
              { from: 0, to: n - k - 1, tone: "active", label: "x" },
              { from: n - k, to: n - 1, tone: "alt", label: "rev（從右往左讀）" },
            ]
          : [],
      });
    const revView = (rev: number, marks: Record<number, Tone> = {}) => V.array("rev", digitsOf(rev), { marks });

    if (x0 < 0 || (x0 % 10 === 0 && x0 !== 0)) {
      const marks: Record<number, Tone> = x0 < 0 ? { 0: "bad" } : { 0: "compare", [n - 1]: "bad" };
      t.push({
        line: 3,
        note:
          x0 < 0
            ? `\`x = ${x0}\` 是負數。反過來讀時負號會跑到最後面，不可能和原本一樣。`
            : `\`x = ${x0}\` 的個位數是 0。回文的話最高位也得是 0，但除了 0 本身，沒有數字會以 0 開頭。`,
        views: [original(0, marks, false)],
        vars: { x: x0 },
      });
      t.push({
        line: 4,
        note: "所以不用再算，直接回傳 `False`。",
        views: [original(0, marks, false)],
        vars: { x: x0 },
        result: py(false),
      });
      return t.frames;
    }

    let x = x0;
    let rev = 0;
    let k = 0; // 已經搬到 rev 的位數

    t.push({
      line: [3, 5],
      note: `\`${x0}\` 不是負數、個位也不是 0，有可能是回文。準備 \`rev = 0\`，接下來從個位數開始，一位一位搬到 \`rev\`，把**後半段反轉**出來。`,
      views: [original(0), revView(0)],
      vars: { x, rev },
    });

    while (x > rev) {
      const d = x % 10;
      const px = x;
      const prev = rev;
      rev = rev * 10 + d;
      x = Math.floor(x / 10);
      k++;
      t.push({
        line: [6, 7, 8],
        note:
          `\`${px} > ${prev}\`，還沒到中間。拔下 \`x\` 的個位數 \`${d}\` 接到 \`rev\` 尾端：\`rev = ${prev} × 10 + ${d} = ${rev}\`，` +
          `\`x\` 去掉個位變成 \`${x}\`。`,
        views: [original(k, { [n - k]: "active" }), revView(rev, { [k - 1]: "active" })],
        vars: { x, rev, "x % 10": d },
      });
    }

    t.push({
      line: 6,
      note: `\`${x} > ${rev}\` 不成立 —— \`rev\` 的位數已經追上 \`x\`，代表**走到中間了**，後半段已經反轉完成。`,
      views: [original(k), revView(rev)],
      vars: { x, rev },
    });

    const even = x === rev;
    const odd = x === Math.floor(rev / 10);
    const ans = even || odd;
    const marks: Record<number, Tone> = {};
    const revMarks: Record<number, Tone> = {};
    const tone: Tone = ans ? "good" : "bad";
    for (let i = 0; i < n; i++) marks[i] = tone;
    for (let i = 0; i < k; i++) revMarks[i] = tone;
    const isOddLen = k > n - k; // rev 比 x 多一位：多的是正中間那個數字
    if (isOddLen && ans) {
      marks[n - k] = "muted";
      revMarks[k - 1] = "muted";
    }
    let note: string;
    if (even) {
      note = `前半段 \`x = ${x}\` 和反轉後的後半段 \`rev = ${rev}\` 相等，是回文。`;
    } else if (odd) {
      note = `位數是奇數，\`rev = ${rev}\` 多帶了正中間的數字（它自己跟自己對稱，不用比）。丟掉它：\`rev // 10 = ${Math.floor(rev / 10)}\`，和 \`x = ${x}\` 相等，是回文。`;
    } else {
      note = `\`x = ${x}\`，\`rev = ${rev}\`，\`rev // 10 = ${Math.floor(rev / 10)}\`，兩種比法都不相等 —— 前半段和反轉的後半段對不上，不是回文。`;
    }
    t.push({
      line: 9,
      note,
      views: [original(k, marks), revView(rev, revMarks)],
      vars: { x, rev, "rev // 10": Math.floor(rev / 10) },
      result: py(ans),
    });
    return t.frames;
  },
});
