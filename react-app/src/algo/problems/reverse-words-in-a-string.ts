import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def reverseWords(self, s: str) -> str:
        res = []
        i = len(s) - 1
        while i >= 0:
            if s[i] == " ":             # 空白不屬於任何單字，跳過
                i -= 1
                continue
            j = i                       # j 記住單字的最後一個字元
            while i >= 0 and s[i] != " ":
                i -= 1                  # i 往左走到單字開頭的前一格
            res.append(s[i + 1 : j + 1])
        return " ".join(res)`;

export default defineProblem<{ s: string }>({
  id: 151,
  summary:
    "給一個字串 `s`，把裡面的**單字順序反過來**（每個單字本身的字母順序不變）。\n\n`s` 的開頭、結尾或單字之間可能有多餘的空白；回傳的字串裡，單字之間只能有**一個**空白，頭尾不能有空白。",
  examples: [
    { input: 's = "the sky is blue"', output: '"blue is sky the"' },
    { input: 's = "  hello world  "', output: '"world hello"' },
    { input: 's = "a good   example"', output: '"example good a"' },
  ],
  constraints: ["1 ≤ s.length ≤ 10⁴", "s 至少包含一個單字"],
  idea:
    "要的是「最後一個單字排最前面」，所以**從字串尾巴往前掃**：遇到空白就跳過，遇到字母就用兩個指標框出一整個單字並收集起來。收集的順序自然就是反過來的，最後用單一空白接起來，多餘的空白也順便處理掉了。",
  steps: [
    "`i` 從最後一個字元往左走。",
    "`s[i]` 是空白 → 跳過。",
    "`s[i]` 是字母 → 用 `j` 記住單字結尾，`i` 繼續往左走到空白或字串開頭。",
    "這時單字就是 `s[i+1 : j+1]`，加進 `res`。",
    "全部掃完後 `\" \".join(res)`。",
  ],
  pitfalls: [
    "切片是 `s[i + 1 : j + 1]`：內層迴圈結束時 `i` 停在單字開頭的**前一格**，而 Python 切片不含右端點。",
    "面試時一行解 `\" \".join(s.split()[::-1])` 也是對的，但通常會被要求不用 `split` 自己掃一次。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def reverseWords(self, s: str) -> str:
        `,
  presets: [
    { label: '"  sky is  blue "', input: { s: "  sky is  blue " }, expected: '"blue is sky"' },
    { label: '"a good   day"', input: { s: "a good   day" }, expected: '"day good a"' },
    { label: '" hi "', input: { s: " hi " }, expected: '"hi"' },
  ],
  trace({ s }) {
    const t = tracer();
    const res: string[] = [];
    const marks: Record<number, Tone> = {};
    let i = s.length - 1;

    const resView = (last?: Tone) => {
      const entries: [Cell, Cell][] = res.map((w, k) => [k, w]);
      return V.map("res", entries, { marks: last && res.length ? { [String(res.length - 1)]: last } : {} });
    };

    t.push({
      line: [3, 4],
      note: "想讓最後一個單字排到最前面，所以 `i` 從字串**尾巴**開始往左掃，掃到的單字依序放進 `res`。",
      views: [V.chars("s", s, { pointers: { i } }), resView()],
      vars: { i },
    });

    while (i >= 0) {
      if (s[i] === " ") {
        marks[i] = "muted";
        i--;
        t.push({
          line: [5, 6, 7, 8],
          note: `\`s[${i + 1}]\` 是空白，不屬於任何單字，直接跳過。不管連續幾個空白都是這樣一格一格略過。`,
          views: [V.chars("s", s, { pointers: { i }, marks }), resView()],
          vars: { i },
        });
        continue;
      }

      const j = i;
      t.push({
        line: [5, 6, 9],
        note: `\`s[${i}] = "${s[i]}"\` 是字母 —— 碰到一個單字的**結尾**了。用 \`j = ${j}\` 把這個位置記下來。`,
        views: [V.chars("s", s, { pointers: { i, j }, marks: { ...marks, [i]: "active" } }), resView()],
        vars: { i, j },
      });

      while (i >= 0 && s[i] !== " ") i--;
      const word = s.slice(i + 1, j + 1);
      const wordMarks: Record<number, Tone> = {};
      for (let k = i + 1; k <= j; k++) wordMarks[k] = "active";
      t.push({
        line: [10, 11],
        note:
          `\`i\` 一路往左走，直到${i < 0 ? "走出字串開頭（`i = -1`）" : `碰到空白（\`s[${i}]\`）`}才停。` +
          `所以單字的範圍是 \`i + 1 = ${i + 1}\` 到 \`j = ${j}\`。`,
        views: [
          V.chars("s", s, {
            pointers: { i, j },
            marks: { ...marks, ...wordMarks },
            ranges: [{ from: i + 1, to: j, tone: "active", label: word }],
          }),
          resView(),
        ],
        vars: { i, j },
      });

      res.push(word);
      for (let k = i + 1; k <= j; k++) marks[k] = "visited";
      t.push({
        line: 12,
        note: `切出 \`s[${i + 1}:${j + 1}] = "${word}"\` 放進 \`res\`。因為是從後面掃過來的，越後面的單字越早進 \`res\`，順序自然就反過來了。`,
        views: [
          V.chars("s", s, {
            pointers: { i, j },
            marks,
            ranges: [{ from: i + 1, to: j, tone: "good", label: word }],
          }),
          resView("good"),
        ],
        vars: { i, j },
      });
    }

    const answer = res.join(" ");
    const all: Record<string, Tone> = {};
    res.forEach((_, k) => (all[String(k)] = "good"));
    t.push({
      line: 13,
      note: `\`i\` 走到 -1，整個字串掃完。用**一個**空白把 \`res\` 接起來：\`"${answer}"\` —— 原本多餘的空白完全沒被收進來。`,
      views: [
        V.chars("s", s, { pointers: { i }, marks }),
        V.map("res", res.map((w, k) => [k, w] as [Cell, Cell]), { marks: all }),
      ],
      vars: { i },
      result: py(answer),
    });
    return t.frames;
  },
});
