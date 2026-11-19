import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        s2t, t2s = {}, {}  # 兩個方向各一張對照表
        for a, b in zip(s, t):
            if a in s2t and s2t[a] != b:
                return False
            if b in t2s and t2s[b] != a:
                return False
            s2t[a] = b
            t2s[b] = a
        return True`;

export default defineProblem<{ s: string; t: string }>({
  id: 205,
  summary:
    "給兩個長度相同的字串 `s` 和 `t`，判斷它們是否**同構**：能不能把 `s` 的每一種字元固定換成另一種字元，換完剛好得到 `t`。\n\n同一種字元必須永遠換成同一個字元，而且**不同的字元不能換成同一個字元**（字元可以換成自己）。",
  summaryEn:
    "Given two strings `s` and `t` of the same length, decide whether they are **isomorphic**: can each kind of character in `s` be consistently replaced by some character so that the result is exactly `t`?\n\nThe same character must always map to the same character, and **two different characters cannot map to the same character** (a character may map to itself).",
  examples: [
    { input: 's = "egg", t = "add"', output: "true", note: "e→a、g→d", noteEn: "e->a, g->d" },
    { input: 's = "foo", t = "bar"', output: "false", note: "o 不能同時對應 a 和 r", noteEn: "o cannot map to both a and r" },
    { input: 's = "paper", t = "title"', output: "true" },
  ],
  constraints: ["1 ≤ s.length ≤ 5 × 10⁴", "t.length == s.length", "由任意 ASCII 字元組成"],
  constraintsEn: ["1 ≤ s.length ≤ 5 × 10⁴", "t.length == s.length", "Made of any ASCII characters"],
  idea:
    "同構就是字元之間的**一對一對應**。只記 `s → t` 一個方向會漏掉「兩個不同字元對到同一個字元」的情況，所以要**兩個方向各一張雜湊表**：`s2t` 保證同一個 `a` 不會對到兩個 `b`，`t2s` 保證同一個 `b` 不會被兩個 `a` 搶。",
  steps: [
    "準備兩張空的對照表 `s2t`、`t2s`。",
    "同時走訪兩個字串同一位置的字元 `a`、`b`。",
    "若 `a` 已經有對應、但對應的不是 `b` → 衝突，回傳 `False`。",
    "若 `b` 已經被對應、但對它的不是 `a` → 衝突，回傳 `False`。",
    "沒有衝突就把 `a ↔ b` 記進兩張表。全部走完回傳 `True`。",
  ],
  pitfalls: [
    "只用一張表會把 `\"badc\"` / `\"baba\"` 誤判成 `True`：`b→b`、`a→a`、`d→b`、`c→a` 單看 s→t 都不衝突，但 `b` 被兩個字元對到了。",
  ],
  complexity: { time: "O(n)", space: "O(字元種類數)" },
  code,
  starter: `class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        `,
  presets: [
    { label: '"paper" / "title"', input: { s: "paper", t: "title" }, expected: "True" },
    { label: '"foo" / "bar"', input: { s: "foo", t: "bar" }, expected: "False" },
    { label: '"badc" / "baba"', input: { s: "badc", t: "baba" }, expected: "False" },
  ],
  trace({ s, t }) {
    const tr = tracer();
    const s2t = new Map<string, string>();
    const t2s = new Map<string, string>();
    const done: Record<number, Tone> = {};

    const views = (
      i: number | null,
      cur: Tone | null,
      m1: Record<string, Tone> = {},
      m2: Record<string, Tone> = {},
    ) => {
      const marks = i !== null && cur ? { ...done, [i]: cur } : { ...done };
      const pointers: Record<string, number> = i !== null ? { i } : {};
      return [
        V.chars("s", s, { pointers, marks }),
        V.chars("t", t, { pointers, marks }),
        V.map("s2t（s 的字元 → t 的字元）", s2t, { marks: m1 }),
        V.map("t2s（t 的字元 → s 的字元）", t2s, { marks: m2 }),
      ];
    };

    tr.push({
      line: 3,
      note: "同構 = **一對一**對應。準備兩張對照表：`s2t` 記「s 的字元換成誰」，`t2s` 記「t 的字元是被誰換來的」。",
      views: views(null, null),
    });

    for (let i = 0; i < s.length; i++) {
      const a = s[i];
      const b = t[i];
      const vars = { i, a, b };

      if (s2t.has(a) && s2t.get(a) !== b) {
        tr.push({
          line: [4, 5, 6],
          note: `位置 ${i}：\`${a}\` 對 \`${b}\`。但 \`s2t\` 裡 \`${a}\` 早就對應到 \`${s2t.get(a)}\` 了 —— 同一個字元不能換成兩種不同的字元，衝突！`,
          views: views(i, "bad", { [a]: "bad" }),
          vars,
          result: py(false),
        });
        return tr.frames;
      }
      if (t2s.has(b) && t2s.get(b) !== a) {
        tr.push({
          line: [4, 5, 7, 8],
          note: `位置 ${i}：\`${a}\` 對 \`${b}\`。\`s2t\` 這邊沒問題，但 \`t2s\` 顯示 \`${b}\` 已經是 \`${t2s.get(b)}\` 的對象 —— 兩個不同的字元不能換成同一個，衝突！`,
          views: views(i, "bad", {}, { [b]: "bad" }),
          vars,
          result: py(false),
        });
        return tr.frames;
      }

      const known = s2t.has(a);
      tr.push({
        line: [4, 5, 7],
        note: known
          ? `位置 ${i}：\`${a}\` 對 \`${b}\`。兩張表都查得到，而且和之前記的一致（\`${a} → ${b}\`、\`${b} → ${a}\`），沒有衝突。`
          : `位置 ${i}：\`${a}\` 對 \`${b}\`。\`${a}\` 還沒有對應，\`${b}\` 也還沒被別人對到，兩個方向都沒有衝突。`,
        views: views(i, "active", known ? { [a]: "compare" } : {}, known ? { [b]: "compare" } : {}),
        vars,
      });

      s2t.set(a, b);
      t2s.set(b, a);
      done[i] = "good";
      tr.push({
        line: [9, 10],
        note: known
          ? `對應不變，照樣寫回兩張表（內容沒有改變）。`
          : `把這組配對記下來：\`s2t["${a}"] = "${b}"\`、\`t2s["${b}"] = "${a}"\`。之後再遇到這兩個字元，都必須維持這個配對。`,
        views: views(i, "good", { [a]: "active" }, { [b]: "active" }),
        vars,
      });
    }

    tr.push({
      line: 11,
      note: "整個字串走完都沒有衝突，兩個方向都是一對一，`s` 和 `t` 同構。",
      views: views(null, null),
      result: py(true),
    });
    return tr.frames;
  },
});
