import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def deleteDuplicates(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev = dummy                # 最後一個確定保留的節點
        cur = head
        while cur:
            if cur.next and cur.val == cur.next.val:
                while cur.next and cur.val == cur.next.val:
                    cur = cur.next  # 走到這段重複值的最後一個
                prev.next = cur.next  # 整段跳過
            else:
                prev = cur          # cur 沒有重複，保留
            cur = cur.next
        return dummy.next`;

export default defineProblem<{ head: number[] }>({
  id: 82,
  summary:
    "給一條**已排序**的鏈結串列，把所有「值出現超過一次」的節點**全部刪掉**（一個都不留），只留下原本就只出現一次的值，回傳結果。\n\n和只留一個代表的版本（LC 83）不同，這題重複的值要整組消失。",
  examples: [
    { input: "head = [1,2,3,3,4,4,5]", output: "[1,2,5]" },
    { input: "head = [1,1,1,2,3]", output: "[2,3]" },
  ],
  constraints: ["0 ≤ 節點數 ≤ 300", "串列已依非遞減順序排好"],
  idea:
    "因為已排序，**相同的值一定連在一起**。用 `prev` 記住「最後一個確定保留的節點」，`cur` 往前探路：如果 `cur` 和下一個同值，就讓 `cur` 一路走到這段重複的最後一個，再把 `prev.next` 直接接到這段之後；否則 `cur` 是獨一無二的，`prev` 才前進。",
  steps: [
    "接上 `dummy`（頭節點本身可能被刪），`prev = dummy`、`cur = head`。",
    "若 `cur` 與 `cur.next` 同值：`cur` 持續前進到這段重複值的最後一個，然後 `prev.next = cur.next` 把整段跳過 —— 這時 `prev` **不動**。",
    "否則 `cur` 沒有重複：`prev = cur`，把它納入保留區。",
    "`cur = cur.next` 繼續，直到走完；回傳 `dummy.next`。",
  ],
  pitfalls: [
    "跳過一段重複後 `prev` 不能前進：接上來的那個節點還沒檢查過，它自己也可能是另一段重複的開頭。",
    "頭節點可能整段被刪（例如 `[1,1,2]`），所以需要 `dummy`。",
    "比較 `cur.next.val` 之前要先確認 `cur.next` 存在。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def deleteDuplicates(self, head: Optional[ListNode]) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[1,2,3,3,4,4,5]", input: { head: [1, 2, 3, 3, 4, 4, 5] }, expected: "[1, 2, 5]" },
    { label: "[1,1,1,2,3]", input: { head: [1, 1, 1, 2, 3] }, expected: "[2, 3]" },
    { label: "[1,2,2,2]", input: { head: [1, 2, 2, 2] }, expected: "[1]" },
  ],
  trace({ head }) {
    const t = tracer();
    const ids = ["d", ...head.map((_, i) => String(i))];
    const val: Record<string, number | string> = { d: "D" };
    head.forEach((v, i) => (val[String(i)] = v));
    const next: Record<string, string | null> = {};
    ids.forEach((id, i) => (next[id] = ids[i + 1] ?? null));
    let shown = [...ids]; // drawing order; skipped runs stay visible for one frame
    const kept = new Set<string>(); // nodes confirmed unique

    const view = (pointers: Record<string, string | null>, extra: Record<string, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      kept.forEach((id) => (marks[id] = "good"));
      return V.list(
        "串列（D = dummy）",
        shown.map<ListNodeSpec>((id) => ({ id, val: val[id], next: next[id] })),
        { pointers, marks: { ...marks, ...extra } },
      );
    };
    const tone = (list: string[], tn: Tone) => Object.fromEntries(list.map((id) => [id, tn]));

    let prev = "d";
    let cur: string | null = next["d"];
    t.push({
      line: [3, 4, 5],
      note:
        "頭節點也可能被刪，所以先接上 `dummy`。`prev` 指著**最後一個確定保留**的節點（一開始是 `dummy`），`cur` 負責往前檢查。",
      views: [view({ prev, cur })],
    });

    while (cur !== null) {
      const nx: string | null = next[cur];
      if (nx !== null && val[cur] === val[nx]) {
        const run = [cur];
        t.push({
          line: [6, 7],
          note: `\`cur\` 的值 \`${val[cur]}\` 和下一個節點一樣 —— 排序過的串列裡同值一定相鄰，所以這是一段重複的開頭，整段都不能留。`,
          views: [view({ prev, cur }, tone([cur, nx], "compare"))],
          vars: { "cur.val": val[cur], "cur.next.val": val[nx] },
        });
        while (next[cur] !== null && val[cur] === val[next[cur]!]) {
          cur = next[cur]!;
          run.push(cur);
          const after: string | null = next[cur];
          t.push({
            line: [8, 9],
            note:
              `\`cur\` 往後走一格，仍然是 \`${val[cur]}\`。` +
              (after !== null && val[after] === val[cur]
                ? "下一個還是同值，繼續走。"
                : after === null
                  ? "後面沒有節點了，`cur` 停在這段重複的最後一個。"
                  : `下一個是 \`${val[after]}\`，不一樣了，\`cur\` 停在這段重複的最後一個。`),
            views: [view({ prev, cur }, tone(run, "bad"))],
            vars: { "cur.val": val[cur], "cur.next.val": after === null ? "None" : val[after] },
          });
        }
        next[prev] = next[cur];
        t.push({
          line: 10,
          note:
            `\`prev.next = cur.next\`：從 \`prev\` 直接接到這段之後` +
            (next[cur] === null ? "（`None`）" : `（\`${val[next[cur]!]}\`）`) +
            `，${run.length} 個 \`${val[cur]}\` 一次全部跳過。注意 \`prev\` **沒有前進** —— 新接上的節點還沒檢查過。`,
          views: [view({ prev, cur }, tone(run, "muted"))],
        });
        cur = next[cur];
        shown = shown.filter((id) => !run.includes(id));
        t.push({
          line: 13,
          note:
            cur === null
              ? "`cur = cur.next` 變成 `None`，串列走完了。"
              : `\`cur = cur.next\`，從 \`${val[cur]}\` 繼續檢查。`,
          views: [view({ prev, cur })],
        });
      } else {
        t.push({
          line: [6, 7],
          note:
            nx === null
              ? `\`cur\`（\`${val[cur]}\`）後面沒有節點了，不可能和誰重複。`
              : `\`cur\` 是 \`${val[cur]}\`，下一個是 \`${val[nx]}\`，不一樣。前面同值的節點如果有也早就被跳過了，所以 \`${val[cur]}\` 只出現一次。`,
          views: [view({ prev, cur }, { [cur]: "active", ...(nx !== null ? { [nx]: "compare" as Tone } : {}) })],
          vars: { "cur.val": val[cur], "cur.next.val": nx === null ? "None" : val[nx] },
        });
        prev = cur;
        kept.add(cur);
        cur = next[cur];
        t.push({
          line: [11, 12, 13],
          note: `保留 \`${val[prev]}\`：\`prev\` 前進到它，\`cur\` 再往下一格。`,
          views: [view({ prev, cur })],
        });
      }
    }

    const out: number[] = [];
    for (let id = next["d"]; id; id = next[id]) out.push(val[id] as number);
    t.push({
      line: 14,
      note: out.length
        ? "`cur` 是 `None`，全部檢查完。回傳 `dummy.next`，留下來的都是只出現一次的值。"
        : "`cur` 是 `None`，全部檢查完。每個值都有重複，`dummy.next` 是空串列。",
      views: [view({})],
      result: py(out),
    });
    return t.frames;
  },
});
