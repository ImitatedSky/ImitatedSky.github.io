---
title: "Leetcode#139.\_Word Break"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Array
- Hash Table
- String
- Dynamic Programming
- Trie
- Memoization
- 施工中


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-30 16:12:29
---
# `Problem`

Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.

**Note** that the same word in the dictionary may be reused multiple times in the segmentation.

**Example 1:**

```
Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
Explanation: Return true because "leetcode" can be segmented as "leet code".

```

**Example 2:**

```
Input: s = "applepenapple", wordDict = ["apple","pen"]
Output: true
Explanation: Return true because "applepenapple" can be segmented as "apple pen apple".
Note that you are allowed to reuse a dictionary word.

```

**Example 3:**

```
Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
Output: false

```

**Constraints:**

- `1 <= s.length <= 300`
- `1 <= wordDict.length <= 1000`
- `1 <= wordDict[i].length <= 20`
- `s` and `wordDict[i]` consist of only lowercase English letters.
- All the strings of `wordDict` are **unique**.

# `Solve`

法n+1 有用到題目要的 Trie 、DP、memo

一開始沒想到用 memo!!!!!!!!!  導致Limit exceeded

法1 、 法n+1 ，兩個的想法其實都一樣，差在多用了一個Trie 來搜尋

### `法1` DFS

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:

        memo = {}
        Dicts = set(wordDict)
        

        def dfs(s, memo):
            if s in memo:
                return memo[s]
            if s in Dicts:
                return True
            
            for i in range( 1, len(s)+1 ):
                if s[:i] in Dicts  and dfs(s[i:] , memo):
                    memo[s] = True
                    return True
            memo[s] = False
            
            return False
        
        return dfs(s, memo)
```

N: 字串長度   K:字典長度(個數)

time complexity: 

space complexity:

### `法n` 某次錯誤解 Time Limit Exceeded

邏輯應該為正確，但某原因導致limit exceed

某原因為 有些重複太多次，加上memo會更快

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_word = True
    
    def search(self, word):
        node = self.root

        for c in word:
            if c not in node.children:
                return False
            node = node.children[c]
        return node.is_word

    
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        dicts = Trie()

        for w in wordDict:
            dicts.insert(w)

        def dfs(node, string):
            if not string:
                return True
            
            for i in range(1, len(string) + 1):
                if dicts.search(string[:i]) and dfs(dicts.root, string[i:]):
                        return True
            return False
        
        return dps(dicts.root, s)
```

```
Time Limit Exceeded
35 / 46 testcases passed
Last Executed Input
Use Testcase
s =
"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"
wordDict =
["a","aa","aaa","aaaa","aaaaa","aaaaaa","aaaaaaa","aaaaaaaa","aaaaaaaaa","aaaaaaaaaa"]
```

### `法n+1` 修正

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_word = True
    
    def search(self, word):
        node = self.root

        for c in word:
            if c not in node.children:
                return False
            node = node.children[c]
        return node.is_word

    
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        dicts = Trie()
        memo = {}

        for w in wordDict:
            dicts.insert(w)

        def dps(node, s):
            if not s:
                return True
            if s in memo:
                return memo[s]
            
            for i in range(1, len(s) + 1):
                if dicts.search(s[:i]) and dps(dicts.root, s[i:]):
                    memo[s] = True
                    return True
            memo[s] = False
            return False
        
        return dps(dicts.root, s)

```

N: 字串長度   K:字典長度(個數)

time complexity: 

space complexity:

~~這題網路上沒找到用Trie解，真奇怪~~