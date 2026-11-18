import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        have = Counter()  # 視窗內每個字元的數量
        formed, required = 0, len(need)  # 已達標 / 需要達標的字元種類
        best_l, best_len = 0, inf
        l = 0
        for r, c in enumerate(s):
            have[c] += 1
            if c in need and have[c] == need[c]:
                formed += 1  # c 這個字元剛好湊夠
            while formed == required:  # 視窗合法，盡量從左邊縮
                if r - l + 1 < best_len:
                    best_l, best_len = l, r - l + 1
                out = s[l]
                have[out] -= 1
                if out in need and have[out] < need[out]:
                    formed -= 1  # out 變得不夠了
                l += 1
        return "" if best_len == inf else s[best_l:best_l + best_len]`;

export default defineProblem<{ s: string; t: string }>({
  id: 76,
  summary:
    "給兩個字串 `s` 和 `t`，在 `s` 裡找出**最短的子字串**，使它包含 `t` 的所有字元 —— `t` 裡重複出現的字元，子字串裡也要有至少那麼多個。\n\n找不到就回傳空字串。題目保證答案唯一。",
  examples: [
    { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
    { input: 's = "a", t = "a"', output: '"a"' },
    { input: 's = "a", t = "aa"', output: '""', note: "s 裡只有一個 a，不夠" },
  ],
  constraints: ["1 ≤ s.length, t.length ≤ 10⁵", "s 和 t 由大小寫英文字母組成"],
  idea:
    "滑動視窗：右邊界一直擴張到視窗「涵蓋 `t`」為止，接著左邊界盡量收縮、邊縮邊記錄最短紀錄，縮到不合法再繼續擴張。關鍵是**不要每次都重新比對整個計數表**：用 `formed` 記住「有幾種字元已經湊夠」，只在某個字元的數量剛好跨過門檻時加減 1，判斷視窗合不合法就是 O(1)。",
  steps: [
    "`need = Counter(t)`；`required` 是需要湊齊的字元**種類數**。",
    "`r` 往右擴張，把 `s[r]` 記進 `have`。如果它是需要的字元而且數量**剛好等於** `need`，`formed += 1`。",
    "當 `formed == required`，視窗合法：先用目前長度更新最短紀錄。",
    "把最左邊的字元 `out` 移出視窗；如果它是需要的字元而且數量掉到 `need` 以下，`formed -= 1`。然後 `l += 1`。",
    "重複直到 `r` 走完，回傳紀錄的最短視窗（沒有紀錄就回傳空字串）。",
  ],
  pitfalls: [
    "`formed` 只在 `have[c] == need[c]` 的**那一瞬間**加 1；用 `>=` 的話，同一個字元多出現幾次會被重複計算。",
    "`required` 是字元**種類數** `len(need)`，不是 `len(t)`。",
    "縮視窗時要先記錄答案、再移出字元，順序反了會記到不合法的視窗。",
    "記錄起點和長度就好，不要每次都切出子字串，否則會退化成 O(n²)。",
  ],
  complexity: { time: "O(n + m)", space: "O(字元種類數)" },
  code,
  starter: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        `,
  presets: [
    { label: '"ADOBECODEBANC", "ABC"', input: { s: "ADOBECODEBANC", t: "ABC" }, expected: '"BANC"' },
    { label: '"acbbaca", "aba"', input: { s: "acbbaca", t: "aba" }, expected: '"baca"' },
    { label: '"abc", "bb"', input: { s: "abc", t: "bb" }, expected: '""' },
  ],
  trace({ s, t: target }) {
    const tr = tracer();
    const n = s.length;
    const need = new Map<string, number>();
    for (const ch of target) need.set(ch, (need.get(ch) ?? 0) + 1);
    const have = new Map<string, number>();
    let formed = 0;
    const required = need.size;
    let bestL = 0;
    let bestLen = Infinity;
    let l = 0;

    const bestStr = () => (bestLen === Infinity ? "（還沒有）" : `"${s.slice(bestL, bestL + bestLen)}"`);
    const vars = (r: number | null) => ({
      ...(r === null ? { l } : { l, r }),
      formed: `${formed} / ${required}`,
      best: bestStr(),
    });
    const sView = (r: number, tone: Tone, extra: Record<number, Tone> = {}) => {
      const marks: Record<number, Tone> = {};
      for (let i = 0; i < l && i < n; i++) marks[i] = "muted";
      for (let i = l; i <= r; i++) if (need.has(s[i])) marks[i] = "alt"; // 視窗內「有用」的字元
      return V.chars("s", s, {
        pointers: r >= 0 ? { l, r } : { l },
        marks: { ...marks, ...extra },
        ...(r >= l ? { ranges: [{ from: l, to: r, tone, label: `長度 ${r - l + 1}` }] } : {}),
      });
    };
    const needView = () => V.map("need", need);
    const haveView = (extra: Record<string, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      for (const [ch, cnt] of have) marks[ch] = !need.has(ch) ? "muted" : cnt >= need.get(ch)! ? "good" : "compare";
      return V.map("have", have, { marks: { ...marks, ...extra } });
    };

    tr.push({
      line: [3, 4, 5, 6, 7],
      note: `\`need\` 記下 \`t = "${target}"\` 每個字元需要幾個，共 ${required} 種字元要湊齊（\`required = ${required}\`）。\`formed\` 記錄目前視窗已經湊夠幾種。`,
      views: [sView(-1, "active"), needView(), haveView()],
      vars: vars(null),
    });

    for (let r = 0; r < n; r++) {
      const c = s[r];
      have.set(c, (have.get(c) ?? 0) + 1);
      const cnt = have.get(c)!;
      let note: string;
      let line: number[];
      if (!need.has(c)) {
        note = `右邊界擴張，收進 \`${c}\`。它不是 \`t\` 需要的字元，對湊齊沒有幫助，\`formed\` 不變。`;
        line = [8, 9, 10];
      } else if (cnt === need.get(c)!) {
        formed++;
        note =
          `右邊界擴張，收進 \`${c}\`：\`have[${c}] = ${cnt}\`，剛好等於 \`need[${c}]\`，這種字元湊夠了，\`formed = ${formed}\`。` +
          (formed === required ? "所有種類都湊齊，**視窗合法**！" : "");
        line = [8, 9, 10, 11];
      } else if (cnt < need.get(c)!) {
        note = `右邊界擴張，收進 \`${c}\`：\`have[${c}] = ${cnt}\`，還不到需要的 ${need.get(c)} 個，\`formed\` 不變。`;
        line = [8, 9, 10];
      } else {
        note = `右邊界擴張，收進 \`${c}\`：\`have[${c}] = ${cnt}\`，已經超過需要的 ${need.get(c)} 個。多出來的不會讓 \`formed\` 再加一次。`;
        line = [8, 9, 10];
      }
      tr.push({
        line,
        note,
        views: [sView(r, formed === required ? "good" : "active", { [r]: "active" }), needView(), haveView()],
        vars: vars(r),
      });

      while (formed === required) {
        const len = r - l + 1;
        const improved = len < bestLen;
        if (improved) {
          bestL = l;
          bestLen = len;
        }
        tr.push({
          line: [12, 13, 14],
          note:
            `視窗 \`"${s.slice(l, r + 1)}"\` 涵蓋了 \`t\`，長度 ${len}。` +
            (improved ? "比目前的紀錄短，記下來。" : `沒有比紀錄 ${bestStr()} 短，不更新。`) +
            "接著試試從左邊縮短。",
          views: [sView(r, "good"), needView(), haveView()],
          vars: vars(r),
        });

        const out = s[l];
        const outAt = l;
        have.set(out, have.get(out)! - 1);
        const left = have.get(out)!;
        let why: string;
        let lines: number[];
        if (!need.has(out)) {
          why = `\`${out}\` 本來就不需要，丟掉完全沒影響，視窗依然合法。`;
          lines = [15, 16, 17, 19];
        } else if (left < need.get(out)!) {
          formed--;
          why = `\`have[${out}]\` 掉到 ${left}，少於需要的 ${need.get(out)} 個 —— \`formed\` 減為 ${formed}，視窗不再合法，得回去擴張右邊界。`;
          lines = [15, 16, 17, 18, 19];
        } else {
          why = `\`have[${out}]\` 還有 ${left} 個，仍然夠用（需要 ${need.get(out)} 個），視窗依然合法。`;
          lines = [15, 16, 17, 19];
        }
        l++;
        tr.push({
          line: lines,
          note: `把最左邊的 \`${out}\` 移出視窗，\`l\` 右移到 ${l}。${why}`,
          views: [
            sView(r, formed === required ? "good" : "active", { [outAt]: "bad" }),
            needView(),
            haveView(need.has(out) && formed !== required ? { [out]: "bad" } : {}),
          ],
          vars: vars(r),
        });
      }
    }

    const found = bestLen !== Infinity;
    const marks: Record<number, Tone> = {};
    for (let i = 0; i < n; i++) marks[i] = found && i >= bestL && i < bestL + bestLen ? "good" : "muted";
    const ans = found ? s.slice(bestL, bestL + bestLen) : "";
    tr.push({
      line: 20,
      note: found
        ? `右邊界走到底了。記錄到的最短合法視窗是索引 ${bestL} ~ ${bestL + bestLen - 1} 的 \`"${ans}"\`。`
        : "右邊界走到底，視窗從來沒有合法過（`best_len` 還是無限大），回傳空字串。",
      views: [
        V.chars("s", s, {
          pointers: { l, r: n - 1 },
          marks,
          ...(found ? { ranges: [{ from: bestL, to: bestL + bestLen - 1, tone: "good" as Tone, label: `最短，長度 ${bestLen}` }] } : {}),
        }),
        needView(),
        haveView(),
      ],
      vars: vars(null),
      result: py(ans),
    });
    return tr.frames;
  },
});
