import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        res = 0
        for x in nums:
            res ^= x  # 相同的數 XOR 兩次會互相抵消
        return res`;

export default defineProblem<{ nums: number[] }>({
  id: 136,
  summary:
    "給一個非空的整數陣列 `nums`，其中**只有一個數出現一次，其餘每個數都剛好出現兩次**。找出那個落單的數。\n\n要求線性時間，而且只能用常數的額外空間。",
  examples: [
    { input: "nums = [2,2,1]", output: "1" },
    { input: "nums = [4,1,2,1,2]", output: "4" },
    { input: "nums = [1]", output: "1" },
  ],
  constraints: ["1 ≤ nums.length ≤ 3 × 10⁴", "除了一個數以外，每個數都出現兩次"],
  idea:
    "XOR 有三個性質：`a ^ a = 0`（自己跟自己抵消）、`a ^ 0 = a`、而且**順序可以任意交換**。所以把所有數 XOR 在一起，成對的數不管隔多遠都會互相抵消成 0，最後剩下的就是落單的那個。",
  steps: [
    "`res = 0`（0 是 XOR 的「什麼都沒有」）。",
    "走訪每個 `x`，做 `res ^= x`：`x` 的每個 1 會把 `res` 對應的位元翻轉一次。",
    "同一個數出現兩次 = 同樣的位元被翻兩次 = 翻回原狀。",
    "走完後 `res` 就是只出現一次的數。",
  ],
  pitfalls: [
    "用雜湊表計數或排序也能做，但空間 O(n) 或時間 O(n log n)，不符合題目要求。",
    "這招只在「其他數都出現**偶數**次」時成立；出現三次的版本（LC 137）要換方法。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[4,1,2,1,2]", input: { nums: [4, 1, 2, 1, 2] }, expected: "4" },
    { label: "[5,3,6,3,7,6,5]", input: { nums: [5, 3, 6, 3, 7, 6, 5] }, expected: "7" },
    { label: "[9]", input: { nums: [9] }, expected: "9" },
  ],
  trace({ nums }) {
    const t = tracer();
    // 動畫只處理非負數（預設輸入都是），位元寬度取最大值所需的位數
    const W = Math.max(4, ...nums.map((v) => Math.abs(v).toString(2).length));
    const bits = (x: number): Cell[] => Array.from({ length: W }, (_, k) => Math.floor(x / 2 ** (W - 1 - k)) % 2);
    const blank: Cell[] = Array.from({ length: W }, () => "");
    const colLabels = Array.from({ length: W }, (_, k) => 2 ** (W - 1 - k));
    const bin = (x: number) => x.toString(2).padStart(W, "0");
    const xor = (a: number, b: number) => {
      let out = 0;
      for (let k = 0; k < W; k++) {
        const ba = Math.floor(a / 2 ** k) % 2;
        const bb = Math.floor(b / 2 ** k) % 2;
        if (ba !== bb) out += 2 ** k;
      }
      return out;
    };

    // 走到索引 upto（含）為止：出現偶數次的數已經互相抵消
    const numMarks = (upto: number, cur: number) => {
      const seen = new Map<number, number>();
      for (let k = 0; k <= upto; k++) seen.set(nums[k], (seen.get(nums[k]) ?? 0) + 1);
      const m: Record<number, Tone> = {};
      for (let k = 0; k <= upto; k++) m[k] = seen.get(nums[k])! % 2 === 0 ? "muted" : "compare";
      if (cur >= 0) m[cur] = "active";
      return m;
    };
    const alive = (upto: number) => {
      const seen = new Map<number, number>();
      for (let k = 0; k <= upto; k++) seen.set(nums[k], (seen.get(nums[k]) ?? 0) + 1);
      return [...seen.entries()].filter(([, c]) => c % 2 === 1).map(([v]) => v);
    };

    let res = 0;
    t.push({
      line: 3,
      note: "`res` 從 0 開始。接下來把每個數都 XOR 進去 —— XOR 就是「不進位的加法」：上下位元**不同得 1、相同得 0**。",
      views: [
        V.array("nums", nums),
        V.grid("res ^= x（逐位元）", [bits(0), blank, blank], { rowLabels: ["res = 0", "x", "res ^ x"], colLabels }),
      ],
      vars: { res: 0 },
    });

    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];
      const next = xor(res, x);
      const marks: Record<string, Tone> = {};
      bits(x).forEach((b, c) => {
        if (b === 1) {
          marks[`1,${c}`] = "active";
          marks[`2,${c}`] = "active";
        }
      });
      const firstTime = !nums.slice(0, i).includes(x);
      const left = alive(i);
      const why = firstTime
        ? `\`${x}\` 第一次出現，它的 1 所在的位元被翻轉，等於把 \`${x}\` 「記」進 \`res\`。`
        : `\`${x}\` 之前出現過！同樣的位元再翻一次就翻回去了 —— 兩個 \`${x}\` **互相抵消**。`;
      const remain =
        left.length === 0
          ? "現在所有看過的數都成對抵消了，`res` 回到 0。"
          : `現在 \`res\` 等於還沒被抵消的數的 XOR：${left.map((v) => `\`${v}\``).join(" ^ ")}。`;
      t.push({
        line: [4, 5],
        note: `\`res ^ x = ${bin(res)} ^ ${bin(x)} = ${bin(next)}\`（${next}）。${why}${remain}`,
        views: [
          V.array("nums", nums, { pointers: { x: i }, marks: numMarks(i, i) }),
          V.grid("res ^= x（逐位元）", [bits(res), bits(x), bits(next)], {
            rowLabels: [`res = ${res}`, `x = ${x}`, `res ^ x = ${next}`],
            colLabels,
            marks,
          }),
        ],
        vars: { x, res: next },
      });
      res = next;
    }

    const finalMarks = numMarks(nums.length - 1, -1);
    const idx = nums.indexOf(res);
    if (idx >= 0) finalMarks[idx] = "good";
    const good: Record<string, Tone> = {};
    for (let c = 0; c < W; c++) good[`0,${c}`] = "good";
    t.push({
      line: 6,
      note: `全部走完。成對的數都抵消掉了，\`res\` 裡只剩下落單的 \`${res}\`。`,
      views: [
        V.array("nums", nums, { marks: finalMarks }),
        V.grid("res ^= x（逐位元）", [bits(res), blank, blank], {
          rowLabels: [`res = ${res}`, "x", "res ^ x"],
          colLabels,
          marks: good,
        }),
      ],
      vars: { res },
      result: py(res),
    });
    return t.frames;
  },
});
