import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def reverseBits(self, n: int) -> int:
        res = 0
        for _ in range(32):
            res = (res << 1) | (n & 1)  # res 左移騰出一格，接上 n 的最低位
            n >>= 1                     # n 右移，丟掉剛剛用掉的那一位
        return res`;

const N_LABEL = "n（32 位元，左邊是最高位）";
const R_LABEL = "res（32 位元，左邊是最高位）";

export default defineProblem<{ n: number }>({
  id: 190,
  summary:
    "給一個 32 位元的無號整數 `n`，把它的 **32 個位元整個左右顛倒**（第 0 位換到第 31 位、第 1 位換到第 30 位…），回傳顛倒後的整數。",
  summaryEn:
    "Given a 32-bit unsigned integer `n`, **reverse the order of all 32 bits** (bit 0 swaps with bit 31, bit 1 with bit 30, and so on) and return the resulting integer.",
  examples: [
    {
      input: "n = 43261596",
      output: "964176192",
      note: "00000010100101000001111010011100 → 00111001011110000010100101000000",
      noteEn: "00000010100101000001111010011100 → 00111001011110000010100101000000",
    },
    { input: "n = 1", output: "2147483648", note: "最低位的 1 跑到最高位", noteEn: "The lowest 1 bit moves to the highest position" },
  ],
  constraints: ["輸入固定視為 32 位元"],
  constraintsEn: ["The input is always treated as 32 bits"],
  idea:
    "把 `n` 想成一疊牌：每次從 `n` 的**最右邊**抽一個位元，放到 `res` 的**最右邊**，放之前先把 `res` 整個左移一格。最先抽出來的位元會被後面的 31 次左移一路推到最高位 —— 先進的跑到最左邊，順序自然就反過來了。",
  steps: [
    "`res = 0`。",
    "固定做 32 次（不能看到 `n` 變 0 就停，前導 0 也要反轉到低位）。",
    "`res = (res << 1) | (n & 1)`：`res` 左移一格，把 `n` 的最低位接在尾巴。",
    "`n >>= 1`：把用過的最低位丟掉。",
    "回傳 `res`。",
  ],
  pitfalls: [
    "一定要跑滿 32 次：`n = 1` 只做 1 次的話答案會是 1，而不是 2³¹。",
    "先左移 `res` 再接新位元；順序反了會多移一格。",
    "Java / C++ 要注意有號數的右移（Java 用 `>>>`）；Python 的整數沒有位數上限，跑 32 次剛好落在 32 位元內。",
  ],
  complexity: { time: "O(1)（固定 32 次）", space: "O(1)" },
  code,
  starter: `class Solution:
    def reverseBits(self, n: int) -> int:
        `,
  presets: [
    { label: "43261596", input: { n: 43261596 }, expected: "964176192" },
    { label: "4294967293", input: { n: 4294967293 }, expected: "3221225471" },
    { label: "1", input: { n: 1 }, expected: "2147483648" },
  ],
  trace({ n: n0 }) {
    const t = tracer();
    // 用位元陣列模擬，避免 JS 32 位元有號運算的問題。index 0 = 最高位。
    const toBits = (x: number) => Array.from({ length: 32 }, (_, k) => Math.floor(x / 2 ** (31 - k)) % 2);
    const value = (bits: number[]) => bits.reduce((acc, bit) => acc * 2 + bit, 0);

    let nBits = toBits(n0);
    let nIds: string[] = nBits.map((_, k) => `b${31 - k}`);
    let rBits: number[] = Array.from({ length: 32 }, () => 0);
    let rIds: string[] = rBits.map((_, k) => `e${k}`);

    const views = (nMarks: Record<number, Tone>, rMarks: Record<number, Tone>) => [
      V.array(N_LABEL, nBits, { ids: nIds, marks: nMarks }),
      V.array(R_LABEL, rBits, { ids: rIds, marks: rMarks }),
    ];
    // n 左邊補進來的 0 已經不重要；res 右邊已經放好的位元標成 visited
    const nMuted = (shifted: number) => {
      const m: Record<number, Tone> = {};
      for (let k = 0; k < shifted; k++) m[k] = "muted";
      return m;
    };
    const rPlaced = (placed: number) => {
      const m: Record<number, Tone> = {};
      for (let k = 32 - placed; k < 32; k++) m[k] = "visited";
      return m;
    };

    t.push({
      line: 3,
      note: `\`res\` 從 0 開始。接下來 32 輪，每輪從 \`n\` 的最右邊拿一個位元，接到 \`res\` 的最右邊。（格子下方的小數字只是格子編號，不是位元的權重。）`,
      views: views({}, {}),
      vars: { n: n0, res: 0 },
    });

    for (let step = 0; step < 32; step++) {
      // 上一輪結尾的 n >>= 1 在這裡生效（畫面上 n 整排往右滑一格）
      if (step > 0) {
        nBits = [0, ...nBits.slice(0, 31)];
        nIds = [`z${step}`, ...nIds.slice(0, 31)];
      }
      const bit = nBits[31];
      rBits = [...rBits.slice(1), bit];
      rIds = [...rIds.slice(1), `r${step}`];

      const nMarks = nMuted(step);
      nMarks[31] = "active";
      const rMarks = rPlaced(step + 1);
      rMarks[31] = "good";

      let note: string;
      if (step === 0) {
        note = `第 1 輪：\`n & 1\` 取出 \`n\` 的最低位 \`${bit}\`；\`res\` 先左移一格，再用 \`|\` 把它接在最右邊。接著 \`n >>= 1\` 把這一位丟掉（下一步會看到 \`n\` 整排往右滑）。`;
      } else if (step === 1) {
        note = `第 2 輪：\`n\` 已右移，新的最低位是 \`${bit}\`。\`res\` 左移後，上一輪放的位元被**往左推一格**，新位元補在最右邊 —— 越早拿到的位元會被推得越左邊。`;
      } else if (step === 31) {
        note = `第 32 輪：拿最後一位 \`${bit}\`。第 1 輪放進去的位元已經被推了 31 次，正好抵達最高位。`;
      } else if (nBits.every((x) => x === 0)) {
        note = `第 ${step + 1} 輪：\`n\` 已經是 0，取到的都是 \`0\`。但**不能提早停**：這些 0 還是要接上去，才能把前面的位元繼續往左推到正確位置。`;
      } else {
        note = `第 ${step + 1} 輪：取出最低位 \`${bit}\` 接到 \`res\` 尾端，原本的位元全部往左推一格。`;
      }

      t.push({
        line: [4, 5, 6],
        note,
        views: views(nMarks, rMarks),
        vars: { 輪次: `${step + 1} / 32`, "n & 1": bit, n: value(nBits), res: value(rBits) },
      });
    }

    const res = value(rBits);
    const all: Record<number, Tone> = {};
    for (let k = 0; k < 32; k++) all[k] = "good";
    nBits = [0, ...nBits.slice(0, 31)];
    nIds = ["z32", ...nIds.slice(0, 31)];
    t.push({
      line: 7,
      note: `32 個位元都搬完了，\`n\` 被移成 0，\`res\` 就是原本的位元**左右顛倒**後的結果：\`${res}\`。`,
      views: views(nMuted(32), all),
      vars: { n: 0, res },
      result: py(res),
    });
    return t.frames;
  },
});
