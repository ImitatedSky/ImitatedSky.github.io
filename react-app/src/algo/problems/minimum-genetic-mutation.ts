import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def minMutation(self, startGene: str, endGene: str, bank: List[str]) -> int:
        bank_set = set(bank)
        if endGene not in bank_set:
            return -1
        q = deque([(startGene, 0)])  # (基因, 已經突變幾次)
        seen = {startGene}
        while q:
            gene, steps = q.popleft()
            if gene == endGene:
                return steps
            for i in range(len(gene)):
                for ch in "ACGT":
                    nxt = gene[:i] + ch + gene[i + 1:]
                    if nxt in bank_set and nxt not in seen:
                        seen.add(nxt)
                        q.append((nxt, steps + 1))
        return -1`;

/** BFS 第幾層 → 色調（同一層同一個顏色） */
const LEVEL_TONES: Tone[] = ["alt", "compare", "visited"];

const oneApart = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff === 1;
};

interface Input {
  startGene: string;
  endGene: string;
  bank: string[];
}

export default defineProblem<Input>({
  id: 433,
  summary:
    "基因是一條長度 8、只由 `A`、`C`、`G`、`T` 組成的字串。**一次突變**只能改掉其中一個字元，而且突變後的結果必須出現在基因庫 `bank` 裡才算有效。\n\n給起點 `startGene` 和目標 `endGene`，求最少要突變幾次才能變成目標；做不到就回傳 `-1`。起點本身不需要在基因庫裡。",
  examples: [
    { input: 'startGene = "AACCGGTT", endGene = "AACCGGTA", bank = ["AACCGGTA"]', output: "1" },
    {
      input: 'startGene = "AACCGGTT", endGene = "AAACGGTA", bank = ["AACCGGTA","AACCGCTA","AAACGGTA"]',
      output: "2",
      note: "AACCGGTT → AACCGGTA → AAACGGTA",
    },
  ],
  constraints: ["0 ≤ bank.length ≤ 10", "startGene.length == endGene.length == bank[i].length == 8", "字元只會是 A、C、G、T"],
  idea:
    "把每個基因想成一個節點，**只差一個字元**的兩個基因之間連一條邊，題目就變成「從起點到目標的最短路徑」。每條邊的代價都是 1，所以用 BFS：一層一層往外擴，第一次碰到目標時的層數就是最少突變次數。",
  steps: [
    "把 `bank` 轉成集合，方便 O(1) 查詢；目標不在裡面就直接回傳 `-1`。",
    "佇列放 `(startGene, 0)`，`seen` 記錄已經排進佇列過的基因。",
    "取出 `(gene, steps)`；它就是目標的話回傳 `steps`。",
    "列舉所有「改一個字元」的結果：8 個位置 × 4 種字元。",
    "結果在基因庫裡而且沒看過 → 記進 `seen`，以 `steps + 1` 放進佇列。",
    "佇列空了還沒找到，回傳 `-1`。",
  ],
  pitfalls: [
    "中途的每一步都必須在 `bank` 裡，不是只有終點要在。",
    "`endGene` 不在 `bank` 時，連最後一步都不合法，答案一定是 `-1`。",
    "基因要在**放進佇列的當下**就記進 `seen`，等到取出才記的話，同一個基因會被重複排進去好幾次。",
  ],
  complexity: { time: "O(N · L · 4)，N 為基因庫大小、L = 8（另有字串切片的 O(L)）", space: "O(N)" },
  code,
  starter: `class Solution:
    def minMutation(self, startGene: str, endGene: str, bank: List[str]) -> int:
        `,
  presets: [
    {
      label: "六個基因的基因庫，答案 3",
      input: {
        startGene: "AACCGGTT",
        endGene: "AAACCGTA",
        bank: ["AACCGGTA", "AACCGCTA", "AAACGGTA", "AAACGGTT", "AAACCGTA", "AACCTGTT"],
      },
      expected: "3",
    },
    {
      label: "經典範例，答案 2",
      input: { startGene: "AACCGGTT", endGene: "AAACGGTA", bank: ["AACCGGTA", "AACCGCTA", "AAACGGTA"] },
      expected: "2",
    },
    {
      label: "目標在基因庫裡，但走不到",
      input: { startGene: "AAAAAAAA", endGene: "CCCCCCCC", bank: ["AAAAAAAC", "AAAAAACC", "CCCCCCCC"] },
      expected: "-1",
    },
  ],
  trace({ startGene, endGene, bank }) {
    const t = tracer();
    const bankSet = new Set(bank);

    // 圖上的節點：起點 + 基因庫（去掉重複）。節點放不下 8 個字元，所以用代號，另外附一張對照表。
    const all = [startGene, ...[...bankSet].filter((g) => g !== startGene)];
    const idOf = new Map(all.map((g, i) => [g, i === 0 ? "S" : `g${i}`]));
    const pairs: [string, string][] = [];
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++) if (oneApart(all[i], all[j])) pairs.push([all[i], all[j]]);

    // 版面：依「離起點幾步」由左到右分欄，走不到的放最右邊
    const dist = new Map<string, number>([[startGene, 0]]);
    for (const queue = [startGene]; queue.length; ) {
      const g = queue.shift()!;
      for (const [a, b] of pairs) {
        const other = a === g ? b : b === g ? a : null;
        if (other && !dist.has(other)) {
          dist.set(other, dist.get(g)! + 1);
          queue.push(other);
        }
      }
    }
    const maxDist = Math.max(...dist.values());
    const lastCol = all.some((g) => !dist.has(g)) ? maxDist + 1 : maxDist;
    const columns = new Map<number, string[]>();
    all.forEach((g) => {
      const col = dist.get(g) ?? lastCol;
      columns.set(col, [...(columns.get(col) ?? []), g]);
    });
    const nodes = all.map((g) => {
      const col = dist.get(g) ?? lastCol;
      const members = columns.get(col)!;
      const k = members.indexOf(g);
      const nudge = members.length >= 3 && k % 2 === 1 ? (col === lastCol ? -0.06 : 0.06) : 0;
      return {
        id: idOf.get(g)!,
        label: idOf.get(g)!,
        x: (lastCol === 0 ? 0.5 : col / lastCol) + nudge,
        y: (k + 1) / (members.length + 1),
      };
    });
    const edges = pairs.map(([a, b]) => ({ from: idOf.get(a)!, to: idOf.get(b)! }));

    const q: [string, number][] = [];
    const level = new Map<string, number>(); // seen 裡的基因 → 第幾層
    const parent = new Map<string, string>();

    const views = (
      o: {
        gene?: string;
        i?: number;
        marks?: Record<string, Tone>;
        edgeMarks?: Record<string, Tone>;
      } = {},
    ) => {
      const marks: Record<string, Tone> = {};
      level.forEach((d, g) => (marks[idOf.get(g)!] = LEVEL_TONES[d % LEVEL_TONES.length]));
      if (o.gene) marks[idOf.get(o.gene)!] = "active";
      Object.assign(marks, o.marks);
      const em: Record<string, Tone> = {};
      parent.forEach((p, c) => (em[`${idOf.get(p)!}>${idOf.get(c)!}`] = "visited"));
      Object.assign(em, o.edgeMarks);
      const pointers: Record<string, string> = {};
      if (o.gene) pointers.gene = idOf.get(o.gene)!;
      if (idOf.has(endGene)) pointers.end = idOf.get(endGene)!;
      const shown = o.gene ?? startGene;
      return [
        V.graph("基因圖（有連線 = 只差一個字元）", { nodes, edges }, { marks, edgeMarks: em, pointers }),
        V.map("代號對照", all.map((g) => [idOf.get(g)!, g] as [string, string]), { marks }),
        V.queue("q（基因, 突變次數）", q.map(([g, s]) => `(${g}, ${s})`)),
        V.chars("gene（i = 正在改的位置）", shown, { marks: o.i !== undefined ? { [o.i]: "compare" } : {}, pointers: o.i !== undefined ? { i: o.i } : {} }),
      ];
    };

    t.push({
      line: 3,
      note: `把基因庫轉成集合 \`bank_set\`。圖上先把所有「只差一個字元」的基因連起來 —— 程式不會真的建這張圖，但 BFS 走的就是這些邊。起點 \`${startGene}\` 是 \`S\`。`,
      views: views(),
      vars: { endGene },
    });

    if (!bankSet.has(endGene)) {
      t.push({
        line: [4, 5],
        note: `目標 \`${endGene}\` 根本不在基因庫裡，最後一步突變永遠不合法，直接回傳 \`-1\`。`,
        views: views(),
        vars: { endGene },
        result: py(-1),
      });
      return t.frames;
    }

    q.push([startGene, 0]);
    level.set(startGene, 0);
    t.push({
      line: [6, 7],
      note: `目標在基因庫裡，開始 BFS。起點以 0 次突變放進佇列，並記進 \`seen\`。`,
      views: views(),
      vars: { endGene, "len(seen)": level.size },
    });

    while (q.length) {
      const [gene, steps] = q.shift()!;
      if (gene === endGene) {
        const path = [gene];
        while (parent.has(path[0])) path.unshift(parent.get(path[0])!);
        const marks: Record<string, Tone> = {};
        const em: Record<string, Tone> = {};
        path.forEach((g, k) => {
          marks[idOf.get(g)!] = "good";
          if (k > 0) em[`${idOf.get(path[k - 1])!}>${idOf.get(g)!}`] = "good";
        });
        t.push({
          line: [9, 10, 11],
          note: `取出 \`(${gene}, ${steps})\`：它就是目標！BFS 是照突變次數由少到多一層一層處理的，所以第一次遇到時的 ${steps} 次就是最少次數。路徑：${path.map((g) => `\`${idOf.get(g)!}\``).join(" → ")}。`,
          views: views({ gene, marks, edgeMarks: em }),
          vars: { gene, steps },
          result: py(steps),
        });
        return t.frames;
      }

      t.push({
        line: [9, 10],
        note: `取出 \`(${gene}, ${steps})\`（代號 \`${idOf.get(gene)!}\`），還不是目標。接下來試著改它的每一個位置，各換成 \`A\`、\`C\`、\`G\`、\`T\`。`,
        views: views({ gene }),
        vars: { gene, steps, "len(seen)": level.size },
      });

      let added = 0;
      for (let i = 0; i < gene.length; i++) {
        for (const ch of "ACGT") {
          const nxt = gene.slice(0, i) + ch + gene.slice(i + 1);
          if (!bankSet.has(nxt) || level.has(nxt)) continue;
          level.set(nxt, steps + 1);
          parent.set(nxt, gene);
          q.push([nxt, steps + 1]);
          added++;
          t.push({
            line: [12, 13, 14, 15, 16, 17],
            note: `把第 ${i} 個字元 \`${gene[i]}\` 換成 \`${ch}\` 得到 \`${nxt}\`（\`${idOf.get(nxt)!}\`）：在基因庫裡、也還沒看過 → 記進 \`seen\`，以 ${steps + 1} 次突變放進佇列。`,
            views: views({
              gene,
              i,
              marks: { [idOf.get(nxt)!]: LEVEL_TONES[(steps + 1) % LEVEL_TONES.length] },
              edgeMarks: { [`${idOf.get(gene)!}>${idOf.get(nxt)!}`]: "active" },
            }),
            vars: { gene, steps, i, ch, nxt, "len(seen)": level.size },
          });
        }
      }
      if (added === 0) {
        t.push({
          line: [12, 13, 14, 15],
          note: `\`${idOf.get(gene)!}\` 的 ${gene.length} × 4 種改法全部試過：不是不在基因庫裡，就是之前已經看過（更早看到 = 突變次數不會比較多）。這條路沒有新的進展。`,
          views: views({ gene }),
          vars: { gene, steps, "len(seen)": level.size },
        });
      }
    }

    t.push({
      line: 18,
      note: `佇列空了：從起點靠有效突變走得到的基因全部看過，其中沒有目標 \`${endGene}\`。中間缺了能接上的基因，回傳 \`-1\`。`,
      views: views({ marks: { [idOf.get(endGene)!]: "bad" } }),
      vars: { "len(seen)": level.size },
      result: py(-1),
    });
    return t.frames;
  },
});
