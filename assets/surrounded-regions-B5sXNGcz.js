import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=`class Solution:
    def solve(self, board: List[List[str]]) -> None:
        m, n = len(board), len(board[0])

        def dfs(r, c):
            if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != "O":
                return
            board[r][c] = "#"  # 連得到邊界，安全
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        # 1. 從四條邊上的 O 出發，標記所有「逃得掉」的 O
        for r in range(m):
            dfs(r, 0)
            dfs(r, n - 1)
        for c in range(n):
            dfs(0, c)
            dfs(m - 1, c)

        # 2. 還是 O 的被包圍 → 翻成 X；# 還原成 O
        for r in range(m):
            for c in range(n):
                if board[r][c] == "O":
                    board[r][c] = "X"
                elif board[r][c] == "#":
                    board[r][c] = "O"`,a=[[1,0,`下`],[-1,0,`上`],[0,1,`右`],[0,-1,`左`]],o=r({id:130,summary:'給一張由 `"X"` 和 `"O"` 組成的棋盤。一塊上下左右相連的 `O` 區域，如果**完全被 `X` 包住**（沒有任何一格碰到棋盤邊界），就要把整塊翻成 `X`。\n\n直接修改 `board`，不需要回傳值。',summaryEn:'You get a board of `"X"` and `"O"`. Any region of `O` cells connected up, down, left or right that is **completely enclosed by `X`** (none of its cells touches the board\'s edge) must be flipped entirely to `X`.\n\nModify `board` in place; return nothing.',examples:[{input:`board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]`,output:`[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]`,note:`最下面那個 O 在邊界上，不會被翻掉`,noteEn:`the bottom O is on the edge, so it is not flipped`},{input:`board = [["X"]]`,output:`[["X"]]`}],constraints:[`1 ≤ m, n ≤ 200`,`board[i][j] 只會是 "X" 或 "O"`],constraintsEn:[`1 ≤ m, n ≤ 200`,`board[i][j] is either "X" or "O"`],idea:"直接判斷「這塊 `O` 有沒有被包圍」很麻煩，**反過來想**：不會被翻的 `O`，一定連得到邊界。所以從四條邊上的 `O` 出發做 DFS，把碰得到的都先標成 `#`；剩下還是 `O` 的，就是被包圍的。",steps:["走過四條邊，對每一格呼叫 `dfs`：是 `O` 就改成 `#`，並往四個方向擴散。","此時棋盤上有三種格子：`X`、`#`（安全）、`O`（被包圍）。","最後整張掃一遍：`O` → `X`，`#` → `O`。"],pitfalls:["不要從棋盤內部的 `O` 開始找「有沒有碰到邊界」——要到整塊走完才知道結果，還得回頭再改一次，寫起來又慢又容易錯。","最後一步的兩個判斷要用 `if / elif`：先把 `O` 翻成 `X`，再把 `#` 還原成 `O`，順序或寫法錯了會把剛還原的 `O` 又翻掉。"],complexity:{time:`O(m·n)`,space:`O(m·n)（最壞情況的遞迴深度）`},code:i,starter:`class Solution:
    def solve(self, board: List[List[str]]) -> None:
        `,presets:[{label:`5×5，一塊被包圍、兩塊靠邊`,input:{board:[[`X`,`X`,`X`,`X`,`X`],[`X`,`O`,`O`,`X`,`X`],[`X`,`X`,`O`,`X`,`O`],[`X`,`O`,`X`,`O`,`O`],[`X`,`O`,`X`,`X`,`X`]]},expected:`[["X", "X", "X", "X", "X"], ["X", "X", "X", "X", "X"], ["X", "X", "X", "X", "O"], ["X", "O", "X", "O", "O"], ["X", "O", "X", "X", "X"]]`},{label:`經典 4×4`,input:{board:[[`X`,`X`,`X`,`X`],[`X`,`O`,`O`,`X`],[`X`,`X`,`O`,`X`],[`X`,`O`,`X`,`X`]]},expected:`[["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "O", "X", "X"]]`},{label:`四個角 + 正中央`,input:{board:[[`O`,`X`,`O`],[`X`,`O`,`X`],[`O`,`X`,`O`]]},expected:`[["O", "X", "O"], ["X", "X", "X"], ["O", "X", "O"]]`}],trace({board:r}){let i=n(),o=r.map(e=>[...e]),s=o.length,c=o[0].length,l=[],u=new Set,d=new Set,f=(e={})=>{let t={};for(let e=0;e<s;e++)for(let n=0;n<c;n++){let r=`${e},${n}`;u.has(r)?t[r]=`bad`:d.has(r)||o[e][n]===`#`?t[r]=`good`:o[e][n]===`X`&&(t[r]=`muted`)}return{...t,...e}},p=(e,n={})=>[t.grid(`board`,o,{marks:f(n),pointers:e?{"r,c":e}:{}}),t.stack(`遞迴呼叫堆疊 dfs(r, c)`,l)];i.push({line:3,note:`棋盤是 ${s} × ${c}。想法是反過來做：不去找「被包圍的 \`O\`」，而是先找出**連得到邊界、一定安全**的 \`O\`。`,views:p(),vars:{m:s,n:c}});let m=0,h=(e,t,n)=>{if(!(e<0||e>=s||t<0||t>=c||o[e][t]!==`O`)){o[e][t]=`#`,m++,l.push(`(${e}, ${t})`),i.push({line:[8,9,10,11,12],note:n?`${n} \`(${e}, ${t})\` 也是 \`O\`：它經由剛才那格連得到邊界，所以同樣安全，標成 \`#\`。`:`邊界上的 \`(${e}, ${t})\` 是 \`O\`：貼著邊界不可能被四面包住。標成 \`#\`（安全），再往四個方向找跟它相連的 \`O\`。`,views:p([e,t],{[`${e},${t}`]:`active`}),vars:{r:e,c:t,安全格數:m}});for(let[n,r,i]of a)h(e+n,t+r,`從 \`(${e}, ${t})\` 往${i}走，`);l.pop()}};i.push({line:[15,16,17],note:"第一階段：先走**最左欄和最右欄**，每一格都丟給 `dfs`。不是 `O` 的格子（`X` 或已標過的 `#`）會在第一行判斷就直接返回。",views:p(),vars:{安全格數:m}});for(let e=0;e<s;e++)h(e,0,``),h(e,c-1,``);i.push({line:[18,19,20],note:"接著走**最上列和最下列**，同樣把邊上的 `O` 連同它們相連的區域標成 `#`。",views:p(),vars:{安全格數:m}});for(let e=0;e<c;e++)h(0,e,``),h(s-1,e,``);let g={},_=0;for(let e=0;e<s;e++)for(let t=0;t<c;t++)o[e][t]===`O`&&(g[`${e},${t}`]=`compare`,_++);i.push({line:23,note:`四條邊都走完了，共 ${m} 格被標成 \`#\`。`+(_?`還維持 \`O\` 的 ${_} 格（標示出來的那幾格）從邊界怎麼走都到不了 → 它們就是**被包圍**的。`:"棋盤上已經沒有 `O` 了，代表沒有任何區域被包圍。"),views:p(void 0,g),vars:{安全格數:m,被包圍格數:_}});for(let e=0;e<s;e++)for(let t=0;t<c;t++){let n=`${e},${t}`;o[e][t]===`O`?(o[e][t]=`X`,u.add(n),i.push({line:[25,26],note:`\`(${e}, ${t})\` 還是 \`O\`，表示第一階段沒被碰到 → 被包圍，翻成 \`X\`。`,views:p([e,t]),vars:{r:e,c:t}})):o[e][t]===`#`&&(o[e][t]=`O`,d.add(n),i.push({line:[27,28],note:`\`(${e}, ${t})\` 是 \`#\`，是連得到邊界的安全格 → 還原成 \`O\`。`,views:p([e,t]),vars:{r:e,c:t}}))}return i.push({line:[23,24],note:`整張掃完：被包圍的 ${u.size} 格翻成了 \`X\`，連得到邊界的 ${d.size} 格保留為 \`O\`。\`board\` 已原地修改完成。`,views:p(),result:e(o)}),i.frames}});export{o as default};