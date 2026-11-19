import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        q = deque([(beginWord, 1)])  # (單字, 走到這裡的序列長度)
        seen = {beginWord}
        while q:
            word, steps = q.popleft()
            if word == endWord:
                return steps
            for i in range(len(word)):
                for ch in "abcdefghijklmnopqrstuvwxyz":
                    nxt = word[:i] + ch + word[i + 1:]
                    if nxt in words and nxt not in seen:
                        seen.add(nxt)
                        q.append((nxt, steps + 1))
        return 0`;

/** BFS 第幾層 → 色調（同一層同一個顏色） */
const LEVEL_TONES: Tone[] = ["alt", "compare", "visited"];
const LETTERS = "abcdefghijklmnopqrstuvwxyz";

const oneApart = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff === 1;
};

interface Input {
  beginWord: string;
  endWord: string;
  wordList: string[];
}

export default defineProblem<Input>({
  id: 127,
  summary:
    "給起點單字 `beginWord`、終點單字 `endWord` 和一份字典 `wordList`，所有單字長度相同。每一步只能**改一個字母**，而且改完的單字必須在字典裡。\n\n求從起點變到終點的**最短轉換序列有幾個單字**（起點和終點都要算進去）；變不過去就回傳 `0`。起點不需要在字典裡。",
  examples: [
    {
      input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
      output: "5",
      note: "hit → hot → dot → dog → cog，共 5 個單字",
    },
    {
      input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
      output: "0",
      note: "cog 不在字典裡",
    },
  ],
  constraints: ["1 ≤ beginWord.length ≤ 10", "1 ≤ wordList.length ≤ 5000", "全部是小寫英文字母，字典裡的單字不重複", "beginWord ≠ endWord"],
  idea:
    "把每個單字當成節點，**只差一個字母**的兩個單字連一條邊，要找的就是起點到終點的最短路徑 → BFS。找鄰居時不要拿字典裡的單字兩兩比較，而是**把目前單字的每個位置換成 26 個字母**，再查結果在不在字典裡：每個單字只要 `L × 26` 次查詢，字典再大也不怕。",
  steps: [
    "把 `wordList` 轉成集合；`endWord` 不在裡面就回傳 `0`。",
    "佇列放 `(beginWord, 1)` —— 序列長度把起點自己算進去，所以從 1 開始。",
    "取出 `(word, steps)`；它就是終點的話回傳 `steps`。",
    "對每個位置 `i`、每個字母 `ch`，組出 `nxt`。",
    "`nxt` 在字典裡而且沒看過 → 記進 `seen`，以 `steps + 1` 放進佇列。",
    "佇列空了還沒到終點，回傳 `0`。",
  ],
  pitfalls: [
    "答案是**單字的個數**不是步數，所以起點的 `steps` 是 1；失敗時回傳的是 `0` 而不是 `-1`。",
    "單字要在**放進佇列的當下**就記進 `seen`；等取出才記，同一個單字會被排進去很多次。",
    "兩兩比較字典找鄰居是 O(N² · L)，字典 5000 個單字時會超時；換字母再查集合才是關鍵。",
    "想再更快可以做雙向 BFS（從起點和終點同時往中間擴），面試時當作加分的延伸即可。",
  ],
  complexity: { time: "O(N · L · 26)，N 為字典大小、L 為單字長度（另有字串切片的 O(L)）", space: "O(N · L)" },
  code,
  starter: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        `,
  presets: [
    {
      label: "hit → cog",
      input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log", "cog"] },
      expected: "5",
    },
    {
      label: "cold → warm",
      input: { beginWord: "cold", endWord: "warm", wordList: ["cord", "card", "ward", "warm", "corm", "worm", "word"] },
      expected: "5",
    },
    {
      label: "終點在字典裡，但接不上",
      input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "cog"] },
      expected: "0",
    },
  ],
  trace({ beginWord, endWord, wordList }) {
    const t = tracer();
    const words = new Set(wordList);

    // 圖上的節點：起點 + 字典。只差一個字母的兩個單字連一條邊（程式不會真的建這張圖）。
    const all = [beginWord, ...[...words].filter((w) => w !== beginWord)];
    const pairs: [string, string][] = [];
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++) if (oneApart(all[i], all[j])) pairs.push([all[i], all[j]]);

    // 版面：依「離起點幾步」由左到右分欄，走不到的放最右邊 —— 一欄就是 BFS 的一層
    const dist = new Map<string, number>([[beginWord, 0]]);
    for (const queue = [beginWord]; queue.length; ) {
      const w = queue.shift()!;
      for (const [a, b] of pairs) {
        const other = a === w ? b : b === w ? a : null;
        if (other && !dist.has(other)) {
          dist.set(other, dist.get(w)! + 1);
          queue.push(other);
        }
      }
    }
    const maxDist = Math.max(...dist.values());
    const lastCol = all.some((w) => !dist.has(w)) ? maxDist + 1 : maxDist;
    const columns = new Map<number, string[]>();
    all.forEach((w) => {
      const col = dist.get(w) ?? lastCol;
      columns.set(col, [...(columns.get(col) ?? []), w]);
    });
    const nodes = all.map((w) => {
      const col = dist.get(w) ?? lastCol;
      const members = columns.get(col)!;
      const k = members.indexOf(w);
      const nudge = members.length >= 3 && k % 2 === 1 ? (col === lastCol ? -0.06 : 0.06) : 0;
      return {
        id: w,
        label: w,
        x: (lastCol === 0 ? 0.5 : col / lastCol) + nudge,
        y: (k + 1) / (members.length + 1),
      };
    });
    const edges = pairs.map(([a, b]) => ({ from: a, to: b }));

    const q: [string, number][] = [];
    const level = new Map<string, number>(); // seen 裡的單字 → steps
    const parent = new Map<string, string>();
    const toneOf = (steps: number) => LEVEL_TONES[(steps - 1) % LEVEL_TONES.length];

    const views = (
      o: {
        word?: string;
        i?: number;
        marks?: Record<string, Tone>;
        edgeMarks?: Record<string, Tone>;
      } = {},
    ) => {
      const marks: Record<string, Tone> = {};
      level.forEach((s, w) => (marks[w] = toneOf(s)));
      if (o.word) marks[o.word] = "active";
      Object.assign(marks, o.marks);
      const em: Record<string, Tone> = {};
      parent.forEach((p, c) => (em[`${p}>${c}`] = "visited"));
      Object.assign(em, o.edgeMarks);
      const pointers: Record<string, string> = {};
      if (o.word) pointers.word = o.word;
      if (words.has(endWord) || endWord === beginWord) pointers.end = endWord;
      return [
        V.graph("單字圖（有連線 = 只差一個字母；一欄 = BFS 的一層）", { nodes, edges }, { marks, edgeMarks: em, pointers }),
        V.chars("word（i = 正在改的位置）", o.word ?? beginWord, {
          marks: o.i !== undefined ? { [o.i]: "compare" } : {},
          pointers: o.i !== undefined ? { i: o.i } : {},
        }),
        V.queue("q（單字, 序列長度）", q.map(([w, s]) => `(${w}, ${s})`)),
      ];
    };

    t.push({
      line: 3,
      note: `把字典轉成集合 \`words\`，查一個單字在不在只要 O(1)。圖上把「只差一個字母」的單字先連起來，BFS 實際上就是沿著這些邊一層一層往右走。`,
      views: views(),
      vars: { beginWord, endWord },
    });

    if (!words.has(endWord)) {
      t.push({
        line: [4, 5],
        note: `終點 \`${endWord}\` 不在字典裡，最後一步永遠不合法，直接回傳 \`0\`。`,
        views: views(),
        vars: { beginWord, endWord },
        result: py(0),
      });
      return t.frames;
    }

    q.push([beginWord, 1]);
    level.set(beginWord, 1);
    t.push({
      line: [6, 7],
      note: `終點在字典裡，開始 BFS。起點 \`${beginWord}\` 以長度 **1** 放進佇列 —— 題目要的是序列裡的單字數，起點自己也算一個。`,
      views: views(),
      vars: { endWord, "len(seen)": level.size },
    });

    while (q.length) {
      const [word, steps] = q.shift()!;
      if (word === endWord) {
        const path = [word];
        while (parent.has(path[0])) path.unshift(parent.get(path[0])!);
        const marks: Record<string, Tone> = {};
        const em: Record<string, Tone> = {};
        path.forEach((w, k) => {
          marks[w] = "good";
          if (k > 0) em[`${path[k - 1]}>${w}`] = "good";
        });
        t.push({
          line: [9, 10, 11],
          note: `取出 \`(${word}, ${steps})\`：就是終點！BFS 照層數由近到遠處理，第一次遇到終點時一定是最短的。序列 ${path.map((w) => `\`${w}\``).join(" → ")} 共 ${steps} 個單字。`,
          views: views({ word, marks, edgeMarks: em }),
          vars: { word, steps },
          result: py(steps),
        });
        return t.frames;
      }

      t.push({
        line: [9, 10],
        note: `取出 \`(${word}, ${steps})\`，還不是終點。把它的 ${word.length} 個位置逐一換成 \`a\` ～ \`z\`，看哪些結果在字典裡。`,
        views: views({ word }),
        vars: { word, steps, "len(seen)": level.size },
      });

      let added = 0;
      for (let i = 0; i < word.length; i++) {
        for (const ch of LETTERS) {
          const nxt = word.slice(0, i) + ch + word.slice(i + 1);
          if (!words.has(nxt) || level.has(nxt)) continue;
          level.set(nxt, steps + 1);
          parent.set(nxt, word);
          q.push([nxt, steps + 1]);
          added++;
          t.push({
            line: [12, 13, 14, 15, 16, 17],
            note: `把第 ${i} 個字母 \`${word[i]}\` 換成 \`${ch}\` 得到 \`${nxt}\`：在字典裡、也還沒看過 → 記進 \`seen\`，以長度 ${steps + 1} 放進佇列（第 ${steps + 1} 層）。`,
            views: views({
              word,
              i,
              marks: { [nxt]: toneOf(steps + 1) },
              edgeMarks: { [`${word}>${nxt}`]: "active" },
            }),
            vars: { word, steps, i, ch, nxt, "len(seen)": level.size },
          });
        }
      }
      if (added === 0) {
        t.push({
          line: [12, 13, 14, 15],
          note: `\`${word}\` 的 ${word.length} × 26 種改法都試過了：不是不在字典裡，就是之前已經看過（更早看到 = 序列不會比較長）。從這裡沒有新的單字可以加。`,
          views: views({ word }),
          vars: { word, steps, "len(seen)": level.size },
        });
      }
    }

    t.push({
      line: 18,
      note: `佇列空了：從 \`${beginWord}\` 一次改一個字母能到的單字全部看過，其中沒有 \`${endWord}\`。中間缺了能接上的單字，回傳 \`0\`。`,
      views: views({ marks: { [endWord]: "bad" } }),
      vars: { "len(seen)": level.size },
      result: py(0),
    });
    return t.frames;
  },
});
