import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def hIndex(self, citations: List[int]) -> int:
        citations.sort(reverse=True)  # 引用數由大到小
        h = 0
        while h < len(citations) and citations[h] >= h + 1:
            h += 1
        return h`;

export default defineProblem<{ citations: number[] }>({
  id: 274,
  summary:
    "`citations[i]` 是一位研究者第 `i` 篇論文被引用的次數。**h 指數**的定義是：最大的 `h`，使得至少有 `h` 篇論文各自被引用了**至少 `h` 次**。\n\n回傳這位研究者的 h 指數。",
  summaryEn:
    "`citations[i]` is how many times a researcher's `i`-th paper has been cited. The **h-index** is the largest `h` such that at least `h` papers have each been cited **at least `h` times**.\n\nReturn the researcher's h-index.",
  examples: [
    { input: "citations = [3,0,6,1,5]", output: "3", note: "有 3 篇（3、6、5）被引用至少 3 次", noteEn: "3 papers (3, 6, 5) have at least 3 citations each" },
    { input: "citations = [1,3,1]", output: "1" },
  ],
  constraints: ["1 ≤ citations.length ≤ 5000", "0 ≤ citations[i] ≤ 1000"],
  constraintsEn: ["1 ≤ citations.length ≤ 5000", "0 ≤ citations[i] ≤ 1000"],
  idea:
    "把引用數**由大到小**排好之後，排在第 `h + 1` 名的論文前面（含自己）剛好有 `h + 1` 篇、而且每一篇的引用數都不比它少。所以只要它的引用數 `≥ h + 1`，就代表「有 `h + 1` 篇至少被引用 `h + 1` 次」成立。從第 1 名一路往後檢查，第一次不成立的地方就是答案。",
  steps: [
    "把 `citations` 由大到小排序。",
    "`h = 0`。只要第 `h + 1` 名的論文（索引 `h`）引用數 `≥ h + 1`，就 `h += 1`。",
    "條件不成立或論文看完就停，回傳 `h`。",
  ],
  pitfalls: [
    "比較的對象是**名次** `h + 1`，不是索引 `h`。",
    "引用數越往後越小、門檻卻越來越高，所以一旦不成立，後面也不可能成立，可以直接停。",
    "排序解法是 O(n log n)。因為答案不會超過 `n`，也可以用計數（把 `≥ n` 的都算在同一桶）做到 O(n)，但排序版最好記。",
  ],
  complexity: { time: "O(n log n)", space: "O(1)（不含排序本身）" },
  code,
  starter: `class Solution:
    def hIndex(self, citations: List[int]) -> int:
        `,
  presets: [
    { label: "[3,0,6,1,5]", input: { citations: [3, 0, 6, 1, 5] }, expected: "3" },
    { label: "[4,10,3,8,5,1]", input: { citations: [4, 10, 3, 8, 5, 1] }, expected: "4" },
    { label: "[7,9,8]", input: { citations: [7, 9, 8] }, expected: "3" },
  ],
  trace({ citations: input }) {
    const t = tracer();
    const n = input.length;
    let citations = [...input];
    let ids = citations.map((_, i) => i);
    const need = citations.map((_, i) => i + 1);
    let h = 0;

    const views = (
      marks: Record<number, Tone> = {},
      showPointer = true,
      needMarks: Record<number, Tone> = {},
    ) => [
      V.bars("citations", citations, { ids, marks, pointers: showPointer ? { h } : {} }),
      V.array("門檻：第幾名就要有幾次引用（h + 1）", need, { marks: needMarks, pointers: showPointer ? { h } : {} }),
    ];
    const passed = (tone: Tone = "good") => {
      const m: Record<number, Tone> = {};
      for (let x = 0; x < h; x++) m[x] = tone;
      return m;
    };

    t.push({
      line: 2,
      note: "原始的引用數沒有順序，很難直接看出「有幾篇至少被引用幾次」。",
      views: views({}, false),
      vars: { n },
    });

    // 穩定排序（由大到小），ids 跟著搬，長條會滑到新位置
    const order = ids.slice().sort((a, b) => input[b] - input[a] || a - b);
    citations = order.map((id) => input[id]);
    ids = order;
    t.push({
      line: 3,
      note: "由大到小排序。現在排第 `k` 名的論文，前面（含自己）剛好有 `k` 篇，而且都不比它少 —— 所以只要看它自己有沒有 `≥ k` 次引用。",
      views: views({}, false),
      vars: { n },
    });

    t.push({
      line: 4,
      note: "`h = 0`：目前確定的 h 指數是 0。接著從第 1 名開始，一名一名往後檢查。",
      views: views(),
      vars: { h },
    });

    while (h < n && citations[h] >= h + 1) {
      t.push({
        line: 5,
        note: `第 ${h + 1} 名有 \`${citations[h]}\` 次引用，\`${citations[h]} ≥ ${h + 1}\` 成立：前 ${h + 1} 篇都至少被引用 ${h + 1} 次。`,
        views: views({ ...passed(), [h]: "active" }, true, { [h]: "compare" }),
        vars: { h, "citations[h]": citations[h], "h + 1": h + 1 },
      });
      h++;
      t.push({
        line: 6,
        note: `所以 h 指數至少是 ${h}，\`h = ${h}\`。再看下一名能不能撐住更高的門檻。`,
        views: views(passed()),
        vars: { h },
      });
    }

    if (h < n) {
      const rest: Record<number, Tone> = { ...passed(), [h]: "bad" };
      for (let x = h + 1; x < n; x++) rest[x] = "muted";
      t.push({
        line: 5,
        note: `第 ${h + 1} 名只有 \`${citations[h]}\` 次引用，\`${citations[h]} ≥ ${h + 1}\` **不成立**。後面的引用數只會更少、門檻只會更高，不用再看了。`,
        views: views(rest, true, { [h]: "bad" }),
        vars: { h, "citations[h]": citations[h], "h + 1": h + 1 },
      });
    } else {
      t.push({
        line: 5,
        note: `\`h = ${h}\` 已經等於論文總數，每一篇都通過門檻，迴圈結束。`,
        views: views(passed()),
        vars: { h },
      });
    }

    const final: Record<number, Tone> = passed();
    for (let x = h; x < n; x++) final[x] = "muted";
    t.push({
      line: 7,
      note:
        h > 0
          ? `有 ${h} 篇論文各自被引用至少 ${h} 次，而且湊不出 ${h + 1} 篇各 ${h + 1} 次，所以 h 指數是 \`${h}\`。`
          : "連引用最多的那篇都不到 1 次，h 指數是 `0`。",
      views: views(final, true, h > 0 ? { [h - 1]: "good" } : {}),
      vars: { h },
      result: py(h),
    });
    return t.frames;
  },
});
