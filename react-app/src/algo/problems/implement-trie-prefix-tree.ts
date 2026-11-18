import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class TrieNode:
    def __init__(self):
        self.children = {}  # 字母 -> 子節點
        self.end = False    # 是否有單字在這裡結束


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True

    def _find(self, s: str) -> Optional[TrieNode]:
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.end

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None`;

interface TNode {
  id: string;
  children: Map<string, TNode>;
  end: boolean;
}

type Op = "Trie" | "insert" | "search" | "startsWith";

export default defineProblem<{ ops: Op[]; args: string[] }>({
  id: 208,
  summary:
    "實作 **Trie（字首樹）**，支援三種操作：\n\n`insert(word)` 把單字存進去；`search(word)` 回答這個單字**完整地**被存過嗎；`startsWith(prefix)` 回答有沒有任何已存的單字以 `prefix` 開頭。",
  examples: [
    {
      input:
        'ops = ["Trie","insert","search","search","startsWith","insert","search"]\nargs = [[],["apple"],["apple"],["app"],["app"],["app"],["app"]]',
      output: "[null,null,true,false,true,null,true]",
      note: '第一次 search("app") 是 false：路徑存在，但沒有單字在那裡結束',
    },
  ],
  constraints: ["1 ≤ word.length, prefix.length ≤ 2000", "只包含小寫英文字母", "操作總數 ≤ 3 × 10⁴"],
  idea:
    "Trie 是一棵「**邊上寫字母**」的樹：從根沿著邊走，經過的字母串起來就是一個前綴，所以有共同前綴的單字會**共用同一段路徑**。每個節點多記一個 `end` 旗標表示「有單字剛好在這裡結束」—— `search` 和 `startsWith` 的差別就只在要不要看這個旗標。",
  steps: [
    "節點有 `children`（字母 → 子節點的雜湊表）和 `end` 旗標；Trie 一開始只有一個空的根節點。",
    "`insert`：從根出發逐字母往下走，缺哪條邊就新建節點，走完後把最後的節點標成 `end = True`。",
    "`_find`：從根出發逐字母往下走，途中缺邊就回傳 `None`，走完就回傳停下來的節點。",
    "`search` = 找得到節點**而且** `end` 為真；`startsWith` = 找得到節點就好。",
  ],
  pitfalls: [
    "`search` 一定要檢查 `end`：存了 `apple` 之後，`app` 的路徑存在，但 `app` 並沒有被存過。",
    "`insert` 一個已存在單字的前綴時不會新增任何節點，只是把中途的節點標成 `end`。",
  ],
  complexity: { time: "每個操作 O(L)，L 為字串長度", space: "O(所有插入單字的總長度)" },
  code,
  starter: `class Trie:
    def __init__(self):
        pass

    def insert(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass

    def startsWith(self, prefix: str) -> bool:
        pass`,
  presets: [
    {
      label: "apple / app",
      input: {
        ops: ["Trie", "insert", "search", "search", "startsWith", "insert", "search"],
        args: ["", "apple", "apple", "app", "app", "app", "app"],
      },
      expected: "[None, None, True, False, True, None, True]",
    },
    {
      label: "分岔：car / cat / dog",
      input: {
        ops: ["Trie", "insert", "insert", "insert", "search", "startsWith", "search", "search"],
        args: ["", "car", "cat", "dog", "ca", "ca", "cow", "dog"],
      },
      expected: "[None, None, None, None, False, True, False, True]",
    },
    {
      label: "空的 trie",
      input: { ops: ["Trie", "search", "startsWith", "insert", "search"], args: ["", "a", "a", "a", "a"] },
      expected: "[None, False, False, None, True]",
    },
  ],
  trace({ ops, args }) {
    const t = tracer();
    const root: TNode = { id: "root", children: new Map(), end: false };
    const out: (boolean | null)[] = [];

    const calls = ops.map((op, i) => `${i + 1}. ${op === "Trie" ? "Trie()" : `${op}("${args[i]}")`}`);

    const spec = () => {
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
      return { nodes, edgeLabels, marks };
    };

    interface Shot {
      k: number; // 第幾個操作
      word?: string;
      /** 已經走過幾個字母 */
      i?: number;
      path?: TNode[]; // 從根走到目前節點的路徑（含根）
      nodeTone?: Tone;
      charTone?: Tone;
      opTone?: Tone;
    }
    const views = (s: Shot) => {
      const { nodes, edgeLabels, marks } = spec();
      const path = s.path ?? [];
      const node = path[path.length - 1];
      const edgeMarks: Record<string, Tone> = {};
      for (let j = 1; j < path.length; j++) edgeMarks[`${path[j - 1].id}>${path[j].id}`] = "active";
      if (node) marks[node.id] = s.nodeTone ?? "active";

      const word = s.word ?? "";
      const i = s.i ?? 0;
      const cm: Record<number, Tone> = {};
      for (let j = 0; j < word.length; j++) {
        if (j < i) cm[j] = "visited";
        else if (j === i && s.charTone) cm[j] = s.charTone;
      }

      const entries = calls.map<[Cell, Cell?]>((c, j) => (j < out.length ? [c, py(out[j])] : [c]));
      return [
        V.tree("trie（邊 = 字母，綠色 ✓ = 有單字在此結束）", { nodes, root: root.id }, {
          marks,
          edgeLabels,
          edgeMarks,
          pointers: node ? { node: node.id } : {},
        }),
        V.chars("目前的字串", word, { marks: cm, pointers: s.charTone && i < word.length ? { ch: i } : {} }),
        V.map("操作 → 回傳值", entries, { marks: { [calls[s.k]]: s.opTone ?? "active" } }),
      ];
    };

    /** `_find`：逐字母往下走；回傳走到的節點或 null */
    let lastPath: TNode[] = [root]; // `_find` 最後停在哪裡（失敗時 = 卡住的地方）
    const find = (k: number, word: string, what: string, entryLine: number): TNode | null => {
      const path = [root];
      lastPath = path;
      t.push({
        line: [entryLine, 20],
        note: `${what}：呼叫 \`_find("${word}")\`，\`node\` 從根節點出發，照著字母一條邊一條邊往下走。`,
        views: views({ k, word, path }),
      });
      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        const node = path[path.length - 1];
        const next = node.children.get(ch);
        if (!next) {
          t.push({
            line: [21, 22, 23],
            note: `需要字母 \`${ch}\`，但目前節點底下沒有 \`${ch}\` 這條邊 —— trie 裡沒有任何單字以 \`${word.slice(0, i + 1)}\` 開頭，\`_find\` 回傳 \`None\`。`,
            views: views({ k, word, i, path, nodeTone: "bad", charTone: "bad" }),
            vars: { ch },
          });
          return null;
        }
        path.push(next);
        t.push({
          line: [21, 22, 24],
          note: `有 \`${ch}\` 這條邊，沿著它往下走。目前走過的前綴是 \`${word.slice(0, i + 1)}\`。`,
          views: views({ k, word, i, path, charTone: "active" }),
          vars: { ch },
        });
      }
      return path[path.length - 1];
    };
    ops.forEach((op, k) => {
      const word = args[k];
      if (op === "Trie") {
        out.push(null);
        t.push({
          line: [8, 9],
          note: "建立一棵空的 trie：只有一個根節點，代表「空字串」這個前綴。",
          views: views({ k, path: [root] }),
        });
      } else if (op === "insert") {
        const path = [root];
        t.push({
          line: 12,
          note: `\`insert("${word}")\`：\`node\` 從根節點出發，準備把每個字母變成一條邊。`,
          views: views({ k, word, path }),
        });
        for (let i = 0; i < word.length; i++) {
          const ch = word[i];
          const node = path[path.length - 1];
          let next = node.children.get(ch);
          const created = !next;
          if (!next) {
            next = { id: `t-${word.slice(0, i + 1)}`, children: new Map(), end: false };
            node.children.set(ch, next);
          }
          path.push(next);
          t.push({
            line: created ? [13, 14, 15, 16] : [13, 14, 16],
            note: created
              ? `目前節點沒有 \`${ch}\` 這條邊，新建一個節點接上去，再走過去。`
              : `\`${ch}\` 這條邊已經存在（前綴 \`${word.slice(0, i + 1)}\` 和之前的單字共用），不用新增，直接走過去。`,
            views: views({ k, word, i, path, charTone: "active", nodeTone: created ? "alt" : "active" }),
            vars: { ch },
          });
        }
        path[path.length - 1].end = true;
        out.push(null);
        t.push({
          line: 17,
          note: `字母走完，把停下來的節點標成 \`end = True\`：代表從根走到這裡剛好拼出一個完整的單字 \`${word}\`。`,
          views: views({ k, word, i: word.length, path, nodeTone: "good", opTone: "good" }),
        });
      } else if (op === "search") {
        const node = find(k, word, `\`search("${word}")\``, 28);
        const res = node !== null && node.end;
        out.push(res);
        t.push({
          line: node ? [25, 28, 29] : [28, 29],
          note: !node
            ? `\`_find\` 回傳 \`None\`，路徑根本不存在，\`search\` 回傳 \`False\`。`
            : res
              ? `整個字串走完，而且停下來的節點 \`end = True\` —— \`${word}\` 確實被存過，回傳 \`True\`。`
              : `整個字串走完了，路徑存在，但停下來的節點 \`end = False\`：\`${word}\` 只是別的單字的**前綴**，本身沒被存過，回傳 \`False\`。`,
          views: views({
            k,
            word,
            i: lastPath.length - 1,
            path: lastPath,
            nodeTone: res ? "good" : "bad",
            opTone: res ? "good" : "bad",
          }),
          vars: node ? { "node.end": py(node.end) } : { node: "None" },
        });
      } else {
        const node = find(k, word, `\`startsWith("${word}")\``, 31);
        const res = node !== null;
        out.push(res);
        t.push({
          line: node ? [25, 31] : 31,
          note: res
            ? `整個前綴都走得到就夠了，**不用看 \`end\`** —— 這個節點底下（含自己）一定有單字以 \`${word}\` 開頭，回傳 \`True\`。`
            : `\`_find\` 回傳 \`None\`，沒有任何單字以 \`${word}\` 開頭，回傳 \`False\`。`,
          views: views({
            k,
            word,
            i: lastPath.length - 1,
            path: lastPath,
            nodeTone: res ? "compare" : "bad",
            opTone: res ? "good" : "bad",
          }),
        });
      }
    });

    const last = ops.length - 1;
    t.push({
      note: `所有操作執行完畢。依序的回傳值是 \`${py(out)}\`。`,
      views: views({ k: last, opTone: "visited" }),
      result: py(out),
    });
    return t.frames;
  },
});
