import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=`class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []  # min_stack[i] = stack[0..i] 之中的最小值

    def push(self, val: int) -> None:
        self.stack.append(val)
        self.min_stack.append(min(val, self.min_stack[-1]) if self.min_stack else val)

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]`,a=`操作 → 回傳值`,o=`min_stack（每一層記「到這層為止的最小值」）`,s=r({id:155,summary:"設計一個堆疊，除了一般的 `push`、`pop`、`top` 之外，還要支援 `getMin`：回傳目前堆疊中的**最小值**。\n\n四個操作都必須是 O(1)。輸入是一連串的操作，輸出是每個操作的回傳值（沒有回傳值的記為 `None`）。",summaryEn:"Design a stack that supports the usual `push`, `pop` and `top`, plus `getMin`, which returns the **smallest value** currently in the stack.\n\nAll four operations must run in O(1). The input is a sequence of operations; the output is each operation's return value (`None` for operations that return nothing).",examples:[{input:`["MinStack","push","push","push","getMin","pop","top","getMin"]
[[],[-2],[0],[-3],[],[],[],[]]`,output:`[null,null,null,null,-3,null,0,-2]`}],constraints:[`−2³¹ ≤ val ≤ 2³¹ − 1`,"`pop`、`top`、`getMin` 只會在堆疊不為空時被呼叫",`最多 3 × 10⁴ 次操作`],constraintsEn:[`−2³¹ ≤ val ≤ 2³¹ − 1`,"`pop`, `top` and `getMin` are only called on a non-empty stack",`At most 3 × 10⁴ operations`],idea:"只用一個變數記最小值不夠：最小值被 pop 掉之後，**「前一個最小值」是誰**就不知道了。因為堆疊只會從頂端增減，「堆疊高度為 i 時的最小值」永遠不會變 —— 所以用第二個堆疊 `min_stack` 同步記下每一層當下的最小值，兩個堆疊一起 push、一起 pop。",steps:["`push(val)`：`stack` 放入 `val`；`min_stack` 放入 `min(val, 目前的最小值)`（若為空就放 `val`）。","`pop()`：兩個堆疊各 pop 一次，保持高度一致。","`top()`：回傳 `stack[-1]`。","`getMin()`：回傳 `min_stack[-1]`，它就是目前所有元素的最小值。"],pitfalls:["`min_stack` 為空時不能取 `min_stack[-1]`，第一次 push 要特別處理。","若想省空間改成「只有遇到新的最小值才 push 進 `min_stack`」，判斷要用 `<=` 而不是 `<`，否則重複的最小值 pop 一次就會遺失。"],complexity:{time:`每個操作 O(1)`,space:`O(n)`},code:i,starter:`class MinStack:
    def __init__(self):
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        pass

    def getMin(self) -> int:
        pass`,presets:[{label:`push -2, 0, -3 → getMin, pop, top, getMin`,input:{ops:[`MinStack`,`push`,`push`,`push`,`getMin`,`pop`,`top`,`getMin`],args:[null,-2,0,-3,null,null,null,null]},expected:`[None, None, None, None, -3, None, 0, -2]`},{label:`最小值重複：push 5, 3, 7, 3 再一路 pop`,input:{ops:[`MinStack`,`push`,`push`,`push`,`push`,`getMin`,`pop`,`getMin`,`pop`,`getMin`,`pop`,`getMin`],args:[null,5,3,7,3,null,null,null,null,null,null,null]},expected:`[None, None, None, None, None, 3, None, 3, None, 3, None, 5]`},{label:`遞增：push 1, 2, 3 → getMin, top`,input:{ops:[`MinStack`,`push`,`push`,`push`,`getMin`,`top`,`pop`,`getMin`],args:[null,1,2,3,null,null,null,null]},expected:`[None, None, None, None, 1, 3, None, 1]`}],trace({ops:r,args:i}){let s=n(),c=[],l=[],u=[],d=e=>`${e}. ${r[e]}(${i[e]??``})`,f=(e,n=`active`)=>{let i=r.map((e,t)=>t<u.length?[d(t),u[t]===null?`None`:u[t]]:[d(t)]),o={};return r.forEach((t,r)=>{r===e?o[d(r)]=n:r>=u.length&&(o[d(r)]=`muted`)}),t.map(a,i,{marks:o})},p=(e,n,r,i=`active`)=>[f(e,i),t.stack(`stack`,c,{marks:n&&c.length?{[c.length-1]:n}:{}}),t.stack(o,l,{marks:r&&l.length?{[l.length-1]:r}:{}})];for(let e=0;e<r.length;e++){let t=r[e];if(t===`MinStack`)u.push(null),s.push({line:[2,3,4],note:"建立兩個空堆疊：`stack` 放真正的資料；`min_stack` 和它**同高**，每一層記的是「堆疊堆到這一層時的最小值」。",views:p(e)});else if(t===`push`){let t=i[e];c.push(t),s.push({line:[6,7],note:`\`push(${t})\`：先把 \`${t}\` 放進 \`stack\`。接著要決定 \`min_stack\` 這一層該記什麼。`,views:p(e,`active`,l.length?`compare`:void 0),vars:{val:t}});let n=l.length?l[l.length-1]:null,r=n===null?t:Math.min(t,n);l.push(r),u.push(null),s.push({line:8,note:n===null?`\`min_stack\` 是空的，\`${t}\` 是唯一的元素，當然就是最小值，直接記下 \`${t}\`。`:t<=n?`原本的最小值是 \`${n}\`，新來的 \`${t}\` ${t<n?`更小`:`一樣小`}：\`min(${t}, ${n}) = ${r}\`，這一層的最小值是 \`${r}\`。`:`原本的最小值是 \`${n}\`，新來的 \`${t}\` 比較大：\`min(${t}, ${n}) = ${r}\`，最小值沒變，但**還是要 push 一份** \`${r}\`，讓兩個堆疊保持同高。`,views:p(e,`active`,`active`),vars:{val:t,目前最小值:r}})}else if(t===`pop`)s.push({line:10,note:`\`pop()\`：要移除 \`stack\` 頂端的 \`${c[c.length-1]}\`。它對應的那一層最小值紀錄也跟著失效，兩邊要一起拿掉。`,views:p(e,`bad`,`bad`)}),c.pop(),l.pop(),u.push(null),s.push({line:[11,12],note:c.length?`兩個堆疊各 pop 一次。\`min_stack\` 的新頂端 \`${l[l.length-1]}\` 正是剩下這 ${c.length} 個元素的最小值 —— 完全不用重新掃描。`:`兩個堆疊各 pop 一次，現在都空了。`,views:p(e,void 0,c.length?`compare`:void 0),vars:c.length?{目前最小值:l[l.length-1]}:{}});else if(t===`top`){let t=c[c.length-1];u.push(t),s.push({line:[14,15],note:`\`top()\`：只看不拿，回傳 \`stack[-1] = ${t}\`。`,views:p(e,`good`,void 0,`good`),vars:{回傳:t}})}else{let t=l[l.length-1];u.push(t),s.push({line:[17,18],note:`\`getMin()\`：不用掃過整個 \`stack\`，\`min_stack\` 的頂端就是答案，回傳 \`${t}\`。O(1)。`,views:p(e,void 0,`good`,`good`),vars:{回傳:t}})}}return s.push({note:"所有操作執行完畢。每個操作都只碰到堆疊頂端，所以全部是 O(1)；代價是多用一個同樣高度的 `min_stack`。",views:p(null),result:e(u)}),s.frames}});export{s as default};