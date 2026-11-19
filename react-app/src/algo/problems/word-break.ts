import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        n = len(s)
        dp = [False] * (n + 1)  # dp[i] = s 的前 i 個字元能不能被切成字典裡的單字
        dp[0] = True
        for i in range(1, n + 1):
            for j in range(i):
                # 前 j 個切得開，而且剩下的 s[j:i] 剛好是一個單字
                if dp[j] and s[j:i] in words:
                    dp[i] = True
                    break
        return dp[n]`;

export default defineProblem<{ s: string; wordDict: string[] }>({
  id: 139,
  summary:
    "給一個字串 `s` 和一份單字表 `wordDict`，判斷 `s` 能不能被**切成一個或多個字典裡的單字**（中間不能有剩下的字元）。\n\n同一個單字可以重複使用。",
  summaryEn:
    "Given a string `s` and a word list `wordDict`, decide whether `s` can be **split into one or more dictionary words** with no characters left over.\n\nThe same word may be used more than once.",
  examples: [
    { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true" },
    { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true", note: "apple 用了兩次", noteEn: "apple is used twice" },
    { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false" },
  ],
  constraints: ["1 ≤ s.length ≤ 300", "1 ≤ wordDict.length ≤ 1000", "wordDict 內的單字不重複"],
  constraintsEn: ["1 ≤ s.length ≤ 300", "1 ≤ wordDict.length ≤ 1000", "The words in wordDict are unique"],
  idea:
    "定義 `dp[i]` = `s` 的**前 `i` 個字元**能不能被切開。要讓 `dp[i]` 成立，只要找到一個切點 `j`：前半段 `dp[j]` 已經切得開，而且最後一段 `s[j:i]` 剛好是字典裡的單字。",
  steps: [
    "把字典轉成 `set`，查詢才是 O(1)。",
    "`dp[0] = True`：空字串不用切就成立。",
    "對每個 `i`，枚舉切點 `j`（`0 ≤ j < i`）：若 `dp[j]` 為真且 `s[j:i]` 在字典裡，`dp[i] = True` 並提早跳出。",
    "答案是 `dp[n]`。",
  ],
  pitfalls: [
    "貪心（每次切最長或最短的單字）會錯：`\"catsandog\"` 先切 `cats` 或 `cat` 都會卡住，必須記住所有可行的切點。",
    "`dp[0]` 一定要是 `True`，不然整張表永遠是 `False`。",
  ],
  complexity: { time: "O(n²)（再乘上切片與雜湊的 O(n)）", space: "O(n + 字典大小)" },
  code,
  starter: `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        `,
  presets: [
    { label: '"leetcode"', input: { s: "leetcode", wordDict: ["leet", "code"] }, expected: "True" },
    { label: '"catsandog"', input: { s: "catsandog", wordDict: ["cats", "dog", "sand", "and", "cat"] }, expected: "False" },
    { label: '"aaab"', input: { s: "aaab", wordDict: ["a", "aa"] }, expected: "False" },
  ],
  trace({ s, wordDict }) {
    const t = tracer();
    const words = new Set(wordDict);
    const n = s.length;
    const dp: boolean[] = new Array(n + 1).fill(false);
    let done = 0; // dp[0..done] 已經確定

    const dpMarks = (extra: Record<number, Tone> = {}) => {
      const m: Record<number, Tone> = {};
      for (let k = 0; k <= done; k++) m[k] = dp[k] ? "good" : "muted";
      return { ...m, ...extra };
    };
    const views = (o: {
      i?: number;
      j?: number;
      tone?: Tone;
      dpExtra?: Record<number, Tone>;
      word?: string;
      wordTone?: Tone;
    }) => [
      V.chars("s", s, {
        ranges:
          o.i !== undefined && o.j !== undefined
            ? [{ from: o.j, to: o.i - 1, tone: o.tone ?? "compare", label: `s[${o.j}:${o.i}]` }]
            : [],
      }),
      V.array("dp", dp, {
        marks: dpMarks(o.dpExtra),
        pointers: { ...(o.j !== undefined ? { j: o.j } : {}), ...(o.i !== undefined ? { i: o.i } : {}) },
      }),
      V.set("words", wordDict, {
        marks: o.word !== undefined && words.has(o.word) ? { [o.word]: o.wordTone ?? "good" } : {},
      }),
    ];

    t.push({
      line: [3, 4, 5],
      note: `\`dp[i]\` 的意思是：**\`s\` 的前 \`i\` 個字元能不能被切成字典裡的單字**。表格長度是 \`n + 1 = ${n + 1}\`，答案在 \`dp[${n}]\`。`,
      views: [V.chars("s", s), V.array("dp", dp), V.set("words", wordDict)],
      vars: { n },
    });

    dp[0] = true;
    t.push({
      line: 6,
      note: "`dp[0] = True`：空字串什麼都不用切，天生成立。它是所有切法的起點。",
      views: views({}),
      vars: { n },
    });

    for (let i = 1; i <= n; i++) {
      const skipped: number[] = [];
      let found = false;
      for (let j = 0; j < i; j++) {
        if (!dp[j]) {
          skipped.push(j);
          continue;
        }
        const piece = s.slice(j, i);
        const hit = words.has(piece);
        const skipNote = skipped.length
          ? `（\`j = ${skipped.join("、")}\` 的 \`dp[j]\` 是 False，前半段就切不開，直接跳過。）`
          : "";
        skipped.length = 0;
        if (hit) {
          dp[i] = true;
          done = i;
          found = true;
          t.push({
            line: [8, 10, 11, 12],
            note: `切點 \`j = ${j}\`：\`dp[${j}]\` 是 True，最後一段 \`s[${j}:${i}] = "${piece}"\` 也在字典裡 → \`dp[${i}] = True\`，不用再試其他切點。${skipNote}`,
            views: views({ i, j, tone: "good", dpExtra: { [j]: "compare", [i]: "active" }, word: piece }),
            vars: { i, j, "s[j:i]": piece },
          });
          break;
        }
        t.push({
          line: [8, 10],
          note: `切點 \`j = ${j}\`：\`dp[${j}]\` 是 True，但最後一段 \`s[${j}:${i}] = "${piece}"\` 不在字典裡，這個切法不行。${skipNote}`,
          views: views({ i, j, tone: "bad", dpExtra: { [j]: "compare", [i]: "active" } }),
          vars: { i, j, "s[j:i]": piece },
        });
      }
      if (!found) {
        done = i;
        t.push({
          line: [7, 8],
          note: `\`i = ${i}\` 的所有切點都試過了，沒有任何一個能讓前 ${i} 個字元 \`"${s.slice(0, i)}"\` 切乾淨，\`dp[${i}]\` 維持 False。`,
          views: views({ i, dpExtra: { [i]: "bad" } }),
          vars: { i },
        });
      }
    }

    t.push({
      line: 13,
      note: dp[n]
        ? `\`dp[${n}]\` 是 True：整個字串可以被切成字典裡的單字。`
        : `\`dp[${n}]\` 是 False：不管怎麼切，最後總會剩下湊不成單字的字元。`,
      views: views({ dpExtra: { [n]: dp[n] ? "good" : "bad" } }),
      vars: { n },
      result: py(dp[n]),
    });
    return t.frames;
  },
});
