import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def candy(self, ratings: List[int]) -> int:
        n = len(ratings)
        candies = [1] * n
        # 左 → 右：分數比左邊鄰居高，就要比他多一顆
        for i in range(1, n):
            if ratings[i] > ratings[i - 1]:
                candies[i] = candies[i - 1] + 1
        # 右 → 左：分數比右邊鄰居高，也要比他多（取較大值，才不會破壞上一趟）
        for i in range(n - 2, -1, -1):
            if ratings[i] > ratings[i + 1]:
                candies[i] = max(candies[i], candies[i + 1] + 1)
        return sum(candies)`;

export default defineProblem<{ ratings: number[] }>({
  id: 135,
  summary:
    "一排小朋友各有一個評分 `ratings[i]`。要發糖果給他們，規則是：**每個人至少一顆**，而且**評分比相鄰同學高的人，糖果一定要比那位同學多**。\n\n問最少總共要準備幾顆糖果？",
  summaryEn:
    "A row of children each have a rating `ratings[i]`. You hand out candy with two rules: **everyone gets at least one**, and **a child with a higher rating than a neighbor must get more candy than that neighbor**.\n\nWhat is the minimum total number of candies you need?",
  examples: [
    { input: "ratings = [1,0,2]", output: "5", note: "分別發 2、1、2 顆", noteEn: "Give 2, 1 and 2 candies" },
    { input: "ratings = [1,2,2]", output: "4", note: "分別發 1、2、1 顆（評分相同不需要一樣多）", noteEn: "Give 1, 2 and 1 candies (equal ratings do not need equal candy)" },
  ],
  constraints: ["1 ≤ n ≤ 2 × 10⁴", "0 ≤ ratings[i] ≤ 2 × 10⁴"],
  constraintsEn: ["1 ≤ n ≤ 2 × 10⁴", "0 ≤ ratings[i] ≤ 2 × 10⁴"],
  idea:
    "「比兩邊鄰居都要多」同時看兩邊很難處理，但**拆成兩條單向規則**就簡單了：先由左往右只管「比左邊高分 → 比左邊多」，再由右往左只管「比右邊高分 → 比右邊多」。第二趟用 `max` 保留第一趟的結果，兩條規則就同時成立。",
  steps: [
    "每個人先發 1 顆。",
    "由左到右：若 `ratings[i] > ratings[i-1]`，`candies[i] = candies[i-1] + 1`。",
    "由右到左：若 `ratings[i] > ratings[i+1]`，`candies[i] = max(candies[i], candies[i+1] + 1)`。",
    "把 `candies` 加總。",
  ],
  pitfalls: [
    "第二趟一定要取 `max`：直接覆寫成 `candies[i+1] + 1` 可能比第一趟算的少，左邊的規則就被破壞了。",
    "評分**相同**的鄰居之間沒有限制，所以條件是嚴格的 `>`，不是 `>=`。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def candy(self, ratings: List[int]) -> int:
        `,
  presets: [
    { label: "[1,0,2,3,2,1,0]", input: { ratings: [1, 0, 2, 3, 2, 1, 0] }, expected: "15" },
    { label: "[1,3,2,1]", input: { ratings: [1, 3, 2, 1] }, expected: "7" },
    { label: "[1,2,2]", input: { ratings: [1, 2, 2] }, expected: "4" },
  ],
  trace({ ratings }) {
    const t = tracer();
    const n = ratings.length;
    const candies: number[] = new Array(n).fill(1);

    t.push({
      line: [3, 4],
      note: "每個人至少要有一顆，所以先全部發 1 顆。上面的長條是評分，下面是目前手上的糖果數。",
      views: [V.bars("ratings", ratings), V.bars("candies", candies)],
      vars: { n },
    });

    for (let i = 1; i < n; i++) {
      const higher = ratings[i] > ratings[i - 1];
      if (higher) candies[i] = candies[i - 1] + 1;
      t.push({
        line: higher ? [6, 7, 8] : [6, 7],
        note: higher
          ? `**往右掃**：\`ratings[${i}] = ${ratings[i]}\` 比左邊的 ${ratings[i - 1]} 高，所以要比左邊多一顆：\`candies[${i}] = ${candies[i - 1]} + 1 = ${candies[i]}\`。`
          : `**往右掃**：\`ratings[${i}] = ${ratings[i]}\` 沒有比左邊的 ${ratings[i - 1]} 高，這一趟只管「比左邊」，所以維持 ${candies[i]} 顆。`,
        views: [
          V.bars("ratings", ratings, { pointers: { i }, marks: { [i]: "active", [i - 1]: "compare" } }),
          V.bars("candies", candies, { marks: { [i]: higher ? "good" : "active", [i - 1]: "compare" } }),
        ],
        vars: { i },
      });
    }

    t.push({
      line: 9,
      note: "第一趟結束：每個比**左邊**高分的人都已經比左邊多了。但「比**右邊**高分」的人還沒處理，所以要再從右邊掃回來。",
      views: [V.bars("ratings", ratings), V.bars("candies", candies)],
    });

    for (let i = n - 2; i >= 0; i--) {
      const higher = ratings[i] > ratings[i + 1];
      const before = candies[i];
      const want = candies[i + 1] + 1;
      if (higher) candies[i] = Math.max(candies[i], want);
      const changed = candies[i] !== before;
      t.push({
        line: higher ? [10, 11, 12] : [10, 11],
        note: !higher
          ? `**往左掃**：\`ratings[${i}] = ${ratings[i]}\` 沒有比右邊的 ${ratings[i + 1]} 高，不用動，維持 ${before} 顆。`
          : changed
            ? `**往左掃**：\`ratings[${i}] = ${ratings[i]}\` 比右邊的 ${ratings[i + 1]} 高，至少要 \`${candies[i + 1]} + 1 = ${want}\` 顆；原本只有 ${before} 顆不夠，補到 ${want} 顆。`
            : `**往左掃**：\`ratings[${i}] = ${ratings[i]}\` 比右邊的 ${ratings[i + 1]} 高，至少要 ${want} 顆；但第一趟已經給了 ${before} 顆，\`max(${before}, ${want}) = ${before}\`，保留較大的才不會破壞左邊的規則。`,
        views: [
          V.bars("ratings", ratings, { pointers: { i }, marks: { [i]: "active", [i + 1]: "compare" } }),
          V.bars("candies", candies, { marks: { [i]: changed ? "good" : "active", [i + 1]: "compare" } }),
        ],
        vars: { i },
      });
    }

    const total = candies.reduce((a, b) => a + b, 0);
    const all: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) all[k] = "good";
    t.push({
      line: 13,
      note: `兩個方向的規則都滿足了，而且每個人拿的都是「不得不拿」的最少數量。總和 \`${candies.join(" + ")} = ${total}\`。`,
      views: [V.bars("ratings", ratings), V.bars("candies", candies, { marks: all })],
      vars: { 總和: total },
      result: py(total),
    });
    return t.frames;
  },
});
