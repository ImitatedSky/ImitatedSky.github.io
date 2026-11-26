import{a as e,n as t,o as n,r,s as i}from"./AlgoApp-DIbAQPAC.js";import{t as a}from"./types-Dfvzj6n2.js";var o=a({id:199,summary:`想像你站在一棵二元樹的**右邊**往左看，每一層只看得到最靠右的那個節點。

給根節點 \`root\`，由上到下回傳你看得到的節點值。`,summaryEn:`Imagine standing on the **right side** of a binary tree and looking left: on each level you can only see the rightmost node.

Given \`root\`, return the values you can see, from top to bottom.`,examples:[{input:`root = [1,2,3,null,5,null,4]`,output:`[1,3,4]`},{input:`root = [1,2,3,4,null,null,null,5]`,output:`[1,3,4,5]`,note:`右邊比較淺時，左子樹深處的節點會露出來`,noteEn:`when the right side is shallower, deeper nodes of the left subtree show through`},{input:`root = []`,output:`[]`}],constraints:[`0 ≤ 節點數 ≤ 100`],constraintsEn:[`0 ≤ number of nodes ≤ 100`],idea:"「從右邊看到的」就是**每一層的最後一個節點**。用 BFS 一層一層走：每一輪開始時，佇列裡剛好裝著一整層（由左到右），所以佇列尾端 `q[-1]` 就是答案。",steps:["空樹直接回傳 `[]`；否則把 root 放進佇列。","每一輪開始時佇列 = 一整層，把尾端 `q[-1].val` 加進 `res`。",`把這一層的節點全部 pop 出來，並依「先左後右」把小孩 push 進去，組成下一層。`,"佇列空了就回傳 `res`。"],pitfalls:["不能只沿著 `right` 指標一路往下走：右子樹比較淺時，左子樹深處的節點也看得到。",`小孩一定要**先左後右**進佇列，尾端才會是最右邊的節點。`],complexity:{time:`O(n)`,space:`O(n)`},code:`class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        res = []
        q = deque([root])
        while q:
            res.append(q[-1].val)  # 佇列尾端 = 這一層最右邊
            for _ in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
        return res`,starter:`class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        `,presets:[{label:`[1,2,3,null,5,null,4]`,input:{root:[1,2,3,null,5,null,4]},expected:`[1, 3, 4]`},{label:`左邊比較深 [1,2,3,4,null,null,null,5]`,input:{root:[1,2,3,4,null,null,null,5]},expected:`[1, 3, 4, 5]`},{label:`[]`,input:{root:[]},expected:`[]`}],trace({root:a}){let o=n(),s=r(a),c=i(s);if(!s)return o.push({line:[3,4],note:`空樹，什麼都看不到，回傳空陣列。`,views:[t.tree(`tree`,c)],result:`[]`}),o.frames;let l=[],u=[s],d=new Set,f=new Set,p=(e={})=>{let t={};return d.forEach(e=>t[e]=`visited`),u.forEach(e=>t[e.id]=`compare`),f.forEach(e=>t[e]=`good`),{...t,...e}},m=(e={})=>[t.tree(`tree`,c,{marks:p(e.extra),pointers:e.node?{node:e.node.id}:{}}),t.queue(`q`,u.map(e=>e.val),{marks:e.tail&&u.length?{[u.length-1]:`good`}:{}}),t.array(`res`,l,{marks:e.tail?{[l.length-1]:`good`}:{}})];o.push({line:[5,6],note:`把 root 放進佇列。接下來每一輪，佇列裡都會剛好裝著**一整層**的節點（由左到右）。`,views:m()});let h=0;for(;u.length;){let e=u[u.length-1];l.push(e.val),f.add(e.id),o.push({line:[7,8],note:u.length===1?`第 ${h} 層只有 \`${e.val}\` 一個節點，從右邊看到的就是它，加進 \`res\`。`:`第 ${h} 層由左到右是 ${u.map(e=>`\`${e.val}\``).join(`、`)}，佇列尾端 \`${e.val}\` 最靠右，會擋住同層其他節點 —— 加進 \`res\`。`,views:m({tail:!0}),vars:{層:h,"len(q)":u.length}});let t=u.length;for(let e=0;e<t;e++){let n=u.shift(),r=[n.left,n.right].filter(e=>e!==null);u.push(...r),o.push({line:r.length?[9,10,11,12,13,14]:[9,10],note:`取出 \`${n.val}\`（這一層第 ${e+1} / ${t} 個）。`+(r.length?`小孩 ${r.map(e=>`\`${e.val}\``).join(`、`)} 依先左後右排進佇列，成為下一層。`:`它沒有小孩，下一層不會多出節點。`),views:m({extra:{[n.id]:`active`},node:n}),vars:{層:h,"len(q)":u.length}}),d.add(n.id)}h++}return o.push({line:15,note:`佇列空了。每一層最右邊的節點（綠色）合起來就是右視圖 \`${e(l)}\`。`,views:m(),result:e(l)}),o.frames}});export{o as default};