import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec, View } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def totalNQueens(self, n: int) -> int:
        cols = set()    # 已經有皇后的直行
        diag = set()    # 「＼」對角線：同一條上 r - c 都相同
        anti = set()    # 「／」對角線：同一條上 r + c 都相同

        def backtrack(r: int) -> int:
            if r == n:                  # 每一列都放好了
                return 1
            count = 0
            for c in range(n):
                if c in cols or (r - c) in diag or (r + c) in anti:
                    continue            # 會被攻擊，換下一格
                cols.add(c)             # 放皇后
                diag.add(r - c)
                anti.add(r + c)
                count += backtrack(r + 1)
                cols.remove(c)          # 拿走皇后
                diag.remove(r - c)
                anti.remove(r + c)
            return count

        return backtrack(0)`;

const QUEEN = "♛";

export default defineProblem<{ n: number }>({
  id: 52,
  summary:
    "在 `n × n` 的棋盤上放 `n` 個皇后，讓任兩個皇后都**不能互相攻擊**（不在同一列、同一行、同一條斜線上）。\n\n回傳總共有**幾種**不同的擺法（只要數量，不用列出盤面）。",
  summaryEn:
    "Place `n` queens on an `n × n` chessboard so that **no two queens attack each other** (no shared row, column, or diagonal).\n\nReturn **how many** distinct placements exist; you only need the count, not the boards.",
  examples: [
    { input: "n = 4", output: "2" },
    { input: "n = 1", output: "1" },
  ],
  constraints: ["1 ≤ n ≤ 9"],
  constraintsEn: ["1 ≤ n ≤ 9"],
  idea:
    "每一列一定剛好放一個皇后，所以**一列一列往下放**，每列只需要決定放在哪一行。要 O(1) 判斷某格會不會被攻擊，用三個集合：`cols` 記用過的直行；同一條「＼」斜線上 `r - c` 相同、同一條「／」斜線上 `r + c` 相同，各用一個集合記下來。",
  steps: [
    "`backtrack(r)` 回傳「前 `r` 列已經放好的情況下，剩下的列有幾種放法」。",
    "`r == n`：全部放完，算 1 種。",
    "對第 `r` 列的每一行 `c`：`c`、`r - c`、`r + c` 只要有一個已經在集合裡就跳過。",
    "否則把三個值加進集合（放皇后）→ 遞迴下一列並累加回傳值 → 把三個值移除（拿走皇后）。",
  ],
  pitfalls: [
    "兩條斜線方向不同：「＼」是 `r - c`、「／」是 `r + c`，要用**兩個**集合，不能混在一起。",
    "回溯時三個集合都要還原，漏掉一個之後的判斷就全錯。",
    "不需要真的存棋盤 —— 只要數量的話，三個集合就夠了。",
  ],
  complexity: { time: "O(n!)", space: "O(n)" },
  code,
  starter: `class Solution:
    def totalNQueens(self, n: int) -> int:
        `,
  presets: [
    { label: "n = 4", input: { n: 4 }, expected: "2" },
    { label: "n = 3", input: { n: 3 }, expected: "0" },
    { label: "n = 1", input: { n: 1 }, expected: "1" },
  ],
  trace({ n }) {
    const t = tracer();
    const queens: number[] = []; // queens[r] = column of the queen in row r
    const idx = Array.from({ length: n }, (_, i) => i);
    let total = 0;

    // Decision tree: level = row, edge = chosen column. Only drawn while it stays small.
    const showTree = n <= 4;
    const nodes: TreeNodeSpec[] = [{ id: "r", val: "起", children: [] }];
    const done: Record<string, Tone> = {};
    const stack = ["r"];
    const edgeLabels: Record<string, string> = {};

    const attacked = (r: number, c: number) =>
      queens.some((qc, qr) => qc === c || qr - qc === r - c || qr + qc === r + c);

    const views = (
      o: { cell?: [number, number]; tone?: Tone; clash?: number; hit?: "cols" | "diag" | "anti"; solved?: boolean } = {},
    ): View[] => {
      const cells: Cell[][] = idx.map((r) => idx.map((c) => (queens[r] === c ? QUEEN : "")));
      const marks: Record<string, Tone> = {};
      for (const r of idx)
        for (const c of idx) {
          if (queens[r] === c) marks[`${r},${c}`] = "good";
          else if (!o.solved && attacked(r, c)) marks[`${r},${c}`] = "muted";
        }
      if (o.cell) marks[`${o.cell[0]},${o.cell[1]}`] = o.tone ?? "active";
      if (o.clash !== undefined) marks[`${o.clash},${queens[o.clash]}`] = "compare";

      const hitKey = (name: "cols" | "diag" | "anti") => {
        if (!o.cell || o.hit !== name) return {};
        const [r, c] = o.cell;
        return { [String(name === "cols" ? c : name === "diag" ? r - c : r + c)]: "bad" as Tone };
      };
      const out: View[] = [
        V.grid("棋盤（灰色 = 會被攻擊的格子）", cells, { marks, rowLabels: idx, colLabels: idx }),
        V.set("cols", queens.map((c) => c), { marks: hitKey("cols") }),
        V.set("diag（r − c）", queens.map((c, r) => r - c), { marks: hitKey("diag") }),
        V.set("anti（r + c）", queens.map((c, r) => r + c), { marks: hitKey("anti") }),
      ];
      if (showTree) {
        const tm: Record<string, Tone> = { ...done };
        const em: Record<string, Tone> = {};
        stack.forEach((id, k) => {
          tm[id] = k === stack.length - 1 ? (done[id] ?? "active") : "compare";
          if (k > 0) em[`${stack[k - 1]}>${id}`] = "active";
        });
        out.push(
          V.tree("決策樹（第 r 層 = 第 r 列，邊 = 皇后放的行 c）", { nodes, root: "r" }, { marks: tm, edgeMarks: em, edgeLabels }),
        );
      }
      return out;
    };

    t.push({
      line: [3, 4, 5, 23],
      note: `${n} × ${n} 的棋盤，每一列剛好放一個皇后，所以從第 0 列開始一列一列決定「放在哪一行」。三個集合一開始都是空的。`,
      views: views(),
      vars: { n, r: 0, 已找到: total },
    });

    const backtrack = (r: number): number => {
      if (r === n) {
        total++;
        done[stack[stack.length - 1]] = "good";
        t.push({
          line: [8, 9],
          note: `\`r == ${n}\`，每一列都成功放了皇后 —— 找到第 ${total} 種擺法：各列的行號是 \`${py(queens)}\`。回傳 1。`,
          views: views({ solved: true }),
          vars: { r, 已找到: total },
        });
        return 1;
      }
      let count = 0;
      let placed = 0;
      for (let c = 0; c < n; c++) {
        const clashCol = queens.findIndex((qc) => qc === c);
        const clashDiag = queens.findIndex((qc, qr) => qr - qc === r - c);
        const clashAnti = queens.findIndex((qc, qr) => qr + qc === r + c);
        if (clashCol !== -1 || clashDiag !== -1 || clashAnti !== -1) {
          const hit = clashCol !== -1 ? "cols" : clashDiag !== -1 ? "diag" : "anti";
          const clash = clashCol !== -1 ? clashCol : clashDiag !== -1 ? clashDiag : clashAnti;
          const why =
            hit === "cols"
              ? `\`c = ${c}\` 已經在 \`cols\` 裡 —— 跟第 ${clash} 列的皇后同一行`
              : hit === "diag"
                ? `\`r - c = ${r - c}\` 已經在 \`diag\` 裡 —— 跟第 ${clash} 列的皇后在同一條「＼」斜線上`
                : `\`r + c = ${r + c}\` 已經在 \`anti\` 裡 —— 跟第 ${clash} 列的皇后在同一條「／」斜線上`;
          t.push({
            line: [11, 12, 13],
            note: `試第 ${r} 列第 ${c} 行：${why}，會被攻擊，跳過。`,
            views: views({ cell: [r, c], tone: "bad", clash, hit }),
            vars: { r, c, "r - c": r - c, "r + c": r + c, count, 已找到: total },
          });
          continue;
        }
        queens.push(c);
        placed++;
        const id = `q${nodes.length}`;
        const parent = stack[stack.length - 1];
        nodes.push({ id, val: QUEEN, children: [] });
        nodes.find((x) => x.id === parent)!.children!.push(id);
        edgeLabels[`${parent}>${id}`] = String(c);
        stack.push(id);
        t.push({
          line: [11, 12, 14, 15, 16, 17],
          note:
            `試第 ${r} 列第 ${c} 行：\`${c}\`、\`r - c = ${r - c}\`、\`r + c = ${r + c}\` 都不在集合裡，安全。**放**上皇后並把三個值記進集合，` +
            (r + 1 < n ? `往下處理第 ${r + 1} 列。` : "所有列都放完了。"),
          views: views({ cell: [r, c], tone: "active" }),
          vars: { r, c, "r - c": r - c, "r + c": r + c, count, 已找到: total },
        });
        const got = backtrack(r + 1);
        count += got;
        queens.pop();
        done[stack.pop()!] ??= "visited";
        t.push({
          line: [18, 19, 20],
          note:
            `回到第 ${r} 列：這個位置往下共找到 ${got} 種擺法，\`count = ${count}\`。**拿走**第 ${c} 行的皇后（三個集合一起還原），` +
            (c + 1 < n ? `接著試第 ${c + 1} 行。` : "這一列已經試到最後一行。"),
          views: views({ cell: [r, c], tone: "compare" }),
          vars: { r, c, "r - c": r - c, "r + c": r + c, count, 已找到: total },
        });
      }
      if (placed === 0) {
        done[stack[stack.length - 1]] = "bad";
        t.push({
          line: 21,
          note: `第 ${r} 列的每一格都被前面的皇后攻擊，一個都放不下 —— **死路**，回傳 0，只能回頭改前面的選擇。`,
          views: views(),
          vars: { r, count, 已找到: total },
        });
      }
      return count;
    };
    const ans = backtrack(0);

    t.push({
      line: [21, 23],
      note:
        ans > 0
          ? `第 0 列的每一行都試過了，總共有 ${ans} 種擺法。`
          : `第 0 列的每一行都試過了，沒有任何擺法能放滿 ${n} 個皇后，答案是 0。`,
      views: views(),
      vars: { n, 已找到: total },
      result: py(ans),
    });
    return t.frames;
  },
});
