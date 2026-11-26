import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=r({id:211,summary:"設計一個單字字典，支援兩種操作：\n\n`addWord(word)` 把單字加進字典；`search(word)` 回答字典裡有沒有符合的單字 —— 查詢字串可以包含 `.`，每個 `.` 能代表**任意一個字母**。",summaryEn:"Design a word dictionary with two operations:\n\n`addWord(word)` adds a word; `search(word)` tells whether any stored word matches. The query may contain `.`, and each `.` can stand for **any single letter**.",examples:[{input:`ops = ["WordDictionary","addWord","addWord","addWord","search","search","search","search"]
args = [[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]`,output:`[null,null,null,null,false,true,true,true]`}],constraints:[`1 ≤ word.length ≤ 25`,"addWord 的單字只有小寫字母；search 的字串可含 `.`",`操作總數 ≤ 10⁴`],constraintsEn:[`1 ≤ word.length ≤ 25`,"addWord words contain only lowercase letters; search strings may contain `.`",`Total operations ≤ 10⁴`],idea:"用 **Trie** 存單字。查詢時遇到一般字母，只有一條邊可以走；遇到 `.` 就不知道該走哪條 —— 那就**每個小孩都試**（DFS + 回溯），只要有一條路能走到底而且停在單字結尾就算找到。",steps:["`addWord`：標準的 trie 插入，逐字母往下走、缺邊就新建節點，最後標記 `end = True`。","`search` 用遞迴 `dfs(node, i)`：目前站在 `node`，要比對 `word[i]`。","`i == len(word)`：字串用完了，答案是 `node.end`。","`word[i]` 是 `.`：對每個小孩遞迴 `dfs(child, i + 1)`，任一個成功就成功。","否則是一般字母：沒有那條邊就 `False`，有就沿著它繼續遞迴。"],pitfalls:["字串走完時要回傳 `node.end`，不是 `True`：路徑存在不代表有單字在這裡結束。","`.` 一定要消耗**一個**字母：節點沒有小孩時 `any([])` 是 `False`，所以查詢比單字長時會正確失敗。","`any(...)` 搭配產生器會短路，找到一條成功的路就不再試其他小孩。"],complexity:{time:"addWord O(L)；search 沒有 `.` 時 O(L)，最壞（全是 `.`）要走遍相關的子樹，O(26^L)",space:`O(所有單字的總長度)，遞迴深度 O(L)`},code:`class TrieNode:
    def __init__(self):
        self.children = {}  # 字母 -> 子節點
        self.end = False    # 是否有單字在這裡結束


class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return node.end
            ch = word[i]
            if ch == ".":  # 萬用字元：每個小孩都試試看
                return any(dfs(child, i + 1) for child in node.children.values())
            if ch not in node.children:
                return False
            return dfs(node.children[ch], i + 1)

        return dfs(self.root, 0)`,starter:`class WordDictionary:
    def __init__(self):
        pass

    def addWord(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass`,presets:[{label:`bat / cab / can（會回溯）`,input:{ops:[`WordDictionary`,`addWord`,`addWord`,`addWord`,`search`,`search`,`search`,`search`],args:[``,`bat`,`cab`,`can`,`..n`,`.a`,`ca.`,`bat.`]},expected:`[None, None, None, None, True, False, True, False]`},{label:`bad / dad / mad`,input:{ops:[`WordDictionary`,`addWord`,`addWord`,`addWord`,`search`,`search`,`search`,`search`],args:[``,`bad`,`dad`,`mad`,`pad`,`bad`,`.ad`,`b..`]},expected:`[None, None, None, None, False, True, True, True]`},{label:`空字典與單一字母`,input:{ops:[`WordDictionary`,`search`,`addWord`,`search`,`search`,`search`],args:[``,`.`,`a`,`.`,`..`,`a`]},expected:`[None, False, None, True, False, True]`}],trace({ops:r,args:i}){let a=n(),o={id:`root`,prefix:``,children:new Map,end:!1},s=[],c=r.map((e,t)=>`${t+1}. ${e===`WordDictionary`?`WordDictionary()`:`${e}("${i[t]}")`}`),l=n=>{let r=[],i={},a={},l=e=>{r.push({id:e.id,val:e===o?`root`:e.end?`✓`:``,children:[...e.children.values()].map(e=>e.id)}),e.end&&(a[e.id]=`good`);for(let[t,n]of e.children)i[`${e.id}>${n.id}`]=t,l(n)};l(o);let u=n.path??[],d=u[u.length-1],f={};n.dead?.forEach(e=>f[e]=`bad`);for(let e=1;e<u.length;e++)f[`${u[e-1].id}>${u[e].id}`]=n.pathTone??`active`;d&&(a[d.id]=n.nodeTone??`active`),d&&n.next&&(f[`${d.id}>${n.next.id}`]=`compare`,n.next.end||(a[n.next.id]=`compare`));let p=n.word??``,m=n.i??0,h={};for(let e=0;e<p.length;e++)e<m?h[e]=n.pathTone===`good`?`good`:`visited`:e===m&&n.charTone&&(h[e]=n.charTone);let g=c.map((t,n)=>n<s.length?[t,e(s[n])]:[t]);return[t.tree(`trie（邊 = 字母，✓ = 單字結尾，紫色 = node）`,{nodes:r,root:o.id},{marks:a,edgeLabels:i,edgeMarks:f}),t.stack(`遞迴堆疊 dfs(前綴, i)`,n.stack?u.map((e,t)=>`dfs("${e.prefix}", ${t})`):[]),t.chars(`word`,p,{marks:h,pointers:n.stack&&m<=p.length&&p.length?{i:m}:{}}),t.map(`操作 → 回傳值`,g,{marks:{[c[n.k]]:n.opTone??`active`}})]};return r.forEach((t,n)=>{let r=i[n];if(t===`WordDictionary`){s.push(null),a.push({line:[8,9],note:`建立空的字典：底層是一棵只有根節點的 trie。`,views:l({k:n,path:[o]})});return}if(t===`addWord`){let e=[o],t=!1;for(let i=0;i<r.length;i++){let o=r[i],s=e[e.length-1],c=s.children.get(o),u=!c;c||(c={id:`t-${r.slice(0,i+1)}`,prefix:r.slice(0,i+1),children:new Map,end:!1},s.children.set(o,c),t=!0),e.push(c),a.push({line:[...i===0?[12]:[],...u?[13,14,15,16]:[13,14,16]],note:(i===0?`\`addWord("${r}")\`：從根節點出發。`:``)+(u?`目前節點沒有 \`${o}\` 這條邊，新建節點接上去再走過去。`:`\`${o}\` 這條邊已經有了（和之前的單字共用前綴 \`${r.slice(0,i+1)}\`），直接走過去。`),views:l({k:n,word:r,i,path:e,charTone:`active`,nodeTone:u?`alt`:`active`}),vars:{ch:o}})}e[e.length-1].end=!0,s.push(null),a.push({line:17,note:`字母走完，把最後的節點標成 \`end = True\`，\`${r}\` 存好了${t?``:`（沒有新增任何節點，只多了一個結尾標記）`}。`,views:l({k:n,word:r,i:r.length,path:e,nodeTone:`good`,opTone:`good`})});return}let c=[],u=new Set,d=[],f=(e={})=>({k:n,word:r,i:c.length-1,path:c,dead:u,stack:!0,...e}),p=(t,n)=>{c.push(t);let i=n===0?`\`search("${r}")\`：呼叫 \`dfs(root, 0)\`。`:``;try{if(n===r.length)return a.push({line:[21,22],note:t.end?`${i}\`i == len(word)\`，字串剛好用完，而且這個節點 \`end = True\` —— 找到符合的單字 \`${t.prefix}\`，回傳 \`True\`。`:`${i}\`i == len(word)\`，字串用完了，但這個節點 \`end = False\`：\`${t.prefix}\` 只是某個單字的前綴，不算，回傳 \`False\`。`,views:l(f({nodeTone:t.end?`good`:`bad`})),vars:{i:n,"node.end":e(t.end)}}),t.end&&(d=[...c]),t.end;let o=r[n];if(o===`.`){let e=[...t.children.entries()];if(e.length===0)return a.push({line:[23,24,25],note:`${i}\`word[${n}]\` 是 \`.\`，必須配上**一個**字母，但這個節點沒有任何小孩 —— \`any([])\` 是 \`False\`。`,views:l(f({charTone:`bad`,nodeTone:`bad`})),vars:{i:n,ch:o}}),!1;a.push({line:[23,24,25],note:`${i}\`word[${n}]\` 是 \`.\`，可以是任何字母，無法確定走哪條邊 —— 只好把小孩 ${e.map(([e])=>`\`${e}\``).join(`、`)} **一個一個試**，先試 \`${e[0][0]}\`。`,views:l(f({charTone:`compare`,next:e[0][1]})),vars:{i:n,ch:o}});for(let r=0;r<e.length;r++){let[i,s]=e[r];if(p(s,n+1))return!0;u.add(`${t.id}>${s.id}`);let c=e[r+1];a.push({line:25,note:c?`把 \`.\` 當成 \`${i}\` 行不通，**回溯**到這個節點，改試下一個小孩 \`${c[0]}\`。`:`把 \`.\` 當成 \`${i}\` 也行不通。所有小孩都試過了，沒有一條路成功，\`any\` 回傳 \`False\`。`,views:l(f({charTone:c?`compare`:`bad`,nodeTone:c?`active`:`bad`,next:c?.[1]})),vars:{i:n,ch:o}})}return!1}let s=t.children.get(o);return s?(a.push({line:[23,26,28],note:`${i}\`word[${n}]\` 是一般字母 \`${o}\`，只有一條邊可以走，而且它存在 —— 沿著它往下遞迴。`,views:l(f({charTone:`active`,next:s})),vars:{i:n,ch:o}}),p(s,n+1)):(a.push({line:[23,26,27],note:`${i}\`word[${n}]\` 是 \`${o}\`，但這個節點底下沒有 \`${o}\` 這條邊，這條路走不通，回傳 \`False\`。`,views:l(f({charTone:`bad`,nodeTone:`bad`})),vars:{i:n,ch:o}}),!1)}finally{c.pop()}},m=p(o,0);s.push(m),a.push({line:30,note:m?`有一條路成功走到單字結尾（\`${d[d.length-1].prefix}\`），\`True\` 一路往上回傳，\`search("${r}")\` 回傳 \`True\`。`:`所有可能的路都失敗了，\`search("${r}")\` 回傳 \`False\`。`,views:l({k:n,word:r,i:m?r.length:0,path:m?d:[o],dead:u,pathTone:m?`good`:void 0,nodeTone:m?`good`:`bad`,opTone:m?`good`:`bad`})})}),a.push({note:`所有操作執行完畢。依序的回傳值是 \`${e(s)}\`。`,views:l({k:r.length-1,opTone:`visited`}),result:e(s)}),a.frames}});export{i as default};