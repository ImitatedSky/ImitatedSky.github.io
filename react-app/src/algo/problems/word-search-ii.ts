import { defineProblem } from "../types";
import type { Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        trie = {}
        for word in words:
            node = trie
            for ch in word:
                node = node.setdefault(ch, {})
            node["$"] = word  # 單字結尾：直接把整個單字存在這裡

        rows, cols = len(board), len(board[0])
        res = []

        def dfs(r, c, parent):
            ch = board[r][c]
            node = parent[ch]
            if "$" in node:
                res.append(node.pop("$"))  # 取走，同一個單字只收一次
            board[r][c] = "#"  # 標記：這條路徑上已經用過
            for nr, nc in (r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1):
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in node:
                    dfs(nr, nc, node)
            board[r][c] = ch  # 回溯：還原這一格
            if not node:
                parent.pop(ch)  # 剪枝：這個分支底下已經沒有單字

        for r in range(rows):
            for c in range(cols):
                if board[r][c] in trie:
                    dfs(r, c, trie)
        return res`;

interface TNode {
  id: string;
  children: Map<string, TNode>;
  word: string | null; // 對應 Python 的 node["$"]
}

export default defineProblem<{ board: string[][]; words: string[] }>({
  id: 212,
  summary:
    "給一個字母方格 `board` 和一串單字 `words`，找出**所有**能在方格上拼出來的單字。\n\n拼字時從任一格出發，每一步走到上下左右相鄰的格子，同一個單字裡**同一格不能用兩次**。",
  examples: [
    {
      input:
        'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]\nwords = ["oath","pea","eat","rain"]',
      output: '["eat","oath"]',
      note: "順序不限",
    },
    { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: "[]" },
  ],
  constraints: ["1 ≤ m, n ≤ 12", "1 ≤ words.length ≤ 3 × 10⁴", "1 ≤ words[i].length ≤ 10", "單字互不相同"],
  idea:
    "對每個單字各做一次方格搜尋太慢。把**所有單字放進一棵 trie**，然後只做一輪回溯：在方格上每走一步，就在 trie 裡跟著往下走一層 —— trie 沒有那條邊，代表沒有任何單字有這個前綴，立刻回頭。找到的單字從 trie 拿掉，變空的分支順手**剪掉**，之後的搜尋就不會再白走。",
  steps: [
    "把所有單字插進 trie（用巢狀 dict），單字結尾的節點用 `\"$\"` 存下整個單字。",
    "以每一格為起點：只有當這格的字母是 trie 根節點的小孩時才開始 DFS。",
    "`dfs(r, c, parent)`：走進 `node = parent[ch]`；若 `node` 有 `\"$\"`，把單字收進答案並從 trie 移除。",
    "把這格暫時改成 `#`，對四個鄰居中「字母是 `node` 的小孩」的格子繼續 DFS，結束後把這格還原。",
    "若 `node` 已經變成空的，從 `parent` 把它刪掉（剪枝）。",
  ],
  pitfalls: [
    "找到單字後**不能 return**：它可能是更長單字的前綴（`oat` → `oath`），要繼續往下走。",
    "找到的單字要從 trie 拿掉（`pop(\"$\")`），否則同一個單字從不同路徑會被重複加入。",
    "回溯時一定要把格子還原，不然別的路徑就不能用這一格了。",
    "不剪枝也會對，但在大測資會超時：剪掉空分支能讓 trie 越搜越小。",
  ],
  complexity: {
    time: "O(m · n · 4 · 3^(L−1))，L 為最長單字長度（實際上因 trie 剪枝遠小於此）",
    space: "O(所有單字的總長度)",
  },
  code,
  starter: `class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        `,
  presets: [
    {
      label: "共用前綴 + 剪枝：oat / oath / eat / dog",
      input: {
        board: [
          ["o", "a", "t"],
          ["o", "e", "h"],
        ],
        words: ["oat", "oath", "eat", "dog"],
      },
      expected: '["oat", "oath", "eat"]',
    },
    {
      label: "經典 4×4：oath / pea / eat / rain",
      input: {
        board: [
          ["o", "a", "a", "n"],
          ["e", "t", "a", "e"],
          ["i", "h", "k", "r"],
          ["i", "f", "l", "v"],
        ],
        words: ["oath", "pea", "eat", "rain"],
      },
      expected: '["oath", "eat"]',
    },
    {
      label: "同一格不能重複用：abdb / acd",
      input: {
        board: [
          ["a", "b"],
          ["c", "d"],
        ],
        words: ["abdb", "acd"],
      },
      expected: '["acd"]',
    },
  ],
  trace({ board: board0, words }) {
    const t = tracer();
    const board = board0.map((row) => [...row]);
    const rows = board.length;
    const cols = board[0].length;
    const trie: TNode = { id: "root", children: new Map(), word: null };
    const res: string[] = [];
    const rootLetters = new Set<string>(); // 建好 trie 時根節點有哪些字母（用來說明「被剪掉了」）

    const path: [number, number][] = []; // 目前 DFS 路徑上的格子
    const nodes: TNode[] = [trie]; // 對應的 trie 節點（含根）

    interface Shot {
      grid?: Record<string, Tone>;
      nodeTone?: Tone;
      wordIdx?: number; // 正在插入的單字
      insertPath?: TNode[];
      at?: [number, number];
    }
    const views = (s: Shot = {}) => {
      const specs: TreeNodeSpec[] = [];
      const edgeLabels: Record<string, string> = {};
      const marks: Record<string, Tone> = {};
      const walk = (n: TNode) => {
        specs.push({ id: n.id, val: n === trie ? "root" : (n.word ?? ""), children: [...n.children.values()].map((c) => c.id) });
        if (n.word !== null) marks[n.id] = "good";
        for (const [ch, c] of n.children) {
          edgeLabels[`${n.id}>${c.id}`] = ch;
          walk(c);
        }
      };
      walk(trie);
      const have = new Set(specs.map((n) => n.id));

      const chain = s.insertPath ?? nodes;
      const edgeMarks: Record<string, Tone> = {};
      for (let j = 1; j < chain.length; j++)
        if (have.has(chain[j].id)) edgeMarks[`${chain[j - 1].id}>${chain[j].id}`] = "active";
      // 指標標籤會蓋住邊上的字母，所以改用顏色表示：紫色 = node，藍色 = parent
      const cur = chain[chain.length - 1];
      if (s.insertPath) {
        marks[cur.id] = "good";
      } else if (chain.length > 1) {
        marks[chain[chain.length - 2].id] = "alt";
        if (have.has(cur.id)) marks[cur.id] = s.nodeTone ?? "active";
      }

      const gm: Record<string, Tone> = {};
      path.forEach(([r, c]) => (gm[`${r},${c}`] = "visited"));
      if (path.length) {
        const [r, c] = path[path.length - 1];
        gm[`${r},${c}`] = "active";
      }
      Object.assign(gm, s.grid);

      const wm: Record<number, Tone> = {};
      words.forEach((w, i) => {
        if (res.includes(w)) wm[i] = "good";
      });
      if (s.wordIdx !== undefined) wm[s.wordIdx] = "active";

      return [
        V.tree("trie（邊 = 字母，綠 = 存著單字，紫 = node，藍 = parent）", { nodes: specs, root: trie.id }, { marks, edgeLabels, edgeMarks }),
        V.stack("遞迴堆疊", path.map(([r, c]) => `dfs(${r}, ${c})`)),
        V.grid("board（# = 目前路徑用過的格子）", board, {
          marks: gm,
          pointers: s.at ? { "r,c": s.at } : {},
          rowLabels: board.map((_, r) => r),
          colLabels: board[0].map((_, c) => c),
        }),
        V.map("words（綠色 = 已找到）", words.map((w, i) => [`${i}`, w] as [string, string]), {
          marks: wm,
        }),
      ];
    };
    const vars = (extra: Record<string, string | number> = {}) => ({ ...extra, res: py(res) });

    t.push({
      line: 3,
      note: "先建一棵空的 trie。把所有單字放進同一棵 trie，之後在方格上只要搜尋**一輪**，就能同時比對全部的單字。",
      views: views(),
      vars: vars(),
    });

    // ── 建 trie ──
    words.forEach((word, wi) => {
      let node = trie;
      const chain = [trie];
      let shared = 0;
      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        let next = node.children.get(ch);
        if (next) shared = i + 1;
        else {
          next = { id: `t-${word.slice(0, i + 1)}`, children: new Map(), word: null };
          node.children.set(ch, next);
        }
        node = next;
        chain.push(node);
      }
      node.word = word;
      t.push({
        line: [4, 5, 6, 7, 8],
        note:
          `插入 \`${word}\`：從根逐字母往下走，缺的邊用 \`setdefault\` 補上` +
          (shared ? `（前綴 \`${word.slice(0, shared)}\` 已經存在，直接共用）` : "") +
          `，最後在結尾節點用 \`"$"\` 存下整個單字。`,
        views: views({ wordIdx: wi, insertPath: chain }),
        vars: vars({ word: py(word) }),
      });
    });
    trie.children.forEach((_, ch) => rootLetters.add(ch));

    t.push({
      line: [10, 11],
      note: `trie 建好了。接著以每一格為起點嘗試 —— 但只有字母是 trie 根節點小孩（${[...rootLetters].map((c) => `\`${c}\``).join("、")}）的格子才值得出發。`,
      views: views(),
      vars: vars({ rows, cols }),
    });

    // ── DFS ──
    const cell = (r: number, c: number) => `\`(${r},${c})\``;
    const candidates = (r: number, c: number, node: TNode) =>
      (
        [
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1],
        ] as [number, number][]
      ).filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && node.children.has(board[nr][nc]));

    const dfs = (r: number, c: number, parent: TNode) => {
      const ch = board[r][c];
      const node = parent.children.get(ch)!;
      const top = path.length === 0;
      path.push([r, c]);
      nodes.push(node);
      const prefix = node.id.slice(2);
      const lead = top
        ? `${cell(r, c)} 的 \`${ch}\` 是 trie 根的小孩，從這裡開始 DFS。`
        : `走到 ${cell(r, c)} 的 \`${ch}\`，trie 也跟著往下走一層（目前拼出 \`${prefix}\`）。`;

      const nextNote = () => {
        const cand = candidates(r, c, node);
        const want = [...node.children.keys()].map((k) => `\`${k}\``).join("、");
        if (node.children.size === 0) return `\`node\` 底下已經沒有小孩，沒有更長的單字可找，不必再看鄰居。`;
        if (cand.length === 0)
          return `\`node\` 的小孩是 ${want}，但四周的鄰居沒有符合的字母（用過的格子是 \`#\`，也不會符合），這條路到此為止。`;
        return `\`node\` 的小孩是 ${want}：鄰居 ${cand.map(([nr, nc]) => `${cell(nr, nc)} 的 \`${board[nr][nc]}\``).join("、")} 符合，往那裡走。`;
      };
      const candMarks = () => Object.fromEntries(candidates(r, c, node).map(([nr, nc]) => [`${nr},${nc}`, "compare" as Tone]));

      if (node.word !== null) {
        const word = node.word;
        res.push(word);
        node.word = null;
        t.push({
          line: [...(top ? [28, 29] : []), 14, 15, 16, 17],
          note: `${lead}這個節點存著 \`"$"\` —— 拼出完整的單字 \`${word}\`！加進 \`res\`，並把 \`"$"\` 從 trie 取走，避免之後重複收。`,
          views: views({ grid: Object.fromEntries(path.map(([pr, pc]) => [`${pr},${pc}`, "good" as Tone])), nodeTone: "good", at: [r, c] }),
          vars: vars({ ch }),
        });
        board[r][c] = "#";
        t.push({
          line: [18, 19, 20],
          note: `找到單字後**不能停**，它可能是更長單字的前綴。把這格標成 \`#\`。${nextNote()}`,
          views: views({ grid: candMarks(), at: [r, c] }),
          vars: vars({ ch }),
        });
      } else {
        board[r][c] = "#";
        t.push({
          line: [...(top ? [28, 29] : []), 14, 15, 18, 19, 20],
          note: `${lead}把這格暫時標成 \`#\`，同一條路徑不能再用它。${nextNote()}`,
          views: views({ grid: candMarks(), at: [r, c] }),
          vars: vars({ ch }),
        });
      }

      for (const [nr, nc] of [
        [r + 1, c],
        [r - 1, c],
        [r, c + 1],
        [r, c - 1],
      ] as [number, number][]) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && node.children.has(board[nr][nc])) dfs(nr, nc, node);
      }

      board[r][c] = ch;
      const empty = node.children.size === 0 && node.word === null;
      if (empty) parent.children.delete(ch);
      t.push({
        line: empty ? [22, 23, 24] : [22, 23],
        note:
          `${cell(r, c)} 的鄰居都處理完了，**回溯**：把格子還原成 \`${ch}\`。` +
          (empty
            ? `這個 trie 節點已經空了（底下的單字都找到了），從 \`parent\` 把 \`${ch}\` 這條邊**剪掉** —— 之後任何路徑都不會再走進這個前綴。`
            : `這個 trie 節點底下還有沒找到的單字（${[...node.children.keys()].map((k) => `\`${k}\``).join("、")} 方向），保留不剪。`),
        views: views({ nodeTone: "muted", at: [r, c], grid: { [`${r},${c}`]: "compare" } }),
        vars: vars({ ch }),
      });
      path.pop();
      nodes.pop();
    };

    let skipped: [number, number][] = [];
    const flushSkipped = () => {
      if (!skipped.length) return;
      const gone = [...new Set(skipped.map(([r, c]) => board[r][c]).filter((ch) => rootLetters.has(ch)))];
      t.push({
        line: [26, 27, 28],
        note:
          `${skipped.map(([r, c]) => `${cell(r, c)} 的 \`${board[r][c]}\``).join("、")} 不是 trie 根的小孩，沒有任何（還沒找到的）單字以它開頭，連 DFS 都不用開始。` +
          (gone.length ? `其中 ${gone.map((g) => `\`${g}\``).join("、")} 原本在 trie 裡，但整個分支剛才已經被**剪掉**了。` : ""),
        views: views({ grid: Object.fromEntries(skipped.map(([r, c]) => [`${r},${c}`, "muted" as Tone])) }),
        vars: vars(),
      });
      skipped = [];
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (trie.children.has(board[r][c])) {
          flushSkipped();
          dfs(r, c, trie);
        } else {
          skipped.push([r, c]);
        }
      }
    }
    flushSkipped();

    const missing = words.filter((w) => !res.includes(w));
    t.push({
      line: 30,
      note:
        `每一格都當過起點了，回傳 \`${py(res)}\`。` +
        (missing.length ? `trie 裡剩下的分支就是方格上拼不出來的單字（${missing.map((w) => `\`${w}\``).join("、")}）。` : "所有單字都找到了，trie 也被剪到只剩根節點。"),
      views: views(),
      vars: vars(),
      result: py(res),
    });
    return t.frames;
  },
});
