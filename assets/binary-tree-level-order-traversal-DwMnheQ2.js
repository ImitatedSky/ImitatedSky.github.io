import{a as e,n as t,o as n,r,s as i}from"./AlgoApp-D095I_J-.js";import{t as a}from"./types-Dfvzj6n2.js";var o=a({id:102,summary:`給一棵二元樹的根節點，回傳它的**層序走訪**結果：由上到下、每一層由左到右，每一層的節點值各自放在一個陣列裡。`,summaryEn:`Given the root of a binary tree, return its **level order traversal**: top to bottom, left to right within each level, with each level's values in their own array.`,examples:[{input:`root = [3,9,20,null,null,15,7]`,output:`[[3],[9,20],[15,7]]`},{input:`root = []`,output:`[]`}],constraints:[`0 ≤ 節點數 ≤ 2000`],constraintsEn:[`0 ≤ number of nodes ≤ 2000`],idea:`BFS 用佇列。關鍵是**每一輪開始時先記下佇列長度**：那正好是「這一層」的節點數，照這個數量 pop，就能把一層一層切開。`,steps:["空樹直接回傳 `[]`；否則把 root 放進佇列。","佇列不為空時，記下目前長度 `len(q)` —— 這一層有幾個節點。","pop 出這麼多個節點：把值放進 `level`，並把它的左右小孩 push 進佇列（它們是下一層）。","這一層處理完，把 `level` 加進答案。"],pitfalls:["`range(len(q))` 的長度在迴圈開始時就固定了，迴圈中新 push 的小孩不會被算進這一層。"],complexity:{time:`O(n)`,space:`O(n)`},code:`class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        res = []
        q = deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res`,starter:`class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        `,presets:[{label:`[3,9,20,null,null,15,7]`,input:{root:[3,9,20,null,null,15,7]},expected:`[[3], [9, 20], [15, 7]]`},{label:`[1,2,3,4,5,null,6]`,input:{root:[1,2,3,4,5,null,6]},expected:`[[1], [2, 3], [4, 5, 6]]`},{label:`[]`,input:{root:[]},expected:`[]`}],trace({root:a}){let o=n(),s=r(a),c=i(s);if(!s)return o.push({line:[3,4],note:`空樹，直接回傳空陣列。`,views:[t.tree(`tree`,c)],result:`[]`}),o.frames;let l=[],u=[s],d=new Set,f=(e={})=>{let t={};return d.forEach(e=>t[e]=`visited`),u.forEach(e=>t[e.id]=`compare`),{...t,...e}},p=(e,n={},r)=>[t.tree(`tree`,c,{marks:f(n),pointers:r?{node:r.id}:{}}),t.queue(`q`,u.map(e=>e.val)),t.array(`level`,e)];for(o.push({line:[5,6],note:`把 root 放進佇列，準備開始一層一層走。`,views:p([]),vars:{res:e(l)}});u.length;){let t=u.length,n=[];o.push({line:[7,8,9],note:`佇列裡有 ${t} 個節點 —— 這就是**這一層**的全部節點。`,views:p(n),vars:{"len(q)":t,res:e(l)}});for(let r=0;r<t;r++){let t=u.shift();n.push(t.val);let r=[t.left,t.right].filter(e=>e!==null);u.push(...r),o.push({line:r.length?[10,11,12,13,14,15]:[10,11],note:`取出 \`${t.val}\` 放進 \`level\`。`+(r.length?`它的小孩 ${r.map(e=>`\`${e.val}\``).join(`、`)} 排進佇列，留到下一層處理。`:`它沒有小孩。`),views:p(n,{[t.id]:`active`},t),vars:{"len(q)":u.length,res:e(l)}}),d.add(t.id)}l.push(n),o.push({line:16,note:`這一層走完，把 \`${e(n)}\` 加進答案。`,views:p(n),vars:{res:e(l)}})}let m={};return c.nodes.forEach(e=>m[e.id]=`good`),o.push({line:17,note:`佇列空了，所有層都處理完畢。`,views:[t.tree(`tree`,c,{marks:m}),t.queue(`q`,[])],vars:{res:e(l)},result:e(l)}),o.frames}});export{o as default};