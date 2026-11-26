import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=r({id:64,summary:`給一個 \`m × n\` 的非負整數方格，從**左上角**走到**右下角**，每一步只能**往右或往下**。

求路徑上所有數字總和的最小值。`,summaryEn:`Given an \`m × n\` grid of non-negative integers, walk from the **top-left corner** to the **bottom-right corner**, moving only **right or down**.

Find the smallest possible sum of the numbers along the path.`,examples:[{input:`grid = [[1,3,1],[1,5,1],[4,2,1]]`,output:`7`,note:`1 → 3 → 1 → 1 → 1`,noteEn:`1 → 3 → 1 → 1 → 1`},{input:`grid = [[1,2,3],[4,5,6]]`,output:`12`}],constraints:[`1 ≤ m, n ≤ 200`,`0 ≤ grid[i][j] ≤ 200`],constraintsEn:[`1 ≤ m, n ≤ 200`,`0 ≤ grid[i][j] ≤ 200`],idea:"定義 `dp[i][j]` = 從左上角走到 `(i, j)` 的最小路徑和。因為只能往右或往下，要到 `(i, j)` 的**前一步只可能在上面或左邊**，挑比較小的那個再加上自己：`dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]`。",steps:["起點 `dp[0][0] = grid[0][0]`。",`第一列只能從左邊一路走過來、第一行只能從上面一路走下來，各自累加。`,"其餘格子取「上」和「左」的較小值，加上 `grid[i][j]`。","答案是右下角 `dp[m-1][n-1]`。"],pitfalls:["邊界要分開處理，否則 `dp[-1]` 在 Python 會默默取到最後一列而不是報錯。","可以直接改寫 `grid` 或只留一列來把空間壓到 O(n)，但先寫出二維版本最不容易錯。"],complexity:{time:`O(m × n)`,space:`O(m × n)（可壓到 O(n)）`},code:`class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        # dp[i][j] = 從左上角走到 (i, j) 的最小路徑和
        dp = [[0] * n for _ in range(m)]
        for i in range(m):
            for j in range(n):
                if i == 0 and j == 0:
                    dp[i][j] = grid[0][0]
                elif i == 0:
                    dp[i][j] = dp[i][j - 1] + grid[i][j]  # 第一列只能從左邊來
                elif j == 0:
                    dp[i][j] = dp[i - 1][j] + grid[i][j]  # 第一行只能從上面來
                else:
                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
        return dp[m - 1][n - 1]`,starter:`class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        `,presets:[{label:`[[1,3,1],[1,5,1],[4,2,1]]`,input:{grid:[[1,3,1],[1,5,1],[4,2,1]]},expected:`7`},{label:`[[1,2,3],[4,5,6]]`,input:{grid:[[1,2,3],[4,5,6]]},expected:`12`},{label:`[[1,2,5]]（只有一列）`,input:{grid:[[1,2,5]]},expected:`8`}],trace({grid:r}){let i=n(),a=r.length,o=r[0].length,s=r.map(e=>e.map(()=>0)),c=r.map(e=>e.map(()=>!1)),l=r.map((e,t)=>t),u=r[0].map((e,t)=>t),d=()=>s.map((e,t)=>e.map((e,n)=>c[t][n]?e:``)),f=(e={},n={},i)=>[t.grid(`grid`,r,{rowLabels:l,colLabels:u,marks:e,pointers:i?{"i,j":i}:{}}),t.grid(`dp`,d(),{rowLabels:l,colLabels:u,marks:n,pointers:i?{"i,j":i}:{}})];i.push({line:[3,4,5],note:`\`dp[i][j]\` 的意思是：**從左上角走到 \`(i, j)\` 的最小路徑和**。開一張和 \`grid\` 一樣大的 ${a} × ${o} 表格，答案會落在右下角 \`dp[${a-1}][${o-1}]\`。`,views:f(),vars:{m:a,n:o}});for(let e=0;e<a;e++)for(let t=0;t<o;t++){let n=r[e][t],a=`${e},${t}`,o,l,u={};if(e===0&&t===0)s[e][t]=n,o=[8,9],l=`起點 \`(0, 0)\`：還沒走任何一步，路徑和就是自己，\`dp[0][0] = ${n}\`。`;else if(e===0)s[e][t]=s[e][t-1]+n,u[`${e},${t-1}`]=`compare`,o=[10,11],l=`\`(0, ${t})\` 在第一列，上面沒有格子，只能從左邊走過來：\`dp[0][${t}] = dp[0][${t-1}] + ${n} = ${s[e][t-1]} + ${n} = ${s[e][t]}\`。`;else if(t===0)s[e][t]=s[e-1][t]+n,u[`${e-1},${t}`]=`compare`,o=[12,13],l=`\`(${e}, 0)\` 在第一行，左邊沒有格子，只能從上面走下來：\`dp[${e}][0] = dp[${e-1}][0] + ${n} = ${s[e-1][t]} + ${n} = ${s[e][t]}\`。`;else{let r=s[e-1][t],i=s[e][t-1];s[e][t]=Math.min(r,i)+n,u[`${e-1},${t}`]=`compare`,u[`${e},${t-1}`]=`compare`,o=[14,15];let a=r<i?`從上面來比較省`:i<r?`從左邊來比較省`:`兩邊一樣`;l=`\`(${e}, ${t})\` 可以從上面（\`dp[${e-1}][${t}] = ${r}\`）或左邊（\`dp[${e}][${t-1}] = ${i}\`）過來，${a}：\`dp[${e}][${t}] = min(${r}, ${i}) + ${n} = ${s[e][t]}\`。`}c[e][t]=!0,i.push({line:o,note:l,views:f({[a]:`active`},{...u,[a]:`active`},[e,t]),vars:{i:e,j:t,"grid[i][j]":n,"dp[i][j]":s[e][t]}})}let p={},m=[];for(let e=a-1,t=o-1;p[`${e},${t}`]=`good`,m.unshift(r[e][t]),e!==0||t!==0;)e===0?t--:t===0||s[e-1][t]<=s[e][t-1]?e--:t--;return i.push({line:16,note:`整張表填完，右下角 \`dp[${a-1}][${o-1}] = ${s[a-1][o-1]}\` 就是答案。從終點往回看每一格是從哪邊來的，可以還原出綠色這條路徑：\`${m.join(` + `)} = ${s[a-1][o-1]}\`。`,views:f(p,p),vars:{m:a,n:o},result:e(s[a-1][o-1])}),i.frames}});export{i as default};