import { defineProblem } from "../types";
import type { ArrayView, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(l: int, r: int) -> Tuple[int, int]:
            # 從中心往兩邊擴張，回傳回文的範圍 [l, r]
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return l + 1, r - 1

        best_l, best_r = 0, 0
        for i in range(len(s)):
            for l, r in (expand(i, i), expand(i, i + 1)):  # 奇數、偶數長度
                if r - l > best_r - best_l:
                    best_l, best_r = l, r
        return s[best_l:best_r + 1]`;

type Range = NonNullable<ArrayView["ranges"]>[number];

export default defineProblem<{ s: string }>({
  id: 5,
  summary:
    "給一個字串 `s`，找出其中**最長的回文子字串**（正著讀和反著讀都一樣的連續片段）。\n\n如果有好幾個一樣長的，回傳任何一個都可以。",
  summaryEn:
    "Given a string `s`, find its **longest palindromic substring** (a contiguous piece that reads the same forwards and backwards).\n\nIf several have the same maximum length, return any of them.",
  examples: [
    { input: 's = "babad"', output: '"bab"', note: '"aba" 也是正確答案', noteEn: "\"aba\" is also a correct answer" },
    { input: 's = "cbbd"', output: '"bb"' },
  ],
  constraints: ["1 ≤ s.length ≤ 1000", "s 只包含英文字母與數字"],
  constraintsEn: ["1 ≤ s.length ≤ 1000", "s contains only English letters and digits"],
  idea:
    "回文是**左右對稱**的，所以一定有個中心。枚舉每一個可能的中心，從中心往兩邊一格一格擴張，只要兩端字元相同就繼續，直到不同或撞到邊界。中心有兩種：落在一個字元上（奇數長度，如 `aba`）或落在兩個字元之間（偶數長度，如 `abba`），一共 `2n - 1` 個。",
  steps: [
    "寫一個 `expand(l, r)`：當 `s[l] == s[r]` 時不斷往外推，回傳最後成立的範圍。",
    "對每個 `i` 分別以 `(i, i)`（奇數）和 `(i, i + 1)`（偶數）為中心擴張。",
    "擴張出來的回文比目前記錄的長，就更新 `best_l, best_r`。",
    "最後用記下的範圍切出子字串。",
  ],
  pitfalls: [
    "只擴張 `(i, i)` 會漏掉偶數長度的回文，例如 `\"cbbd\"` 的 `\"bb\"`。",
    "`while` 結束時 `l`、`r` 已經**多跨出一步**，真正的範圍是 `[l + 1, r - 1]`。",
    "記索引、最後才切片，不要在迴圈裡一直切字串。",
  ],
  complexity: { time: "O(n²)", space: "O(1)" },
  code,
  starter: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        `,
  presets: [
    { label: '"babad"', input: { s: "babad" }, expected: '"bab"' },
    { label: '"xabbay"（偶數長度）', input: { s: "xabbay" }, expected: '"abba"' },
    { label: '"a"', input: { s: "a" }, expected: '"a"' },
  ],
  trace({ s }) {
    const t = tracer();
    const n = s.length;
    let bestL = 0;
    let bestR = 0;
    const best = () => s.slice(bestL, bestR + 1);
    const bestRange = (): Range => ({ from: bestL, to: bestR, tone: "good", label: "best" });
    const view = (o: { marks?: Record<number, Tone>; pointers?: Record<string, number>; ranges?: Range[] }) => [
      V.chars("s", s, { marks: o.marks ?? {}, pointers: o.pointers ?? {}, ranges: o.ranges ?? [bestRange()] }),
    ];

    t.push({
      line: 10,
      note: `回文左右對稱，所以一定有個**中心**。接下來枚舉每個中心往兩邊擴張。先把答案設成第一個字元 \`"${s[0]}"\`（單一字元本身就是回文）。`,
      views: view({}),
      vars: { best_l: bestL, best_r: bestR, best: py(best()) },
    });

    for (let i = 0; i < n; i++) {
      for (const [l0, r0] of [
        [i, i],
        [i, i + 1],
      ]) {
        const odd = l0 === r0;
        const centre = odd ? `以 \`s[${i}] = "${s[i]}"\` 為中心（奇數長度）` : `以 \`s[${i}]\` 和 \`s[${i + 1}]\` 之間為中心（偶數長度）`;
        let l = l0;
        let r = r0;
        let first = true;
        while (l >= 0 && r < n && s[l] === s[r]) {
          const inner: Record<number, Tone> = {};
          for (let k = l + 1; k < r; k++) inner[k] = "visited";
          t.push({
            line: first ? [11, 12, 5] : [5, 6, 7],
            note:
              (first ? `${centre}。` : "往外推一格：") +
              (l === r
                ? `單一字元一定是回文，\`"${s[l]}"\` 成立，繼續往兩邊看。`
                : `\`s[${l}] = "${s[l]}"\` 和 \`s[${r}] = "${s[r]}"\` 相同，\`"${s.slice(l, r + 1)}"\` 是回文，繼續往外推。`),
            views: view({
              marks: { ...inner, [l]: "active", [r]: "active" },
              pointers: l === r ? { "l,r": l } : { l, r },
              ranges: [bestRange(), { from: l, to: r, tone: "active", label: "回文" }],
            }),
            vars: { i, l, r, best: py(best()) },
          });
          first = false;
          l--;
          r++;
        }

        // while 條件不成立的那一刻
        const outOfBounds = l < 0 || r >= n;
        const resL = l + 1;
        const resR = r - 1;
        const empty = resL > resR;
        const stopMarks: Record<number, Tone> = {};
        for (let k = resL; k <= resR; k++) stopMarks[k] = "visited";
        if (l >= 0) stopMarks[l] = outOfBounds ? "muted" : "bad";
        if (r < n) stopMarks[r] = outOfBounds ? "muted" : "bad";
        const why = outOfBounds
          ? `${l < 0 && r >= n ? "兩邊都" : l < 0 ? "左邊" : "右邊"}已經超出字串邊界`
          : `\`s[${l}] = "${s[l]}"\` 和 \`s[${r}] = "${s[r]}"\` 不同`;
        t.push({
          line: first ? [11, 12, 5, 8] : [5, 8],
          note:
            (first ? `${centre}。` : "") +
            `${why}，擴張停止。` +
            (empty
              ? outOfBounds
                ? "這個中心湊不出任何一對字元，沒有回文。"
                : "這個中心連第一對都對不上，沒有回文。"
              : `退回一步，這個中心最長的回文是 \`s[${resL}..${resR}] = "${s.slice(resL, resR + 1)}"\`（長度 ${resR - resL + 1}）。`),
          views: view({
            marks: stopMarks,
            pointers: { l, r },
            ranges: empty ? [bestRange()] : [bestRange(), { from: resL, to: resR, tone: "compare", label: "這次" }],
          }),
          vars: { i, l, r, best: py(best()) },
        });

        if (resR - resL > bestR - bestL) {
          const old = best();
          bestL = resL;
          bestR = resR;
          const m: Record<number, Tone> = {};
          for (let k = bestL; k <= bestR; k++) m[k] = "good";
          t.push({
            line: [13, 14],
            note: `\`"${best()}"\`（長度 ${best().length}）比目前記錄的 \`"${old}"\`（長度 ${old.length}）更長，更新答案：\`best_l, best_r = ${bestL}, ${bestR}\`。`,
            views: view({ marks: m }),
            vars: { i, best_l: bestL, best_r: bestR, best: py(best()) },
          });
        }
      }
    }

    const m: Record<number, Tone> = {};
    for (let k = 0; k < n; k++) m[k] = k >= bestL && k <= bestR ? "good" : "muted";
    t.push({
      line: 15,
      note: `所有 ${2 * n - 1} 個有效中心都試過了，最長的回文子字串是 \`s[${bestL}:${bestR + 1}] = "${best()}"\`。`,
      views: view({ marks: m }),
      vars: { best_l: bestL, best_r: bestR },
      result: py(best()),
    });
    return t.frames;
  },
});
