import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if nums[i] > 0:
                break  # 最小的數已經是正的，三個數加起來不可能是 0
            if i > 0 and nums[i] == nums[i - 1]:
                continue  # 同樣的值當過第一個數了，跳過
            l, r = i + 1, len(nums) - 1
            while l < r:
                total = nums[i] + nums[l] + nums[r]
                if total < 0:
                    l += 1
                elif total > 0:
                    r -= 1
                else:
                    res.append([nums[i], nums[l], nums[r]])
                    l += 1
                    r -= 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1  # 跳過重複的第二個數
        return res`;

const triple = (a: number, b: number, c: number) => `[${a}, ${b}, ${c}]`;

export default defineProblem<{ nums: number[] }>({
  id: 15,
  summary:
    "給一個整數陣列 `nums`，找出所有**相加等於 0 的三個數**（三個位置必須不同）。\n\n答案裡不能有重複的組合：`[-1, 0, 1]` 和 `[0, 1, -1]` 算同一組，只能出現一次。組合之間的順序不限。",
  summaryEn:
    "Given an integer array `nums`, find every **triple of numbers that sums to 0** (the three positions must be different).\n\nThe answer must not repeat a combination: `[-1, 0, 1]` and `[0, 1, -1]` count as the same triple and may appear only once. The triples can be in any order.",
  examples: [
    { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
    { input: "nums = [0,1,1]", output: "[]" },
    { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
  ],
  constraints: ["3 ≤ nums.length ≤ 3000", "-10⁵ ≤ nums[i] ≤ 10⁵"],
  constraintsEn: ["3 ≤ nums.length ≤ 3000", "-10⁵ ≤ nums[i] ≤ 10⁵"],
  idea:
    "**先排序**，然後固定第一個數 `nums[i]`，剩下的問題就變成「在右邊的有序區間裡找兩個數，和為 `-nums[i]`」—— 這正是頭尾雙指標的拿手好戲。排序還順便讓相同的值排在一起，**跳過相鄰的重複值**就能去重，不需要用集合。",
  steps: [
    "把 `nums` 由小到大排序。",
    "用 `i` 走訪第一個數：若 `nums[i] > 0` 可以直接結束；若和前一個值相同就跳過。",
    "`l = i + 1`、`r` 在最右邊，計算三數之和 `total`。",
    "`total < 0` → `l` 右移讓和變大；`total > 0` → `r` 左移讓和變小。",
    "`total == 0` → 記錄答案，兩個指標都往內縮，並讓 `l` 跳過和剛才相同的值。",
  ],
  pitfalls: [
    "去重要比的是**前一個**（`nums[i - 1]`、`nums[l - 1]`），而且 `i > 0` 的檢查不能少。",
    "找到答案後 `l` 和 `r` 都要移動；只移一邊的話，另一邊不變、和一定不會再是 0，白做一輪。",
    "第二個數去重就夠了：`l` 換成不同的值之後，`r` 就算停在一樣的值上，和也不會是 0。",
  ],
  complexity: { time: "O(n²)", space: "O(1)（不計排序與輸出）" },
  code,
  starter: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        `,
  presets: [
    { label: "[-1,0,1,2,-1,-4]", input: { nums: [-1, 0, 1, 2, -1, -4] }, expected: "[[-1, -1, 2], [-1, 0, 1]]" },
    { label: "[2,-2,0,0,2,-2,0]", input: { nums: [2, -2, 0, 0, 2, -2, 0] }, expected: "[[-2, 0, 2], [0, 0, 0]]" },
    { label: "[3,1,2,-1,4]", input: { nums: [3, 1, 2, -1, 4] }, expected: "[]" },
  ],
  trace({ nums: input }) {
    const t = tracer();
    const n = input.length;
    // 排序時保留原本的索引當 id，格子才會滑到新位置
    const order = input.map((_, k) => k).sort((a, b) => input[a] - input[b] || a - b);
    const nums = order.map((k) => input[k]);
    const res: number[][] = [];
    const resView = (latest = false) =>
      V.set(
        "res",
        res.map((x) => triple(x[0], x[1], x[2])),
        latest && res.length ? { marks: { [triple(...(res[res.length - 1] as [number, number, number]))]: "good" } } : {},
      );
    const base = (i: number): Record<number, Tone> => {
      const m: Record<number, Tone> = {};
      for (let k = 0; k < i; k++) m[k] = "muted";
      return m;
    };

    t.push({
      line: 3,
      note: "原始陣列是亂的，沒辦法判斷指標該往哪邊移。第一步先排序。",
      views: [V.array("nums", input, { ids: input.map((_, k) => k) }), resView()],
    });
    t.push({
      line: [3, 4],
      note: "排序完成。現在「往右走變大、往左走變小」，而且相同的值會排在一起，方便去重。",
      views: [V.array("nums", nums, { ids: order }), resView()],
    });

    let stoppedEarly = false;
    for (let i = 0; i < n - 2; i++) {
      if (nums[i] > 0) {
        t.push({
          line: [5, 6, 7],
          note: `\`nums[${i}] = ${nums[i]}\` 已經大於 0，它右邊的數只會更大，三個正數加起來不可能是 0 —— 直接結束。`,
          views: [V.array("nums", nums, { ids: order, pointers: { i }, marks: { ...base(i), [i]: "bad" } }), resView()],
          vars: { i },
        });
        stoppedEarly = true;
        break;
      }
      if (i > 0 && nums[i] === nums[i - 1]) {
        t.push({
          line: [5, 8, 9],
          note: `\`nums[${i}] = ${nums[i]}\` 和前一個 \`nums[${i - 1}]\` 相同。以 \`${nums[i]}\` 當第一個數的組合剛才都找過了，再找一次只會得到重複的答案 —— 跳過。`,
          views: [
            V.array("nums", nums, {
              ids: order,
              pointers: { i },
              marks: { ...base(i), [i - 1]: "visited", [i]: "bad" },
            }),
            resView(),
          ],
          vars: { i },
        });
        continue;
      }

      let l = i + 1;
      let r = n - 1;
      const view = (extra: Record<number, Tone> = {}) =>
        V.array("nums", nums, {
          ids: order,
          pointers: { i, l, r },
          marks: { ...base(i), [i]: "active", ...extra },
          ...(l <= r ? { ranges: [{ from: l, to: r, tone: "alt" as Tone, label: `找兩數和 = ${-nums[i]}` }] } : {}),
        });

      t.push({
        line: [5, 10],
        note: `固定第一個數 \`nums[${i}] = ${nums[i]}\`。接下來在它右邊的有序區間裡，用 \`l\`、\`r\` 找兩個數湊出 \`${-nums[i]}\`。`,
        views: [view(), resView()],
        vars: { i, l, r },
      });

      while (l < r) {
        const total = nums[i] + nums[l] + nums[r];
        const expr = `\`${nums[i]} + ${nums[l]} + ${nums[r]} = ${total}\``;
        if (total < 0) {
          t.push({
            line: [12, 13, 14],
            note: `${expr}，小於 0。想讓和變大，只能把 \`l\` 右移換一個更大的數。`,
            views: [view({ [l]: "bad", [r]: "compare" }), resView()],
            vars: { i, l, r, total },
          });
          l++;
        } else if (total > 0) {
          t.push({
            line: [12, 15, 16],
            note: `${expr}，大於 0。想讓和變小，只能把 \`r\` 左移換一個更小的數。`,
            views: [view({ [l]: "compare", [r]: "bad" }), resView()],
            vars: { i, l, r, total },
          });
          r--;
        } else {
          res.push([nums[i], nums[l], nums[r]]);
          t.push({
            line: [12, 17, 18],
            note: `${expr}，剛好是 0！把 \`${triple(nums[i], nums[l], nums[r])}\` 加進答案。`,
            views: [view({ [i]: "good", [l]: "good", [r]: "good" }), resView(true)],
            vars: { i, l, r, total },
          });
          l++;
          r--;
          t.push({
            line: [19, 20],
            note:
              l < r
                ? "兩個指標都往內縮：只動一邊的話另一個數沒變，和不可能再是 0。"
                : "兩個指標都往內縮，`l` 和 `r` 已經碰頭，這個 `i` 找完了。",
            views: [view(l < r ? { [l]: "compare", [r]: "compare" } : {}), resView()],
            vars: { i, l, r },
          });
          while (l < r && nums[l] === nums[l - 1]) {
            t.push({
              line: [21, 22],
              note: `\`nums[${l}] = ${nums[l]}\` 和剛才用過的 \`nums[${l - 1}]\` 一樣，拿它當第二個數只會得到重複的組合 —— \`l\` 再往右跳。`,
              views: [view({ [l - 1]: "visited", [l]: "bad", [r]: "compare" }), resView()],
              vars: { i, l, r },
            });
            l++;
          }
        }
      }
    }

    const final: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) final[k] = "muted";
    t.push({
      line: 23,
      note:
        (stoppedEarly ? "" : "每個可以當第一個數的位置都試過了。") +
        (res.length ? `總共找到 ${res.length} 組不重複的三元組。` : "沒有任何三個數的和為 0，回傳空陣列。"),
      views: [V.array("nums", nums, { ids: order, marks: final }), resView()],
      result: py(res),
    });
    return t.frames;
  },
});
