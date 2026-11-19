import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class RandomizedSet:
    def __init__(self):
        self.nums = []  # 所有元素，順序不重要
        self.pos = {}   # 數值 -> 它在 nums 裡的索引

    def insert(self, val: int) -> bool:
        if val in self.pos:
            return False
        self.pos[val] = len(self.nums)
        self.nums.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.pos:
            return False
        i, last = self.pos[val], self.nums[-1]
        self.nums[i] = last  # 用最後一個元素補上這個洞
        self.pos[last] = i
        self.nums.pop()
        del self.pos[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.nums)`;

type Op = ["insert", number] | ["remove", number] | ["getRandom"];

export default defineProblem<{ ops: Op[] }>({
  id: 380,
  summary:
    "設計一個集合 `RandomizedSet`，支援三個操作，而且**平均都要 O(1)**：\n\n`insert(val)`：`val` 不在集合裡就加入並回傳 `True`，已存在則回傳 `False`。`remove(val)`：`val` 在集合裡就移除並回傳 `True`，否則回傳 `False`。`getRandom()`：隨機回傳集合中的一個元素，每個元素被選到的機率要相同（呼叫時保證集合不是空的）。",
  examples: [
    {
      input: "insert(1), remove(2), insert(2), getRandom(), remove(1), insert(2), getRandom()",
      output: "true, false, true, 1 或 2, true, false, 2",
    },
  ],
  constraints: ["-2³¹ ≤ val ≤ 2³¹ - 1", "最多呼叫 2 × 10⁵ 次", "呼叫 getRandom 時集合至少有一個元素"],
  idea:
    "兩種結構各有一半的本事：**雜湊表**能 O(1) 查找和增刪，但沒辦法「隨機抽第 k 個」；**陣列**能用隨機索引 O(1) 抽，但從中間刪除要 O(n)。把兩個合起來：陣列存元素、雜湊表存「數值 → 索引」。刪除的關鍵是 —— 順序不重要，所以把**最後一個元素搬來補洞**，再把尾巴 pop 掉，就不用搬動其他人。",
  steps: [
    "`nums` 存所有元素；`pos[val]` 記 `val` 在 `nums` 的索引。",
    "`insert`：已存在回傳 `False`；否則記下索引 `len(nums)`，append 到尾端。",
    "`remove`：不存在回傳 `False`；否則找到它的索引 `i`，把最後一個元素 `last` 寫到 `nums[i]`、更新 `pos[last] = i`，再 pop 尾端並刪掉 `pos[val]`。",
    "`getRandom`：`random.choice(nums)`，陣列裡每格機率相同。",
  ],
  pitfalls: [
    "`remove` 的順序很重要：要**先** `pos[last] = i`、**後** `del pos[val]`。當要刪的剛好就是最後一個元素（`val == last`）時，反過來寫會把剛刪掉的 key 又加回去。",
    "只用 `set` 不行：`random.choice(list(s))` 每次都要 O(n) 轉成串列。",
    "搬完元素別忘了更新它在 `pos` 裡的索引，否則下次刪它會刪錯位置。",
  ],
  complexity: { time: "每個操作平均 O(1)", space: "O(n)" },
  code,
  starter: `class RandomizedSet:
    def __init__(self):
        pass

    def insert(self, val: int) -> bool:
        pass

    def remove(self, val: int) -> bool:
        pass

    def getRandom(self) -> int:
        pass`,
  presets: [
    {
      label: "插入、刪中間、刪尾端",
      input: {
        ops: [["insert", 5], ["insert", 8], ["insert", 3], ["insert", 9], ["remove", 8], ["getRandom"], ["remove", 3], ["remove", 7], ["getRandom"]],
      },
      expected: "[True, True, True, True, True, 9, True, False, 5]",
    },
    {
      label: "LeetCode 範例",
      input: {
        ops: [["insert", 1], ["remove", 2], ["insert", 2], ["getRandom"], ["remove", 1], ["insert", 2], ["getRandom"]],
      },
      expected: "[True, False, True, 2, True, False, 2]",
    },
    {
      label: "刪到空再插入",
      input: { ops: [["insert", 4], ["remove", 4], ["insert", 4], ["insert", 4], ["getRandom"]] },
      expected: "[True, True, True, False, 4]",
    },
  ],
  trace({ ops }) {
    const t = tracer();
    const nums: number[] = [];
    const pos = new Map<number, number>();
    const out: (boolean | number)[] = [];
    let randomCalls = 0;

    const opLabels = ops.map((op) => (op[0] === "insert" ? `+${op[1]}` : op[0] === "remove" ? `−${op[1]}` : "?"));
    const callText = (op: Op) => (op[0] === "getRandom" ? "getRandom()" : `${op[0]}(${op[1]})`);

    const views = (
      cur: number,
      o: {
        numMarks?: Record<number, Tone>;
        numPointers?: Record<string, number>;
        posMarks?: Record<string, Tone>;
        opTone?: Tone;
      } = {},
    ) => {
      const opMarks: Record<number, Tone> = {};
      for (let x = 0; x < Math.min(cur, ops.length); x++) opMarks[x] = "visited";
      if (cur >= 0 && cur < ops.length) opMarks[cur] = o.opTone ?? "active";
      return [
        V.array("操作（+ insert、− remove、? getRandom）", opLabels, {
          marks: opMarks,
          pointers: cur >= 0 && cur < ops.length ? { 現在: cur } : {},
        }),
        V.array("nums", nums, { marks: o.numMarks ?? {}, pointers: o.numPointers ?? {} }),
        V.map("pos（數值 → 索引）", pos, { marks: o.posMarks ?? {} }),
        // 固定長度、和上面的操作一格對一格，版面才不會跟著長大
        V.array(
          "回傳值（對應上面每個操作）",
          ops.map((_, x) => (x < out.length ? out[x] : "")),
          { marks: cur >= 0 && cur < out.length ? { [cur]: o.opTone === "bad" ? "bad" : "good" } : {} },
        ),
      ];
    };

    t.push({
      line: [2, 3, 4],
      note: "建立兩個結構：`nums` 陣列放元素（讓 getRandom 可以用索引抽），`pos` 雜湊表記每個數值在 `nums` 的哪一格（讓查找和刪除不用掃陣列）。",
      views: views(-1),
    });

    ops.forEach((op, k) => {
      const call = callText(op);

      if (op[0] === "insert") {
        const val = op[1];
        if (pos.has(val)) {
          out.push(false);
          t.push({
            line: [6, 7, 8],
            note: `\`${call}\`：\`${val}\` 已經在 \`pos\` 裡（索引 ${pos.get(val)}），集合不能有重複，回傳 \`False\`。`,
            views: views(k, {
              opTone: "bad",
              numMarks: { [pos.get(val)!]: "bad" },
              posMarks: { [String(val)]: "bad" },
            }),
            vars: { val },
          });
          return;
        }
        t.push({
          line: [6, 7],
          note: `\`${call}\`：先查 \`pos\`，\`${val}\` 不在裡面，可以加入。雜湊表讓這個檢查是 O(1)。`,
          views: views(k),
          vars: { val },
        });
        pos.set(val, nums.length);
        nums.push(val);
        out.push(true);
        t.push({
          line: [9, 10, 11],
          note: `接在 \`nums\` 尾端（索引 ${nums.length - 1}），同時記下 \`pos[${val}] = ${nums.length - 1}\`。回傳 \`True\`。`,
          views: views(k, {
            numMarks: { [nums.length - 1]: "good" },
            posMarks: { [String(val)]: "good" },
          }),
          vars: { val },
        });
        return;
      }

      if (op[0] === "remove") {
        const val = op[1];
        if (!pos.has(val)) {
          out.push(false);
          t.push({
            line: [13, 14, 15],
            note: `\`${call}\`：\`${val}\` 不在 \`pos\` 裡，沒有東西可以刪，回傳 \`False\`。`,
            views: views(k, { opTone: "bad" }),
            vars: { val },
          });
          return;
        }
        const i = pos.get(val)!;
        const lastIdx = nums.length - 1;
        const last = nums[lastIdx];
        const isLast = i === lastIdx;
        t.push({
          line: [13, 14, 16],
          note: isLast
            ? `\`${call}\`：查 \`pos\` 得知 \`${val}\` 在索引 \`i = ${i}\`，它剛好就是最後一個元素（\`last = ${last}\`）。`
            : `\`${call}\`：查 \`pos\` 得知 \`${val}\` 在索引 \`i = ${i}\`。直接從中間挖掉要搬動後面所有人，所以改找最後一個元素 \`last = ${last}\` 來補洞。`,
          views: views(k, {
            numMarks: isLast ? { [i]: "bad" } : { [i]: "bad", [lastIdx]: "alt" },
            numPointers: { i, last: lastIdx },
            posMarks: isLast ? { [String(val)]: "bad" } : { [String(val)]: "bad", [String(last)]: "alt" },
          }),
          vars: { val, i, last },
        });

        nums[i] = last;
        pos.set(last, i);
        t.push({
          line: [17, 18],
          note: isLast
            ? `\`nums[${i}] = ${last}\`、\`pos[${last}] = ${i}\`：自己蓋自己，什麼都沒變 —— 同一套程式不用特判這個情況。`
            : `把 \`${last}\` 抄到 \`nums[${i}]\` 蓋掉 \`${val}\`，並更新 \`pos[${last}] = ${i}\`。現在尾端多了一份重複的 \`${last}\`。`,
          views: views(k, {
            numMarks: isLast ? { [i]: "bad" } : { [i]: "alt", [lastIdx]: "muted" },
            numPointers: { i, last: lastIdx },
            posMarks: isLast ? { [String(val)]: "bad" } : { [String(val)]: "bad", [String(last)]: "alt" },
          }),
          vars: { val, i, last },
        });

        nums.pop();
        pos.delete(val);
        out.push(true);
        t.push({
          line: [19, 20, 21],
          note: `pop 掉尾端（O(1)），再刪掉 \`pos[${val}]\`。\`${val}\` 消失了，其他元素一格都沒搬。回傳 \`True\`。`,
          views: views(k, {
            numMarks: !isLast ? { [i]: "good" } : {},
            posMarks: !isLast ? { [String(last)]: "good" } : {},
          }),
          vars: { val, i, last },
        });
        return;
      }

      // getRandom：動畫用固定規則挑索引，讓每次播放結果相同
      const r = (randomCalls + 1) % nums.length;
      randomCalls++;
      out.push(nums[r]);
      t.push({
        line: [23, 24],
        note: `\`${call}\`：元素緊密排在 \`nums\` 的索引 0 ~ ${nums.length - 1}，隨機挑一個索引就是等機率抽樣。這裡假設抽到索引 ${r}，回傳 \`${nums[r]}\`。`,
        views: views(k, { numMarks: { [r]: "good" }, numPointers: { random: r } }),
      });
    });

    t.push({
      note: "所有操作做完。每個操作都只碰了陣列尾端和雜湊表的一兩個 key，所以平均都是 O(1)。",
      views: views(ops.length),
      result: py(out),
    });
    return t.frames;
  },
});
