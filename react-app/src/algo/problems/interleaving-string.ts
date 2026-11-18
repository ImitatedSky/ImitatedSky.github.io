import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        # dp[i][j] = s1 的前 i 個字元和 s2 的前 j 個字元，能不能交錯組成 s3 的前 i + j 個字元
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for i in range(m + 1):
            for j in range(n + 1):
                # 最後一個字元取自 s1
                if i > 0 and dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]:
                    dp[i][j] = True
                # 最後一個字元取自 s2
                if j > 0 and dp[i][j - 1] and s2[j - 1] == s3[i + j - 1]:
                    dp[i][j] = True
        return dp[m][n]`;

export default defineProblem<{ s1: string; s2: string; s3: string }>({
  id: 97,
  summary:
    "給三個字串 `s1`、`s2`、`s3`，判斷 `s3` 是不是由 `s1` 和 `s2` **交錯**組成的。\n\n交錯的意思是：把 `s1` 和 `s2` 的字元混在一起，但各自原本的**先後順序不能變**，而且兩個字串的每個字元都要剛好用到一次。",
  examples: [
    { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: "true" },
    { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"', output: "false" },
    { input: 's1 = "", s2 = "", s3 = ""', output: "true" },
  ],
  constraints: ["0 ≤ s1.length, s2.length ≤ 100", "0 ≤ s3.length ≤ 200"],
  idea:
    "定義 `dp[i][j]` = `s1` 的前 `i` 個字元和 `s2` 的前 `j` 個字元，能不能交錯出 `s3` 的前 `i + j` 個字元。看 `s3` 的**最後一個字元** `s3[i+j-1]` 是誰提供的：來自 `s1`（那就要 `dp[i-1][j]` 成立且 `s1[i-1]` 相符），或來自 `s2`（`dp[i][j-1]` 成立且 `s2[j-1]` 相符），兩者有一個成立即可。在表格上就是「從上面來」或「從左邊來」。",
  steps: [
    "長度對不上（`m + n != len(s3)`）直接回傳 `False`。",
    "`dp[0][0] = True`：兩邊都還沒取字元，組成空字串。",
    "逐格填表：上方為真且 `s1[i-1] == s3[i+j-1]`，或左方為真且 `s2[j-1] == s3[i+j-1]`，則 `dp[i][j] = True`。",
    "答案是右下角 `dp[m][n]`。",
  ],
  pitfalls: [
    "用兩個指標貪心比對會錯：當 `s1`、`s2` 的下一個字元都和 `s3` 相符時，不知道該取哪一邊，必須兩條路都保留。",
    "`s3` 的索引是 `i + j - 1`，不是 `i + j`。",
    "別忘了先檢查長度，否則 `s3` 的索引會越界或誤判。",
  ],
  complexity: { time: "O(m × n)", space: "O(m × n)（可壓到 O(n)）" },
  code,
  starter: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        `,
  presets: [
    { label: '"aab" + "axy" → "aaxaby"', input: { s1: "aab", s2: "axy", s3: "aaxaby" }, expected: "True" },
    { label: '"aab" + "axy" → "aaxyba"', input: { s1: "aab", s2: "axy", s3: "aaxyba" }, expected: "False" },
    { label: "長度對不上", input: { s1: "ab", s2: "c", s3: "abcd" }, expected: "False" },
  ],
  trace({ s1, s2, s3 }) {
    const t = tracer();
    const m = s1.length;
    const n = s2.length;

    if (m + n !== s3.length) {
      t.push({
        line: [3, 4, 5],
        note: `\`s1\` 有 ${m} 個字元、\`s2\` 有 ${n} 個，加起來是 ${m + n}，但 \`s3\` 有 ${s3.length} 個。每個字元都要剛好用一次，長度對不上就不可能，直接回傳 False。`,
        views: [V.chars("s1", s1), V.chars("s2", s2), V.chars("s3", s3)],
        vars: { m, n, "len(s3)": s3.length },
        result: py(false),
      });
      return t.frames;
    }

    const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array<boolean>(n + 1).fill(false));
    const filled: boolean[][] = Array.from({ length: m + 1 }, () => new Array<boolean>(n + 1).fill(false));
    const rowLabels: Cell[] = ["∅", ...s1];
    const colLabels: Cell[] = ["∅", ...s2];
    const show = (): Cell[][] => dp.map((row, i) => row.map((v, j) => (filled[i][j] ? v : "")));
    const settled = () => {
      const mk: Record<string, Tone> = {};
      for (let i = 0; i <= m; i++)
        for (let j = 0; j <= n; j++) if (filled[i][j]) mk[`${i},${j}`] = dp[i][j] ? "good" : "muted";
      return mk;
    };
    const views = (
      extra: Record<string, Tone> = {},
      ptr?: [number, number],
      s3Marks: Record<number, Tone> = {},
      k?: number,
    ) => [
      V.chars("s3", s3, {
        marks: s3Marks,
        pointers: k !== undefined ? { "i+j-1": k } : {},
        ranges: k !== undefined && k > 0 ? [{ from: 0, to: k - 1, tone: "visited" }] : [],
      }),
      V.grid("dp", show(), {
        rowLabels,
        colLabels,
        marks: { ...settled(), ...extra },
        pointers: ptr ? { "i,j": ptr } : {},
      }),
    ];

    t.push({
      line: [6, 7],
      note: `\`dp[i][j]\` 的意思是：**\`s1\` 的前 \`i\` 個字元和 \`s2\` 的前 \`j\` 個字元，能不能交錯組成 \`s3\` 的前 \`i + j\` 個字元**。列是 \`s1\`（往下走 = 多用一個 \`s1\` 的字元），行是 \`s2\`（往右走 = 多用一個 \`s2\` 的字元）。`,
      views: views(),
      vars: { m, n },
    });

    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        const key = `${i},${j}`;
        if (i === 0 && j === 0) {
          dp[0][0] = true;
          filled[0][0] = true;
          t.push({
            line: 8,
            note: "`dp[0][0] = True`：兩邊都還沒取任何字元，組出來的是空字串，當然成立。",
            views: views({ [key]: "active" }, [0, 0]),
            vars: { i, j },
          });
          continue;
        }
        const k = i + j - 1;
        const ch = s3[k];
        const deps: Record<string, Tone> = {};
        const parts: string[] = [];
        let fromS1 = false;
        let fromS2 = false;
        if (i > 0) {
          deps[`${i - 1},${j}`] = "compare";
          const prev = dp[i - 1][j];
          const same = s1[i - 1] === ch;
          fromS1 = prev && same;
          parts.push(
            `**取自 \`s1\`**（上方）：\`dp[${i - 1}][${j}]\` 是 ${py(prev)}` +
              (prev ? `，\`s1[${i - 1}] = "${s1[i - 1]}"\` ${same ? "等於" : "不等於"} \`"${ch}"\`` : "，前面就組不出來") +
              ` → ${fromS1 ? "可以" : "不行"}`,
          );
        }
        if (j > 0) {
          deps[`${i},${j - 1}`] = "compare";
          const prev = dp[i][j - 1];
          const same = s2[j - 1] === ch;
          fromS2 = prev && same;
          parts.push(
            `**取自 \`s2\`**（左方）：\`dp[${i}][${j - 1}]\` 是 ${py(prev)}` +
              (prev ? `，\`s2[${j - 1}] = "${s2[j - 1]}"\` ${same ? "等於" : "不等於"} \`"${ch}"\`` : "，前面就組不出來") +
              ` → ${fromS2 ? "可以" : "不行"}`,
          );
        }
        dp[i][j] = fromS1 || fromS2;
        filled[i][j] = true;
        const line = [10, ...(i > 0 ? [12] : []), ...(fromS1 ? [13] : []), ...(j > 0 ? [15] : []), ...(fromS2 ? [16] : [])];
        t.push({
          line,
          note:
            `要組出 \`s3\` 的前 ${i + j} 個字元 \`"${s3.slice(0, i + j)}"\`，最後一個字元是 \`s3[${k}] = "${ch}"\`。` +
            `${parts.join("；")}。\`dp[${i}][${j}] = ${py(dp[i][j])}\`。`,
          views: views({ ...deps, [key]: "active" }, [i, j], { [k]: dp[i][j] ? "good" : "bad" }, k),
          vars: { i, j, "s3[i+j-1]": ch, "dp[i][j]": dp[i][j] },
        });
      }
    }

    const ans = dp[m][n];
    // 成立時回溯出一條從 (0,0) 到 (m,n) 的路徑
    const path: Record<string, Tone> = {};
    const order: string[] = [];
    if (ans) {
      // 不在路徑上的 True 格子退成淡色，讓路徑跳出來
      for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) if (dp[i][j]) path[`${i},${j}`] = "visited";
      for (let i = m, j = n; ; ) {
        path[`${i},${j}`] = "good";
        if (i === 0 && j === 0) break;
        if (i > 0 && dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) {
          order.unshift(`${s1[i - 1]}₁`);
          i--;
        } else {
          order.unshift(`${s2[j - 1]}₂`);
          j--;
        }
      }
    } else {
      path[`${m},${n}`] = "bad";
    }
    t.push({
      line: 17,
      note: ans
        ? `右下角 \`dp[${m}][${n}]\` 是 True。綠色的路徑就是一種交錯方式：往下走一步取 \`s1\`、往右走一步取 \`s2\`，依序是 \`${order.join(" ")}\`（下標 1、2 代表來自哪個字串）。`
        : `右下角 \`dp[${m}][${n}]\` 是 False：從左上角沒有任何一條全是 True 的路可以走到右下角，\`s3\` 不是交錯字串。`,
      views: views(path),
      vars: { m, n },
      result: py(ans),
    });
    return t.frames;
  },
});
