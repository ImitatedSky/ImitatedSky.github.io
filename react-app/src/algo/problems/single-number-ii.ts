import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        res = 0
        for i in range(32):
            total = sum((x >> i) & 1 for x in nums)  # 第 i 位總共有幾個 1
            if total % 3:
                res |= 1 << i
        # 第 31 位是符號位：是 1 的話代表答案是負數
        if res >= 1 << 31:
            res -= 1 << 32
        return res`;

const LABEL = "每個數的二進位（上方是位元編號 i，右邊是最低位）";

export default defineProblem<{ nums: number[] }>({
  id: 137,
  summary:
    "給一個整數陣列 `nums`，其中**只有一個數出現一次，其餘每個數都剛好出現三次**。找出那個只出現一次的數。\n\n要求線性時間、常數額外空間。",
  examples: [
    { input: "nums = [2,2,3,2]", output: "3" },
    { input: "nums = [0,1,0,1,0,1,99]", output: "99" },
  ],
  constraints: ["1 ≤ nums.length ≤ 3 × 10⁴", "−2³¹ ≤ nums[i] ≤ 2³¹ − 1"],
  idea:
    "XOR 只能抵消「出現偶數次」的數，三次的抵消不掉。改成**一個位元一個位元看**：把所有數在第 `i` 位的 0/1 加起來，出現三次的數對這個總和的貢獻一定是 0 或 3，所以 `total % 3` 剩下的就是**落單那個數在第 `i` 位的值**。32 個位元各做一次，就能把答案拼回來。",
  steps: [
    "`res = 0`，對位元 `i = 0 … 31` 逐一處理。",
    "`total` = 所有數的第 `i` 位加起來（`(x >> i) & 1`）。",
    "若 `total % 3 != 0`，代表落單的數在這一位是 1，用 `res |= 1 << i` 把它寫進答案。",
    "Python 的整數沒有固定位數：如果第 31 位（符號位）是 1，要減掉 2³² 轉回負數。",
  ],
  pitfalls: [
    "Python 一定要處理符號位，否則答案是負數時會回傳一個很大的正數。",
    "還有一個用 `ones`、`twos` 兩個變數的狀態機寫法（同樣 O(1) 空間、只掃一遍），但比較難當場推導；逐位計數的想法直接、不容易寫錯，也能推廣到「其他數出現 k 次」。",
  ],
  complexity: { time: "O(32 · n) = O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[2,2,3,2]", input: { nums: [2, 2, 3, 2] }, expected: "3" },
    { label: "[0,1,0,1,0,1,99]", input: { nums: [0, 1, 0, 1, 0, 1, 99] }, expected: "99" },
    { label: "[5,9,5,5]", input: { nums: [5, 9, 5, 5] }, expected: "9" },
  ],
  trace({ nums }) {
    const t = tracer();
    // 動畫只畫非負數的低 W 位；更高的位元全部是 0，用一個影格帶過
    const W = Math.max(4, ...nums.map((v) => Math.abs(v).toString(2).length));
    const bitAt = (x: number, i: number) => Math.floor(x / 2 ** i) % 2;
    const numRows: Cell[][] = nums.map((x) => Array.from({ length: W }, (_, c) => bitAt(x, W - 1 - c)));
    const totalRow: Cell[] = Array.from({ length: W }, () => "");
    const resRow: Cell[] = Array.from({ length: W }, () => "");
    const colLabels = Array.from({ length: W }, (_, c) => W - 1 - c);
    const rowLabels = [...nums.map((x, k) => `nums[${k}] = ${x}`), "total", "total % 3 → res"];
    const R_TOTAL = nums.length;
    const R_RES = nums.length + 1;

    const grid = (marks: Record<string, Tone>) =>
      V.grid(LABEL, [...numRows, totalRow, resRow], { rowLabels, colLabels, marks });
    const settled = () => {
      const m: Record<string, Tone> = {};
      resRow.forEach((v, c) => {
        if (v === 1) m[`${R_RES},${c}`] = "good";
        else if (v === 0) m[`${R_RES},${c}`] = "muted";
      });
      return m;
    };

    let res = 0;
    t.push({
      line: 3,
      note: "把每個數寫成二進位、上下對齊。接下來**一欄一欄（一個位元一個位元）往下加**：出現三次的數在每一欄貢獻 0 或 3，除以 3 的餘數就是落單那個數在這一欄的位元。",
      views: [grid({})],
      vars: { res },
    });

    for (let i = 0; i < W; i++) {
      const c = W - 1 - i;
      const total = nums.reduce((acc, x) => acc + bitAt(x, i), 0);
      const bit = total % 3;
      totalRow[c] = total;
      resRow[c] = bit ? 1 : 0;
      if (bit) res += 2 ** i;
      const marks = settled();
      nums.forEach((x, r) => (marks[`${r},${c}`] = bitAt(x, i) ? "active" : "compare"));
      marks[`${R_TOTAL},${c}`] = "alt";
      marks[`${R_RES},${c}`] = bit ? "good" : "muted";
      t.push({
        line: bit ? [4, 5, 6, 7] : [4, 5, 6],
        note:
          `第 ${i} 位：這一欄共有 ${total} 個 1，\`${total} % 3 = ${bit}\`。` +
          (bit
            ? `餘數不是 0 —— 扣掉三個三個一組的之後還多一個 1，那一定是落單的數帶來的，所以 \`res\` 的第 ${i} 位設成 1（\`res |= 1 << ${i}\`）。`
            : total === 0
              ? `沒有任何數在這一位是 1，落單的數這一位當然也是 0。`
              : `剛好被 3 整除，這些 1 全都來自出現三次的數，落單的數這一位是 0。`),
        views: [grid(marks)],
        vars: { i, total, "total % 3": bit, res },
      });
    }

    t.push({
      line: [4, 5, 6],
      note: `第 ${W} ～ 31 位：這組輸入的每個數在這些位元都是 0，\`total\` 都是 0，\`res\` 不會再變。（程式仍然會把 32 個位元都跑完。）`,
      views: [grid(settled())],
      vars: { i: `${W} … 31`, total: 0, "total % 3": 0, res },
    });

    const done = settled();
    nums.forEach((x, r) => {
      if (x === res) for (let c = 0; c < W; c++) done[`${r},${c}`] = "good";
    });
    t.push({
      line: [9, 11],
      note: `\`res = ${res}\` 小於 2³¹，符號位是 0，不用轉成負數。最下面一列拼出來的就是只出現一次的數：**${res}**。`,
      views: [grid(done)],
      vars: { res },
      result: py(res),
    });
    return t.frames;
  },
});
