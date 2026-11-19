import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        best = 0
        while l < r:
            area = (r - l) * min(height[l], height[r])
            best = max(best, area)
            if height[l] < height[r]:
                l += 1  # 左邊是短板，換掉它
            else:
                r -= 1  # 右邊是短板（或一樣高），換掉它
        return best`;

export default defineProblem<{ height: number[] }>({
  id: 11,
  summary:
    "有一排垂直的線，第 `i` 條的高度是 `height[i]`。任選兩條線，和 x 軸一起圍成一個容器，**能裝的水量 = 兩線的距離 × 較矮那條的高度**。\n\n找出能裝最多水的那一組，回傳最大水量。容器不能傾斜，中間的線不會擋住水。",
  summaryEn:
    "There is a row of vertical lines, and line `i` has height `height[i]`. Any two lines together with the x-axis form a container, and **the water it holds = the distance between the lines × the height of the shorter line**.\n\nFind the pair that holds the most water and return that amount. The container cannot be tilted, and the lines in between do not block the water.",
  examples: [
    { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", note: "選索引 1 和 8：寬 7 × 高 min(8, 7) = 49", noteEn: "Pick indices 1 and 8: width 7 × height min(8, 7) = 49" },
    { input: "height = [1,1]", output: "1" },
  ],
  constraints: ["2 ≤ height.length ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"],
  constraintsEn: ["2 ≤ height.length ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"],
  idea:
    "從**最寬**的容器開始，兩個指標往內縮。每縮一步寬度一定變小，想讓面積變大只能靠「變高」—— 而高度被**短板**限制住，所以移動長板絕對沒用，每次都該**丟掉短板**那一邊。",
  steps: [
    "`l`、`r` 放在最左和最右，這是寬度最大的容器。",
    "算出目前面積 `(r - l) * min(height[l], height[r])`，更新 `best`。",
    "比較兩邊高度，把**較矮**的那個指標往內移一格（一樣高時移哪邊都可以）。",
    "重複直到 `l` 和 `r` 相遇，回傳 `best`。",
  ],
  pitfalls: [
    "為什麼可以放心丟掉短板？以短板為邊的其他容器，寬度都更小、高度也不會超過短板，面積一定不會比現在大。",
    "寬度是 `r - l`（索引差），不是 `r - l + 1`。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def maxArea(self, height: List[int]) -> int:
        `,
  presets: [
    { label: "[1,8,6,2,5,4,8,3,7]", input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expected: "49" },
    { label: "[2,3,10,5,7,8,9]", input: { height: [2, 3, 10, 5, 7, 8, 9] }, expected: "36" },
    { label: "[4,4]", input: { height: [4, 4] }, expected: "4" },
  ],
  trace({ height }) {
    const t = tracer();
    const n = height.length;
    let l = 0;
    let r = n - 1;
    let best = 0;
    let bestL = 0;
    let bestR = n - 1;

    // 把 a、b 兩條線之間的水畫出來：水面高度 = 短板高度
    const view = (a: number, b: number, marks: Record<number, Tone>, tone: Tone, showWater = true) => {
      const level = Math.min(height[a], height[b]);
      const fill = height.map((h, i) => (showWater && i > a && i < b ? Math.max(0, level - h) : 0));
      const muted: Record<number, Tone> = {};
      for (let i = 0; i < n; i++) if (i < a || i > b) muted[i] = "muted";
      return V.bars("height", height, {
        pointers: { l, r },
        marks: { ...muted, ...marks },
        fill,
        ranges: [{ from: a, to: b, tone, label: `寬 ${b - a} × 高 ${level} = ${(b - a) * level}` }],
      });
    };

    t.push({
      line: [3, 4],
      note: "`l`、`r` 放在最左和最右 —— 這是**最寬**的容器。之後每一步寬度都會變小，所以只能靠換掉短板來爭取更高的水面。",
      views: [view(l, r, { [l]: "active", [r]: "active" }, "active", false)],
      vars: { l, r, best },
    });

    while (l < r) {
      const hl = height[l];
      const hr = height[r];
      const area = (r - l) * Math.min(hl, hr);
      const improved = area > best;
      if (improved) {
        best = area;
        bestL = l;
        bestR = r;
      }
      t.push({
        line: [6, 7],
        note:
          `寬 \`${r} - ${l} = ${r - l}\`，水面高度由短板決定：\`min(${hl}, ${hr}) = ${Math.min(hl, hr)}\`，面積 \`${area}\`。` +
          (improved ? `比之前的紀錄大，\`best\` 更新為 **${best}**。` : `沒有超過 \`best = ${best}\`，紀錄不變。`),
        views: [view(l, r, { [l]: improved ? "good" : "active", [r]: improved ? "good" : "active" }, improved ? "good" : "active")],
        vars: { l, r, area, best },
      });

      if (hl < hr) {
        t.push({
          line: [8, 9],
          note: `\`height[${l}] = ${hl}\` 比 \`height[${r}] = ${hr}\` 矮，左邊是短板。留著它，不管右邊怎麼換，水面都高不過 ${hl}、寬度卻只會更小 —— 丟掉它，\`l\` 右移。`,
          views: [view(l, r, { [l]: "bad", [r]: "compare" }, "active")],
          vars: { l, r, area, best },
        });
        l++;
      } else {
        t.push({
          line: [8, 10, 11],
          note:
            hl === hr
              ? `兩邊一樣高（都是 ${hr}），兩邊都是短板，移哪一邊都可以，這裡移 \`r\`。`
              : `\`height[${r}] = ${hr}\` 比 \`height[${l}] = ${hl}\` 矮，右邊是短板。留著它，水面永遠高不過 ${hr}、寬度卻只會更小 —— 丟掉它，\`r\` 左移。`,
          views: [view(l, r, { [l]: "compare", [r]: "bad" }, "active")],
          vars: { l, r, area, best },
        });
        r--;
      }
    }

    t.push({
      line: 12,
      note: `\`l\` 和 \`r\` 相遇，所有值得考慮的容器都看過了。最大的是索引 ${bestL} 和 ${bestR} 圍成的容器，水量 **${best}**。`,
      views: [view(bestL, bestR, { [bestL]: "good", [bestR]: "good" }, "good")],
      vars: { l, r, best },
      result: py(best),
    });
    return t.frames;
  },
});
