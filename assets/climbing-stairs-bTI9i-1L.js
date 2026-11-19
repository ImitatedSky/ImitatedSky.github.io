import{a as e,n as t,o as n}from"./AlgoApp-D095I_J-.js";import{t as r}from"./types-Dfvzj6n2.js";var i=r({id:70,summary:`樓梯總共有 \`n\` 階，每一步可以爬 **1 階**或 **2 階**。

問爬到最頂端一共有幾種不同的走法。`,summaryEn:`A staircase has \`n\` steps, and each move climbs either **1 step** or **2 steps**.

How many different ways are there to reach the top?`,examples:[{input:`n = 2`,output:`2`,note:`1+1、2`,noteEn:`1+1, 2`},{input:`n = 3`,output:`3`,note:`1+1+1、1+2、2+1`,noteEn:`1+1+1, 1+2, 2+1`}],constraints:[`1 ≤ n ≤ 45`],constraintsEn:[`1 ≤ n ≤ 45`],idea:"定義 `dp[i]` = 爬到第 `i` 階的方法數。站上第 `i` 階的**最後一步**只有兩種可能：從 `i-1` 跨 1 階，或從 `i-2` 跨 2 階，所以 `dp[i] = dp[i-1] + dp[i-2]` —— 其實就是費氏數列。",steps:["`dp[0] = 1`（站在地面，什麼都不做也算一種）、`dp[1] = 1`。","從 `i = 2` 開始由小到大填：`dp[i] = dp[i-1] + dp[i-2]`。","答案是 `dp[n]`。"],pitfalls:[`兩種「最後一步」互不重疊，所以是**相加**而不是取最大值。`,"每一格只用到前兩格，可以改用兩個變數 `a, b = b, a + b` 滾動，把空間壓到 O(1)。"],complexity:{time:`O(n)`,space:`O(n)（滾動變數可降到 O(1)）`},code:`class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 1:
            return 1
        dp = [0] * (n + 1)  # dp[i] = 爬到第 i 階的方法數
        dp[0] = dp[1] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]`,starter:`class Solution:
    def climbStairs(self, n: int) -> int:
        `,presets:[{label:`n = 6`,input:{n:6},expected:`13`},{label:`n = 2`,input:{n:2},expected:`2`},{label:`n = 1`,input:{n:1},expected:`1`}],trace({n:r}){let i=n();if(r<=1)return i.push({line:[3,4],note:`只有 ${r} 階，走法只有 1 種，直接回傳。`,views:[t.array(`dp`,[1,1].slice(0,r+1),{marks:{[r]:`good`}})],vars:{n:r},result:e(1)}),i.frames;let a=Array(r+1).fill(0),o=-1,s=()=>a.map((e,t)=>t<=o?e:``),c=(e={},n={})=>t.array(`dp`,s(),{marks:e,pointers:n});i.push({line:5,note:`開一個長度 \`n + 1 = ${r+1}\` 的表格。\`dp[i]\` 的意思是：**爬到第 \`i\` 階一共有幾種走法**，我們要的是 \`dp[${r}]\`。`,views:[c()],vars:{n:r}}),a[0]=a[1]=1,o=1,i.push({line:6,note:"起點：`dp[0] = 1`（站在地面不動算一種）、`dp[1] = 1`（只能跨 1 階）。這兩格是之後所有答案的基礎。",views:[c({0:`good`,1:`good`})],vars:{n:r}});for(let e=2;e<=r;e++)a[e]=a[e-1]+a[e-2],o=e,i.push({line:[7,8],note:`要站上第 ${e} 階，最後一步不是從第 ${e-1} 階跨 1 階，就是從第 ${e-2} 階跨 2 階，兩種情況加起來：\`dp[${e}] = dp[${e-1}] + dp[${e-2}] = ${a[e-1]} + ${a[e-2]} = ${a[e]}\`。`,views:[c({[e]:`active`,[e-1]:`compare`,[e-2]:`compare`},{i:e})],vars:{n:r,i:e,"dp[i]":a[e]}});return i.push({line:9,note:`表格填完了，\`dp[${r}] = ${a[r]}\` 就是爬到頂端的方法數。`,views:[c({[r]:`good`})],vars:{n:r},result:e(a[r])}),i.frames}});export{i as default};