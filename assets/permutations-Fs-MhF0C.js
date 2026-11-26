import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=`class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []
        path = []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                res.append(path[:])       # 複製一份，path 之後還會變
                return
            for i in range(len(nums)):
                if used[i]:               # 這個數已經在 path 裡了
                    continue
                used[i] = True            # 選
                path.append(nums[i])
                backtrack()
                path.pop()                # 撤銷
                used[i] = False

        backtrack()
        return res`;function a(e){let n=[{id:`r`,val:e,children:[]}],r={},i={},a=[`r`];return{down(e,t){let r=a[a.length-1],o=`d${n.length}`;n.push({id:o,val:e,children:[]}),n.find(e=>e.id===r).children.push(o),i[`${r}>${o}`]=t,a.push(o)},settle(e){r[a[a.length-1]]=e},up(){let e=a.pop();r[e]??=`visited`},view(e){let o={...r},s={};return a.forEach((e,t)=>{o[e]=t===a.length-1?r[e]??`active`:`compare`,t>0&&(s[`${a[t-1]}>${e}`]=`active`)}),t.tree(e,{nodes:n,root:`r`},{marks:o,edgeLabels:i,edgeMarks:s})}}}var o=r({id:46,summary:`給一個**元素互不相同**的整數陣列 \`nums\`，列出它所有可能的**排列**（每個元素恰好用一次，順序不同就算不同的排列）。

答案之間的順序不限。`,summaryEn:`Given an integer array \`nums\` whose **elements are all distinct**, list every possible **permutation** of it (each element used exactly once; a different order counts as a different permutation).

The permutations can be returned in any order.`,examples:[{input:`nums = [1,2,3]`,output:`[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`},{input:`nums = [0,1]`,output:`[[0,1],[1,0]]`},{input:`nums = [1]`,output:`[[1]]`}],constraints:[`1 ≤ nums.length ≤ 6`,`nums 裡的整數互不相同`],constraintsEn:[`1 ≤ nums.length ≤ 6`,`All integers in nums are distinct`],idea:"排列是一格一格填位置：第 1 格有 n 種選擇，第 2 格剩 n − 1 種…。跟「組合」不同，**順序有差**，所以每一層都要從頭掃過整個 `nums`，只是要跳過已經放進 `path` 的數 —— 用 `used[i]` 記錄誰被用掉了。",steps:["`path` 是目前排好的前幾格，`used[i]` 表示 `nums[i]` 是否已經在 `path` 裡。","`len(path) == len(nums)`：每一格都填好了，把 `path` 的複本收進 `res`。","否則掃過每個 `i`：已經用過就跳過。","沒用過的：標記 `used[i]`、`append` → 遞迴填下一格 → `pop`、取消標記。"],pitfalls:["撤銷要成對：`path.pop()` 和 `used[i] = False` 兩個都要做，少一個狀態就壞了。","要存 `path[:]`（複本），不然 `res` 裡每一項都是同一個、最後被清空的串列。"],complexity:{time:`O(n · n!)`,space:`O(n)（遞迴深度與 used，不含輸出）`},code:i,starter:`class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        `,presets:[{label:`[1,2,3]`,input:{nums:[1,2,3]},expected:`[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]`},{label:`[0,1]`,input:{nums:[0,1]},expected:`[[0, 1], [1, 0]]`},{label:`[5]`,input:{nums:[5]},expected:`[[5]]`}],trace({nums:r}){let i=n(),o=r.length,s=[],c=[],l=Array(o).fill(!1),u=a(`[]`),d=r.every(e=>e>=0&&e<=9),f=(n,i)=>{let a={};return l.forEach((e,t)=>{e&&(a[t]=`muted`)}),n!==void 0&&(a[n]=`active`),[t.array(`nums（灰色 = 已經用掉）`,r,{marks:a,pointers:n===void 0?{}:{i:n}}),u.view(`決策樹（節點 = 目前的 path，邊 = 選的數）`),t.array(`res`,s.map(t=>e(t)),{marks:i?{[s.length-1]:`good`}:{}})]};i.push({line:[3,4,5,20],note:`要把 ${o} 個數排進 ${o} 個位置。\`used\` 全部是 \`False\`，\`path\` 是空的，開始一格一格填。`,views:f(),vars:{path:e(c),used:e(l)}});let p=()=>{if(c.length===o){s.push([...c]),u.settle(`good`),i.push({line:[8,9,10],note:`\`path\` 長度到 ${o}，每一格都填好了 —— 把複本 \`${e(c)}\` 收進 \`res\`。`,views:f(void 0,c),vars:{path:e(c),已收集:s.length}});return}let t=c.length,n=[];for(let a=0;a<o;a++){if(l[a]){n.push(r[a]);continue}l[a]=!0,c.push(r[a]),u.down(d?c.join(``):r[a],String(r[a])),i.push({line:[11,12,14,15,16],note:`填第 ${t+1} 格。`+(n.length?`${n.map(e=>`\`${e}\``).join(`、`)} 已經在 \`path\` 裡，跳過；`:``)+`\`nums[${a}] = ${r[a]}\` 還沒用過，**選**它並標記 \`used[${a}] = True\`，再往下填下一格。`,views:f(a),vars:{i:a,path:e(c),used:e(l)}}),n=[],p(),c.pop(),l[a]=!1,u.up();let o=r.filter((e,t)=>t>a&&!l[t]);i.push({line:[17,18],note:`**撤銷**：把 \`${r[a]}\` 從 \`path\` 拿掉、\`used[${a}]\` 改回 \`False\`，\`path\` 變回 \`${e(c)}\`。`+(o.length?`第 ${t+1} 格接著換試 \`${o[0]}\`。`:`第 ${t+1} 格能放的都試過了，返回上一層。`),views:f(a),vars:{i:a,path:e(c),used:e(l)}})}};return p(),i.push({line:21,note:`整棵樹走完，共 ${s.length} 個排列（${o}! = ${s.length}）。每一層的分支數比上一層少 1，因為用過的數不能再選。`,views:f(),vars:{已收集:s.length},result:e(s)}),i.frames}});export{o as default};