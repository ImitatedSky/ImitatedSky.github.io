import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, tracer } from "../trace";

const code = `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        A, B = nums1, nums2
        if len(A) > len(B):
            A, B = B, A  # 在比較短的 A 上二分
        m, n = len(A), len(B)
        half = (m + n + 1) // 2  # 左半邊總共要有幾個數
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2  # A 分 i 個給左半邊
            j = half - i        # 剩下的 j 個由 B 補上
            a_left = A[i - 1] if i > 0 else -inf
            a_right = A[i] if i < m else inf
            b_left = B[j - 1] if j > 0 else -inf
            b_right = B[j] if j < n else inf
            if a_left > b_right:
                hi = i - 1  # A 拿太多了
            elif b_left > a_right:
                lo = i + 1  # A 拿太少了
            else:
                if (m + n) % 2:
                    return float(max(a_left, b_left))
                return (max(a_left, b_left) + min(a_right, b_right)) / 2`;

/** Python 印 float 的樣子：2 → "2.0"、2.5 → "2.5" */
const pyFloat = (x: number) => (Number.isInteger(x) ? `${x}.0` : String(x));
const show = (x: number) => (x === Infinity ? "inf" : x === -Infinity ? "-inf" : String(x));

export default defineProblem<{ nums1: number[]; nums2: number[] }>({
  id: 4,
  summary:
    "給兩個**各自已排序**的整數陣列 `nums1`（長度 m）和 `nums2`（長度 n），回傳把它們合在一起之後的**中位數**。\n\n總數是奇數時中位數是正中間那個數；偶數時是中間兩個數的平均。時間複雜度必須是 O(log(m + n))，所以不能真的把兩個陣列合併。",
  examples: [
    { input: "nums1 = [1,3], nums2 = [2]", output: "2.0", note: "合併後是 [1,2,3]" },
    { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5", note: "合併後是 [1,2,3,4]，(2 + 3) / 2" },
  ],
  constraints: ["0 ≤ m, n ≤ 1000", "1 ≤ m + n ≤ 2000"],
  idea:
    "中位數就是把所有數**切成左右兩半**的那條線：左半邊有 `half` 個數，而且左半邊的每個數都 ≤ 右半邊。左半邊一定是「A 的前 `i` 個 + B 的前 `j` 個」，而 `j = half - i` 被 `i` 決定，所以**只要二分搜尋 `i`**。切得對不對，只要看切口旁的四個數：`a_left <= b_right` 且 `b_left <= a_right`。",
  steps: [
    "讓 `A` 是較短的陣列（保證 `j` 不會變負數，複雜度也變成 O(log min(m, n))）。",
    "`half = (m + n + 1) // 2` 是左半邊的個數；在 `i ∈ [0, m]` 上二分。",
    "對每個 `i` 算出 `j = half - i`，取切口兩側的四個數，超出邊界的用 `-inf` / `inf` 代替。",
    "`a_left > b_right`：A 拿太多，`hi = i - 1`；`b_left > a_right`：A 拿太少，`lo = i + 1`。",
    "兩個條件都滿足就是正確切法：奇數回傳左半邊最大值，偶數回傳「左半最大 + 右半最小」的平均。",
  ],
  pitfalls: [
    "一定要在**較短**的陣列上二分，否則 `j = half - i` 可能是負的或超出 B。",
    "`half` 用 `(m + n + 1) // 2`，這樣總數是奇數時多出來的那個數會落在左半邊，中位數就是 `max(a_left, b_left)`。",
    "`i = 0`、`i = m`、`j = 0`、`j = n` 時某一側是空的，要用 ±inf 補，否則會索引越界。",
  ],
  complexity: { time: "O(log min(m, n))", space: "O(1)" },
  code,
  starter: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        `,
  presets: [
    {
      label: "[3,8,10,14,20] + [1,5,9,12,16,18,22]",
      input: { nums1: [3, 8, 10, 14, 20], nums2: [1, 5, 9, 12, 16, 18, 22] },
      expected: "11.0",
    },
    { label: "[1,2] + [3,4]（切在邊界）", input: { nums1: [1, 2], nums2: [3, 4] }, expected: "2.5" },
    { label: "[1,3,7,9] + [2,5]（會交換）", input: { nums1: [1, 3, 7, 9], nums2: [2, 5] }, expected: "4.0" },
  ],
  trace({ nums1, nums2 }) {
    const t = tracer();
    const swapped = nums1.length > nums2.length;
    const A = swapped ? [...nums2] : [...nums1];
    const B = swapped ? [...nums1] : [...nums2];
    const m = A.length;
    const n = B.length;
    const labelA = `A（= ${swapped ? "nums2" : "nums1"}，較短）`;
    const labelB = `B（= ${swapped ? "nums1" : "nums2"}）`;
    const candidates = Array.from({ length: m + 1 }, (_, k) => k);

    let lo = 0;
    let hi = m;

    /**
     * 三個畫面：i 的候選（真正被二分的東西）、A 和 B 各自的切口。
     * 指標 i / j 指在「右半邊的第一格」，也就是切口的右側。
     */
    const views = (
      i: number | null,
      aMarks: Record<number, Tone> = {},
      bMarks: Record<number, Tone> = {},
      iTone: Tone = "compare",
    ) => {
      const cand: Record<number, Tone> = {};
      for (let k = 0; k <= m; k++) if (k < lo || k > hi) cand[k] = "muted";
      if (i !== null) cand[i] = iTone;
      const candView = V.array("i 的候選：A 分幾個給左半邊", candidates, {
        pointers: i === null ? { lo, hi } : { lo, i, hi },
        marks: cand,
      });
      if (i === null) {
        return [
          candView,
          V.array(labelA, A, { ranges: [{ from: 0, to: -1, tone: "alt", label: "左半" }] }),
          V.array(labelB, B, { ranges: [{ from: 0, to: -1, tone: "alt", label: "左半" }] }),
        ];
      }
      const j = half - i;
      const am: Record<number, Tone> = {};
      const bm: Record<number, Tone> = {};
      for (let k = 0; k < i; k++) am[k] = "alt";
      for (let k = 0; k < j; k++) bm[k] = "alt";
      return [
        candView,
        V.array(labelA, A, {
          pointers: { i },
          marks: { ...am, ...aMarks },
          ranges: [{ from: 0, to: i - 1, tone: "alt", label: `左半 ${i} 個` }],
        }),
        V.array(labelB, B, {
          pointers: { j },
          marks: { ...bm, ...bMarks },
          ranges: [{ from: 0, to: j - 1, tone: "alt", label: `左半 ${j} 個` }],
        }),
      ];
    };

    const half = Math.floor((m + n + 1) / 2);

    t.push({
      line: [3, 4, 5],
      note: swapped
        ? `\`nums1\` 比較長，所以**交換**：讓 \`A\` 是較短的 \`nums2\`、\`B\` 是 \`nums1\`。我們只在短的那個上面二分。`
        : `\`nums1\` 沒有比 \`nums2\` 長，不用交換：\`A = nums1\`、\`B = nums2\`。我們只在較短的 \`A\` 上面二分。`,
      views: views(null),
      vars: { m, n },
    });

    t.push({
      line: [6, 7, 8],
      note: `總共 ${m + n} 個數，左半邊要放 \`half = (${m} + ${n} + 1) // 2 = ${half}\` 個。左半邊 = A 的前 \`i\` 個 + B 的前 \`j\` 個，只要決定 \`i\`（0 ~ ${m} 都有可能），\`j\` 就跟著確定。`,
      views: views(null),
      vars: { m, n, half, lo, hi },
    });

    for (;;) {
      const i = Math.floor((lo + hi) / 2);
      const j = half - i;
      const aLeft = i > 0 ? A[i - 1] : -Infinity;
      const aRight = i < m ? A[i] : Infinity;
      const bLeft = j > 0 ? B[j - 1] : -Infinity;
      const bRight = j < n ? B[j] : Infinity;
      const base = { half, lo, hi, i, j };
      const four = {
        ...base,
        a_left: show(aLeft),
        a_right: show(aRight),
        b_left: show(bLeft),
        b_right: show(bRight),
      };

      t.push({
        line: [9, 10, 11],
        note: `試 \`i = (${lo} + ${hi}) // 2 = ${i}\`：A 出前 ${i} 個，B 就要補 \`j = ${half} - ${i} = ${j}\` 個，左半邊才會剛好 ${half} 個。指標 \`i\`、\`j\` 指在各自**右半邊的第一格**。`,
        views: views(i),
        vars: base,
      });

      const edge: string[] = [];
      if (i === 0) edge.push("A 的左邊是空的，`a_left = -inf`");
      if (i === m) edge.push("A 的右邊是空的，`a_right = inf`");
      if (j === 0) edge.push("B 的左邊是空的，`b_left = -inf`");
      if (j === n) edge.push("B 的右邊是空的，`b_right = inf`");
      const aEdge: Record<number, Tone> = {};
      const bEdge: Record<number, Tone> = {};
      if (i > 0) aEdge[i - 1] = "compare";
      if (i < m) aEdge[i] = "compare";
      if (j > 0) bEdge[j - 1] = "compare";
      if (j < n) bEdge[j] = "compare";
      t.push({
        line: [12, 13, 14, 15],
        note:
          `取出切口兩側的四個數。同一個陣列內本來就有序，所以只要**交叉檢查**：\`a_left <= b_right\` 和 \`b_left <= a_right\`。` +
          (edge.length ? `（${edge.join("；")}，這樣比較時永遠不會擋路。）` : ""),
        views: views(i, aEdge, bEdge),
        vars: four,
      });

      if (aLeft > bRight) {
        hi = i - 1;
        t.push({
          line: [16, 17],
          note: `\`a_left = ${show(aLeft)} > b_right = ${show(bRight)}\`：左半邊有個數比右半邊的還大，表示 **A 拿太多**。\`i\` 要變小（比 ${i} 更大的切法只會更糟）→ \`hi = i - 1 = ${hi}\`。`,
          views: views(i, { [i - 1]: "bad" }, { [j]: "bad" }, "bad"),
          vars: { ...four, hi },
        });
      } else if (bLeft > aRight) {
        lo = i + 1;
        t.push({
          line: [16, 18, 19],
          note: `\`b_left = ${show(bLeft)} > a_right = ${show(aRight)}\`：B 留在左半邊的數比 A 右半邊的還大，表示 **A 拿太少**（B 拿太多）。\`i\` 要變大 → \`lo = i + 1 = ${lo}\`。`,
          views: views(i, { [i]: "bad" }, { [j - 1]: "bad" }, "bad"),
          vars: { ...four, lo },
        });
      } else {
        const leftMax = Math.max(aLeft, bLeft);
        const rightMin = Math.min(aRight, bRight);
        t.push({
          line: [16, 18, 20],
          note: `\`${show(aLeft)} <= ${show(bRight)}\` 而且 \`${show(bLeft)} <= ${show(aRight)}\`，兩個交叉條件都成立：左半邊的 ${half} 個數全部 ≤ 右半邊，**切對了**。`,
          views: views(i, aEdge, bEdge, "good"),
          vars: four,
        });

        const odd = (m + n) % 2 === 1;
        const aGood: Record<number, Tone> = {};
        const bGood: Record<number, Tone> = {};
        if (aLeft >= bLeft) aGood[i - 1] = "good";
        else bGood[j - 1] = "good";
        if (!odd) {
          if (aRight <= bRight) aGood[i] = "good";
          else bGood[j] = "good";
        }
        const ans = odd ? leftMax : (leftMax + rightMin) / 2;
        t.push({
          line: odd ? [21, 22] : [21, 23],
          note: odd
            ? `總數 ${m + n} 是奇數，左半邊多一個，中位數就是**左半邊的最大值**：\`max(${show(aLeft)}, ${show(bLeft)}) = ${leftMax}\`，回傳 \`${pyFloat(ans)}\`。`
            : `總數 ${m + n} 是偶數，中位數是中間兩個數的平均：左半邊最大 \`max(${show(aLeft)}, ${show(bLeft)}) = ${leftMax}\`、右半邊最小 \`min(${show(aRight)}, ${show(bRight)}) = ${rightMin}\`，\`(${leftMax} + ${rightMin}) / 2 = ${pyFloat(ans)}\`。`,
          views: views(i, aGood, bGood, "good"),
          vars: four,
          result: pyFloat(ans),
        });
        return t.frames;
      }
    }
  },
});
