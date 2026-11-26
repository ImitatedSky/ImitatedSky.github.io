import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=`class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}                        # key -> Node
        self.head, self.tail = Node(), Node()  # 哨兵：head 後面最久沒用，tail 前面最近用過
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):                   # 把 node 從串列中拔掉
        node.prev.next, node.next.prev = node.next, node.prev

    def _append(self, node):                   # 把 node 接到 tail 前面（最近使用）
        last = self.tail.prev
        last.next, node.prev = node, last
        node.next, self.tail.prev = self.tail, node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)                     # 被用到了：移到最近使用的那一端
        self._append(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])      # 舊節點先拔掉
        node = Node(key, value)
        self.cache[key] = node
        self._append(node)
        if len(self.cache) > self.cap:
            lru = self.head.next               # 最久沒用的在 head 後面
            self._remove(lru)
            del self.cache[lru.key]`,a=i.split(`
`),o=e=>{let t=a.findIndex(t=>t.includes(e));if(t<0)throw Error(`lru-cache: no code line contains "${e}"`);return t+1},s={init:[o(`self.cap = capacity`),o(`self.cache = {}`),o(`self.head, self.tail = Node(), Node()`),o(`self.head.next, self.tail.prev`)],remove:[o(`node.prev.next, node.next.prev`)],append:[o(`last = self.tail.prev`),o(`last.next, node.prev`),o(`node.next, self.tail.prev`)],getMiss:[o(`if key not in self.cache`),o(`return -1`)],getFind:[o(`if key not in self.cache`),o(`node = self.cache[key]`)],getMove:[o(`self._remove(node)`),o(`self._append(node)`),o(`return node.val`)],putHas:[o(`if key in self.cache`),o(`self._remove(self.cache[key])`)],putCheck:o(`if key in self.cache`),putNew:[o(`node = Node(key, value)`),o(`self.cache[key] = node`),o(`self.cache[key] = node`)+1],capCheck:o(`if len(self.cache) > self.cap`),lru:o(`lru = self.head.next`),evict:[o(`self._remove(lru)`),o(`del self.cache[lru.key]`)]},c=r({id:146,summary:"設計一個容量固定的 **LRU（Least Recently Used，最近最少使用）快取**，支援兩個操作：\n\n`get(key)`：key 存在就回傳它的值，否則回傳 `-1`。\n\n`put(key, value)`：新增或更新這筆資料；如果因此超過容量，就把**最久沒有被使用**的那一筆淘汰掉。`get` 和 `put` 都算「使用」，而且兩者都必須是平均 O(1)。",summaryEn:"Design a fixed-capacity **LRU (Least Recently Used) cache** with two operations:\n\n`get(key)`: return the key's value if it exists, otherwise `-1`.\n\n`put(key, value)`: insert or update the entry; if that pushes the cache over capacity, evict the entry that has gone **unused the longest**. Both `get` and `put` count as a use, and both must run in O(1) on average.",examples:[{input:`LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)`,output:`[null, null, null, 1, null, -1, null, -1, 3, 4]`,note:`put(3,3) 淘汰 key 2；put(4,4) 淘汰 key 1`,noteEn:`put(3,3) evicts key 2; put(4,4) evicts key 1`}],constraints:[`1 ≤ capacity ≤ 3000`,`0 ≤ key, value ≤ 10⁵`,`get 與 put 平均時間複雜度必須是 O(1)`],constraintsEn:[`1 ≤ capacity ≤ 3000`,`0 ≤ key, value ≤ 10⁵`,`get and put must run in O(1) average time`],idea:"需要兩種能力：**O(1) 找到 key**（雜湊表）以及 **O(1) 維護「誰最久沒用」的順序**（雙向鏈結串列）。串列依使用時間排序：`head` 這一側最久沒用，`tail` 這一側最近用過。雜湊表存 `key → 節點`，所以一拿到節點就能原地把它拔掉、再接到 `tail` 前面，完全不用走訪。",steps:["建立兩個哨兵節點 `head`、`tail` 互相連接，之後插入、刪除都不必處理空串列或邊界。","寫兩個小工具：`_remove(node)` 把節點從串列拔掉；`_append(node)` 把節點接到 `tail` 前面。","`get`：不在雜湊表裡回傳 `-1`；否則把節點拔掉再接到尾端（標記成最近使用），回傳值。","`put`：key 已存在就先拔掉舊節點；建立新節點、寫進雜湊表、接到尾端。","若數量超過容量，`head.next` 就是最久沒用的節點：把它從串列**和雜湊表**一起刪掉。"],pitfalls:["節點裡要同時存 `key`：淘汰時是從串列拿到節點，得靠 `lru.key` 才能回頭刪雜湊表裡的那一筆。","`get` 也算使用，別忘了把節點移到最近使用的那一端。","一定要用**雙向**串列：只有知道 `prev`，才能在 O(1) 把中間的節點拔掉。",`淘汰時串列和雜湊表都要刪，漏掉一邊就會出現「查得到但其實已淘汰」的幽靈資料。`],complexity:{time:`get、put 皆為 O(1)`,space:`O(capacity)`},code:i,starter:`class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass`,presets:[{label:`容量 2：經典範例`,input:{capacity:2,ops:[[`put`,1,1],[`put`,2,2],[`get`,1],[`put`,3,3],[`get`,2],[`put`,4,4],[`get`,1],[`get`,3],[`get`,4]]},expected:`[None, None, 1, None, -1, None, -1, 3, 4]`},{label:`容量 3：更新已存在的 key`,input:{capacity:3,ops:[[`put`,1,10],[`put`,2,20],[`put`,3,30],[`put`,1,11],[`put`,4,40],[`get`,2],[`get`,1],[`get`,3]]},expected:`[None, None, None, None, None, -1, 11, 30]`},{label:`容量 1`,input:{capacity:1,ops:[[`put`,2,1],[`get`,2],[`put`,3,2],[`get`,2],[`get`,3]]},expected:`[None, 1, None, -1, 2]`}],trace({capacity:r,ops:i}){let a=n(),o=[],c=new Map,l=[],u=e=>e[0]===`put`?`put(${e[1]}, ${e[2]})`:`get(${e[1]})`,d=e=>`${e+1}. ${u(i[e])}`,f=e=>`k${e}`,p=(n,r={})=>{let a=[{id:`H`,val:`H`},...o.map(e=>({id:f(e),val:`${e}:${c.get(e)}`})),{id:`T`,val:`T`}],s=i.map((t,n)=>n<l.length?[d(n),e(l[n])]:[d(n)]),u={};return i.forEach((e,t)=>{t<l.length&&(r.finished||t!==n)?u[d(t)]=`visited`:t===n&&(u[d(t)]=`active`)}),[t.map(`操作 → 回傳值`,s,{marks:u}),t.list(`雙向鏈結串列 key:value（H 後面最久沒用 → T 前面最近使用）`,a,{marks:r.list??{},pointers:r.pointers??{}}),t.map(`cache（key → 節點）`,[...c.entries()].map(([e,t])=>[e,`節點 ${e}:${t}`]),{marks:r.map??{}})]},m=e=>({操作:u(i[e]),"len(cache)":c.size,cap:r});return a.push({line:s.init,note:`建立容量 ${r} 的快取：空的雜湊表，加上只有兩個哨兵 \`H\`（head）、\`T\`（tail）的雙向串列。真正的資料節點都會夾在兩個哨兵之間，越靠近 \`T\` 代表越近期被用過。`,views:p(-1),vars:{"len(cache)":0,cap:r}}),i.forEach((e,t)=>{if(e[0]===`get`){let n=e[1];if(!c.has(n)){l.push(-1),a.push({line:s.getMiss,note:`\`get(${n})\`：雜湊表裡沒有 key \`${n}\`${i.slice(0,t).some(e=>e[0]===`put`&&e[1]===n)?`（之前被淘汰了）`:``}，回傳 \`-1\`。沒有命中，串列順序不變。`,views:p(t),vars:{...m(t),回傳:-1}});return}let r=c.get(n),u=o[o.length-1]===n;a.push({line:s.getFind,note:`\`get(${n})\`：查雜湊表，O(1) 直接拿到節點 \`${n}:${r}\`，不必沿著串列找。`,views:p(t,{list:{[f(n)]:`active`},map:{[String(n)]:`active`},pointers:{node:f(n)}}),vars:m(t)}),o=[...o.filter(e=>e!==n),n],l.push(r),a.push({line:[...s.getMove,...s.remove,...s.append],note:(u?"它剛被用到，要排到最近使用的那一端。它本來就在 `T` 前面，拔掉再接回去位置不變。":"它剛被用到，所以 `_remove` 把它從原位拔掉，`_append` 再接到 `T` 前面 —— 現在它是**最近使用**的。")+`回傳 \`${r}\`。`,views:p(t,{list:{[f(n)]:`good`},map:{[String(n)]:`good`},pointers:{node:f(n)}}),vars:{...m(t),回傳:r}});return}let[,n,u]=e,d=!1;c.has(n)&&(d=!0,a.push({line:[...s.putHas,...s.remove],note:`\`put(${n}, ${u})\`：key \`${n}\` 已經存在（舊值 \`${c.get(n)}\`）。先用 \`_remove\` 把舊節點從串列拔掉，等一下換上新的。`,views:p(t,{list:{[f(n)]:`bad`},map:{[String(n)]:`bad`}}),vars:m(t)}),o=o.filter(e=>e!==n)),c.set(n,u),o.push(n);let h=c.size>r;if(a.push({line:[...d?[]:[s.putCheck],...s.putNew,...s.append,...h?[]:[s.capCheck]],note:(d?`建立新節點 \`${n}:${u}\`，覆蓋雜湊表裡 key \`${n}\` 的那一筆，並接到 \`T\` 前面。`:`\`put(${n}, ${u})\`：key \`${n}\` 是新的。建立節點 \`${n}:${u}\`、寫進雜湊表，並用 \`_append\` 接到 \`T\` 前面（剛寫入也算最近使用）。`)+(h?``:`目前 ${c.size} 筆，沒有超過容量 ${r}。`),views:p(t,{list:{[f(n)]:`active`},map:{[String(n)]:`active`},pointers:{node:f(n)}}),vars:m(t)}),h){let e=o[0];a.push({line:[s.capCheck,s.lru],note:`現在有 ${c.size} 筆，**超過容量 ${r}**，必須淘汰一筆。串列是照使用時間排的，所以 \`H\` 後面那個節點 \`${e}:${c.get(e)}\` 就是最久沒被用到的 —— 不用找，O(1) 就拿到。`,views:p(t,{list:{[f(n)]:`active`,[f(e)]:`bad`},map:{[String(n)]:`active`,[String(e)]:`bad`},pointers:{lru:f(e)}}),vars:m(t)}),o=o.slice(1),c.delete(e),a.push({line:[...s.evict,...s.remove],note:`把它從串列拔掉，再用節點裡存的 \`lru.key = ${e}\` 把雜湊表那一筆也刪掉。這就是節點必須同時存 key 的原因。`,views:p(t,{list:{[f(n)]:`active`},map:{[String(n)]:`active`}}),vars:m(t)})}l.push(null)}),a.push({note:"所有操作執行完畢。每個 `get`、`put` 都只動了固定幾條指標和一次雜湊表查詢，所以都是 O(1)。",views:p(-1,{finished:!0}),vars:{"len(cache)":c.size,cap:r},result:e(l)}),a.frames}});export{c as default};