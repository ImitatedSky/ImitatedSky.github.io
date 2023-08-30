---
title: How to create a trie in Python
tags:
- [💡]
- Trie
- Python

categories: ~algo
cover: /img/cover/code.jpg
date: 2023-08-15 11:54:40
---

# How to create a trie in Python

## Trie

Trie 像一顆特別的樹，每個節點都是一個字母，從根節點到葉節點的路徑上的字母連起來就是一個單詞。

`用途`搜尋提示，比如輸入一個單詞，自動提示可能的後續單詞。

`優點`搜尋效率高，不用像哈希表一樣，需要計算哈希值，直接根據單詞的每個字母，一層一層的往下搜尋即可。

`缺點`空間消耗大，因為每個節點都需要存儲子節點的指針，當單詞數量很多時，需要的空間就很大。



## 建立 Trie
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
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_word = True
    
    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_word

    def startsWith(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True
```

## 加註解
```python
# 建構Trie節點的類
class TrieNode:
    def __init__(self):
        # 用字典來存儲子節點
        # key: char, value: TrieNode
        # ex: {'a': TrieNode, 'b': TrieNode}
        self.children = {}
        self.is_word = False

# 建構Trie的類
class Trie:
    # 初始化
    def __init__(self):
        # 建立一個根節點
        self.root = TrieNode()
    
    # 插入單詞
    def insert(self, word):
        # 從根節點開始
        node = self.root

        # 對於單詞中的每個字母
        for char in word:
            # 如果該字母不在當前節點的子節點中
            if char not in node.children:
                # 創建一個新的子節點
                node.children[char] = TrieNode()
            # 將當前節點設置為子節點，進入下一層
            node = node.children[char]
        # 將當前節點標記為單詞結尾
        node.is_word = True
    
    # 查找單詞
    def search(self, word):
        # 從根節點開始
        node = self.root
        # 對於單詞中的每個字母
        for char in word:
            # 如果該字母不在當前節點的子節點中，返回False
            if char not in node.children:
                return False
            # 如果該字母在當前節點的子節點中，則將當前節點設置為子節點，進入下一層
            node = node.children[char]
        # 返回當前節點是否為單詞結尾
        return node.is_word

    # 查找前綴
    def startsWith(self, prefix):
        # 從根節點開始
        node = self.root
        # 對於前綴中的每個字母
        for char in prefix:
            # 如果該字母不在當前節點的子節點中，返回False
            if char not in node.children:
                return False
            # 如果該字母在當前節點的子節點中，則將當前節點設置為子節點，進入下一層
            node = node.children[char]
        # 返回True
        return True

'''
insert
root = TrieNode()

+app
root.children = {'a': TrieNode}
root.children['a'].children = {'p': TrieNode}
root.children['a'].children['p'].children = {'p': TrieNode}

+apple
root.children = {'a': TrieNode}
root.children['a'].children = {'p': TrieNode}
root.children['a'].children['p'].children = {'p': TrieNode}
root.children['a'].children['p'].children['p'].children = {'l': TrieNode}
root.children['a'].children['p'].children['p'].children['l'].children = {'e': TrieNode}
root.children['a'].children['p'].children['p'].children['l'].children['e'].children = {'': TrieNode}

+bat
root.children = {'a': TrieNode, 'b': TrieNode}
root.children['a'].children = {'p': TrieNode}
.
.
.
root.children['b'].children['a'].children = {'t': TrieNode}



+banana
root.children = {'a': TrieNode, 'b': TrieNode}
root.children['a'].children = {'p': TrieNode}
.
.
.
root.children['b'].children['a'].children = {'t': TrieNode , 'n': TrieNode}
root.children['b'].children['a'].children['n'].children = {'a': TrieNode}
root.children['b'].children['a'].children['n'].children['a'].children = {'n': TrieNode}
root.children['b'].children['a'].children['n'].children['a'].children['n'].children = {'a': TrieNode}
'''

```



