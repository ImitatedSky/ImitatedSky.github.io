import{a as e,n as t,o as n}from"./AlgoApp-D095I_J-.js";import{t as r}from"./types-Dfvzj6n2.js";var i=`class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        for r in range(9):
            for c in range(9):
                x = board[r][c]
                if x == ".":
                    continue
                b = r // 3 * 3 + c // 3  # 第幾個九宮格
                if x in rows[r] or x in cols[c] or x in boxes[b]:
                    return False
                rows[r].add(x)
                cols[c].add(x)
                boxes[b].add(x)
        return True`,a=[`53..7....`,`6..195...`,`.98....6.`,`8...6...3`,`4..8.3..1`,`7...2...6`,`.6....28.`,`...419..5`,`....8..79`],o=r({id:36,summary:`給一個 9×9 的數獨盤面，有些格子已填數字、有些是空的（\`.\`）。判斷**目前已填的數字**是否合法：每一列、每一欄、每個 3×3 九宮格裡，數字 1–9 都不能重複。

只需要檢查已填的格子，不用管這個盤面最後解不解得出來。`,summaryEn:`You get a 9×9 Sudoku board where some cells are filled with digits and the rest are empty (\`.\`). Decide whether **the digits filled in so far** are valid: no row, no column, and no 3×3 box may contain a digit 1-9 more than once.

Only check the filled cells; whether the board can actually be solved does not matter.`,examples:[{input:`board = [["5","3",".",".","7",…], …]  (standard example board)`,output:`true`},{input:`same board, top-left 5 changed to 8`,output:`false`,note:`左上角的九宮格裡出現兩個 8`,noteEn:`The top-left 3×3 box now contains two 8s`}],constraints:[`board 固定是 9×9`,"每格是 `1`–`9` 或 `.`"],constraintsEn:[`board is always 9×9`,"Each cell is `1`-`9` or `.`"],idea:"每個數字同時屬於**一列、一欄、一個九宮格**。替 9 列、9 欄、9 宮各準備一個集合，掃過盤面一次：放進去之前先問「這三個集合裡有沒有它？」有就是重複。九宮格的編號用 `r // 3 * 3 + c // 3` 算出來。",steps:["建立 `rows`、`cols`、`boxes` 各 9 個空集合。",`由左到右、由上到下走訪每一格，空格直接跳過。`,"算出這格屬於第 `b = r // 3 * 3 + c // 3` 個九宮格。","若數字已在 `rows[r]`、`cols[c]` 或 `boxes[b]` 裡 → 重複，回傳 `False`。","否則把它加進這三個集合；全部走完都沒衝突就回傳 `True`。"],pitfalls:["九宮格編號是 `r // 3 * 3 + c // 3`，先整除再乘 3，不要寫成 `r * 3 // 3`。",`題目只問「目前合法嗎」，不是問「有沒有解」，不需要回溯。`],complexity:{time:`O(81) = O(1)`,space:`O(81) = O(1)`},code:i,starter:`class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        `,presets:[{label:`合法盤面`,input:{board:a},expected:`True`},{label:`九宮格內重複`,input:{board:[`83..7....`,...a.slice(1)]},expected:`False`},{label:`同一欄重複`,input:{board:[`1..4..7..`,`.2..5..8.`,`..3..6..9`,`4........`,`..3......`,`.........`,`.........`,`.........`,`.........`]},expected:`False`}],trace({board:r}){let i=n(),a=r.map(e=>[...e].map(e=>e===`.`?``:e)),o=[0,1,2,3,4,5,6,7,8],s=o.map(()=>new Set),c=o.map(()=>new Set),l=o.map(()=>new Set),u=(e={},n={})=>t.grid(`board`,a,{marks:e,pointers:n,rowLabels:o,colLabels:o,blocks:[3,3]});i.push({line:[3,4,5],note:`替 9 列、9 欄、9 個九宮格各準備一個空集合，記錄「這裡已經出現過哪些數字」。`,views:[u(),t.set(`rows[r]`,[]),t.set(`cols[c]`,[]),t.set(`boxes[b]`,[])]});for(let n=0;n<9;n++)for(let a=0;a<9;a++){let o=r[n][a];if(o===`.`)continue;let d=Math.floor(n/3)*3+Math.floor(a/3),f={};for(let e=0;e<9;e++)for(let t=0;t<9;t++){let i=Math.floor(e/3)===Math.floor(n/3)&&Math.floor(t/3)===Math.floor(a/3);if(e!==n&&t!==a&&!i){f[`${e},${t}`]=`muted`;continue}(e<n||e===n&&t<a)&&r[e][t]!==`.`&&(f[`${e},${t}`]=r[e][t]===o?`bad`:`compare`)}f[`${n},${a}`]=`active`;let p={r:n,c:a,b:d,x:o},m=[];if(s[n].has(o)&&m.push(`第 ${n} 列`),c[a].has(o)&&m.push(`第 ${a} 欄`),l[d].has(o)&&m.push(`第 ${d} 宮`),m.length){f[`${n},${a}`]=`bad`;let r=e=>e.has(o)?{marks:{[o]:`bad`}}:{};return i.push({line:[8,11,12,13],note:`\`board[${n}][${a}] = ${o}\`，屬於第 ${d} 宮。但 \`${o}\` 已經出現在${m.join(`、`)}的集合裡 —— **重複了**，盤面不合法。`,views:[u(f,{x:[n,a]}),t.set(`rows[r]`,s[n],r(s[n])),t.set(`cols[c]`,c[a],r(c[a])),t.set(`boxes[b]`,l[d],r(l[d]))],vars:p,result:e(!1)}),i.frames}s[n].add(o),c[a].add(o),l[d].add(o);let h={marks:{[o]:`good`}};i.push({line:[8,11,12,14,15,16],note:`\`board[${n}][${a}] = ${o}\`，屬於第 \`${n} // 3 * 3 + ${a} // 3 = ${d}\` 宮。第 ${n} 列、第 ${a} 欄、第 ${d} 宮都還沒有 \`${o}\`，把它記進三個集合。`,views:[u(f,{x:[n,a]}),t.set(`rows[r]`,s[n],h),t.set(`cols[c]`,c[a],h),t.set(`boxes[b]`,l[d],h)],vars:p})}let d={};return r.forEach((e,t)=>[...e].forEach((e,n)=>e!==`.`&&(d[`${t},${n}`]=`good`))),i.push({line:17,note:`所有已填的格子都檢查完，沒有任何一列、一欄或九宮格出現重複，盤面合法。`,views:[u(d),t.set(`rows[r]`,[]),t.set(`cols[c]`,[]),t.set(`boxes[b]`,[])],result:e(!0)}),i.frames}});export{o as default};