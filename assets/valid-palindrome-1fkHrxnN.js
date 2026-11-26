import{a as e,n as t,o as n}from"./AlgoApp-DIbAQPAC.js";import{t as r}from"./types-Dfvzj6n2.js";var i=`class Solution:
    def isPalindrome(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        while l < r:
            if not s[l].isalnum():
                l += 1  # 左邊不是字母或數字，跳過
            elif not s[r].isalnum():
                r -= 1  # 右邊不是字母或數字，跳過
            elif s[l].lower() != s[r].lower():
                return False
            else:
                l += 1
                r -= 1
        return True`,a=e=>/^[a-z0-9]$/i.test(e),o=e=>e===` `?`空白`:e,s=r({id:125,summary:`給一個字串 \`s\`，只看其中的**英文字母和數字**，而且不分大小寫。判斷這樣過濾之後，它從左讀和從右讀是不是一模一樣（回文）。

空白、逗號、冒號等其他符號全部當作不存在。`,summaryEn:`Given a string \`s\`, look only at its **letters and digits**, ignoring case. Decide whether the filtered string reads exactly the same forwards and backwards (a palindrome).

Spaces, commas, colons and every other symbol are treated as if they were not there.`,examples:[{input:`s = "A man, a plan, a canal: Panama"`,output:`true`,note:`過濾後是 amanaplanacanalpanama`,noteEn:`After filtering: amanaplanacanalpanama`},{input:`s = "race a car"`,output:`false`,note:`過濾後是 raceacar`,noteEn:`After filtering: raceacar`},{input:`s = " "`,output:`true`,note:`過濾後是空字串`,noteEn:`After filtering: an empty string`}],constraints:[`1 ≤ s.length ≤ 2 × 10⁵`,`s 只包含可列印的 ASCII 字元`],constraintsEn:[`1 ≤ s.length ≤ 2 × 10⁵`,`s contains only printable ASCII characters`],idea:`回文的定義就是「第 k 個字元 = 倒數第 k 個字元」。所以放兩個指標在頭尾**往中間夾**，每次比一對；遇到不是字母或數字的字元就直接跳過，不必先另外建一個過濾後的字串。`,steps:["`l` 指向開頭、`r` 指向結尾。","如果 `s[l]` 不是字母或數字，`l` 往右跳過；否則如果 `s[r]` 不是，`r` 往左跳過。","兩邊都是有效字元時，轉成小寫比較：不一樣就回傳 `False`。","一樣的話兩個指標各往內走一步，直到 `l >= r` 都沒出錯，就是回文。"],pitfalls:["數字也算有效字元，要用 `isalnum()` 而不是 `isalpha()`。","比較前記得 `lower()`，`A` 和 `a` 視為相同。","迴圈條件是 `l < r`：兩個指標相遇時，中間那個字元自己跟自己一定相同，不用比。"],complexity:{time:`O(n)`,space:`O(1)`},code:i,starter:`class Solution:
    def isPalindrome(self, s: str) -> bool:
        `,presets:[{label:`"Was it a cat I saw?"`,input:{s:`Was it a cat I saw?`},expected:`True`},{label:`"race a car"`,input:{s:`race a car`},expected:`False`},{label:`"A man, a plan, a canal: Panama"`,input:{s:`A man, a plan, a canal: Panama`},expected:`True`}],trace({s:r}){let i=n(),s=r.length,c=0,l=s-1,u={},d=(e={})=>t.chars(`s`,r,{pointers:{l:c,r:l},marks:{...u,...e}});for(i.push({line:3,note:"`l` 放在最左邊、`r` 放在最右邊，準備一對一對往中間比。",views:[d()],vars:{l:c,r:l}});c<l;){let t=r[c],n=r[l];if(!a(t))i.push({line:[5,6],note:`\`s[${c}]\` 是「${o(t)}」，不是字母或數字，不參與比較 —— \`l\` 往右跳過它。`,views:[d({[c]:`bad`})],vars:{l:c,r:l}}),u[c]=`muted`,c++;else if(!a(n))i.push({line:[7,8],note:`左邊 \`${t}\` 是有效字元，但 \`s[${l}]\` 是「${o(n)}」，不是字母或數字 —— \`r\` 往左跳過它。`,views:[d({[c]:`compare`,[l]:`bad`})],vars:{l:c,r:l}}),u[l]=`muted`,l--;else if(t.toLowerCase()!==n.toLowerCase())return i.push({line:[9,10],note:`比較 \`${t}\` 和 \`${n}\`：轉成小寫後是 \`${t.toLowerCase()}\` ≠ \`${n.toLowerCase()}\`。只要有一對對不上，就不可能是回文。`,views:[d({[c]:`bad`,[l]:`bad`})],vars:{l:c,r:l},result:e(!1)}),i.frames;else i.push({line:[9,11,12,13],note:`比較 \`${t}\` 和 \`${n}\`：轉成小寫後都是 \`${t.toLowerCase()}\`，這一對沒問題，兩個指標各往內走一步。`,views:[d({[c]:`active`,[l]:`active`})],vars:{l:c,r:l}}),u[c]=`good`,u[l]=`good`,c++,l--}return c===l&&c>=0&&c<s&&a(r[c])&&(u[c]=`good`),i.push({line:[4,14],note:c===l?`\`l\` 和 \`r\` 在索引 ${c} 相遇，中間這一格不需要再比。所有配對都相同，是回文。`:"`l` 已經越過 `r`，所有配對都檢查完而且都相同，是回文。",views:[d()],vars:{l:c,r:l},result:e(!0)}),i.frames}});export{s as default};