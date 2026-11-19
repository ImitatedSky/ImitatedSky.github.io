import { defineProblem } from "../types";
import type { Cell, Tone, TreeNodeSpec } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        phone = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                 "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        res = []
        path = []

        def backtrack(i: int) -> None:
            if i == len(digits):          # 每個數字都選好字母了
                res.append("".join(path))
                return
            for ch in phone[digits[i]]:
                path.append(ch)           # 選
                backtrack(i + 1)          # 往下一個數字
                path.pop()                # 撤銷

        backtrack(0)
        return res`;

const PHONE: Record<string, string> = {
  "2": "abc",
  "3": "def",
  "4": "ghi",
  "5": "jkl",
  "6": "mno",
  "7": "pqrs",
  "8": "tuv",
  "9": "wxyz",
};

/** Decision tree that grows as the backtracking explores it */
function decisionTree(rootVal: Cell) {
  const nodes: TreeNodeSpec[] = [{ id: "r", val: rootVal, children: [] }];
  const done: Record<string, Tone> = {};
  const edgeLabels: Record<string, string> = {};
  const stack = ["r"];
  return {
    /** choose: add a child under the current node and step into it */
    down(val: Cell, edge: string) {
      const parent = stack[stack.length - 1];
      const id = `d${nodes.length}`;
      nodes.push({ id, val, children: [] });
      nodes.find((n) => n.id === parent)!.children!.push(id);
      edgeLabels[`${parent}>${id}`] = edge;
      stack.push(id);
    },
    /** how the current node ended (solution / dead end) */
    settle(tone: Tone) {
      done[stack[stack.length - 1]] = tone;
    },
    /** undo: step back to the parent */
    up() {
      const id = stack.pop()!;
      done[id] ??= "visited";
    },
    view(label: string) {
      const marks: Record<string, Tone> = { ...done };
      const edgeMarks: Record<string, Tone> = {};
      stack.forEach((id, k) => {
        marks[id] = k === stack.length - 1 ? (done[id] ?? "active") : "compare";
        if (k > 0) edgeMarks[`${stack[k - 1]}>${id}`] = "active";
      });
      return V.tree(label, { nodes, root: "r" }, { marks, edgeLabels, edgeMarks });
    },
  };
}

export default defineProblem<{ digits: string }>({
  id: 17,
  summary:
    "給一個只包含 `2`–`9` 的數字字串 `digits`。照著傳統手機九宮格鍵盤的對應（`2 → abc`、`3 → def`、…、`9 → wxyz`），列出這串數字**可能代表的所有字母組合**。\n\n答案的順序不限；如果 `digits` 是空字串，就回傳空陣列。",
  summaryEn:
    "You get a string `digits` made only of the characters `2`–`9`. Using the letters printed on an old phone keypad (`2 → abc`, `3 → def`, …, `9 → wxyz`), list **every letter combination the digits could spell**.\n\nAny order is fine; if `digits` is empty, return an empty list.",
  examples: [
    { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
    { input: 'digits = "2"', output: '["a","b","c"]' },
    { input: 'digits = ""', output: "[]" },
  ],
  constraints: ["0 ≤ digits.length ≤ 4", "digits[i] 是 '2' 到 '9' 的數字"],
  constraintsEn: ["0 ≤ digits.length ≤ 4", "digits[i] is a digit from '2' to '9'"],
  idea:
    "每個數字是一層「選擇」：第 `i` 層要從 `digits[i]` 對應的幾個字母裡挑一個。把所有選擇畫出來就是一棵樹，**每一條從根走到葉子的路徑就是一個答案**。回溯就是用一個共用的 `path` 走遍這棵樹：選一個字母 → 往下一層 → 回來時把它拿掉，再換下一個。",
  steps: [
    "空字串直接回傳 `[]`（否則會得到一個空字串組合）。",
    "`backtrack(i)` 代表「現在要替第 `i` 個數字挑字母」，`path` 是前面已經挑好的字母。",
    "`i == len(digits)`：每個數字都挑完了，把 `path` 接成字串收進 `res`。",
    "否則依序嘗試 `phone[digits[i]]` 的每個字母：`append` → 遞迴 `i + 1` → `pop`。",
  ],
  pitfalls: [
    "忘了處理空字串：沒有特判的話會回傳 `[\"\"]` 而不是 `[]`。",
    "`path.pop()` 不能省 —— `path` 是所有分支共用的，不撤銷的話上一個選擇會殘留到下一個分支。",
    "`7` 和 `9` 對應 **4** 個字母，不是 3 個。",
  ],
  complexity: { time: "O(4ⁿ · n)", space: "O(n)（遞迴深度，不含輸出）" },
  code,
  starter: `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        `,
  presets: [
    {
      label: '"23"',
      input: { digits: "23" },
      expected: '["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]',
    },
    {
      label: '"29"',
      input: { digits: "29" },
      expected: '["aw", "ax", "ay", "az", "bw", "bx", "by", "bz", "cw", "cx", "cy", "cz"]',
    },
    { label: '"2"', input: { digits: "2" }, expected: '["a", "b", "c"]' },
  ],
  trace({ digits }) {
    const t = tracer();
    if (!digits) {
      t.push({
        line: [3, 4],
        note: "`digits` 是空字串，沒有任何數字可以對應，直接回傳空陣列。",
        views: [V.chars("digits", digits)],
        result: "[]",
      });
      return t.frames;
    }

    const n = digits.length;
    const res: string[] = [];
    const path: string[] = [];
    const tree = decisionTree('""');
    const used = [...new Set(digits)];

    // phone map first (its own row), no separate path array (tree node = path),
    // and `res` as an array so it never jumps between beside / below the tree.
    const views = (i: number, newest?: string) => [
      V.map(
        "phone（只列出用到的鍵）",
        used.map((d) => [d, PHONE[d]] as [Cell, Cell]),
        { marks: i < n ? { [digits[i]]: "active" } : {} },
      ),
      V.chars("digits", digits, {
        pointers: { i },
        marks: i < n ? { [i]: "active" } : {},
      }),
      tree.view("決策樹（節點 = 目前的 path，邊 = 選的字母）"),
      V.array("res", res, { marks: newest ? { [res.length - 1]: "good" } : {} }),
    ];

    t.push({
      line: [5, 6, 7, 8, 19],
      note: `共有 ${n} 個數字，所以決策樹有 ${n} 層：第 \`i\` 層要替 \`digits[i]\` 挑一個字母。從空的 \`path\` 開始 \`backtrack(0)\`。`,
      views: views(0),
      vars: { i: 0, path: '""' },
    });

    const backtrack = (i: number) => {
      if (i === n) {
        const s = path.join("");
        res.push(s);
        tree.settle("good");
        t.push({
          line: [11, 12, 13],
          note: `\`i == ${n}\`，每個數字都挑好字母了 —— 這條路徑就是一個答案，把 \`"${s}"\` 收進 \`res\`。`,
          views: views(i, s),
          vars: { i, path: `"${s}"`, 已收集: res.length },
        });
        return;
      }
      const letters = PHONE[digits[i]];
      for (let k = 0; k < letters.length; k++) {
        const ch = letters[k];
        path.push(ch);
        tree.down(path.join(""), ch);
        t.push({
          line: [14, 15, 16],
          note:
            `第 ${i} 個數字是 \`${digits[i]}\`，可以選 \`${letters}\`。**選** \`${ch}\` 放進 \`path\`，` +
            (i + 1 === n ? "所有數字都處理完了，往下檢查。" : `再往下替第 ${i + 1} 個數字挑字母。`),
          views: views(i),
          vars: { i, ch, path: `"${path.join("")}"` },
        });
        backtrack(i + 1);
        path.pop();
        tree.up();
        t.push({
          line: 17,
          note:
            `回到第 ${i} 層，**撤銷** \`${ch}\`（\`path.pop()\`），\`path\` 變回 \`"${path.join("")}"\`。` +
            (k + 1 < letters.length
              ? `接著換試 \`${letters[k + 1]}\`。`
              : `\`${letters}\` 都試過了，這一層結束，返回上一層。`),
          views: views(i),
          vars: { i, ch, path: `"${path.join("")}"` },
        });
      }
    };
    backtrack(0);

    t.push({
      line: 20,
      note: `整棵決策樹走完了：每一片葉子對應一個組合，共 ${res.length} 個。`,
      views: views(0),
      vars: { 已收集: res.length },
      result: py(res),
    });
    return t.frames;
  },
});
