import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        k = 0  # 下一個要保留的數該放的位置
        for i in range(len(nums)):
            if nums[i] != val:
                nums[k] = nums[i]
                k += 1
        return k`;

export default defineProblem<{ nums: number[]; val: number }>({
  id: 27,
  summary:
    "給一個整數陣列 `nums` 和一個數值 `val`，請**原地**把所有等於 `val` 的元素拿掉，並回傳剩下的元素個數 `k`。\n\n評分只看 `nums` 的前 `k` 格：裡面必須正好是那些不等於 `val` 的數（順序不限），第 `k` 格之後放什麼都無所謂。",
  examples: [
    { input: "nums = [3,2,2,3], val = 3", output: "2, nums = [2,2,_,_]" },
    { input: "nums = [0,1,2,2,3,0,4,2], val = 2", output: "5, nums = [0,1,3,0,4,_,_,_]" },
  ],
  constraints: ["0 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 50", "0 ≤ val ≤ 100"],
  idea:
    "用**快慢雙指標**：快指標 `i` 負責把每個數看過一遍，慢指標 `k` 指著「下一個要保留的數該放哪」。遇到要留的數就抄到 `nums[k]`、`k` 前進；遇到 `val` 就直接跳過。因為 `k ≤ i`，寫入永遠不會蓋掉還沒看過的數。",
  steps: [
    "`k = 0`：目前保留了 0 個數。",
    "`i` 由左到右走訪每個元素。",
    "若 `nums[i] != val`：這個數要留下，抄到 `nums[k]`，`k += 1`。",
    "若 `nums[i] == val`：什麼都不做，等於把它丟掉。",
    "走完後 `k` 就是保留的個數，前 `k` 格就是答案。",
  ],
  pitfalls: [
    "不要真的用 `nums.remove()` 或 `del` 一個一個刪 —— 每刪一次後面都要整批往前搬，會變成 O(n²)。",
    "回傳的是**個數** `k`，不是陣列；`k` 之後的內容不用清掉。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        `,
  presets: [
    { label: "[0,1,2,2,3,0,4,2], val = 2", input: { nums: [0, 1, 2, 2, 3, 0, 4, 2], val: 2 }, expected: "5" },
    { label: "[3,2,2,3], val = 3", input: { nums: [3, 2, 2, 3], val: 3 }, expected: "2" },
    { label: "[4,4,4], val = 4", input: { nums: [4, 4, 4], val: 4 }, expected: "0" },
  ],
  trace({ nums: input, val }) {
    const t = tracer();
    const nums = [...input];
    const n = nums.length;
    let k = 0;

    // [0, k) 保留區；[k, i) 已看過、可被覆蓋；i 之後還沒看
    const view = (i: number, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let x = 0; x < n; x++) {
        if (x < k) marks[x] = "good";
        else if (x < i) marks[x] = "muted";
      }
      return V.array("nums", nums, {
        marks: { ...marks, ...extra },
        pointers: i < n ? { k, i } : { k },
        ranges: [{ from: 0, to: k - 1, tone: "good", label: `保留 ${k} 個` }],
      });
    };

    t.push({
      line: 3,
      note: `\`k = 0\`：目前一個數都還沒保留。\`k\` 同時也是「下一個要留的數該放的位置」。要拿掉的值是 \`val = ${val}\`。`,
      views: [view(0)],
      vars: { val, k },
    });

    for (let i = 0; i < n; i++) {
      if (nums[i] !== val) {
        t.push({
          line: [4, 5],
          note: `\`nums[${i}] = ${nums[i]}\` 不等於 \`${val}\`，這個數要留下。`,
          views: [view(i, { [i]: "active" })],
          vars: { val, i, k },
        });
        const same = i === k;
        nums[k] = nums[i];
        k++;
        t.push({
          line: [6, 7],
          note: same
            ? `\`i\` 和 \`k\` 在同一格，抄給自己等於沒動；\`k\` 前進到 ${k}，保留區多一格。`
            : `把 \`${nums[k - 1]}\` 抄到 \`nums[${k - 1}]\`（那格原本的內容已經不需要了），\`k\` 前進到 ${k}。`,
          views: [view(i + 1, same ? {} : { [i]: "compare", [k - 1]: "good" })],
          vars: { val, i, k },
        });
      } else {
        t.push({
          line: [4, 5],
          note: `\`nums[${i}] = ${nums[i]}\` 等於 \`val\`，要丟掉 —— 做法就是**不抄**它，\`k\` 留在原地，之後會被別的數蓋過去。`,
          views: [view(i, { [i]: "bad" })],
          vars: { val, i, k },
        });
      }
    }

    t.push({
      line: 8,
      note:
        k > 0
          ? `全部看完。前 \`k = ${k}\` 格 \`${py(nums.slice(0, k))}\` 就是拿掉 \`${val}\` 之後的結果，後面的內容不重要。`
          : `全部看完，每個數都等於 \`${val}\`，一個都沒留下，\`k = 0\`。`,
      views: [view(n)],
      vars: { val, k },
      result: py(k),
    });
    return t.frames;
  },
});
