import { defineProblem } from "../types";
import type { Tone } from "../types";
import { V, py, tracer } from "../trace";

const code = `class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = []  # 目前所在位置的每一層目錄
        for part in path.split("/"):
            if part == "..":
                if stack:
                    stack.pop()
            elif part and part != ".":
                stack.append(part)
        return "/" + "/".join(stack)`;

const PARTS = 'path.split("/")';
const STACK = "stack（從根目錄一路走到這裡的目錄）";

export default defineProblem<{ path: string }>({
  id: 71,
  summary:
    "給一個 Unix 風格的**絕對路徑**（以 `/` 開頭），把它化簡成標準形式。\n\n規則：`.` 代表目前目錄、`..` 代表回到上一層（在根目錄時原地不動）、連續多個 `/` 視為一個。其他名稱（包含 `...` 這種）都是一般的目錄或檔名。結果要以單一 `/` 開頭、目錄之間只有一個 `/`、結尾不能有 `/`（根目錄除外）。",
  examples: [
    { input: 'path = "/home/"', output: '"/home"' },
    { input: 'path = "/home//foo/"', output: '"/home/foo"' },
    { input: 'path = "/home/user/Documents/../Pictures"', output: '"/home/user/Pictures"' },
    { input: 'path = "/../"', output: '"/"' },
    { input: 'path = "/.../a/../b/c/../d/./"', output: '"/.../b/d"' },
  ],
  constraints: ["1 ≤ path.length ≤ 3000", "path 是合法的絕對路徑，由英文字母、數字、`.`、`/`、`_` 組成"],
  idea:
    "把路徑想成「一步一步走」：進入目錄就往下一層、`..` 就退回上一層 —— **最後進去的目錄最先被退出**，所以用堆疊記錄目前所在的每一層。先用 `/` 把路徑切成一段一段，再依每一段的意思操作堆疊。",
  steps: [
    "`path.split(\"/\")` 把路徑切段。連續的 `/` 或頭尾的 `/` 會切出空字串。",
    "遇到 `..`：堆疊不是空的才 pop（已經在根目錄就不動）。",
    "遇到空字串或 `.`：什麼都不做。",
    "其他都是目錄名稱，push 進堆疊。",
    "最後用 `/` 把堆疊由底到頂接起來，前面補一個 `/`。",
  ],
  pitfalls: [
    "在根目錄遇到 `..` 不能 pop 空堆疊，要先檢查 `if stack`。",
    "`...` 或 `..a` 是合法的名稱，不是「上一層」—— 所以要用整段字串去比對，而不是逐字元處理。",
    "堆疊是空的時候答案是 `\"/\"`；`\"/\" + \"/\".join([])` 剛好就是它，不用特判。",
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code,
  starter: `class Solution:
    def simplifyPath(self, path: str) -> str:
        `,
  presets: [
    { label: '"/a/./b/../../c/"', input: { path: "/a/./b/../../c/" }, expected: '"/c"' },
    { label: '"/home//foo/../bar"', input: { path: "/home//foo/../bar" }, expected: '"/home/bar"' },
    { label: '"/../.../x/"', input: { path: "/../.../x/" }, expected: '"/.../x"' },
  ],
  trace({ path }) {
    const t = tracer();
    const parts = path.split("/");
    const shown = parts.map((p) => (p === "" ? '""' : p)); // 空字串畫成 ""
    const stack: string[] = [];
    const done: Record<number, Tone> = {};
    const here = () => "/" + stack.join("/");

    const views = (i: number | null, tone?: Tone, top?: Tone) => [
      V.array(PARTS, shown, {
        pointers: i !== null ? { i } : {},
        marks: i !== null && tone ? { ...done, [i]: tone } : { ...done },
      }),
      V.stack(STACK, stack, { marks: top && stack.length ? { [stack.length - 1]: top } : {} }),
    ];

    t.push({
      line: [3, 4],
      note: `用 \`/\` 把 \`"${path}"\` 切成 ${parts.length} 段。開頭、結尾或連續的 \`/\` 會切出空字串 \`""\`。堆疊代表「目前走到哪」，一開始在根目錄，所以是空的。`,
      views: views(null),
      vars: { path, 目前位置: here() },
    });

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part === "..") {
        if (stack.length) {
          const top = stack[stack.length - 1];
          t.push({
            line: [4, 5, 6],
            note: `\`..\` 表示回到上一層。堆疊不是空的，頂端的 \`${top}\` 就是我們最後進入的目錄，等一下要退出它。`,
            views: views(i, "active", "bad"),
            vars: { part, 目前位置: here() },
          });
          stack.pop();
          done[i] = "visited";
          t.push({
            line: 7,
            note: `pop 掉 \`${top}\`，回到上一層，現在位置是 \`${here()}\`。`,
            views: views(i, "active"),
            vars: { part, 目前位置: here() },
          });
        } else {
          done[i] = "muted";
          t.push({
            line: [4, 5, 6],
            note: "`..` 表示回到上一層，但堆疊是空的 —— 我們已經在根目錄，沒有上一層可以退，原地不動（也不能對空堆疊 pop）。",
            views: views(i, "bad"),
            vars: { part, 目前位置: here() },
          });
        }
      } else if (part === "" || part === ".") {
        done[i] = "muted";
        t.push({
          line: [4, 5, 8],
          note:
            part === ""
              ? '這一段是空字串（來自開頭、結尾或連續的 `/`），不代表任何目錄。`elif part and …` 的 `part` 是假值，略過。'
              : "`.` 代表「目前這個目錄」，走了等於沒走，略過。",
          views: views(i, "muted"),
          vars: { part: part === "" ? '""' : part, 目前位置: here() },
        });
      } else {
        stack.push(part);
        done[i] = "good";
        t.push({
          line: [4, 5, 8, 9],
          note:
            (part.startsWith(".")
              ? `\`${part}\` 雖然由點組成，但既不是 \`.\` 也不是 \`..\`，就是一個普通的名稱。`
              : `\`${part}\` 是目錄名稱。`) + `進入它：push 進堆疊，現在位置是 \`${here()}\`。`,
          views: views(i, "active", "active"),
          vars: { part, 目前位置: here() },
        });
      }
    }

    const res = here();
    t.push({
      line: 10,
      note: stack.length
        ? `所有片段處理完。把堆疊**由底到頂**用 \`/\` 接起來，前面補上根目錄的 \`/\`，得到 \`"${res}"\`。`
        : '所有片段處理完，堆疊是空的，代表停在根目錄。`"/".join([])` 是空字串，前面補上 `/` 就是 `"/"`。',
      views: [
        V.array(PARTS, shown, { marks: done }),
        V.stack(STACK, stack, { marks: Object.fromEntries(stack.map((_, k) => [k, "good" as Tone])) }),
      ],
      vars: { path },
      result: py(res),
    });
    return t.frames;
  },
});
