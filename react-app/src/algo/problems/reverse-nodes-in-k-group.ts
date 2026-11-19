import { defineProblem } from "../types";
import type { ListNodeSpec, Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev = dummy                    # 這一組的前一個節點
        while True:
            kth = prev
            for _ in range(k):          # 先確認後面還有 k 個節點
                kth = kth.next
                if not kth:
                    return dummy.next   # 不足 k 個，維持原樣
            cur = prev.next
            for _ in range(k - 1):      # 頭插法反轉這一組
                nxt = cur.next
                cur.next = nxt.next
                nxt.next = prev.next
                prev.next = nxt
            prev = cur                  # cur 變成這一組的尾巴`;

export default defineProblem<{ head: number[]; k: number }>({
  id: 25,
  summary:
    "給一條鏈結串列和正整數 `k`，從頭開始**每 k 個節點為一組，把組內順序反轉**，回傳處理後的串列。\n\n最後剩下不足 `k` 個的節點要保持原本的順序。只能改指標，不能只是交換節點裡的值。",
  summaryEn:
    "Given a linked list and a positive integer `k`, walk from the head and **reverse each group of k nodes in place**, then return the resulting list.\n\nAny leftover nodes at the end (fewer than `k`) keep their original order. You must relink the pointers, not just swap the values inside the nodes.",
  examples: [
    { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]" },
    { input: "head = [1,2,3,4,5], k = 3", output: "[3,2,1,4,5]" },
  ],
  constraints: ["1 ≤ k ≤ 節點數 ≤ 5000", "進階：只用 O(1) 額外空間"],
  constraintsEn: ["1 ≤ k ≤ number of nodes ≤ 5000", "Follow-up: use only O(1) extra space"],
  idea:
    "把問題拆成「重複做很多次區間反轉」。讓 `prev` 停在每一組的前一格：先往後數 `k` 個確認這一組湊得滿，再用**頭插法**（跟 LC 92 一樣）把組內第 2 ~ k 個節點依序搬到 `prev` 的正後方。反轉完，原本的第一個節點 `cur` 會變成組尾，正好是下一組的 `prev`。",
  steps: [
    "在 head 前面接一個 `dummy`，`prev = dummy`。",
    "從 `prev` 往後走 `k` 步；途中走到 `None` 代表剩下的不足 `k` 個，直接回傳 `dummy.next`。",
    "`cur = prev.next` 是這一組的第一個節點。重複 `k - 1` 次：把 `cur` 後面的 `nxt` 拔出來，插到 `prev` 的正後方。",
    "這一組反轉完，`cur` 成了組尾：`prev = cur`，回到第 2 步處理下一組。",
  ],
  pitfalls: [
    "一定要**先數再反轉**：不先確認夠不夠 `k` 個，最後不足的那一段會被錯誤地反轉。",
    "頭插的三行順序不能換：`cur.next = nxt.next` → `nxt.next = prev.next` → `prev.next = nxt`。",
    "反轉後組尾是 `cur`（原本的第一個），不是 `kth`；下一組的 `prev` 要接在 `cur`。",
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code,
  starter: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        `,
  presets: [
    { label: "[1,2,3,4,5], k = 2", input: { head: [1, 2, 3, 4, 5], k: 2 }, expected: "[2, 1, 4, 3, 5]" },
    { label: "[1,2,3,4,5,6,7,8], k = 3", input: { head: [1, 2, 3, 4, 5, 6, 7, 8], k: 3 }, expected: "[3, 2, 1, 6, 5, 4, 7, 8]" },
    { label: "[1,2,3,4], k = 4", input: { head: [1, 2, 3, 4], k: 4 }, expected: "[4, 3, 2, 1]" },
  ],
  trace({ head, k }) {
    const t = tracer();
    const ids = ["d", ...head.map((_, i) => String(i))];
    const val: Record<string, number | string> = { d: "D" };
    head.forEach((v, i) => (val[String(i)] = v));
    const next: Record<string, string | null> = {};
    ids.forEach((id, i) => (next[id] = ids[i + 1] ?? null));

    const done = new Set<string>(); // nodes of groups that are already reversed
    const chain = () => {
      const order: string[] = [];
      for (let id: string | null = "d"; id; id = next[id]) order.push(id);
      return order.map<ListNodeSpec>((id) => ({ id, val: val[id], next: next[id] }));
    };
    const view = (pointers: Record<string, string | null>, extra: Record<string, Tone> = {}) => {
      const marks: Record<string, Tone> = {};
      done.forEach((id) => (marks[id] = "good"));
      return V.list("串列（D = dummy）", chain(), { pointers, marks: { ...marks, ...extra } });
    };

    let prev = "d";
    let group = 0;
    t.push({
      line: [3, 4],
      note: `在 head 前面接上 \`dummy\`，\`prev\` 停在第一組的前一格。之後每一組都是「先數 ${k} 個、再反轉」。`,
      views: [view({ prev })],
      vars: { k },
    });

    for (;;) {
      group++;
      // Count k nodes
      let kth: string | null = prev;
      const counted: string[] = [];
      let short = false;
      for (let s = 1; s <= k; s++) {
        kth = next[kth!];
        if (kth === null) {
          short = true;
          const rest = Object.fromEntries(counted.map((id) => [id, "muted" as Tone]));
          t.push({
            line: [8, 9, 10],
            note: counted.length
              ? `第 ${group} 組：要走第 ${s} 步時 \`kth\` 變成 \`None\` —— 後面只剩 ${counted.length} 個節點，**不足 ${k} 個**，這一段保持原樣。`
              : `第 ${group} 組：\`prev\` 後面已經沒有節點了，\`kth\` 是 \`None\`，全部處理完畢。`,
            views: [view({ prev, kth: null }, rest)],
            vars: { k, 組別: group },
          });
          break;
        }
        counted.push(kth);
        t.push({
          line: s === 1 ? [6, 7, 8, 9] : [7, 8, 9],
          note:
            s < k
              ? `第 ${group} 組：\`kth\` 從 \`prev\` 往後數，第 ${s} / ${k} 步，還有節點，繼續數。`
              : `第 ${group} 組：數滿 ${k} 個了（${counted.map((id) => `\`${val[id]}\``).join("、")}），這一組可以反轉。`,
          views: [view({ prev, kth }, Object.fromEntries(counted.map((id) => [id, "compare" as Tone])))],
          vars: { k, 組別: group },
        });
      }
      if (short) break;

      const groupIds = [...counted];
      const tones = (extra: Record<string, Tone>) => ({
        ...Object.fromEntries(groupIds.map((id) => [id, "compare" as Tone])),
        ...extra,
      });
      const cur = next[prev]!;
      t.push({
        line: 11,
        note:
          k === 1
            ? "`cur = prev.next`。`k = 1` 時每組只有一個節點，不需要搬動。"
            : `\`cur = prev.next\` 是這一組的第一個節點，反轉完它會沉到**組尾**。接下來把它後面的節點一個個搬到 \`prev\` 後面，共 ${k - 1} 次。`,
        views: [view({ prev, cur }, tones({ [cur]: "active" }))],
        vars: { k, 組別: group },
      });

      for (let r = 1; r <= k - 1; r++) {
        const nxt = next[cur]!;
        t.push({
          line: [12, 13],
          note: `頭插第 ${r} / ${k - 1} 次：\`nxt = cur.next\`（\`${val[nxt]}\`），它要被搬到 \`prev\` 的正後方、成為這一組新的開頭。`,
          views: [view({ prev, cur, nxt }, tones({ [cur]: "active", [nxt]: "alt" }))],
          vars: { k, 組別: group },
        });
        next[cur] = next[nxt];
        next[nxt] = next[prev];
        next[prev] = nxt;
        t.push({
          line: [14, 15, 16],
          note: `\`cur\` 跳過 \`nxt\` 接到後面、\`nxt\` 指向原本的組頭、\`prev\` 指向 \`nxt\`。\`${val[nxt]}\` 現在排在這一組最前面。`,
          views: [view({ prev, cur, nxt }, tones({ [cur]: "active", [nxt]: "alt" }))],
          vars: { k, 組別: group },
        });
      }

      groupIds.forEach((id) => done.add(id));
      prev = cur;
      t.push({
        line: 17,
        note: `第 ${group} 組反轉完成。\`cur\`（\`${val[cur]}\`）成了組尾，剛好是下一組的前一格，所以 \`prev = cur\`。`,
        views: [view({ prev })],
        vars: { k, 組別: group },
      });
    }

    const out: number[] = [];
    for (let id = next["d"]; id; id = next[id]) out.push(val[id] as number);
    t.push({
      line: 10,
      note: "回傳 `dummy.next`：每一組滿 k 個的都反轉了，不足的尾巴原封不動。",
      views: [view({})],
      vars: { k },
      result: py(out),
    });
    return t.frames;
  },
});
