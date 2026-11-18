import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = Counter(s)  # s 裡每個字母的數量
        for c in t:
            if count[c] == 0:
                return False
            count[c] -= 1
        return True`;

const COUNT = "count（字母 → 還沒被抵銷的數量）";

export default defineProblem<{ s: string; t: string }>({
  id: 242,
  summary:
    "給兩個字串 `s` 和 `t`，判斷 `t` 是不是 `s` 的**字母異位詞**（anagram）：把 `s` 的字母重新排列後能不能剛好得到 `t`。\n\n換句話說，兩個字串用到的字母種類與每種的數量要完全相同，只有順序可以不同。",
  examples: [
    { input: 's = "anagram", t = "nagaram"', output: "true" },
    { input: 's = "rat", t = "car"', output: "false" },
  ],
  constraints: ["1 ≤ s.length, t.length ≤ 5 × 10⁴", "只包含小寫英文字母"],
  idea:
    "順序不重要，重要的只有**每個字母出現幾次**。先確認長度相同，再數 `s` 的字母，接著用 `t` 的字母一個一個去抵銷。因為長度一樣，只要 `t` 沒有任何字母「多出來」，就代表兩邊完全相同。",
  steps: [
    "長度不同一定不是異位詞，直接回傳 `False`。",
    "`count = Counter(s)` 統計 `s` 中每個字母的數量。",
    "走訪 `t` 的每個字母 `c`：若 `count[c] == 0`，表示 `t` 的 `c` 比 `s` 多，回傳 `False`；否則扣 1。",
    "走完都沒問題就回傳 `True`。",
  ],
  pitfalls: [
    "**長度檢查不能省**：少了它，`s = \"aab\"`、`t = \"ab\"` 會因為 `t` 的字母都扣得掉而被誤判成 `True`。",
    "面試時也可以直接寫 `Counter(s) == Counter(t)` 或 `sorted(s) == sorted(t)`（後者是 O(n log n)），但要能說出背後在比什麼。",
  ],
  complexity: { time: "O(n)", space: "O(1)（最多 26 個字母）" },
  code,
  starter: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        `,
  presets: [
    { label: '"listen" / "silent"', input: { s: "listen", t: "silent" }, expected: "True" },
    { label: '"aacc" / "ccac"', input: { s: "aacc", t: "ccac" }, expected: "False" },
    { label: '"aab" / "ab"（長度不同）', input: { s: "aab", t: "ab" }, expected: "False" },
  ],
  trace({ s, t }) {
    const tr = tracer();
    const count = new Map<string, number>();

    if (s.length !== t.length) {
      tr.push({
        line: [3, 4],
        note: `\`s\` 長度 ${s.length}、\`t\` 長度 ${t.length}。字母總數不一樣，怎麼排都不可能相同，直接回傳 \`False\`。`,
        views: [V.chars("s", s), V.chars("t", t), V.map(COUNT, count)],
        vars: { "len(s)": s.length, "len(t)": t.length },
        result: py(false),
      });
      return tr.frames;
    }

    tr.push({
      line: 3,
      note: `兩個字串長度都是 ${s.length}，有機會是異位詞。接下來只要比**每個字母的數量**。`,
      views: [V.chars("s", s), V.chars("t", t), V.map(COUNT, count)],
      vars: { "len(s)": s.length, "len(t)": t.length },
    });

    for (let j = 0; j < s.length; j++) {
      const ch = s[j];
      count.set(ch, (count.get(ch) ?? 0) + 1);
      const sMarks: Record<number, Tone> = {};
      for (let k = 0; k < j; k++) sMarks[k] = "visited";
      sMarks[j] = "active";
      tr.push({
        line: 5,
        note:
          j === 0
            ? `\`Counter(s)\` 把 \`s\` 的字母逐一計數。第一個是 \`${ch}\`。`
            : `數到 \`${ch}\`，目前 \`s\` 裡的 \`${ch}\` 有 ${count.get(ch)} 個。`,
        views: [
          V.chars("s", s, { pointers: { j }, marks: sMarks }),
          V.chars("t", t),
          V.map(COUNT, count, { marks: { [ch]: "active" } }),
        ],
      });
    }

    const tMarks: Record<number, Tone> = {};
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      const have = count.get(c) ?? 0;
      const views = (cur: Tone, entry: Tone) => [
        V.chars("s", s),
        V.chars("t", t, { pointers: { i }, marks: { ...tMarks, [i]: cur } }),
        V.map(COUNT, count, { marks: count.has(c) ? { [c]: entry } : {} }),
      ];

      if (have === 0) {
        tr.push({
          line: [6, 7, 8],
          note: count.has(c)
            ? `\`t[${i}] = ${c}\`，但 \`count["${c}"]\` 已經是 0 —— \`s\` 的 \`${c}\` 全被抵銷完了，\`t\` 的 \`${c}\` 比 \`s\` 多，不是異位詞。`
            : `\`t[${i}] = ${c}\`，但 \`s\` 裡**完全沒有** \`${c}\`（\`count["${c}"]\` 是 0），不是異位詞。`,
          views: views("bad", "bad"),
          vars: { c, "count[c]": 0 },
          result: py(false),
        });
        return tr.frames;
      }

      count.set(c, have - 1);
      tMarks[i] = "good";
      tr.push({
        line: [6, 7, 9],
        note: `\`t[${i}] = ${c}\`，\`count["${c}"]\` 是 ${have}，不是 0，可以和 \`s\` 的一個 \`${c}\` 互相抵銷：${have} → ${have - 1}。`,
        views: views("good", "active"),
        vars: { c, "count[c]": have - 1 },
      });
    }

    tr.push({
      line: 10,
      note: "`t` 的每個字母都找到 `s` 的字母抵銷；長度又相同，所以 `count` 全部歸零、沒有剩下的 —— 兩者是字母異位詞。",
      views: [V.chars("s", s), V.chars("t", t, { marks: tMarks }), V.map(COUNT, count)],
      result: py(true),
    });
    return tr.frames;
  },
});
