import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class TrieNode:
    def __init__(self):
        self.children = {}  # 字母 -> 子節點
        self.end = False    # 是否有單字在這裡結束


class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return node.end
            ch = word[i]
            if ch == ".":  # 萬用字元：每個小孩都試試看
                return any(dfs(child, i + 1) for child in node.children.values())
            if ch not in node.children:
                return False
            return dfs(node.children[ch], i + 1)

        return dfs(self.root, 0)`;

interface TNode {
  id: string;
  prefix: string;
  children: Map<string, TNode>;
  end: boolean;
}

type Op = "WordDictionary" | "addWord" | "search";

export default defineProblem<{ ops: Op[]; args: string[] }>({
  id: 211,
  summary:
    "設計一個單字字典，支援兩種操作：\n\n`addWord(word)` 把單字加進字典；`search(word)` 回答字典裡有沒有符合的單字 —— 查詢字串可以包含 `.`，每個 `.` 能代表**任意一個字母**。",
  summaryEn:
    "Design a word dictionary with two operations:\n\n`addWord(word)` adds a word; `search(word)` tells whether any stored word matches. The query may contain `.`, and each `.` can stand for **any single letter**.",
  examples: [
    {
      input:
        'ops = ["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\nargs = [[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]',
      output: "[null,null,null,null,false,true,true,true]",
    },
  ],
  constraints: ["1 ≤ word.length ≤ 25", "addWord 的單字只有小寫字母；search 的字串可含 `.`", "操作總數 ≤ 10⁴"],
  constraintsEn: ["1 ≤ word.length ≤ 25", "addWord words contain only lowercase letters; search strings may contain `.`", "Total operations ≤ 10⁴"],
  idea:
    "用 **Trie** 存單字。查詢時遇到一般字母，只有一條邊可以走；遇到 `.` 就不知道該走哪條 —— 那就**每個小孩都試**（DFS + 回溯），只要有一條路能走到底而且停在單字結尾就算找到。",
  steps: [
    "`addWord`：標準的 trie 插入，逐字母往下走、缺邊就新建節點，最後標記 `end = True`。",
    "`search` 用遞迴 `dfs(node, i)`：目前站在 `node`，要比對 `word[i]`。",
    "`i == len(word)`：字串用完了，答案是 `node.end`。",
    "`word[i]` 是 `.`：對每個小孩遞迴 `dfs(child, i + 1)`，任一個成功就成功。",
    "否則是一般字母：沒有那條邊就 `False`，有就沿著它繼續遞迴。",
  ],
  pitfalls: [
    "字串走完時要回傳 `node.end`，不是 `True`：路徑存在不代表有單字在這裡結束。",
    "`.` 一定要消耗**一個**字母：節點沒有小孩時 `any([])` 是 `False`，所以查詢比單字長時會正確失敗。",
    "`any(...)` 搭配產生器會短路，找到一條成功的路就不再試其他小孩。",
  ],
  complexity: {
    time: "addWord O(L)；search 沒有 `.` 時 O(L)，最壞（全是 `.`）要走遍相關的子樹，O(26^L)",
    space: "O(所有單字的總長度)，遞迴深度 O(L)",
  },
  code,
  starter: `class WordDictionary:
    def __init__(self):
        pass

    def addWord(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass`,
  presets: [
    {
      label: "bat / cab / can（會回溯）",
      input: {
        ops: ["WordDictionary", "addWord", "addWord", "addWord", "search", "search", "search", "search"],
        args: ["", "bat", "cab", "can", "..n", ".a", "ca.", "bat."],
      },
      expected: "[None, None, None, None, True, False, True, False]",
    },
    {
      label: "bad / dad / mad",
      input: {
        ops: ["WordDictionary", "addWord", "addWord", "addWord", "search", "search", "search", "search"],
        args: ["", "bad", "dad", "mad", "pad", "bad", ".ad", "b.."],
      },
      expected: "[None, None, None, None, False, True, True, True]",
    },
    {
      label: "空字典與單一字母",
      input: {
        ops: ["WordDictionary", "search", "addWord", "search", "search", "search"],
        args: ["", ".", "a", ".", "..", "a"],
      },
      expected: "[None, False, None, True, False, True]",
    },
  ],
  trace({ ops, args }) {
    const t = tracer();
    const root: TNode = { id: "root", prefix: "", children: new Map(), end: false };
    const out: (boolean | null)[] = [];
    const calls = ops.map((op, i) => `${i + 1}. ${op === "WordDictionary" ? "WordDictionary()" : `${op}("${args[i]}")`}`);

    interface Shot {
      k: number;
      word?: string;
      i?: number;
      path?: TNode[]; // 根 → 目前節點
      dead?: Set<string>; // 這次搜尋已經確定走不通的邊
      next?: TNode; // 接下來要走進去的小孩
      nodeTone?: Tone;
      charTone?: Tone;
      pathTone?: Tone;
      opTone?: Tone;
      stack?: boolean;
    }
    const views = (s: Shot) => {
      const nodes: TreeNodeSpec[] = [];
      const edgeLabels: Record<string, string> = {};
      const marks: Record<string, Tone> = {};
      const walk = (n: TNode) => {
        nodes.push({ id: n.id, val: n === root ? "root" : n.end ? "✓" : "", children: [...n.children.values()].map((c) => c.id) });
        if (n.end) marks[n.id] = "good";
        for (const [ch, c] of n.children) {
          edgeLabels[`${n.id}>${c.id}`] = ch;
          walk(c);
        }
      };
      walk(root);

      const path = s.path ?? [];
      const node = path[path.length - 1];
      const edgeMarks: Record<string, Tone> = {};
      s.dead?.forEach((e) => (edgeMarks[e] = "bad"));
      for (let j = 1; j < path.length; j++) edgeMarks[`${path[j - 1].id}>${path[j].id}`] = s.pathTone ?? "active";
      if (node) marks[node.id] = s.nodeTone ?? "active";
      if (node && s.next) {
        edgeMarks[`${node.id}>${s.next.id}`] = "compare";
        if (!s.next.end) marks[s.next.id] = "compare";
      }

      const word = s.word ?? "";
      const i = s.i ?? 0;
      const cm: Record<number, Tone> = {};
      for (let j = 0; j < word.length; j++) {
        if (j < i) cm[j] = s.pathTone === "good" ? "good" : "visited";
        else if (j === i && s.charTone) cm[j] = s.charTone;
      }
      const entries = calls.map<[Cell, Cell?]>((c, j) => (j < out.length ? [c, py(out[j])] : [c]));
      return [
        V.tree("trie（邊 = 字母，✓ = 單字結尾，紫色 = node）", { nodes, root: root.id }, { marks, edgeLabels, edgeMarks }),
        V.stack(
          "遞迴堆疊 dfs(前綴, i)",
          s.stack ? path.map((n, j) => `dfs("${n.prefix}", ${j})`) : [],
        ),
        V.chars("word", word, { marks: cm, pointers: s.stack && i <= word.length && word.length ? { i } : {} }),
        V.map("操作 → 回傳值", entries, { marks: { [calls[s.k]]: s.opTone ?? "active" } }),
      ];
    };

    ops.forEach((op, k) => {
      const word = args[k];
      if (op === "WordDictionary") {
        out.push(null);
        t.push({
          line: [8, 9],
          note: "建立空的字典：底層是一棵只有根節點的 trie。",
          views: views({ k, path: [root] }),
        });
        return;
      }

      if (op === "addWord") {
        const path = [root];
        let createdAny = false;
        for (let i = 0; i < word.length; i++) {
          const ch = word[i];
          const node = path[path.length - 1];
          let next = node.children.get(ch);
          const created = !next;
          if (!next) {
            next = { id: `t-${word.slice(0, i + 1)}`, prefix: word.slice(0, i + 1), children: new Map(), end: false };
            node.children.set(ch, next);
            createdAny = true;
          }
          path.push(next);
          t.push({
            line: [...(i === 0 ? [12] : []), ...(created ? [13, 14, 15, 16] : [13, 14, 16])],
            note:
              (i === 0 ? `\`addWord("${word}")\`：從根節點出發。` : "") +
              (created
                ? `目前節點沒有 \`${ch}\` 這條邊，新建節點接上去再走過去。`
                : `\`${ch}\` 這條邊已經有了（和之前的單字共用前綴 \`${word.slice(0, i + 1)}\`），直接走過去。`),
            views: views({ k, word, i, path, charTone: "active", nodeTone: created ? "alt" : "active" }),
            vars: { ch },
          });
        }
        path[path.length - 1].end = true;
        out.push(null);
        t.push({
          line: 17,
          note: `字母走完，把最後的節點標成 \`end = True\`，\`${word}\` 存好了${createdAny ? "" : "（沒有新增任何節點，只多了一個結尾標記）"}。`,
          views: views({ k, word, i: word.length, path, nodeTone: "good", opTone: "good" }),
        });
        return;
      }

      // search
      const path: TNode[] = [];
      const dead = new Set<string>();
      let winPath: TNode[] = []; // 成功時記下整條路徑，最後整條標綠
      const shot = (o: Partial<Shot> = {}): Shot => ({ k, word, i: path.length - 1, path, dead, stack: true, ...o });

      const dfs = (node: TNode, i: number): boolean => {
        path.push(node);
        const lead = i === 0 ? `\`search("${word}")\`：呼叫 \`dfs(root, 0)\`。` : "";
        try {
          if (i === word.length) {
            t.push({
              line: [21, 22],
              note: node.end
                ? `${lead}\`i == len(word)\`，字串剛好用完，而且這個節點 \`end = True\` —— 找到符合的單字 \`${node.prefix}\`，回傳 \`True\`。`
                : `${lead}\`i == len(word)\`，字串用完了，但這個節點 \`end = False\`：\`${node.prefix}\` 只是某個單字的前綴，不算，回傳 \`False\`。`,
              views: views(shot({ nodeTone: node.end ? "good" : "bad" })),
              vars: { i, "node.end": py(node.end) },
            });
            if (node.end) winPath = [...path];
            return node.end;
          }
          const ch = word[i];
          if (ch === ".") {
            const kids = [...node.children.entries()];
            if (kids.length === 0) {
              t.push({
                line: [23, 24, 25],
                note: `${lead}\`word[${i}]\` 是 \`.\`，必須配上**一個**字母，但這個節點沒有任何小孩 —— \`any([])\` 是 \`False\`。`,
                views: views(shot({ charTone: "bad", nodeTone: "bad" })),
                vars: { i, ch },
              });
              return false;
            }
            t.push({
              line: [23, 24, 25],
              note: `${lead}\`word[${i}]\` 是 \`.\`，可以是任何字母，無法確定走哪條邊 —— 只好把小孩 ${kids.map(([c]) => `\`${c}\``).join("、")} **一個一個試**，先試 \`${kids[0][0]}\`。`,
              views: views(shot({ charTone: "compare", next: kids[0][1] })),
              vars: { i, ch },
            });
            for (let j = 0; j < kids.length; j++) {
              const [c, child] = kids[j];
              if (dfs(child, i + 1)) return true;
              dead.add(`${node.id}>${child.id}`);
              const more = kids[j + 1];
              t.push({
                line: 25,
                note: more
                  ? `把 \`.\` 當成 \`${c}\` 行不通，**回溯**到這個節點，改試下一個小孩 \`${more[0]}\`。`
                  : `把 \`.\` 當成 \`${c}\` 也行不通。所有小孩都試過了，沒有一條路成功，\`any\` 回傳 \`False\`。`,
                views: views(shot({ charTone: more ? "compare" : "bad", nodeTone: more ? "active" : "bad", next: more?.[1] })),
                vars: { i, ch },
              });
            }
            return false;
          }
          const next = node.children.get(ch);
          if (!next) {
            t.push({
              line: [23, 26, 27],
              note: `${lead}\`word[${i}]\` 是 \`${ch}\`，但這個節點底下沒有 \`${ch}\` 這條邊，這條路走不通，回傳 \`False\`。`,
              views: views(shot({ charTone: "bad", nodeTone: "bad" })),
              vars: { i, ch },
            });
            return false;
          }
          t.push({
            line: [23, 26, 28],
            note: `${lead}\`word[${i}]\` 是一般字母 \`${ch}\`，只有一條邊可以走，而且它存在 —— 沿著它往下遞迴。`,
            views: views(shot({ charTone: "active", next })),
            vars: { i, ch },
          });
          return dfs(next, i + 1);
        } finally {
          path.pop();
        }
      };

      const res = dfs(root, 0);

      out.push(res);
      t.push({
        line: 30,
        note: res
          ? `有一條路成功走到單字結尾（\`${winPath[winPath.length - 1].prefix}\`），\`True\` 一路往上回傳，\`search("${word}")\` 回傳 \`True\`。`
          : `所有可能的路都失敗了，\`search("${word}")\` 回傳 \`False\`。`,
        views: views({
          k,
          word,
          i: res ? word.length : 0,
          path: res ? winPath : [root],
          dead,
          pathTone: res ? "good" : undefined,
          nodeTone: res ? "good" : "bad",
          opTone: res ? "good" : "bad",
        }),
      });
    });

    t.push({
      note: `所有操作執行完畢。依序的回傳值是 \`${py(out)}\`。`,
      views: views({ k: ops.length - 1, opTone: "visited" }),
      result: py(out),
    });
    return t.frames;
  },
});
