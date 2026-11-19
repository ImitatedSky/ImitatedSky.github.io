import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        count = Counter(magazine)  # 雜誌裡每個字母的庫存
        for c in ransomNote:
            if count[c] == 0:
                return False
            count[c] -= 1
        return True`;

export default defineProblem<{ ransomNote: string; magazine: string }>({
  id: 383,
  summary:
    "給兩個字串 `ransomNote` 和 `magazine`。想像要從雜誌上**剪下字母**來拼出一封信：雜誌裡的每個字母只能用一次。\n\n判斷 `magazine` 的字母夠不夠拼出 `ransomNote`。",
  summaryEn:
    "Given two strings `ransomNote` and `magazine`, imagine **cutting letters out of a magazine** to spell a note: each letter in the magazine can be used only once.\n\nDecide whether `magazine` has enough letters to build `ransomNote`.",
  examples: [
    { input: 'ransomNote = "aa", magazine = "ab"', output: "false", note: "雜誌只有一個 a", noteEn: "The magazine has only one a" },
    { input: 'ransomNote = "aa", magazine = "aab"', output: "true" },
  ],
  constraints: ["1 ≤ 兩個字串的長度 ≤ 10⁵", "只包含小寫英文字母"],
  constraintsEn: ["1 ≤ length of each string ≤ 10⁵", "Only lowercase English letters"],
  idea:
    "這是一個**庫存問題**：先數出雜誌裡每個字母有幾個，再照著信的內容一個一個「領用」。只要有任何一個字母領不到（庫存為 0），就拼不出來。",
  steps: [
    "用 `Counter(magazine)` 統計雜誌中每個字母的數量。",
    "走訪 `ransomNote` 的每個字母 `c`。",
    "若 `count[c] == 0`，代表這個字母已經用完（或根本沒有），回傳 `False`。",
    "否則 `count[c] -= 1`，用掉一個。全部走完就回傳 `True`。",
  ],
  pitfalls: [
    "要數的是 `magazine`，扣的是 `ransomNote`，方向別弄反。",
    "`Counter` 查不存在的鍵會得到 0 而不會丟例外；如果改用一般 `dict`，要用 `count.get(c, 0)`。",
  ],
  complexity: { time: "O(m + n)", space: "O(1)（最多 26 個字母）" },
  code,
  starter: `class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        `,
  presets: [
    { label: '"aab" ← "abab"', input: { ransomNote: "aab", magazine: "abab" }, expected: "True" },
    { label: '"aab" ← "abc"', input: { ransomNote: "aab", magazine: "abc" }, expected: "False" },
    { label: '"az" ← "aab"', input: { ransomNote: "az", magazine: "aab" }, expected: "False" },
  ],
  trace({ ransomNote, magazine }) {
    const t = tracer();
    const count = new Map<string, number>();

    // 先一個一個數雜誌的字母（Python 裡是一行 Counter）
    for (let j = 0; j < magazine.length; j++) {
      const ch = magazine[j];
      count.set(ch, (count.get(ch) ?? 0) + 1);
      const mMarks: Record<number, Tone> = {};
      for (let k = 0; k < j; k++) mMarks[k] = "visited";
      mMarks[j] = "active";
      t.push({
        line: 3,
        note:
          j === 0
            ? `先盤點庫存：\`Counter(magazine)\` 會把雜誌的字母一個一個數過去。第一個是 \`${ch}\`。`
            : `數到 \`${ch}\`，現在雜誌裡的 \`${ch}\` 共有 ${count.get(ch)} 個。`,
        views: [
          V.chars("magazine", magazine, { pointers: { j }, marks: mMarks }),
          V.chars("ransomNote", ransomNote),
          V.map("count（字母 → 剩餘數量）", count, { marks: { [ch]: "active" } }),
        ],
      });
    }

    const noteMarks: Record<number, Tone> = {};
    for (let i = 0; i < ransomNote.length; i++) {
      const c = ransomNote[i];
      const have = count.get(c) ?? 0;
      const views = (cur: Tone, entry: Tone | null) => [
        V.chars("magazine", magazine),
        V.chars("ransomNote", ransomNote, { pointers: { i }, marks: { ...noteMarks, [i]: cur } }),
        V.map("count（字母 → 剩餘數量）", count, { marks: entry && count.has(c) ? { [c]: entry } : {} }),
      ];

      if (have === 0) {
        t.push({
          line: [4, 5, 6],
          note: count.has(c)
            ? `信需要 \`${c}\`，但 \`count["${c}"]\` 已經是 0 —— 雜誌裡的 \`${c}\` 用光了，拼不出來。`
            : `信需要 \`${c}\`，但雜誌裡**根本沒有**這個字母（\`count["${c}"]\` 是 0），拼不出來。`,
          views: views("bad", "bad"),
          vars: { c, "count[c]": 0 },
          result: py(false),
        });
        return t.frames;
      }

      t.push({
        line: [4, 5],
        note: `信的第 ${i + 1} 個字母是 \`${c}\`。查庫存：\`count["${c}"] = ${have}\`，不是 0，還有得用。`,
        views: views("active", "compare"),
        vars: { c, "count[c]": have },
      });

      count.set(c, have - 1);
      noteMarks[i] = "good";
      t.push({
        line: 7,
        note: `剪下一個 \`${c}\` 貼到信上，庫存 ${have} → ${have - 1}。每個字母只能用一次，所以一定要扣掉。`,
        views: views("good", "active"),
        vars: { c, "count[c]": have - 1 },
      });
    }

    t.push({
      line: 8,
      note: "信上的每個字母都順利領到了，雜誌的字母足夠，回傳 `True`。",
      views: [
        V.chars("magazine", magazine),
        V.chars("ransomNote", ransomNote, { marks: noteMarks }),
        V.map("count（字母 → 剩餘數量）", count),
      ],
      result: py(true),
    });
    return t.frames;
  },
});
