import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        cand, count = None, 0
        for x in nums:
            if count == 0:
                cand = x  # 沒有人站著，x 成為新的候選人
            count += 1 if x == cand else -1
        return cand`;

export default defineProblem<{ nums: number[] }>({
  id: 169,
  summary:
    "給一個長度為 `n` 的陣列 `nums`，找出其中的**多數元素** —— 出現次數**超過** `n / 2` 的那個數。題目保證這個數一定存在。\n\n進階要求：時間 O(n)、額外空間 O(1)。",
  examples: [
    { input: "nums = [3,2,3]", output: "3" },
    { input: "nums = [2,2,1,1,1,2,2]", output: "2" },
  ],
  constraints: ["1 ≤ n ≤ 5 × 10⁴", "多數元素一定存在"],
  idea:
    "**Boyer–Moore 投票法**：把不同的數兩兩「互相抵銷」。每次抵銷拿掉一個候選人的票和一個別人的票 —— 多數元素的票數超過一半，就算其他所有數聯合起來跟它對消，它也一定還有剩。所以最後留在場上的候選人就是答案。",
  steps: [
    "維護候選人 `cand` 和它目前「淨剩」的票數 `count`，一開始 `count = 0`。",
    "走訪每個數 `x`：若 `count == 0`，場上沒有人，讓 `x` 當新的候選人。",
    "`x` 等於候選人就 `count += 1`（多一票）；不等於就 `count -= 1`（拿一票互相抵銷）。",
    "走完後 `cand` 就是多數元素。",
  ],
  pitfalls: [
    "`count` 不是 `cand` 的真實出現次數，只是「還沒被抵銷掉的票數」。",
    "這個方法靠的是「多數元素一定存在」。如果題目不保證，最後要再掃一遍確認 `cand` 的次數真的過半。",
    "要先判斷 `count == 0` 換人，再做加減 —— 換人之後 `x == cand`，票數會從 0 變成 1。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        `,
  presets: [
    { label: "[2,2,1,1,1,2,2]", input: { nums: [2, 2, 1, 1, 1, 2, 2] }, expected: "2" },
    { label: "[3,5,3,4,3,3,5,3]", input: { nums: [3, 5, 3, 4, 3, 3, 5, 3] }, expected: "3" },
    { label: "[7]", input: { nums: [7] }, expected: "7" },
  ],
  trace({ nums }) {
    const t = tracer();
    let cand: number | null = null;
    let count = 0;
    // 還沒被抵銷的票（存索引），長度永遠等於 count
    const alive: number[] = [];
    const cancelled = new Set<number>();

    const views = (i: number, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      cancelled.forEach((x) => (marks[x] = "muted"));
      alive.forEach((x) => (marks[x] = "alt"));
      return [
        V.array("nums", nums, { marks: { ...marks, ...extra }, pointers: i < nums.length ? { x: i } : {} }),
        V.stack("還沒被抵銷的票（張數 = count）", alive.map((x) => nums[x])),
      ];
    };
    const vars = (x?: number) => ({ cand, count, ...(x === undefined ? {} : { x }) });

    t.push({
      line: 3,
      note: "一開始場上沒有候選人，`count = 0`。接下來把每個數當成一張票，**不同的票兩兩抵銷**，看最後誰還站著。",
      views: views(0),
      vars: vars(),
    });

    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];
      if (count === 0) {
        cand = x;
        t.push({
          line: [4, 5, 6],
          note:
            i === 0
              ? `\`count == 0\`，場上沒有人。第一張票 \`${x}\` 直接成為候選人。`
              : `\`count == 0\`：前面的票剛好全部兩兩抵銷光了，等於從這裡重新開始。\`${x}\` 成為新的候選人。`,
          views: views(i, { [i]: "active" }),
          vars: vars(x),
        });
      }

      if (x === cand) {
        count++;
        alive.push(i);
        t.push({
          line: [4, 7],
          note: `\`x = ${x}\` 和候選人 \`${cand}\` 相同，多一張支持票，\`count\` 變成 ${count}。`,
          views: views(i, { [i]: "active" }),
          vars: vars(x),
        });
      } else {
        count--;
        const victim = alive.pop()!;
        cancelled.add(victim);
        cancelled.add(i);
        t.push({
          line: [4, 7],
          note: `\`x = ${x}\` 和候選人 \`${cand}\` 不同：拿一張 \`${cand}\` 的票跟它**同歸於盡**（索引 ${victim} 和 ${i} 變灰），\`count\` 剩 ${count}。`,
          views: views(i, { [i]: "bad", [victim]: "bad" }),
          vars: vars(x),
        });
      }
    }

    const final: Record<number, Tone> = {};
    alive.forEach((x) => (final[x] = "good"));
    t.push({
      line: 8,
      note: `走完了。被抵銷的票都是「一張 A 配一張不是 A」，多數元素超過一半，不可能被消光 —— 所以還站著的 \`${cand}\` 就是答案。`,
      views: views(nums.length, final),
      vars: vars(),
      result: py(cand),
    });
    return t.frames;
  },
});
