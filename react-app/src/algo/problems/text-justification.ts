import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        res = []
        line, length = [], 0        # 這一行的單字、它們的字母總數
        for w in words:
            # 字母 + 每個間隔至少一個空白 + 新單字，放不下就先把這一行排好
            if length + len(line) + len(w) > maxWidth:
                spaces = maxWidth - length
                gaps = max(1, len(line) - 1)
                for i in range(spaces):         # 空白一個一個輪流發，左邊的間隔先拿
                    line[i % gaps] += " "
                res.append("".join(line))
                line, length = [], 0
            line.append(w)
            length += len(w)
        # 最後一行：靠左對齊，右邊用空白補滿
        res.append(" ".join(line).ljust(maxWidth))
        return res`;

/** 參考解（只用來事先算出總共會排成幾行） */
function justify(words: string[], maxWidth: number): string[] {
  const res: string[] = [];
  let line: string[] = [];
  let length = 0;
  for (const w of words) {
    if (length + line.length + w.length > maxWidth) {
      const gaps = Math.max(1, line.length - 1);
      for (let i = 0; i < maxWidth - length; i++) line[i % gaps] += " ";
      res.push(line.join(""));
      line = [];
      length = 0;
    }
    line.push(w);
    length += w.length;
  }
  res.push(line.join(" ").padEnd(maxWidth, " "));
  return res;
}

export default defineProblem<{ words: string[]; maxWidth: number }>({
  id: 68,
  summary:
    "給一串單字 `words` 和寬度 `maxWidth`，把它們排版成**每一行剛好 `maxWidth` 個字元、左右對齊**的文字。\n\n每一行要**盡量多塞單字**（貪心）。行內的空白要盡量平均分配到單字之間；如果分不均勻，**左邊的間隔**要比右邊多。\n\n兩個例外要**靠左對齊**、右邊補空白：最後一行，以及只放得下一個單字的行。",
  examples: [
    {
      input: 'words = ["This","is","an","example","of","text","justification."], maxWidth = 16',
      output: '["This    is    an","example  of text","justification.  "]',
    },
    {
      input: 'words = ["What","must","be","acknowledgment","shall","be"], maxWidth = 16',
      output: '["What   must   be","acknowledgment  ","shall be        "]',
    },
  ],
  constraints: ["1 ≤ words.length ≤ 300", "1 ≤ words[i].length ≤ maxWidth ≤ 100"],
  idea:
    "分成兩件事：**① 這一行能放哪些單字**、**② 空白怎麼分**。①用貪心：只要「字母數 + 每個間隔至少一格 + 新單字」不超過寬度就繼續塞。②不用算除法和餘數 —— 把要補的空白**一個一個輪流發給各個間隔**（round-robin），從最左邊發起，自然就是「盡量平均、多的給左邊」。",
  steps: [
    "`line` 收集這一行的單字，`length` 是它們的字母總數（不含空白）。",
    "看下一個單字 `w`：若 `length + len(line) + len(w) > maxWidth`，這一行已經滿了。",
    "滿了就結算：要補 `maxWidth - length` 個空白，間隔數是 `len(line) - 1`（只有一個單字時當成 1，空白全部接在它後面）。",
    "把空白輪流接在第 `i % gaps` 個單字後面，接完把整行併起來放進 `res`，清空 `line`。",
    "把 `w` 放進（新的）這一行。",
    "全部單字處理完，剩下的是最後一行：用單一空白接起來，再用 `ljust` 補到 `maxWidth`。",
  ],
  pitfalls: [
    "判斷放不放得下時，`len(line)` 剛好就是「加入 `w` 之後的間隔數」，每個間隔至少要一格空白。",
    "一行只有一個單字時 `len(line) - 1 = 0`，直接取餘數會除以零，所以要 `max(1, …)`。",
    "最後一行**不做**左右對齊，容易忘記而把它也拿去平均分配。",
  ],
  complexity: { time: "O(所有字元數 + 行數 × maxWidth)", space: "O(maxWidth)（不計輸出）" },
  code,
  starter: `class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        `,
  presets: [
    {
      label: "the quick brown fox…, 16",
      input: { words: ["the", "quick", "brown", "fox", "jumps", "over", "a", "lazy", "dog"], maxWidth: 16 },
      expected: '["the  quick brown", "fox jumps over a", "lazy dog        "]',
    },
    {
      label: "algorithm is fun to learn, 10",
      input: { words: ["algorithm", "is", "fun", "to", "learn"], maxWidth: 10 },
      expected: '["algorithm ", "is  fun to", "learn     "]',
    },
    { label: '["hi","yo"], 5', input: { words: ["hi", "yo"], maxWidth: 5 }, expected: '["hi yo"]' },
  ],
  trace({ words, maxWidth }) {
    const t = tracer();
    const totalRows = justify(words, maxWidth).length;
    const rowLabels = Array.from({ length: totalRows }, (_, r) => `res[${r}]`);
    const GRID = `排版結果（每行 ${maxWidth} 格，␣ = 空白）`;

    const res: string[] = [];
    let line: string[] = [];
    let length = 0;
    let lineStart = 0; // 這一行第一個單字在 words 裡的索引

    /** 排版格子：已完成的行 + 目前這一行的暫時樣子 */
    const grid = (current: string, curMarks: Record<number, Tone> = {}) => {
      const cells: Cell[][] = [];
      const marks: Record<string, Tone> = {};
      for (let r = 0; r < totalRows; r++) {
        const text = r < res.length ? res[r] : r === res.length ? current : "";
        cells.push(Array.from({ length: maxWidth }, (_, c) => text[c] ?? ""));
        if (r < res.length) for (let c = 0; c < maxWidth; c++) marks[`${r},${c}`] = text[c] === " " ? "alt" : "good";
        else if (r === res.length) for (const [c, tone] of Object.entries(curMarks)) marks[`${r},${c}`] = tone;
      }
      return V.grid(GRID, cells, { marks, rowLabels });
    };
    /** 把字串裡每個空白都標上同一個顏色 */
    const spaceMarks = (text: string, tone: Tone) => {
      const m: Record<number, Tone> = {};
      for (let c = 0; c < text.length; c++) if (text[c] === " ") m[c] = tone;
      return m;
    };
    const wordsView = (k: number, cur?: Tone) => {
      const marks: Record<string, Tone> = {};
      for (let x = 0; x < words.length; x++) {
        if (x < lineStart) marks[String(x)] = "visited";
        else if (x < lineStart + line.length) marks[String(x)] = "active";
      }
      if (cur && k < words.length) marks[String(k)] = cur;
      return V.map("words", words.map((w, x) => [x, w] as [Cell, Cell]), { marks });
    };
    const lineView = (hot?: number) =>
      V.map("line", line.map((p, x) => [x, p.replace(/ /g, "␣")] as [Cell, Cell]), {
        marks: hot === undefined ? {} : { [String(hot)]: "active" },
      });

    t.push({
      line: [3, 4],
      note: `每一行都要剛好 ${maxWidth} 格。\`line\` 收集目前這一行的單字，\`length\` 是它們的**字母總數**（不含空白）。`,
      views: [wordsView(0), lineView(), grid("")],
      vars: { maxWidth, length },
    });

    for (let k = 0; k < words.length; k++) {
      const w = words[k];
      const need = length + line.length + w.length;
      const fits = need <= maxWidth;
      const tentative = line.join(" ");
      t.push({
        line: [5, 7],
        note:
          line.length === 0
            ? `看 \`"${w}"\`：這一行還是空的，\`0 + 0 + ${w.length} = ${need}\` ≤ ${maxWidth}，一定放得下。`
            : `看 \`"${w}"\`：已有字母 ${length} + 間隔至少 ${line.length} 格空白 + 新單字 ${w.length} = **${need}**，` +
              (fits ? `≤ ${maxWidth}，還放得下。` : `> ${maxWidth}，**放不下**了 —— 先把這一行排好。`),
        views: [wordsView(k, fits ? "compare" : "bad"), lineView(), grid(tentative, spaceMarks(tentative, "compare"))],
        vars: { maxWidth, w, length, "len(line)": line.length },
      });

      if (!fits) {
        const spaces = maxWidth - length;
        const gaps = Math.max(1, line.length - 1);
        t.push({
          line: [8, 9],
          note:
            `這一行的字母共 ${length} 格，還要補 \`spaces = ${maxWidth} − ${length} = ${spaces}\` 個空白。` +
            (line.length === 1
              ? "只有一個單字，沒有間隔可分，`gaps` 取 1 —— 空白全部接在它後面（等於靠左對齊）。"
              : `${line.length} 個單字之間有 \`gaps = ${gaps}\` 個間隔，空白要發給這些間隔。`),
          views: [wordsView(k, "bad"), lineView(), grid(line.join(""))],
          vars: { maxWidth, length, spaces, gaps },
        });

        for (let i = 0; i < spaces; i++) {
          const g = i % gaps;
          line[g] += " ";
          const text = line.join("");
          const col = line.slice(0, g + 1).join("").length - 1;
          t.push({
            line: [10, 11],
            note:
              `第 ${i + 1} / ${spaces} 個空白：\`i % gaps = ${i} % ${gaps} = ${g}\`，接在 \`line[${g}]\` 後面。` +
              (gaps > 1 && i === gaps ? "每個間隔都拿過一輪了，多出來的又從**最左邊**開始發，所以左邊的間隔會比較寬。" : ""),
            views: [wordsView(k, "bad"), lineView(g), grid(text, { ...spaceMarks(text, "alt"), [col]: "active" })],
            vars: { maxWidth, i, spaces, gaps },
          });
        }

        res.push(line.join(""));
        lineStart += line.length;
        line = [];
        length = 0;
        t.push({
          line: [12, 13],
          note: `空白發完，把 \`line\` 併成一個字串，剛好 ${maxWidth} 格，放進 \`res\`。清空 \`line\`、\`length\` 歸零，開始排下一行。`,
          views: [wordsView(k, "compare"), lineView(), grid("")],
          vars: { maxWidth, w, length },
        });
      }

      line.push(w);
      length += w.length;
      const now = line.join(" ");
      t.push({
        line: [14, 15],
        note:
          `把 \`"${w}"\` 放進這一行，\`length = ${length}\`。` +
          (line.length > 1
            ? "格子裡先暫時用一格空白隔開（每個間隔的最低需求），真正的空白等這一行確定之後再分配。"
            : "它是這一行的第一個單字。"),
        views: [wordsView(k), lineView(line.length - 1), grid(now, spaceMarks(now, "compare"))],
        vars: { maxWidth, w, length },
      });
    }

    const last = line.join(" ").padEnd(maxWidth, " ");
    res.push(last);
    lineStart += line.length;
    line = [];
    t.push({
      line: [16, 17],
      note: "單字都用完了，剩下的是**最後一行**。它不做左右對齊：單字之間只放一格空白，右邊用 `ljust` 補空白到滿。",
      views: [wordsView(words.length), lineView(), grid("")],
      vars: { maxWidth },
    });
    t.push({
      line: 18,
      note: `全部排好了，共 ${res.length} 行，每一行都剛好 ${maxWidth} 格。`,
      views: [wordsView(words.length), lineView(), grid("")],
      vars: { maxWidth },
      result: py(res),
    });
    return t.frames;
  },
});
