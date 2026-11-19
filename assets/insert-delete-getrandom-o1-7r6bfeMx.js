import{a as e,n as t,o as n}from"./AlgoApp-D095I_J-.js";import{t as r}from"./types-Dfvzj6n2.js";var i=r({id:380,summary:"設計一個集合 `RandomizedSet`，支援三個操作，而且**平均都要 O(1)**：\n\n`insert(val)`：`val` 不在集合裡就加入並回傳 `True`，已存在則回傳 `False`。`remove(val)`：`val` 在集合裡就移除並回傳 `True`，否則回傳 `False`。`getRandom()`：隨機回傳集合中的一個元素，每個元素被選到的機率要相同（呼叫時保證集合不是空的）。",summaryEn:"Design a set `RandomizedSet` with three operations, each running in **O(1) on average**:\n\n`insert(val)`: add `val` and return `True` if it is not in the set yet, otherwise return `False`. `remove(val)`: remove `val` and return `True` if it is in the set, otherwise return `False`. `getRandom()`: return a random element of the set, with every element equally likely (the set is guaranteed to be non-empty when this is called).",examples:[{input:`insert(1), remove(2), insert(2), getRandom(), remove(1), insert(2), getRandom()`,output:`true, false, true, 1 或 2, true, false, 2`}],constraints:[`-2³¹ ≤ val ≤ 2³¹ - 1`,`最多呼叫 2 × 10⁵ 次`,`呼叫 getRandom 時集合至少有一個元素`],constraintsEn:[`-2³¹ ≤ val ≤ 2³¹ - 1`,`At most 2 × 10⁵ calls in total`,`The set has at least one element whenever getRandom is called`],idea:`兩種結構各有一半的本事：**雜湊表**能 O(1) 查找和增刪，但沒辦法「隨機抽第 k 個」；**陣列**能用隨機索引 O(1) 抽，但從中間刪除要 O(n)。把兩個合起來：陣列存元素、雜湊表存「數值 → 索引」。刪除的關鍵是 —— 順序不重要，所以把**最後一個元素搬來補洞**，再把尾巴 pop 掉，就不用搬動其他人。`,steps:["`nums` 存所有元素；`pos[val]` 記 `val` 在 `nums` 的索引。","`insert`：已存在回傳 `False`；否則記下索引 `len(nums)`，append 到尾端。","`remove`：不存在回傳 `False`；否則找到它的索引 `i`，把最後一個元素 `last` 寫到 `nums[i]`、更新 `pos[last] = i`，再 pop 尾端並刪掉 `pos[val]`。","`getRandom`：`random.choice(nums)`，陣列裡每格機率相同。"],pitfalls:["`remove` 的順序很重要：要**先** `pos[last] = i`、**後** `del pos[val]`。當要刪的剛好就是最後一個元素（`val == last`）時，反過來寫會把剛刪掉的 key 又加回去。","只用 `set` 不行：`random.choice(list(s))` 每次都要 O(n) 轉成串列。","搬完元素別忘了更新它在 `pos` 裡的索引，否則下次刪它會刪錯位置。"],complexity:{time:`每個操作平均 O(1)`,space:`O(n)`},code:`class RandomizedSet:
    def __init__(self):
        self.nums = []  # 所有元素，順序不重要
        self.pos = {}   # 數值 -> 它在 nums 裡的索引

    def insert(self, val: int) -> bool:
        if val in self.pos:
            return False
        self.pos[val] = len(self.nums)
        self.nums.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.pos:
            return False
        i, last = self.pos[val], self.nums[-1]
        self.nums[i] = last  # 用最後一個元素補上這個洞
        self.pos[last] = i
        self.nums.pop()
        del self.pos[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.nums)`,starter:`class RandomizedSet:
    def __init__(self):
        pass

    def insert(self, val: int) -> bool:
        pass

    def remove(self, val: int) -> bool:
        pass

    def getRandom(self) -> int:
        pass`,presets:[{label:`插入、刪中間、刪尾端`,input:{ops:[[`insert`,5],[`insert`,8],[`insert`,3],[`insert`,9],[`remove`,8],[`getRandom`],[`remove`,3],[`remove`,7],[`getRandom`]]},expected:`[True, True, True, True, True, 9, True, False, 5]`},{label:`LeetCode 範例`,input:{ops:[[`insert`,1],[`remove`,2],[`insert`,2],[`getRandom`],[`remove`,1],[`insert`,2],[`getRandom`]]},expected:`[True, False, True, 2, True, False, 2]`},{label:`刪到空再插入`,input:{ops:[[`insert`,4],[`remove`,4],[`insert`,4],[`insert`,4],[`getRandom`]]},expected:`[True, True, True, False, 4]`}],trace({ops:r}){let i=n(),a=[],o=new Map,s=[],c=0,l=r.map(e=>e[0]===`insert`?`+${e[1]}`:e[0]===`remove`?`−${e[1]}`:`?`),u=e=>e[0]===`getRandom`?`getRandom()`:`${e[0]}(${e[1]})`,d=(e,n={})=>{let i={};for(let t=0;t<Math.min(e,r.length);t++)i[t]=`visited`;return e>=0&&e<r.length&&(i[e]=n.opTone??`active`),[t.array(`操作（+ insert、− remove、? getRandom）`,l,{marks:i,pointers:e>=0&&e<r.length?{現在:e}:{}}),t.array(`nums`,a,{marks:n.numMarks??{},pointers:n.numPointers??{}}),t.map(`pos（數值 → 索引）`,o,{marks:n.posMarks??{}}),t.array(`回傳值（對應上面每個操作）`,r.map((e,t)=>t<s.length?s[t]:``),{marks:e>=0&&e<s.length?{[e]:n.opTone===`bad`?`bad`:`good`}:{}})]};return i.push({line:[2,3,4],note:"建立兩個結構：`nums` 陣列放元素（讓 getRandom 可以用索引抽），`pos` 雜湊表記每個數值在 `nums` 的哪一格（讓查找和刪除不用掃陣列）。",views:d(-1)}),r.forEach((e,t)=>{let n=u(e);if(e[0]===`insert`){let r=e[1];if(o.has(r)){s.push(!1),i.push({line:[6,7,8],note:`\`${n}\`：\`${r}\` 已經在 \`pos\` 裡（索引 ${o.get(r)}），集合不能有重複，回傳 \`False\`。`,views:d(t,{opTone:`bad`,numMarks:{[o.get(r)]:`bad`},posMarks:{[String(r)]:`bad`}}),vars:{val:r}});return}i.push({line:[6,7],note:`\`${n}\`：先查 \`pos\`，\`${r}\` 不在裡面，可以加入。雜湊表讓這個檢查是 O(1)。`,views:d(t),vars:{val:r}}),o.set(r,a.length),a.push(r),s.push(!0),i.push({line:[9,10,11],note:`接在 \`nums\` 尾端（索引 ${a.length-1}），同時記下 \`pos[${r}] = ${a.length-1}\`。回傳 \`True\`。`,views:d(t,{numMarks:{[a.length-1]:`good`},posMarks:{[String(r)]:`good`}}),vars:{val:r}});return}if(e[0]===`remove`){let r=e[1];if(!o.has(r)){s.push(!1),i.push({line:[13,14,15],note:`\`${n}\`：\`${r}\` 不在 \`pos\` 裡，沒有東西可以刪，回傳 \`False\`。`,views:d(t,{opTone:`bad`}),vars:{val:r}});return}let c=o.get(r),l=a.length-1,u=a[l],f=c===l;i.push({line:[13,14,16],note:f?`\`${n}\`：查 \`pos\` 得知 \`${r}\` 在索引 \`i = ${c}\`，它剛好就是最後一個元素（\`last = ${u}\`）。`:`\`${n}\`：查 \`pos\` 得知 \`${r}\` 在索引 \`i = ${c}\`。直接從中間挖掉要搬動後面所有人，所以改找最後一個元素 \`last = ${u}\` 來補洞。`,views:d(t,{numMarks:f?{[c]:`bad`}:{[c]:`bad`,[l]:`alt`},numPointers:{i:c,last:l},posMarks:f?{[String(r)]:`bad`}:{[String(r)]:`bad`,[String(u)]:`alt`}}),vars:{val:r,i:c,last:u}}),a[c]=u,o.set(u,c),i.push({line:[17,18],note:f?`\`nums[${c}] = ${u}\`、\`pos[${u}] = ${c}\`：自己蓋自己，什麼都沒變 —— 同一套程式不用特判這個情況。`:`把 \`${u}\` 抄到 \`nums[${c}]\` 蓋掉 \`${r}\`，並更新 \`pos[${u}] = ${c}\`。現在尾端多了一份重複的 \`${u}\`。`,views:d(t,{numMarks:f?{[c]:`bad`}:{[c]:`alt`,[l]:`muted`},numPointers:{i:c,last:l},posMarks:f?{[String(r)]:`bad`}:{[String(r)]:`bad`,[String(u)]:`alt`}}),vars:{val:r,i:c,last:u}}),a.pop(),o.delete(r),s.push(!0),i.push({line:[19,20,21],note:`pop 掉尾端（O(1)），再刪掉 \`pos[${r}]\`。\`${r}\` 消失了，其他元素一格都沒搬。回傳 \`True\`。`,views:d(t,{numMarks:f?{}:{[c]:`good`},posMarks:f?{}:{[String(u)]:`good`}}),vars:{val:r,i:c,last:u}});return}let r=(c+1)%a.length;c++,s.push(a[r]),i.push({line:[23,24],note:`\`${n}\`：元素緊密排在 \`nums\` 的索引 0 ~ ${a.length-1}，隨機挑一個索引就是等機率抽樣。這裡假設抽到索引 ${r}，回傳 \`${a[r]}\`。`,views:d(t,{numMarks:{[r]:`good`},numPointers:{random:r}})})}),i.push({note:`所有操作做完。每個操作都只碰了陣列尾端和雜湊表的一兩個 key，所以平均都是 O(1)。`,views:d(r.length),result:e(s)}),i.frames}});export{i as default};