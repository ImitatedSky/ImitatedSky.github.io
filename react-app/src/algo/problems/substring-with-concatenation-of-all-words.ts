import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        n, k, m = len(s), len(words[0]), len(words)
        need = Counter(words)
        res = []
        for start in range(k):  # 依切割起點分成 k 組，各滑一次
            have = Counter()
            count = 0  # 視窗內的單字數
            l = start
            for r in range(start, n - k + 1, k):
                w = s[r:r + k]
                if w not in need:
                    have.clear()  # 不認識的單字：視窗整個作廢
                    count = 0
                    l = r + k
                    continue
                have[w] += 1
                count += 1
                while have[w] > need[w]:  # w 太多了，從左邊吐掉單字
                    have[s[l:l + k]] -= 1
                    count -= 1
                    l += k
                if count == m:
                    res.append(l)
        return res`;

export default defineProblem<{ s: string; words: string[] }>({
  id: 30,
  summary:
    "給一個字串 `s` 和一組**長度都相同**的單字 `words`。把 `words` 裡的每個單字**各用一次**、以任意順序首尾相接，會得到一個「串聯字串」。\n\n找出 `s` 裡所有等於某個串聯字串的子字串，回傳它們的起始索引（順序不限）。`words` 裡可能有重複的單字，重複幾次就得用幾次。",
  examples: [
    { input: 's = "barfoothefoobarman", words = ["foo","bar"]', output: "[0,9]", note: '"barfoo" 和 "foobar"' },
    { input: 's = "wordgoodgoodgoodbestword", words = ["word","good","best","word"]', output: "[]" },
    { input: 's = "barfoofoobarthefoobarman", words = ["bar","foo","the"]', output: "[6,9,12]" },
  ],
  constraints: ["1 ≤ s.length ≤ 10⁴", "1 ≤ words.length ≤ 5000", "1 ≤ words[i].length ≤ 30", "所有單字長度相同"],
  idea:
    "單字長度固定是 `k`，所以只要決定「從哪裡開始切」，`s` 就會變成**一排單字**。切割起點只有 `0 … k-1` 這 `k` 種；對每一種，把單字當成一個「字元」，問題就變成經典的滑動視窗：找出單字數量與 `need` 完全一致的視窗。",
  steps: [
    "用 `need = Counter(words)` 記下每個單字需要幾個。",
    "列舉切割起點 `start = 0 … k-1`，每一組各自維護視窗左邊界 `l`、視窗內的計數 `have` 與單字數 `count`。",
    "`r` 每次跳 `k` 格，取出單字 `w`。若 `w` 不在 `need` 裡，任何包含它的視窗都不合法：清空視窗，`l` 跳到它後面。",
    "否則把 `w` 收進視窗；如果 `w` 的數量超過需要的，就從左邊一個一個吐掉單字，直到不超過。",
    "此時視窗內每種單字都不超量，所以只要 `count == m`，就代表剛好湊齊，記錄 `l`。",
  ],
  pitfalls: [
    "一定要試遍 `k` 種切割起點，只從 0 開始切會漏掉答案。",
    "`words` 可能有重複單字，要用 `Counter` 比數量，不能只用集合判斷有沒有出現。",
    "湊齊之後**不用清空視窗**：下一個單字進來若超量，`while` 會自動把左邊吐掉，視窗就這樣一格一格滑過去。",
    "`r` 的上限是 `n - k`，尾巴不足一個單字長度的部分不用看。",
  ],
  complexity: { time: "O(n · k)，k 為單字長度", space: "O(m · k)" },
  code,
  starter: `class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        `,
  presets: [
    { label: '"barfoothefoobarman", [foo, bar]', input: { s: "barfoothefoobarman", words: ["foo", "bar"] }, expected: "[0, 9]" },
    { label: '"ababcdabab", [ab, ab, cd]', input: { s: "ababcdabab", words: ["ab", "ab", "cd"] }, expected: "[0, 2, 4]" },
    { label: '"afoobarbbarfoo", [foo, bar]', input: { s: "afoobarbbarfoo", words: ["foo", "bar"] }, expected: "[1, 8]" },
  ],
  trace({ s, words }) {
    const t = tracer();
    const n = s.length;
    const k = words[0].length;
    const m = words.length;
    const need = new Map<string, number>();
    for (const w of words) need.set(w, (need.get(w) ?? 0) + 1);
    const res: number[] = [];

    t.push({
      line: [3, 4, 5],
      note: `每個單字長度 \`k = ${k}\`，共 \`m = ${m}\` 個，所以合法的子字串長度一定是 ${k * m}。\`need\` 記下每個單字需要的數量。`,
      views: [V.chars("s", s), V.map("need", need), V.set("res", res)],
      vars: { n, k, m },
    });

    for (let start = 0; start < k; start++) {
      const have = new Map<string, number>();
      let count = 0;
      let l = start;
      const chunks: string[] = [];
      for (let r = start; r <= n - k; r += k) chunks.push(s.slice(r, r + k));
      const used = start + chunks.length * k; // 之後是不足一個單字的尾巴
      const ci = (pos: number) => (pos - start) / k;

      /** r < 0 表示還沒開始讀單字 */
      const views = (
        r: number,
        o: { word?: Tone; window?: Tone; gone?: number[]; haveMarks?: Record<string, Tone>; newRes?: boolean } = {},
      ) => {
        const sMarks: Record<number, Tone> = {};
        const cMarks: Record<number, Tone> = {};
        for (let i = 0; i < n; i++) if (i < start || i >= used) sMarks[i] = "muted";
        for (let i = start; i < l && i < used; i++) sMarks[i] = "muted";
        for (let c = 0; c < ci(l) && c < chunks.length; c++) cMarks[c] = "muted";
        const hasWindow = r >= 0 && l <= r;
        if (hasWindow && o.window) {
          for (let i = l; i < r + k; i++) sMarks[i] = o.window;
          for (let c = ci(l); c <= ci(r); c++) cMarks[c] = o.window;
        }
        for (const g of o.gone ?? []) {
          for (let i = g; i < g + k; i++) sMarks[i] = "bad";
          cMarks[ci(g)] = "bad";
        }
        if (r >= 0 && o.word) {
          for (let i = r; i < r + k; i++) sMarks[i] = o.word;
          cMarks[ci(r)] = o.word;
        }
        const label = `視窗：${count} / ${m} 個單字`;
        return [
          V.chars("s", s, {
            pointers: r >= 0 ? { l, r } : { l },
            marks: sMarks,
            ...(hasWindow ? { ranges: [{ from: l, to: r + k - 1, tone: o.window ?? "active", label }] } : {}),
          }),
          V.array("切成單字", chunks, {
            marks: cMarks,
            ...(hasWindow ? { ranges: [{ from: ci(l), to: ci(r), tone: o.window ?? "active", label }] } : {}),
          }),
          V.map("need", need),
          V.map("have", have, { marks: o.haveMarks ?? {} }),
          V.set("res", res, o.newRes ? { marks: { [String(res[res.length - 1])]: "good" } } : {}),
        ];
      };

      t.push({
        line: [6, 7, 8, 9],
        note:
          `切割起點 \`start = ${start}\`：從索引 ${start} 開始每 ${k} 個字元切一刀，\`s\` 變成下面那排單字。` +
          (chunks.length < m ? `這樣只切得出 ${chunks.length} 個單字，不可能湊齊 ${m} 個。` : "接下來把每個單字當成一格，做滑動視窗。"),
        views: views(-1),
        vars: { start, l, count },
      });

      for (let r = start; r <= n - k; r += k) {
        const w = s.slice(r, r + k);
        if (!need.has(w)) {
          have.clear();
          count = 0;
          l = r + k;
          t.push({
            line: [11, 12, 13, 14, 15, 16],
            note: `讀到單字 \`${w}\`，它不在 \`need\` 裡。任何包含它的視窗都不可能合法 —— 視窗整個清空，\`l\` 跳到它後面（索引 ${l}）重新開始。`,
            views: views(r, { word: "bad" }),
            vars: { start, l, r, w, count },
          });
          continue;
        }

        have.set(w, (have.get(w) ?? 0) + 1);
        count++;
        const over = have.get(w)! > need.get(w)!;
        t.push({
          line: [11, 17, 18],
          note:
            `讀到單字 \`${w}\`，是需要的單字，收進視窗：\`have[${w}] = ${have.get(w)}\`、\`count = ${count}\`。` +
            (over ? `但 \`need[${w}]\` 只有 ${need.get(w)}，\`${w}\` 超量了！` : ""),
          views: views(r, { word: over ? "bad" : "active", haveMarks: { [w]: over ? "bad" : "active" } }),
          vars: { start, l, r, w, count },
        });

        while (have.get(w)! > need.get(w)!) {
          const out = s.slice(l, l + k);
          const gone = l;
          have.set(out, have.get(out)! - 1);
          count--;
          l += k;
          const still = have.get(w)! > need.get(w)!;
          t.push({
            line: [19, 20, 21, 22],
            note:
              `從左邊吐掉單字 \`${out}\`：\`have[${out}] = ${have.get(out)}\`、\`count = ${count}\`，\`l\` 右移到 ${l}。` +
              (still ? `\`${w}\` 還是超量，繼續吐。` : `現在 \`${w}\` 不超量了，視窗恢復合法。`),
            views: views(r, { gone: [gone], word: still ? "bad" : "active", haveMarks: { [out]: "compare" } }),
            vars: { start, l, r, w, count },
          });
        }

        if (count === m) {
          res.push(l);
          t.push({
            line: [23, 24],
            note: `\`count == m\`（${m}）：視窗裡每種單字都沒超量，又剛好有 ${m} 個，代表完全湊齊！子字串 \`"${s.slice(l, r + k)}"\` 的起點 \`l = ${l}\` 加進答案。`,
            views: views(r, { window: "good", newRes: true }),
            vars: { start, l, r, w, count },
          });
        }
      }
    }

    const marks: Record<number, Tone> = {};
    for (let i = 0; i < n; i++) marks[i] = "muted";
    for (const p of res) for (let i = p; i < p + k * m; i++) marks[i] = "good";
    t.push({
      line: 25,
      note: res.length
        ? `${k} 種切割起點都滑完了，共找到 ${res.length} 個起點：${res.map((p) => `\`${p}\``).join("、")}。`
        : `${k} 種切割起點都滑完了，沒有任何視窗能湊齊所有單字。`,
      views: [
        V.chars("s", s, { marks, pointers: Object.fromEntries(res.map((p, i) => [`res[${i}]`, p])) }),
        V.map("need", need),
        V.set("res", res, { marks: Object.fromEntries(res.map((p) => [String(p), "good" as Tone])) }),
      ],
      result: py(res),
    });
    return t.frames;
  },
});
