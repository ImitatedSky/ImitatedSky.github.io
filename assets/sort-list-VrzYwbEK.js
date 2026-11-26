import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=r({id:148,summary:`給一條單向鏈結串列的頭節點，把它依節點值**由小到大排序**後回傳。

進階要求：時間 O(n log n)。`,summaryEn:`Given the head of a singly linked list, **sort its nodes by value in ascending order** and return the new head.

Follow-up: do it in O(n log n) time.`,examples:[{input:`head = [4,2,1,3]`,output:`[1,2,3,4]`},{input:`head = [-1,5,3,4,0]`,output:`[-1,0,3,4,5]`},{input:`head = []`,output:`[]`}],constraints:[`0 ≤ 節點數 ≤ 5 × 10⁴`,`-10⁵ ≤ Node.val ≤ 10⁵`],constraintsEn:[`0 ≤ number of nodes ≤ 5 × 10⁴`,`-10⁵ ≤ Node.val ≤ 10⁵`],idea:"鏈結串列不能用索引隨機存取，快速排序、堆積排序都不好做，但**合併排序**非常適合：「找中點切兩半」用快慢指標走一趟就好；「合併兩條排好的串列」只需要改 `next` 指標，不用額外的陣列。切到只剩一個節點就一定是排好的，再兩兩合併回來。",steps:[`空串列或只有一個節點：直接回傳。`,"`slow` 一次走一步、`fast` 一次走兩步；`fast` 走到底時 `slow` 停在前半段的最後一個節點。","`mid = slow.next`，再把 `slow.next` 設成 `None`，把串列**真的切斷**成兩條。","遞迴排序左半 `head` 和右半 `mid`。","用 `dummy` 節點合併：每次把 `left`、`right` 中較小的那個接到 `tail` 後面，最後把還有剩的那一條整段接上。"],pitfalls:["`fast` 要從 `head.next` 出發。如果從 `head` 出發，兩個節點時 `slow` 會停在第二個，切出來的左半永遠是整條 → 無窮遞迴。","一定要 `slow.next = None` 切斷，否則左半邊還連著右半邊。","合併時用 `<=` 才是穩定排序（相等時先拿左邊的）。"],complexity:{time:`O(n log n)`,space:`O(log n)（遞迴堆疊）`},code:`class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:     # 0 或 1 個節點：本來就排好了
            return head
        # 1. 快慢指標找中點，把串列切成兩半
        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        mid = slow.next
        slow.next = None
        # 2. 兩半各自排序
        left = self.sortList(head)
        right = self.sortList(mid)
        # 3. 合併兩條排好的串列
        dummy = tail = ListNode()
        while left and right:
            if left.val <= right.val:
                tail.next = left
                left = left.next
            else:
                tail.next = right
                right = right.next
            tail = tail.next
        tail.next = left or right         # 剩下的那一段整個接上
        return dummy.next`,starter:`class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        `,presets:[{label:`[4,2,1,3]`,input:{head:[4,2,1,3]},expected:`[1, 2, 3, 4]`},{label:`[-1,5,3,4,0]`,input:{head:[-1,5,3,4,0]},expected:`[-1, 0, 3, 4, 5]`},{label:`[1]`,input:{head:[1]},expected:`[1]`}],trace({head:r}){let i=n(),a=r.length,o=e=>r[+e],s={};r.forEach((e,t)=>s[String(t)]=t+1<a?String(t+1):null);let c=r.map((e,t)=>String(t)),l=[],u=(e,n,r={},i={})=>{let a={};return c.forEach((t,r)=>{(r<e||r>=n)&&(a[t]=`muted`)}),[t.list(`串列（灰色 = 這一層遞迴管不到的部分）`,c.map(e=>({id:e,val:o(e),next:s[e]})),{pointers:r,marks:{...a,...i}}),t.stack(`呼叫堆疊`,l)]},d=t=>e(t.map(o)),f=(e,t)=>Object.fromEntries(e.map(e=>[e,t]));if(a===0)return i.push({line:[3,4],note:`空串列，直接回傳。`,views:u(0,0),result:`[]`}),i.frames;i.push({line:2,note:`用合併排序：把串列不斷對半切，切到每段只剩一個節點，再兩兩合併成排好的串列。`,views:u(0,a,{head:c[0]}),vars:{節點數:a}});let p=(e,t)=>{let n=c[e],r=t-e;if(l.push(`sortList(${d(c.slice(e,t))})`),r===1)return i.push({line:[3,4],note:`這一段只有 \`${o(n)}\` 一個節點 —— 一個節點本來就是排好的，直接回傳。`,views:u(e,t,{head:n},{[n]:`good`}),vars:{長度:1}}),l.pop(),n;let a=e,m=e+1,h=e=>e===null?null:c[e];for(i.push({line:[5,6],note:`排序 \`${d(c.slice(e,t))}\`。先找中點：\`slow\` 從 \`head\` 出發，\`fast\` 從 \`head.next\` 出發（多一步的起跑差，讓 \`slow\` 最後停在**前半段的尾巴**）。`,views:u(e,t,{slow:h(a),fast:h(m)}),vars:{長度:r}});m!==null&&m+1<t;)a+=1,m=m+2<t?m+2:null,i.push({line:[7,8,9],note:`\`fast\` 後面還有節點，所以 \`slow\` 走一步到 \`${o(c[a])}\`，\`fast\` 走兩步`+(m===null?"，走出串列變成 `None`。":`到 \`${o(c[m])}\`。`),views:u(e,t,{slow:h(a),fast:h(m)}),vars:{長度:r}});let g=a+1;s[c[a]]=null;let _=c.slice(e,g),v=c.slice(g,t);i.push({line:[7,10,11],note:(m===null?"`fast` 已經是 `None`":"`fast` 站在最後一個節點（`fast.next` 是 `None`）")+`，迴圈結束，\`slow\` 停在 \`${o(c[a])}\`。\`mid = slow.next\` 是右半的開頭，再把 \`slow.next\` 設成 \`None\` **切斷**：左半 \`${d(_)}\`、右半 \`${d(v)}\`。`,views:u(e,t,{head:n,slow:c[a],mid:c[g]},{...f(_,`active`),...f(v,`alt`)}),vars:{長度:r,左半:_.length,右半:v.length}}),p(e,g),p(g,t);let y=c.slice(e,g),b=c.slice(g,t),x=[],S=0,C=0,w=()=>{c.splice(e,r,...x,...y.slice(S),...b.slice(C))},T=n=>u(e,t,{...x.length?{tail:x[x.length-1]}:{},left:y[S]??null,right:b[C]??null},{...f(x,`good`),...f(y.slice(S),`active`),...f(b.slice(C),`alt`),...n?{[n]:`compare`}:{}});for(i.push({line:[13,14,16],note:`回到 \`${l[l.length-1]}\`：兩半都排好了，\`left = ${d(y)}\`、\`right = ${d(b)}\`。建立 \`dummy\`（畫面上省略），\`tail\` 指著合併結果的尾巴，開始合併。`,views:T(),vars:{left:o(y[0]),right:o(b[0])}});S<y.length&&C<b.length;){let e=o(y[S]),t=o(b[C]),n=e<=t,r=n?y[S]:b[C];x.length&&(s[x[x.length-1]]=r),x.push(r),n?S++:C++,w(),i.push({line:n?[17,18,19,20,24]:[17,18,21,22,23,24],note:n?`比較兩條的開頭：\`${e} <= ${t}\`，\`left\` 的 \`${e}\` 比較小（或相等），把它接到 \`tail\` 後面，\`left\` 往前一格。`:`比較兩條的開頭：\`${e} > ${t}\`，\`right\` 的 \`${t}\` 比較小，把它接到 \`tail\` 後面，\`right\` 往前一格。`,views:T(r),vars:{"left.val":e,"right.val":t,已合併:d(x)}})}let E=S<y.length?y.slice(S):b.slice(C),D=S<y.length?`left`:`right`;return s[x[x.length-1]]=E[0],x.push(...E),S=y.length,C=b.length,w(),i.push({line:[17,25,26],note:`\`${D===`left`?`right`:`left`}\` 用完了。\`${D}\` 剩下的 \`${d(E)}\` 本來就排好、而且都不小於已合併的部分，所以**整段直接接上**，不用一個一個比。回傳 \`dummy.next\`：\`${d(x)}\`。`,views:u(e,t,{head:x[0]},f(x,`good`)),vars:{已合併:d(x)}}),l.pop(),x[0]};return p(0,a),i.push({line:26,note:`最外層的合併也完成了，整條串列由小到大排好。一共切了約 log₂(${a}) 層，每一層合併都只走過所有節點一次。`,views:u(0,a,{head:c[0]},f(c,`good`)),vars:{節點數:a},result:e(c.map(o))}),i.frames}});export{i as default};