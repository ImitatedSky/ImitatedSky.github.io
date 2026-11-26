import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=`class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])

        def dfs(r, c):
            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != "1":
                return
            grid[r][c] = "0"  # 沉掉，之後不會再被算到
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == "1":
                    count += 1
                    dfs(r, c)
        return count`,a=[`good`,`alt`,`compare`,`visited`],o=[[1,0,`下`],[-1,0,`上`],[0,1,`右`],[0,-1,`左`]],s=r({id:200,summary:'給一張由 `"1"`（陸地）和 `"0"`（水）組成的二維地圖，算出上面有**幾座島**。\n\n上下左右相連的陸地算同一座島，斜對角不算相連；地圖外面全部當作水。',summaryEn:'You get a 2D map of `"1"` (land) and `"0"` (water). Count **how many islands** it has.\n\nLand cells that touch up, down, left or right belong to the same island; diagonal neighbors do not count as connected. Everything outside the map is water.',examples:[{input:`grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]`,output:`3`},{input:`grid = [["1","0","1"],["0","1","0"],["1","0","1"]]`,output:`5`,note:`斜對角不相連，每格各自是一座島`,noteEn:`diagonal cells are not connected, so each one is its own island`}],constraints:[`1 ≤ m, n ≤ 300`,`grid[i][j] 只會是 "0" 或 "1"`],constraintsEn:[`1 ≤ m, n ≤ 300`,`grid[i][j] is either "0" or "1"`],idea:"由左上掃到右下，**每碰到一格還沒處理過的陸地，就代表發現一座新島**。這時立刻用 DFS 把整座島「沉掉」（改成 `0`），同一座島之後就不會再被重複計算。",steps:[`逐格掃描整張地圖。`,'遇到 `"1"`：島數 `count += 1`，並從這格開始 DFS。','DFS 把目前這格改成 `"0"`，再往上下左右四個方向遞迴；出界或遇到水就直接返回。',"掃完整張地圖，`count` 就是答案。"],pitfalls:[`要**一進到格子就先沉掉**再往外遞迴，否則相鄰的兩格會互相呼叫、無限遞迴。`,"邊界判斷要寫在讀 `grid[r][c]` 之前，不然會索引出界（或在 Python 被負索引繞回去）。","不想改到輸入的話，可以另外開一個 `visited` 集合，概念完全相同。"],complexity:{time:`O(m·n)`,space:`O(m·n)（最壞情況的遞迴深度）`},code:i,starter:`class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        `,presets:[{label:`4×5，三座島`,input:{grid:[[`1`,`1`,`0`,`0`,`0`],[`1`,`1`,`0`,`0`,`0`],[`0`,`0`,`1`,`0`,`0`],[`0`,`0`,`0`,`1`,`1`]]},expected:`3`},{label:`彎曲的大島 + 角落的小島`,input:{grid:[[`1`,`1`,`1`,`0`],[`0`,`0`,`1`,`0`],[`1`,`0`,`1`,`1`],[`1`,`0`,`0`,`1`]]},expected:`2`},{label:`斜對角不相連`,input:{grid:[[`1`,`0`,`1`],[`0`,`1`,`0`],[`1`,`0`,`1`]]},expected:`5`}],trace({grid:r}){let i=n(),s=r.map(e=>[...e]),c=s.length,l=s[0].length,u=s.map(e=>e.map(()=>-1)),d=[],f=0,p=(e={})=>{let t={};for(let e=0;e<c;e++)for(let n=0;n<l;n++)r[e][n]===`1`?u[e][n]>=0&&(t[`${e},${n}`]=a[u[e][n]%a.length]):t[`${e},${n}`]=`muted`;return{...t,...e}},m=(e,n={})=>[t.grid(`grid`,s,{marks:p(n),pointers:e?{"r,c":e}:{}}),t.stack(`遞迴呼叫堆疊 dfs(r, c)`,d)];i.push({line:[3,14],note:`地圖是 ${c} × ${l}。變淡的格子是水，其餘的 \`1\` 是還沒處理的陸地。準備逐格掃描，\`count\` 從 0 開始。`,views:m(),vars:{m:c,n:l,count:f}});let h=0,g=(e,t,n)=>{if(!(e<0||e>=c||t<0||t>=l||s[e][t]!==`1`)){s[e][t]=`0`,u[e][t]=f-1,h++,d.push(`(${e}, ${t})`),i.push({line:[8,9,10,11,12],note:n?`${n} \`(${e}, ${t})\` 也是陸地，和起點相連 → 屬於同一座島。先把它沉成 \`0\`，再繼續往四個方向找。`:`進入 \`dfs(${e}, ${t})\`：**一進來就先把這格沉成 \`0\`**，這樣鄰居遞迴回頭時不會再走進來。接著往下、上、右、左探索。`,views:m([e,t],{[`${e},${t}`]:`active`}),vars:{count:f,r:e,c:t,這座島的格數:h}});for(let[n,r,i]of o)g(e+n,t+r,`從 \`(${e}, ${t})\` 往${i}走，`);d.pop()}},_=0;for(let e=0;e<c;e++)for(let t=0;t<l;t++){if(s[e][t]!==`1`){_++;continue}f++,i.push({line:[15,16,17,18],note:(_?`跳過 ${_} 格 \`0\`（水，或已經沉掉的陸地）。`:``)+`掃到 \`(${e}, ${t})\` 是 \`1\`：這是一塊**還沒被算過**的陸地，所以發現第 ${f} 座島，\`count = ${f}\`。`,views:m([e,t],{[`${e},${t}`]:`compare`}),vars:{count:f,r:e,c:t}}),_=0,h=0,g(e,t,``),i.push({line:19,note:`DFS 全部返回：第 ${f} 座島共 ${h} 格，已經整座沉掉。之後再掃到這些格子都是 \`0\`，不會重複計數。`,views:m([e,t]),vars:{count:f,r:e,c:t,這座島的格數:h}})}return i.push({line:20,note:(_?`剩下的 ${_} 格都是 \`0\`，直接跳過。`:``)+`整張地圖掃完，一共啟動了 ${f} 次 DFS，也就是 ${f} 座島。`,views:m(),vars:{count:f},result:e(f)}),i.frames}});export{s as default};