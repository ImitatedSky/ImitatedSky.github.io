import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        # dp[i][j] = 把 word1 的前 i 個字元變成 word2 的前 j 個字元，最少要幾步
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i  # 變成空字串：刪掉 i 個字元
        for j in range(n + 1):
            dp[0][j] = j  # 從空字串開始：插入 j 個字元
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]  # 最後一個字元相同，不用花步數
                else:
                    dp[i][j] = 1 + min(
                        dp[i - 1][j],      # 刪除 word1[i - 1]
                        dp[i][j - 1],      # 插入 word2[j - 1]
                        dp[i - 1][j - 1],  # 把 word1[i - 1] 取代成 word2[j - 1]
                    )
        return dp[m][n]`;

export default defineProblem<{ word1: string; word2: string }>({
  id: 72,
  summary:
    "給兩個字串 `word1` 和 `word2`，求把 `word1` 變成 `word2` **最少需要幾次操作**。\n\n每次操作可以：**插入**一個字元、**刪除**一個字元，或把一個字元**取代**成另一個。",
  examples: [
    { input: 'word1 = "horse", word2 = "ros"', output: "3", note: "horse → rorse → rose → ros" },
    { input: 'word1 = "intention", word2 = "execution"', output: "5" },
  ],
  constraints: ["0 ≤ word1.length, word2.length ≤ 500", "只包含小寫英文字母"],
  idea:
    "定義 `dp[i][j]` = 把 `word1` 的前 `i` 個字元變成 `word2` 的前 `j` 個字元的最少步數。只看**兩邊的最後一個字元**：相同就不用動，直接沿用左上角 `dp[i-1][j-1]`；不同就在三種操作裡挑最便宜的再 +1 —— **上方** `dp[i-1][j]` 是刪除、**左方** `dp[i][j-1]` 是插入、**左上** `dp[i-1][j-1]` 是取代。",
  steps: [
    "邊界：`dp[i][0] = i`（全部刪掉）、`dp[0][j] = j`（全部用插入的）。",
    "`word1[i-1] == word2[j-1]`：`dp[i][j] = dp[i-1][j-1]`。",
    "否則：`dp[i][j] = 1 + min(上, 左, 左上)`。",
    "答案是右下角 `dp[m][n]`。",
  ],
  pitfalls: [
    "表格是 `(m + 1) × (n + 1)`，第 0 列／第 0 行代表**空字串**，字元索引要記得 `- 1`。",
    "三個方向對應哪個操作容易搞混：`i - 1` 代表 `word1` 少一個字元（刪除），`j - 1` 代表 `word2` 少一個字元（那個字元是之後插入的）。",
    "字元相同時不需要再跟「上、左」比：可以證明左上角一定不會比較差。",
  ],
  complexity: { time: "O(m × n)", space: "O(m × n)（可壓到 O(n)）" },
  code,
  starter: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        `,
  presets: [
    { label: '"horse" → "ros"', input: { word1: "horse", word2: "ros" }, expected: "3" },
    { label: '"sea" → "eat"', input: { word1: "sea", word2: "eat" }, expected: "2" },
    { label: '"" → "abc"', input: { word1: "", word2: "abc" }, expected: "3" },
  ],
  trace({ word1, word2 }) {
    const t = tracer();
    const m = word1.length;
    const n = word2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    const filled: boolean[][] = Array.from({ length: m + 1 }, () => new Array<boolean>(n + 1).fill(false));
    const rowLabels: Cell[] = ["∅", ...word1];
    const colLabels: Cell[] = ["∅", ...word2];
    const show = (): Cell[][] => dp.map((row, i) => row.map((v, j) => (filled[i][j] ? v : "")));
    // 只畫 dp 表：列 / 行標籤就是 word1 / word2 的字元，再疊兩條字串會讓舞台太高
    const views = (marks: Record<string, Tone> = {}, ptr?: [number, number]) => [
      V.grid("dp（列 = word1，行 = word2）", show(), { rowLabels, colLabels, marks, pointers: ptr ? { "i,j": ptr } : {} }),
    ];

    t.push({
      line: [3, 4, 5],
      note: `\`dp[i][j]\` 的意思是：**把 \`word1\` 的前 \`i\` 個字元變成 \`word2\` 的前 \`j\` 個字元，最少要幾步**。列是 \`word1\`、行是 \`word2\`，\`∅\` 代表空字串，所以表格是 ${m + 1} × ${n + 1}。答案在右下角。`,
      views: views(),
      vars: { m, n },
    });

    {
      const mk: Record<string, Tone> = {};
      for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
        filled[i][0] = true;
        mk[`${i},0`] = "active";
      }
      t.push({
        line: [6, 7],
        note: `第 0 行：目標是空字串，\`word1\` 的前 \`i\` 個字元只能**全部刪掉**，所以 \`dp[i][0] = i\`。`,
        views: views(mk),
        vars: { m, n },
      });
    }
    {
      const mk: Record<string, Tone> = {};
      for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
        filled[0][j] = true;
        mk[`0,${j}`] = "active";
      }
      t.push({
        line: [8, 9],
        note: `第 0 列：從空字串出發，要湊出 \`word2\` 的前 \`j\` 個字元只能**一個一個插入**，所以 \`dp[0][j] = j\`。`,
        views: views(mk),
        vars: { m, n },
      });
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const a = word1[i - 1];
        const b = word2[j - 1];
        const up = dp[i - 1][j];
        const left = dp[i][j - 1];
        const diag = dp[i - 1][j - 1];
        const key = `${i},${j}`;
        const head = `把 \`"${word1.slice(0, i)}"\` 變成 \`"${word2.slice(0, j)}"\`：`;
        if (a === b) {
          dp[i][j] = diag;
          filled[i][j] = true;
          t.push({
            line: [12, 13],
            note: `${head}最後一個字元都是 \`"${a}"\`，這個字元不用動，問題縮小成左上角那格：\`dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${diag}\`。`,
            views: views({ [`${i - 1},${j - 1}`]: "compare", [key]: "active" }, [i, j]),
            vars: { i, j, "word1[i-1]": a, "word2[j-1]": b, "dp[i][j]": dp[i][j] },
          });
        } else {
          const best = Math.min(up, left, diag);
          dp[i][j] = 1 + best;
          filled[i][j] = true;
          const ops: string[] = [];
          if (diag === best) ops.push(`把 \`"${a}"\` 取代成 \`"${b}"\``);
          if (up === best) ops.push(`刪除 \`"${a}"\``);
          if (left === best) ops.push(`插入 \`"${b}"\``);
          t.push({
            line: [12, 14, 15, 16, 17, 18, 19],
            note:
              `${head}最後一個字元 \`"${a}"\` ≠ \`"${b}"\`，三種操作挑最便宜的 —— 刪除（上）\`${up}\`、插入（左）\`${left}\`、取代（左上）\`${diag}\`：` +
              `\`dp[${i}][${j}] = 1 + min(${up}, ${left}, ${diag}) = ${dp[i][j]}\`，也就是${ops.join("或")}。`,
            views: views(
              { [`${i - 1},${j}`]: "compare", [`${i},${j - 1}`]: "compare", [`${i - 1},${j - 1}`]: "compare", [key]: "active" },
              [i, j],
            ),
            vars: { i, j, "word1[i-1]": a, "word2[j-1]": b, 刪除: up, 插入: left, 取代: diag, "dp[i][j]": dp[i][j] },
          });
        }
      }
    }

    // 從右下角回溯出一組最少步數的操作
    const path: Record<string, Tone> = {};
    const ops: string[] = [];
    for (let i = m, j = n; ; ) {
      path[`${i},${j}`] = "good";
      if (i === 0 && j === 0) break;
      if (i > 0 && j > 0 && word1[i - 1] === word2[j - 1]) {
        i--;
        j--;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        ops.unshift(`${word1[i - 1]}→${word2[j - 1]}`);
        i--;
        j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        ops.unshift(`刪 ${word1[i - 1]}`);
        i--;
      } else {
        ops.unshift(`插 ${word2[j - 1]}`);
        j--;
      }
    }
    t.push({
      line: 20,
      note:
        `右下角 \`dp[${m}][${n}] = ${dp[m][n]}\` 就是答案。` +
        (ops.length
          ? `沿綠色路徑往回走可以還原出一組操作：${ops.map((o) => `\`${o}\``).join("、")}（斜走且數字沒變的是字元相同，不花步數）。`
          : "兩個字串本來就一樣，不需要任何操作。"),
      views: views(path),
      vars: { m, n },
      result: py(dp[m][n]),
    });
    return t.frames;
  },
});
