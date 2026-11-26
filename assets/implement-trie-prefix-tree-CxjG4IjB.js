import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=r({id:208,summary:"實作 **Trie（字首樹）**，支援三種操作：\n\n`insert(word)` 把單字存進去；`search(word)` 回答這個單字**完整地**被存過嗎；`startsWith(prefix)` 回答有沒有任何已存的單字以 `prefix` 開頭。",summaryEn:"Implement a **Trie (prefix tree)** with three operations:\n\n`insert(word)` stores a word; `search(word)` tells whether that exact word was **stored in full**; `startsWith(prefix)` tells whether any stored word begins with `prefix`.",examples:[{input:`ops = ["Trie","insert","search","search","startsWith","insert","search"]
args = [[],["apple"],["apple"],["app"],["app"],["app"],["app"]]`,output:`[null,null,true,false,true,null,true]`,note:`第一次 search("app") 是 false：路徑存在，但沒有單字在那裡結束`,noteEn:`the first search("app") is false: the path exists, but no word ends there`}],constraints:[`1 ≤ word.length, prefix.length ≤ 2000`,`只包含小寫英文字母`,`操作總數 ≤ 3 × 10⁴`],constraintsEn:[`1 ≤ word.length, prefix.length ≤ 2000`,`Only lowercase English letters`,`Total operations ≤ 3 × 10⁴`],idea:"Trie 是一棵「**邊上寫字母**」的樹：從根沿著邊走，經過的字母串起來就是一個前綴，所以有共同前綴的單字會**共用同一段路徑**。每個節點多記一個 `end` 旗標表示「有單字剛好在這裡結束」—— `search` 和 `startsWith` 的差別就只在要不要看這個旗標。",steps:["節點有 `children`（字母 → 子節點的雜湊表）和 `end` 旗標；Trie 一開始只有一個空的根節點。","`insert`：從根出發逐字母往下走，缺哪條邊就新建節點，走完後把最後的節點標成 `end = True`。","`_find`：從根出發逐字母往下走，途中缺邊就回傳 `None`，走完就回傳停下來的節點。","`search` = 找得到節點**而且** `end` 為真；`startsWith` = 找得到節點就好。"],pitfalls:["`search` 一定要檢查 `end`：存了 `apple` 之後，`app` 的路徑存在，但 `app` 並沒有被存過。","`insert` 一個已存在單字的前綴時不會新增任何節點，只是把中途的節點標成 `end`。"],complexity:{time:`每個操作 O(L)，L 為字串長度`,space:`O(所有插入單字的總長度)`},code:`class TrieNode:
    def __init__(self):
        self.children = {}  # 字母 -> 子節點
        self.end = False    # 是否有單字在這裡結束


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True

    def _find(self, s: str) -> Optional[TrieNode]:
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.end

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None`,starter:`class Trie:
    def __init__(self):
        pass

    def insert(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass

    def startsWith(self, prefix: str) -> bool:
        pass`,presets:[{label:`分岔：car / cat / dog`,input:{ops:[`Trie`,`insert`,`insert`,`insert`,`search`,`startsWith`,`search`,`search`],args:[``,`car`,`cat`,`dog`,`ca`,`ca`,`cow`,`dog`]},expected:`[None, None, None, None, False, True, False, True]`},{label:`apple / app`,input:{ops:[`Trie`,`insert`,`search`,`search`,`startsWith`,`insert`,`search`],args:[``,`apple`,`apple`,`app`,`app`,`app`,`app`]},expected:`[None, None, True, False, True, None, True]`},{label:`空的 trie`,input:{ops:[`Trie`,`search`,`startsWith`,`insert`,`search`],args:[``,`a`,`a`,`a`,`a`]},expected:`[None, False, False, None, True]`}],trace({ops:r,args:i}){let a=n(),o={id:`root`,children:new Map,end:!1},s=[],c=r.map((e,t)=>`${t+1}. ${e===`Trie`?`Trie()`:`${e}("${i[t]}")`}`),l=()=>{let e=[],t={},n={},r=i=>{e.push({id:i.id,val:i===o?`root`:i.end?`✓`:``,children:[...i.children.values()].map(e=>e.id)}),i.end&&(n[i.id]=`good`);for(let[e,n]of i.children)t[`${i.id}>${n.id}`]=e,r(n)};return r(o),{nodes:e,edgeLabels:t,marks:n}},u=n=>{let{nodes:r,edgeLabels:i,marks:a}=l(),u=n.path??[],d=u[u.length-1],f={};for(let e=1;e<u.length;e++)f[`${u[e-1].id}>${u[e].id}`]=`active`;d&&(a[d.id]=n.nodeTone??`active`);let p=n.word??``,m=n.i??0,h={};for(let e=0;e<p.length;e++)e<m?h[e]=`visited`:e===m&&n.charTone&&(h[e]=n.charTone);let g=c.map((t,n)=>n<s.length?[t,e(s[n])]:[t]);return[t.tree(`trie（邊 = 字母，✓ = 有單字在此結束，紫色 = node）`,{nodes:r,root:o.id},{marks:a,edgeLabels:i,edgeMarks:f}),t.chars(`目前的字串`,p,{marks:h,pointers:n.charTone&&m<p.length?{ch:m}:{}}),t.map(`操作 → 回傳值`,g,{marks:{[c[n.k]]:n.opTone??`active`}})]},d=[o],f=(e,t,n,r)=>{let i=[o];d=i,a.push({line:[r,20],note:`${n}：呼叫 \`_find("${t}")\`，\`node\` 從根節點出發，照著字母一條邊一條邊往下走。`,views:u({k:e,word:t,path:i})});for(let n=0;n<t.length;n++){let r=t[n],o=i[i.length-1].children.get(r);if(!o)return a.push({line:[21,22,23],note:`需要字母 \`${r}\`，但目前節點底下沒有 \`${r}\` 這條邊 —— trie 裡沒有任何單字以 \`${t.slice(0,n+1)}\` 開頭，\`_find\` 回傳 \`None\`。`,views:u({k:e,word:t,i:n,path:i,nodeTone:`bad`,charTone:`bad`}),vars:{ch:r}}),null;i.push(o),a.push({line:[21,22,24],note:`有 \`${r}\` 這條邊，沿著它往下走。目前走過的前綴是 \`${t.slice(0,n+1)}\`。`,views:u({k:e,word:t,i:n,path:i,charTone:`active`}),vars:{ch:r}})}return i[i.length-1]};r.forEach((t,n)=>{let r=i[n];if(t===`Trie`)s.push(null),a.push({line:[8,9],note:`建立一棵空的 trie：只有一個根節點，代表「空字串」這個前綴。`,views:u({k:n,path:[o]})});else if(t===`insert`){let e=[o];a.push({line:12,note:`\`insert("${r}")\`：\`node\` 從根節點出發，準備把每個字母變成一條邊。`,views:u({k:n,word:r,path:e})});for(let t=0;t<r.length;t++){let i=r[t],o=e[e.length-1],s=o.children.get(i),c=!s;s||(s={id:`t-${r.slice(0,t+1)}`,children:new Map,end:!1},o.children.set(i,s)),e.push(s),a.push({line:c?[13,14,15,16]:[13,14,16],note:c?`目前節點沒有 \`${i}\` 這條邊，新建一個節點接上去，再走過去。`:`\`${i}\` 這條邊已經存在（前綴 \`${r.slice(0,t+1)}\` 和之前的單字共用），不用新增，直接走過去。`,views:u({k:n,word:r,i:t,path:e,charTone:`active`,nodeTone:c?`alt`:`active`}),vars:{ch:i}})}e[e.length-1].end=!0,s.push(null),a.push({line:17,note:`字母走完，把停下來的節點標成 \`end = True\`：代表從根走到這裡剛好拼出一個完整的單字 \`${r}\`。`,views:u({k:n,word:r,i:r.length,path:e,nodeTone:`good`,opTone:`good`})})}else if(t===`search`){let t=f(n,r,`\`search("${r}")\``,28),i=t!==null&&t.end;s.push(i),a.push({line:t?[25,28,29]:[28,29],note:t?i?`整個字串走完，而且停下來的節點 \`end = True\` —— \`${r}\` 確實被存過，回傳 \`True\`。`:`整個字串走完了，路徑存在，但停下來的節點 \`end = False\`：\`${r}\` 只是別的單字的**前綴**，本身沒被存過，回傳 \`False\`。`:"`_find` 回傳 `None`，路徑根本不存在，`search` 回傳 `False`。",views:u({k:n,word:r,i:d.length-1,path:d,nodeTone:i?`good`:`bad`,opTone:i?`good`:`bad`}),vars:t?{"node.end":e(t.end)}:{node:`None`}})}else{let e=f(n,r,`\`startsWith("${r}")\``,31),t=e!==null;s.push(t),a.push({line:e?[25,31]:31,note:t?`整個前綴都走得到就夠了，**不用看 \`end\`** —— 這個節點底下（含自己）一定有單字以 \`${r}\` 開頭，回傳 \`True\`。`:`\`_find\` 回傳 \`None\`，沒有任何單字以 \`${r}\` 開頭，回傳 \`False\`。`,views:u({k:n,word:r,i:d.length-1,path:d,nodeTone:t?`compare`:`bad`,opTone:t?`good`:`bad`})})}});let p=r.length-1;return a.push({note:`所有操作執行完畢。依序的回傳值是 \`${e(s)}\`。`,views:u({k:p,opTone:`visited`}),result:e(s)}),a.frames}});export{i as default};