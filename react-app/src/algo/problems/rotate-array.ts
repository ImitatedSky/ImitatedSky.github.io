import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        n = len(nums)
        k %= n  # 轉 n 步等於沒轉

        def reverse(l: int, r: int) -> None:
            while l < r:
                nums[l], nums[r] = nums[r], nums[l]
                l, r = l + 1, r - 1

        reverse(0, n - 1)  # 整個反轉
        reverse(0, k - 1)  # 前 k 個反轉回來
        reverse(k, n - 1)  # 後 n - k 個反轉回來`;

export default defineProblem<{ nums: number[]; k: number }>({
  id: 189,
  summary:
    "給一個整數陣列 `nums` 和非負整數 `k`，把陣列**向右輪轉 `k` 步**：每一步所有元素往右移一格，最右邊的元素繞回最左邊。\n\n要直接修改 `nums`，不需要回傳。進階要求是只用 O(1) 的額外空間。",
  examples: [
    { input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]" },
    { input: "nums = [-1,-100,3,99], k = 2", output: "[3,99,-1,-100]" },
  ],
  constraints: ["1 ≤ nums.length ≤ 10⁵", "0 ≤ k ≤ 10⁵"],
  idea:
    "向右轉 `k` 步，其實就是把**最後 `k` 個**整塊搬到最前面。**三次反轉**可以原地做到：先把整個陣列反轉，後 `k` 個就跑到前面了（但兩塊內部的順序都顛倒）；再分別把前 `k` 個和後 `n - k` 個各自反轉回來，內部順序就恢復了。",
  steps: [
    "`k %= n`：轉 `n` 步會回到原樣，只有餘數有意義。",
    "反轉整個陣列 `[0, n - 1]`。",
    "反轉前 `k` 個 `[0, k - 1]`。",
    "反轉剩下的 `[k, n - 1]`。",
  ],
  pitfalls: [
    "忘記 `k %= n`：當 `k ≥ n` 時 `reverse(0, k - 1)` 會超出範圍。",
    "題目要求原地修改；`nums = nums[-k:] + nums[:-k]` 只是讓區域變數指向新串列，呼叫端看到的陣列不會變（要寫成 `nums[:] = ...`，而且那是 O(n) 空間）。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """不需要回傳，直接修改 nums"""
        `,
  presets: [
    { label: "[1,2,3,4,5,6,7], k = 3", input: { nums: [1, 2, 3, 4, 5, 6, 7], k: 3 }, expected: "[5, 6, 7, 1, 2, 3, 4]" },
    { label: "[-1,-100,3,99], k = 2", input: { nums: [-1, -100, 3, 99], k: 2 }, expected: "[3, 99, -1, -100]" },
    { label: "[1,2,3,4,5], k = 7", input: { nums: [1, 2, 3, 4, 5], k: 7 }, expected: "[4, 5, 1, 2, 3]" },
  ],
  trace({ nums: input, k: k0 }) {
    const t = tracer();
    const nums = [...input];
    const n = nums.length;
    const ids = nums.map((_, i) => i);
    const k = k0 % n;

    // 用「身分」上色：原本的最後 k 個是一塊（alt），其餘是另一塊
    const view = (
      range: { from: number; to: number; label: string } | null,
      pointers: Record<string, number> = {},
      extra: Record<number, Tone> = {},
    ) => {
      const marks: Record<number, Tone> = {};
      const origMarks: Record<number, Tone> = {};
      ids.forEach((id, pos) => {
        if (id >= n - k) marks[pos] = "alt";
      });
      for (let i = n - k; i < n; i++) origMarks[i] = "alt";
      return [
        V.array("原本的 nums", input, { marks: origMarks }),
        V.array("nums", nums, {
          ids,
          marks: { ...marks, ...extra },
          pointers,
          ranges: range ? [{ ...range, tone: "active" }] : [],
        }),
      ];
    };

    t.push({
      line: [3, 4],
      note:
        k0 === k
          ? `\`n = ${n}\`、\`k = ${k}\`。向右轉 ${k} 步，就是把**最後 ${k} 個**（上色的那一塊）整塊搬到最前面。`
          : `\`n = ${n}\`。轉 ${n} 步會回到原樣，所以 \`k = ${k0} % ${n} = ${k}\`：只需要把**最後 ${k} 個**（上色的那一塊）搬到最前面。`,
      views: view(null),
      vars: { n, k },
    });

    const reverse = (l0: number, r0: number, callLine: number, intro: string, outro: string) => {
      let l = l0;
      let r = r0;
      const label = `reverse(${l0}, ${r0})`;
      const range = l0 <= r0 ? { from: l0, to: r0, label } : null;
      t.push({
        line: [callLine, 6],
        note: intro,
        views: view(range, l0 <= r0 ? { l, r } : {}),
        vars: { n, k, l, r },
      });
      while (l < r) {
        t.push({
          line: [7, 8],
          note: `\`l = ${l}\` < \`r = ${r}\`，交換頭尾這兩格：\`${nums[l]}\` ↔ \`${nums[r]}\`。`,
          views: view(range, { l, r }, { [l]: "compare", [r]: "compare" }),
          vars: { n, k, l, r },
        });
        [nums[l], nums[r]] = [nums[r], nums[l]];
        [ids[l], ids[r]] = [ids[r], ids[l]];
        const a = l;
        const b = r;
        l++;
        r--;
        t.push({
          line: 9,
          note: `換好了，兩個指標往中間各靠一格：\`l = ${l}\`、\`r = ${r}\`。`,
          views: view(range, { l, r }, { [a]: "active", [b]: "active" }),
          vars: { n, k, l, r },
        });
      }
      t.push({
        line: 7,
        note: outro,
        views: view(range),
        vars: { n, k, l, r },
      });
    };

    reverse(
      0,
      n - 1,
      11,
      "**第一步：整個反轉。**這會把後面那一塊送到前面 —— 位置對了，只是順序暫時是反的。",
      k > 0
        ? `\`l >= r\`，整個陣列反轉完成。上色的那一塊已經在最前面 ${k} 格了，但兩塊的內部順序都是顛倒的。`
        : "`l >= r`，整個陣列反轉完成。",
    );
    reverse(
      0,
      k - 1,
      12,
      k > 1
        ? `**第二步：把前 ${k} 個反轉回來**，修正這一塊的內部順序。`
        : k === 1
          ? "**第二步：反轉前 1 個** —— 只有一個元素，`l < r` 不成立，什麼都不用做。"
          : "**第二步：**`k = 0`，`reverse(0, -1)` 是空區間，什麼都不做。",
      k > 0 ? `前 ${k} 個的順序恢復了。` : "空區間，沒有任何交換。",
    );
    reverse(
      k,
      n - 1,
      13,
      `**第三步：把後 ${n - k} 個反轉回來**，修正另一塊的內部順序。`,
      `後 ${n - k} 個的順序也恢復了。`,
    );

    const done: Record<number, Tone> = {};
    nums.forEach((_, i) => (done[i] = "good"));
    t.push({
      line: 13,
      note: `三次反轉做完，\`nums\` 就是向右轉 ${k0} 步的結果。每個元素最多被交換兩次，沒有用到額外陣列。`,
      views: [
        V.array("原本的 nums", input),
        V.array("nums", nums, { ids, marks: done }),
      ],
      vars: { n, k },
      result: py(nums),
    });
    return t.frames;
  },
});
