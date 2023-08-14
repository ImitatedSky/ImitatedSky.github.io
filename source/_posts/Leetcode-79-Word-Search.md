---
title: "Leetcode#79.\_Word Search"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]
- Array
- Backtracking
- Matrix


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-26 11:31:52
---

進階
[leetcode212](../Leetcode-212-Word-Search-II.md)

# `Problem`

Given an `m x n` grid of characters `board` and a string `word`, return `true` *if* `word` *exists in the grid*.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

**Example 1:**

![](https://assets.leetcode.com/uploads/2020/11/04/word2.jpg)

!https://assets.leetcode.com/uploads/2020/11/04/word2.jpg

```
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true

```

**Example 2:**

![](https://assets.leetcode.com/uploads/2020/11/04/word-1.jpg)

!https://assets.leetcode.com/uploads/2020/11/04/word-1.jpg

```
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"
Output: true

```

**Example 3:**

![](https://assets.leetcode.com/uploads/2020/10/15/word3.jpg)

!https://assets.leetcode.com/uploads/2020/10/15/word3.jpg

```
Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"
Output: false

```

**Constraints:**

- `m == board.length`
- `n = board[i].length`
- `1 <= m, n <= 6`
- `1 <= word.length <= 15`
- `board` and `word` consists of only lowercase and uppercase English letters.

**Follow up:** Could you use search pruning to make your solution faster with a larger `board`?

# `Solve`

先全部搜索，當找到第一個字母時，再開始跑 DFS

DFS的概念，

1.判斷是否找到了，如果找到了，就回傳True

2.判斷是否超出邊界，或是word的第一個字母不等於board[i][j]時，代表找不到，回傳False

3.把board[i][j]標記為 #，代表已經走過了

4.往上下左右四個方向走，並且word往後一個字母

5.把board[i][j]還原

6.回傳結果

backtracking 的觀念，當發現走不下去時，就把標記還原，然後往另一個方向走

老鼠走迷宮的概念

## 解法

```python
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        # DFS approach
        def dfs(board, i, j, word):
            # 當word長度為0時，代表已經找到了
            if len(word) == 0:
                return True
            
            # 當i,j超出邊界，或是word的第一個字母不等於board[i][j]時，代表找不到
            if( i < 0 or i >= len(board) or # row
                 j < 0 or j >= len(board[0]) or # column
                 word[0] != board[i][j]): # word
                return False
            
            # temp用來記錄board[i][j]的值，因為之後會被改變 
            temp = board[i][j]

            # board[i][j] = #，代表已經走過了
            board[i][j] = '#'

            # 往上下左右四個方向走，並且word往後一個字母
            # 這邊的board 會有 # 的情況，所以不用擔心會走回頭路
            res = (dfs(board, i + 1, j, word[1:]) or 
                    dfs(board, i - 1, j, word[1:]) or 
                    dfs(board, i, j + 1, word[1:]) or 
                    dfs(board, i, j - 1, word[1:]) )
            
            # 把board[i][j]還原
            board[i][j] = temp
            
            return res
        
        # 全部都走過一遍
        # 這邊的i,j是用來找起點的
        # 通常board[i][j] != word[0]，所以不會進入dfs
        for i in range(len(board)):
            for j in range(len(board[0])):
                if dfs(board, i, j, word):
                    return True
        return False
```

Time complexity: O(m**n * 4^L) m*n is the size of the board and L is the length of the word

Space complexity: O(L) where L is the length of the word