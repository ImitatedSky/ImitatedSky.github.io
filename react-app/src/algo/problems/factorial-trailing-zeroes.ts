import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def trailingZeroes(self, n: int) -> int:
        count = 0
        while n:
            n //= 5     # 依序是 5、25、125… 的倍數有幾個
            count += n  # 每個倍數再多貢獻一個因數 5
        return count`;

const FIVES = "每個數含有幾個因數 5";

export default defineProblem<{ n: number }>({
  id: 172,
  summary:
    "給一個整數 `n`，回傳 `n!`（`1 × 2 × … × n`）的十進位表示**尾端有幾個連續的 0**。\n\n`n` 可以到 10⁴，階乘本身大到不可能真的算出來再數。",
  summaryEn:
    "Given an integer `n`, return **how many consecutive zeros are at the end** of `n!` (`1 × 2 × … × n`) written in decimal.\n\n`n` goes up to 10⁴, so the factorial is far too large to compute and then count.",
  examples: [
    { input: "n = 3", output: "0", note: "3! = 6", noteEn: "3! = 6" },
    { input: "n = 5", output: "1", note: "5! = 120", noteEn: "5! = 120" },
    { input: "n = 25", output: "6", note: "25 自己就帶了兩個 5", noteEn: "25 itself contributes two factors of 5" },
  ],
  constraints: ["0 ≤ n ≤ 10⁴"],
  constraintsEn: ["0 ≤ n ≤ 10⁴"],
  idea:
    "尾端每多一個 0 就是多乘了一個 `10 = 2 × 5`。階乘裡因數 2 遠比 5 多（每兩個數就有一個偶數），所以**0 的個數 = 因數 5 的總數**。`1…n` 中 5 的倍數有 `n // 5` 個，各貢獻一個 5；25 的倍數有 `n // 25` 個，各自**再多**一個；125 的倍數再多一個……全部加起來就是答案。",
  steps: [
    "`count = 0`。",
    "`n //= 5`：現在的 `n` 是原本 `1…n` 中 5 的倍數個數，加進 `count`。",
    "再 `n //= 5`：變成 25 的倍數個數，再加進去；依此類推（125、625…）。",
    "`n` 變成 0 時，再高的次方已經沒有倍數了，回傳 `count`。",
  ],
  pitfalls: [
    "只算 `n // 5` 會漏掉 25、125 這些帶有多個 5 的數（`n = 25` 的答案是 6 不是 5）。",
    "不要真的去算階乘再數 0；也不用數因數 2，它一定夠用。",
  ],
  complexity: { time: "O(log₅ n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def trailingZeroes(self, n: int) -> int:
        `,
  presets: [
    { label: "n = 25", input: { n: 25 }, expected: "6" },
    { label: "n = 30", input: { n: 30 }, expected: "7" },
    { label: "n = 4", input: { n: 4 }, expected: "0" },
  ],
  trace({ n: N }) {
    const t = tracer();
    // 把 1..N 每 5 個排一列：5 的倍數會剛好排在最右邊那一欄
    const rows = Math.max(1, Math.ceil(N / 5));
    const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => (r * 5 + c + 1 <= N ? r * 5 + c + 1 : "")),
    );
    const pos = (v: number) => `${Math.floor((v - 1) / 5)},${(v - 1) % 5}`;
    const multiples = (p: number) => {
      const out: number[] = [];
      for (let v = p; v <= N; v += p) out.push(v);
      return out;
    };
    const fives = new Map<number, number>();
    const label = `1 … ${N}（n! 就是把它們全部乘起來）`;

    const views = (active: number[], counted: number[], mapActive: number[] = []) => {
      const marks: Record<string, Tone> = {};
      counted.forEach((v) => (marks[pos(v)] = "good"));
      active.forEach((v) => (marks[pos(v)] = "active"));
      const mapMarks: Record<string, Tone> = {};
      mapActive.forEach((v) => (mapMarks[String(v)] = "active"));
      return [V.grid(label, cells, { marks }), V.map(FIVES, fives, { marks: mapMarks })];
    };

    let n = N;
    let count = 0;
    t.push({
      line: 3,
      note: `尾端的 0 來自因數 \`10 = 2 × 5\`。\`${N}!\` 裡的 2 多到用不完，所以只要數**總共有幾個因數 5**。把 1 到 ${N} 每 5 個排一列，5 的倍數會整齊地落在最右邊一欄。`,
      views: views([], []),
      vars: { n, count },
    });

    let p = 5;
    while (n) {
      const prev = n;
      n = Math.floor(n / 5);
      const ms = multiples(p);
      const counted = multiples(5);
      if (n === 0) {
        t.push({
          line: [4, 5, 6],
          note: `\`n = ${prev} // 5 = 0\`：1 到 ${N} 之間沒有 ${p} 的倍數（\`${N} < ${p}\`），沒有數字能再多貢獻一個 5。\`count\` 加 0，維持 \`${count}\`。`,
          views: views([], p > 5 ? counted : []),
          vars: { n, count, 這一輪數的是: `${p} 的倍數` },
        });
        break;
      }
      t.push({
        line: [4, 5],
        note:
          `\`n = ${prev} // 5 = ${n}\`，這正好是 1 到 ${N} 之間 **${p} 的倍數**的個數（${ms.map((v) => `\`${v}\``).join("、")}）。` +
          (p === 5
            ? "它們每個至少含有一個因數 5。"
            : `這些數是 ${p} 的倍數，比起上一輪算過的，身上**還多一個** 5。`),
        views: views(ms, p > 5 ? counted : []),
        vars: { n, count, 這一輪數的是: `${p} 的倍數` },
      });
      count += n;
      ms.forEach((v) => fives.set(v, (fives.get(v) ?? 0) + 1));
      t.push({
        line: 6,
        note: `每個 ${p} 的倍數各記一個 5：\`count += ${n}\`，現在 \`count = ${count}\`。`,
        views: views(ms, counted, ms),
        vars: { n, count, 這一輪數的是: `${p} 的倍數` },
      });
      p *= 5;
    }

    const total = [...fives.values()].reduce((a, b) => a + b, 0);
    t.push({
      line: [4, 7],
      note:
        count === 0
          ? `\`n\` 是 0，迴圈結束。1 到 ${N} 裡完全沒有因數 5，湊不出任何一個 10，所以 \`${N}!\` 尾端有 **0** 個 0。`
          : `\`n\` 變成 0，迴圈結束。所有因數 5 加起來共 ${total} 個，每個都能配到一個 2 湊成 10，所以 \`${N}!\` 尾端有 **${count}** 個 0。`,
      views: views([], multiples(5)),
      vars: { n: 0, count },
      result: py(count),
    });
    return t.frames;
  },
});
