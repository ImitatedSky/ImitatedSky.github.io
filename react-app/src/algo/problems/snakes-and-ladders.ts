import { defineProblem } from "../types";
import type { Cell, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        n = len(board)

        def cell(s):  # 編號 s 那一格在 board 上寫的值
            r, c = divmod(s - 1, n)
            if r % 2 == 1:
                c = n - 1 - c  # 奇數列（從下面數）是由右往左編號
            return board[n - 1 - r][c]

        q = deque([(1, 0)])  # (目前所在格, 已經擲了幾次)
        seen = {1}
        while q:
            cur, moves = q.popleft()
            if cur == n * n:
                return moves
            for nxt in range(cur + 1, min(cur + 6, n * n) + 1):
                if cell(nxt) != -1:
                    nxt = cell(nxt)  # 踩到蛇或梯子，直接被送走
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, moves + 1))
        return -1`;

export default defineProblem<{ board: number[][] }>({
  id: 909,
  summary:
    "一個 `n × n` 的棋盤，格子從**左下角**開始編號 `1`，往右編完一列後換到上一列並**反方向**繼續編（蛇行），一直編到 `n²`。\n\n你從 `1` 出發，每回合擲一顆骰子前進 1～6 格。落點如果 `board` 上寫的不是 `-1`，表示那裡有梯子或蛇，會立刻被送到它寫的那個編號（每回合最多只被送一次）。求走到 `n²` **最少要擲幾次骰子**；到不了就回傳 `-1`。",
  examples: [
    {
      input:
        "board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]",
      output: "4",
      note: "1 →(梯子) 15 →(蛇) 13 →(梯子) 35 → 36",
    },
    { input: "board = [[-1,-1],[-1,3]]", output: "1" },
  ],
  constraints: ["2 ≤ n ≤ 20", "board[i][j] 是 -1 或 1 ~ n² 之間的編號", "編號 1 和 n² 的格子上沒有蛇也沒有梯子"],
  idea:
    "每擲一次骰子的代價都是 1，所以這是**無權重圖的最短路徑** → BFS。節點是格子編號，從 `cur` 可以走到 `cur+1 … cur+6`（遇到蛇或梯子就改成它的終點）。BFS 一層一層往外擴，第一次碰到 `n²` 時的擲骰次數就是最少次數。",
  steps: [
    "寫一個 `cell(s)`，把編號 `s` 換算成 `board` 的列與欄：`divmod(s - 1, n)` 得到「從下面數第幾列、第幾個」，奇數列要左右反過來。",
    "佇列放 `(1, 0)`，`seen` 記錄已經到過的編號。",
    "取出 `(cur, moves)`；`cur` 是 `n²` 就回傳 `moves`。",
    "列舉骰子的 6 種結果，落點有蛇或梯子就換成它指向的編號。",
    "落點沒到過 → 記進 `seen`，以 `moves + 1` 放進佇列。",
    "佇列空了還沒到終點，回傳 `-1`。",
  ],
  pitfalls: [
    "編號換算最容易錯：列要**從下面往上**數，而且每隔一列方向相反。",
    "被梯子或蛇送到的終點，就算上面又有另一條蛇或梯子，這一回合也**不會再被送一次**。",
    "`seen` 記的是「實際停下來的格子」（被送走之後的終點），不是骰子點到的那一格。",
    "蛇不一定是壞事：有時先滑下去才接得到更長的梯子，所以不能貪心，只能老實 BFS。",
  ],
  complexity: { time: "O(n²)", space: "O(n²)" },
  code,
  starter: `class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        `,
  presets: [
    {
      label: "4×4：兩道梯子、兩條蛇",
      input: {
        board: [
          [-1, -1, -1, 3],
          [-1, -1, 4, -1],
          [-1, -1, 9, -1],
          [-1, 7, -1, -1],
        ],
      },
      expected: "3",
    },
    {
      label: "經典 6×6",
      input: {
        board: [
          [-1, -1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1, -1],
          [-1, 35, -1, -1, 13, -1],
          [-1, -1, -1, -1, -1, -1],
          [-1, 15, -1, -1, -1, -1],
        ],
      },
      expected: "4",
    },
    {
      label: "3×3：每條路都被蛇送回起點",
      input: {
        board: [
          [1, -1, -1],
          [1, 1, 1],
          [-1, 1, 1],
        ],
      },
      expected: "-1",
    },
  ],
  trace({ board }) {
    const t = tracer();
    const n = board.length;
    const goal = n * n;

    /** 編號 s → 畫面上的 [列, 欄] */
    const posOf = (s: number): [number, number] => {
      const r = Math.floor((s - 1) / n);
      let c = (s - 1) % n;
      if (r % 2 === 1) c = n - 1 - c;
      return [n - 1 - r, c];
    };
    const cell = (s: number) => {
      const [i, j] = posOf(s);
      return board[i][j];
    };
    const key = (s: number) => posOf(s).join(",");

    // 每格顯示自己的編號；有蛇或梯子的格子顯示「編號→終點」
    const cells: Cell[][] = board.map((row) => row.map(() => 0));
    for (let s = 1; s <= goal; s++) {
      const [i, j] = posOf(s);
      cells[i][j] = cell(s) === -1 ? s : `${s}→${cell(s)}`;
    }

    const q: [number, number][] = [[1, 0]];
    const seen = new Set<number>([1]);
    const parent = new Map<number, number>();

    const views = (cur?: number, extra: Record<string, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      seen.forEach((s) => (marks[key(s)] = "visited"));
      Object.assign(marks, extra);
      if (cur !== undefined) marks[key(cur)] = "active";
      return [
        V.grid("棋盤（數字是格子編號，a→b 表示踩到 a 會被送到 b）", cells, {
          marks,
          pointers: cur !== undefined ? { cur: posOf(cur) } : {},
        }),
        V.queue("q（所在格, 擲骰次數）", q.map(([s, m]) => `(${s}, ${m})`)),
      ];
    };

    t.push({
      line: [3, 11, 12],
      note: `棋盤 ${n} × ${n}，編號從**左下角**的 1 開始蛇行往上，終點是 ${goal}。每擲一次骰子算一步，要找最少步數 → 用 BFS。起點 \`(1, 0)\` 放進佇列。`,
      views: views(undefined, { [key(goal)]: "compare" }),
      vars: { n, 終點: goal },
    });

    while (q.length) {
      const [cur, moves] = q.shift()!;
      if (cur === goal) {
        const path = [cur];
        while (parent.has(path[0])) path.unshift(parent.get(path[0])!);
        const marks: Record<string, Tone> = {};
        path.forEach((s) => (marks[key(s)] = "good"));
        t.push({
          line: [14, 15, 16],
          note: `取出 \`(${cur}, ${moves})\`：\`${cur}\` 就是終點 \`n²\`！BFS 是按擲骰次數由少到多處理的，所以第一次到達時的 ${moves} 次就是最少次數。每回合停下來的格子依序是 ${path.map((s) => `\`${s}\``).join(" → ")}。`,
          views: [
            V.grid("棋盤（數字是格子編號，a→b 表示踩到 a 會被送到 b）", cells, {
              marks: { ...Object.fromEntries([...seen].map((s) => [key(s), "visited" as Tone])), ...marks },
              pointers: { cur: posOf(cur) },
            }),
            V.queue("q（所在格, 擲骰次數）", q.map(([s, m]) => `(${s}, ${m})`)),
          ],
          vars: { cur, moves },
          result: py(moves),
        });
        return t.frames;
      }

      const hi = Math.min(cur + 6, goal);
      t.push({
        line: [14, 15, 17],
        note: `取出 \`(${cur}, ${moves})\`：已經擲了 ${moves} 次，停在 \`${cur}\`，還不是終點。再擲一次，骰子可以點到 \`${cur + 1}\` ～ \`${hi}\`。`,
        views: views(cur, Object.fromEntries(range(cur + 1, hi).map((s) => [key(s), "compare" as Tone]))),
        vars: { cur, moves },
      });

      const extra: Record<string, Tone> = {};
      const jumps: string[] = [];
      const fresh: number[] = [];
      for (let d = cur + 1; d <= hi; d++) {
        let nxt = d;
        extra[key(d)] = "compare";
        if (cell(d) !== -1) {
          nxt = cell(d);
          jumps.push(`\`${d}\` 有${nxt > d ? "梯子，爬到" : "蛇，滑到"} \`${nxt}\``);
        }
        if (!seen.has(nxt)) {
          seen.add(nxt);
          parent.set(nxt, cur);
          q.push([nxt, moves + 1]);
          fresh.push(nxt);
        }
      }
      fresh.forEach((s) => (extra[key(s)] = "alt"));
      t.push({
        line: [17, 18, 19, 20, 21, 22],
        note:
          (jumps.length ? `${jumps.join("；")}。` : "這 6 格上沒有蛇也沒有梯子。") +
          (fresh.length
            ? `實際停下來、而且**第一次到達**的格子：${fresh.map((s) => `\`${s}\``).join("、")}，以 ${moves + 1} 次放進佇列。`
            : "能停的格子之前全都到過了（更早到 = 次數不會比較多），沒有新的可以加。"),
        views: views(cur, extra),
        vars: { cur, moves, 新加入: fresh.length },
      });
    }

    t.push({
      line: 23,
      note: `佇列空了：從 1 出發停得到的格子全部試過，沒有任何一格能走到終點 \`${goal}\`，回傳 \`-1\`。`,
      views: views(undefined, { [key(goal)]: "bad" }),
      result: py(-1),
    });
    return t.frames;
  },
});

function range(from: number, to: number): number[] {
  const out: number[] = [];
  for (let x = from; x <= to; x++) out.push(x);
  return out;
}
