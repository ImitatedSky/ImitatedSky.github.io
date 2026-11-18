import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}  # 字元 -> 最後一次出現的索引
        best = 0
        l = 0
        for r, c in enumerate(s):
            if c in last and last[c] >= l:
                l = last[c] + 1  # 重複了：左邊界跳到上一個 c 的右邊
            last[c] = r
            best = max(best, r - l + 1)
        return best`;

export default defineProblem<{ s: string }>({
  id: 3,
  summary:
    "給一個字串 `s`，找出其中**沒有任何重複字元**的最長子字串，回傳它的長度。\n\n子字串必須是連續的一段，不能跳著選。",
  examples: [
    { input: 's = "abcabcbb"', output: "3", note: '"abc"' },
    { input: 's = "bbbbb"', output: "1", note: '"b"' },
    { input: 's = "pwwkew"', output: "3", note: '"wke"' },
  ],
  constraints: ["0 ≤ s.length ≤ 5 × 10⁴", "s 由英文字母、數字、符號和空白組成"],
  idea:
    "維護一個**內容不重複的滑動視窗** `s[l..r]`。右邊界每次收進一個字元 `c`；如果 `c` 已經在視窗裡，就把左邊界直接跳到「上一個 `c` 的下一格」，視窗馬上恢復不重複。用雜湊表記住每個字元**最後出現的位置**，這一跳只要 O(1)。",
  steps: [
    "`last` 記錄每個字元最後一次出現的索引，`l` 是視窗左邊界。",
    "`r` 由左到右走訪每個字元 `c`。",
    "如果 `c` 出現過而且 `last[c] >= l`（上一個 `c` 還在視窗內），把 `l` 移到 `last[c] + 1`。",
    "更新 `last[c] = r`，再用視窗長度 `r - l + 1` 更新 `best`。",
  ],
  pitfalls: [
    "`last[c] >= l` 這個條件不能省：`last` 裡可能留著**視窗左邊**的舊紀錄，那不算重複，如果照著跳，`l` 反而會往回退（用 `\"abba\"` 走一遍就懂了）。",
    "先移動 `l`、更新 `last[c]`，最後才算長度，順序不要顛倒。",
  ],
  complexity: { time: "O(n)", space: "O(字元種類數)" },
  code,
  starter: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        `,
  presets: [
    { label: '"abcabcbb"', input: { s: "abcabcbb" }, expected: "3" },
    { label: '"abba"', input: { s: "abba" }, expected: "2" },
    { label: '"pwwkew"', input: { s: "pwwkew" }, expected: "3" },
  ],
  trace({ s }) {
    const t = tracer();
    const n = s.length;
    const last = new Map<string, number>();
    let best = 0;
    let bestL = 0;
    let l = 0;

    const sView = (r: number, tone: Tone, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let k = 0; k < l; k++) marks[k] = "muted";
      return V.chars("s", s, {
        pointers: r >= 0 ? { l, r } : { l },
        marks: { ...marks, ...extra },
        ...(r >= l ? { ranges: [{ from: l, to: r, tone, label: `長度 ${r - l + 1}` }] } : {}),
      });
    };
    const mapView = (marks: Record<string, Tone> = {}) => V.map("last", last, { marks });

    t.push({
      line: [3, 4, 5],
      note: "視窗一開始是空的。`last` 用來記每個字元最後出現在哪裡，`l` 是視窗的左邊界。",
      views: [sView(-1, "active"), mapView()],
      vars: { l, best },
    });

    for (let r = 0; r < n; r++) {
      const c = s[r];
      const prev = last.get(c);

      if (prev !== undefined && prev >= l) {
        t.push({
          line: [6, 7],
          note: `右邊界來到 \`s[${r}] = ${c}\`。\`last[${c}] = ${prev}\`，而 \`${prev} >= l\`（${l}）—— 上一個 \`${c}\` 還在視窗裡，重複了！`,
          views: [sView(r, "bad", { [prev]: "bad", [r]: "bad" }), mapView({ [c]: "bad" })],
          vars: { l, r, c, best },
        });
        l = prev + 1;
        t.push({
          line: 8,
          note: `左邊界直接跳到上一個 \`${c}\` 的右邊：\`l = ${prev} + 1 = ${l}\`。索引 ${prev} 以前的字元全部丟掉，視窗又不重複了。`,
          views: [sView(r, "active", { [prev]: "bad", [r]: "active" }), mapView({ [c]: "compare" })],
          vars: { l, r, c, best },
        });
      } else if (prev !== undefined) {
        t.push({
          line: [6, 7],
          note: `右邊界來到 \`s[${r}] = ${c}\`。\`last[${c}] = ${prev}\`，但 \`${prev} < l\`（${l}）—— 那個 \`${c}\` 早就被丟出視窗了，**不算重複**，\`l\` 不能往回退。`,
          views: [sView(r, "active", { [prev]: "visited", [r]: "active" }), mapView({ [c]: "visited" })],
          vars: { l, r, c, best },
        });
      } else {
        t.push({
          line: [6, 7],
          note: `右邊界來到 \`s[${r}] = ${c}\`。\`${c}\` 不在 \`last\` 裡，從沒出現過，可以直接收進視窗。`,
          views: [sView(r, "active", { [r]: "active" }), mapView()],
          vars: { l, r, c, best },
        });
      }

      last.set(c, r);
      const len = r - l + 1;
      const improved = len > best;
      if (improved) {
        best = len;
        bestL = l;
      }
      t.push({
        line: [9, 10],
        note:
          `記下 \`last[${c}] = ${r}\`。視窗 \`"${s.slice(l, r + 1)}"\` 長度 \`${r} - ${l} + 1 = ${len}\`，` +
          (improved ? `比紀錄長，\`best\` 更新為 **${best}**。` : `沒有超過 \`best = ${best}\`。`),
        views: [sView(r, improved ? "good" : "active"), mapView({ [c]: "active" })],
        vars: { l, r, c, best },
      });
    }

    const marks: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) marks[k] = best > 0 && k >= bestL && k < bestL + best ? "good" : "muted";
    t.push({
      line: 11,
      note:
        best > 0
          ? `整個字串走完。最長的不重複子字串是 \`"${s.slice(bestL, bestL + best)}"\`，長度 **${best}**。`
          : "空字串沒有任何子字串，答案是 0。",
      views: [
        V.chars("s", s, {
          pointers: n ? { l, r: n - 1 } : { l },
          marks,
          ...(best > 0 ? { ranges: [{ from: bestL, to: bestL + best - 1, tone: "good" as Tone, label: `最長，長度 ${best}` }] } : {}),
        }),
        mapView(),
      ],
      vars: { l, best },
      result: py(best),
    });
    return t.frames;
  },
});
