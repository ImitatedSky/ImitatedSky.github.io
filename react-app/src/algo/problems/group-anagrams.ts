import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)  # 排序後的字串 -> 同一組的單字
        for s in strs:
            key = "".join(sorted(s))
            groups[key].append(s)
        return list(groups.values())`;

const WORD = "s 的字母（排序後就是 key）";
const GROUPS = "groups（key → 同組的單字）";

export default defineProblem<{ strs: string[] }>({
  id: 49,
  summary:
    "給一個字串陣列 `strs`，把其中互為**字母異位詞**的字串分在同一組（用到的字母與數量完全相同，只是順序不同）。\n\n回傳所有分組，組與組之間、組內的順序都不限。",
  examples: [
    {
      input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
      output: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
    },
    { input: 'strs = [""]', output: '[[""]]' },
    { input: 'strs = ["a"]', output: '[["a"]]' },
  ],
  constraints: ["1 ≤ strs.length ≤ 10⁴", "0 ≤ strs[i].length ≤ 100", "只包含小寫英文字母"],
  idea:
    "要把「同一組」的字串丟進同一個桶子，就需要一個**同組的字串都算得出相同結果的標籤**。把字母排序就是最簡單的標籤：`eat`、`tea`、`ate` 排序後都是 `aet`。用這個標籤當雜湊表的 key 即可。",
  steps: [
    "準備 `groups = defaultdict(list)`，key 是排序後的字串，value 是屬於這組的原字串。",
    "對每個字串 `s`，算出 `key = \"\".join(sorted(s))`。",
    "把 `s` 加進 `groups[key]`。",
    "最後回傳 `groups` 所有的 value。",
  ],
  pitfalls: [
    "`sorted(s)` 回傳的是字元的 **list**，list 不能當 dict 的 key，要用 `\"\".join(...)` 轉回字串（或 `tuple(...)`）。",
    "若字串很長，可以改用「26 個字母的計數 tuple」當 key，把每個字串的成本從 O(k log k) 降到 O(k)。",
  ],
  complexity: { time: "O(n · k log k)（k 為字串最大長度）", space: "O(n · k)" },
  code,
  starter: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        `,
  presets: [
    {
      label: '["eat","tea","tan","ate","nat","bat"]',
      input: { strs: ["eat", "tea", "tan", "ate", "nat", "bat"] },
      expected: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]',
    },
    {
      label: '["aab","aba","abb","baa"]',
      input: { strs: ["aab", "aba", "abb", "baa"] },
      expected: '[["aab", "aba", "baa"], ["abb"]]',
    },
    { label: '["cab","a","abc","a"]', input: { strs: ["cab", "a", "abc", "a"] }, expected: '[["cab", "abc"], ["a", "a"]]' },
  ],
  trace({ strs }) {
    const t = tracer();
    const groups = new Map<string, string[]>();
    const keyOf: string[] = []; // 每個已處理字串的 key，用來替 strs 上色
    const groupTones: Tone[] = ["good", "alt", "compare", "visited"];
    const toneOfKey = (key: string): Tone => groupTones[[...groups.keys()].indexOf(key) % groupTones.length];

    const strMarks = (i: number | null) => {
      const m: Record<number, Tone> = {};
      keyOf.forEach((k, idx) => (m[idx] = toneOfKey(k)));
      if (i !== null) m[i] = "active";
      return m;
    };
    const groupsView = (hot?: string) =>
      V.map(
        GROUPS,
        [...groups.entries()].map(([k, list]) => [k, py(list)] as [string, string]),
        { marks: hot !== undefined && groups.has(hot) ? { [hot]: "active" } : {} },
      );

    t.push({
      line: 3,
      note: "準備一個雜湊表 `groups`。我們需要一個「同組字串都會算出一樣結果」的標籤當 key —— 把字母**排序**就可以。",
      views: [V.array("strs", strs), groupsView()],
    });

    for (let i = 0; i < strs.length; i++) {
      const s = strs[i];
      const order = [...s].map((ch, j) => ({ ch, id: `${i}-${j}` }));
      const sortedOrder = [...order].sort((a, b) => (a.ch < b.ch ? -1 : a.ch > b.ch ? 1 : 0));
      const key = sortedOrder.map((o) => o.ch).join("");

      t.push({
        line: 4,
        note: `取出 \`strs[${i}] = "${s}"\`。它該跟誰同組？單看字母順序看不出來。`,
        views: [
          V.array("strs", strs, { pointers: { i }, marks: strMarks(i) }),
          V.array(WORD, order.map((o) => o.ch), { ids: order.map((o) => o.id) }),
          groupsView(),
        ],
        vars: { s },
      });

      const exists = groups.has(key);
      t.push({
        line: 5,
        note:
          `把 \`"${s}"\` 的字母排序 → \`key = "${key}"\`。` +
          (exists
            ? `這個 key **已經在** \`groups\` 裡了，代表之前有字母組成完全相同的字串。`
            : `\`groups\` 裡還沒有這個 key，表示它是新的一組。`),
        views: [
          V.array("strs", strs, { pointers: { i }, marks: strMarks(i) }),
          V.array(WORD, sortedOrder.map((o) => o.ch), {
            ids: sortedOrder.map((o) => o.id),
            marks: Object.fromEntries(sortedOrder.map((_, j) => [j, "compare" as Tone])),
          }),
          groupsView(key),
        ],
        vars: { s, key },
      });

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
      keyOf.push(key);
      t.push({
        line: 6,
        note: exists
          ? `把 \`"${s}"\` 加進 \`groups["${key}"]\`，這一組現在有 ${groups.get(key)!.length} 個字串。`
          : `\`defaultdict\` 自動建立空的 list，再把 \`"${s}"\` 放進去，開出新的一組 \`"${key}"\`。`,
        views: [
          V.array("strs", strs, { pointers: { i }, marks: strMarks(null) }),
          V.array(WORD, sortedOrder.map((o) => o.ch), { ids: sortedOrder.map((o) => o.id) }),
          groupsView(key),
        ],
        vars: { s, key },
      });
    }

    const res = [...groups.values()];
    t.push({
      line: 7,
      note: `所有字串都分好了，共 ${res.length} 組。key 只是分組用的標籤，答案只需要每一組的內容 \`groups.values()\`。`,
      views: [V.array("strs", strs, { marks: strMarks(null) }), groupsView()],
      result: py(res),
    });
    return t.frames;
  },
});
