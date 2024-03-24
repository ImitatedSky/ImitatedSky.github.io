---
title: Leetcode#52. N-Queens II
tags:
- [Leetcode]
- [Python]
- [hard]

- [💡]
- Backtracking


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-22 11:03:22
---

# `Problem`

The **n-queens** puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.

Given an integer `n`, return *the number of distinct solutions to the **n-queens puzzle***.

**Example 1:**

![(https://assets.leetcode.com/uploads/2020/11/13/queens.jpg)

!https://assets.leetcode.com/uploads/2020/11/13/queens.jpg

```
Input: n = 4
Output: 2
Explanation: There are two distinct solutions to the 4-queens puzzle as shown.

```

**Example 2:**

```
Input: n = 1
Output: 1

```

**Constraints:**

- `1 <= n <= 9`

# `Solve`

### `法1`

遍歷每一層，要觀察的條件

1.只需檢查當前點以上的垂直行

2.左上斜線

3.右上斜線

```python
class Solution:
    def totalNQueens(self, n: int) -> int:
        chessboard = [ [0]*n for _ in range(n)]
        res = 0
        def is_valid(row , col):

            for r in range(row):
                # 直線
                if chessboard[r][col] == 'Q':
                  return False
                
                # if abs(row-r) == abs(col - r ) 斜線 
                # 左上斜線
                if col - (row - r) >= 0 and chessboard[r][col - (row - r)] == 'Q'  :
                    return False
                # 右上斜線 
                if col + (row - r) < n and chessboard[r][col + (row - r)] == 'Q'  :
                    return False
            return True

        # row 代表層數
        def dfs(row):
          # res 為全域變數
            nonlocal res
          # 當row == n (超出範圍)時，代表已經找到一個解
            if row == n:
                res += 1
                return

          # col 做每一層的每一個點
            for col in range(n):
                if is_valid(row , col):
                    chessboard[row][col] = 'Q'
                    # 繼續往下一層走
                    dfs(row + 1)
                    chessboard[row][col] = 0
          
        dfs(0)

        return res
```

```python
現在才知道
      if col + (row - r) < n and chessboard[r][col + (row - r)] == 'Q'  :
          return False
      if  chessboard[r][col + (row - r)] == 'Q' and col + (row - r) < n   :
          return False
有差
上方的的因為前辦已經false，所以不會跑超出範圍的
下方的可以因為超出範圍 先error，而不會達到想要的結果
```

### `法2、網路上快速解`

利用 `主對角線`、`副對角線`性質，用來判斷是否有斜線

```python
(0, 0)   (0, 1)   (0, 2)   (0, 3)
(1, 0)   (1, 1)   (1, 2)   (1, 3)
(2, 0)   (2, 1)   (2, 2)   (2, 3)
(3, 0)   (3, 1)   (3, 2)   (3, 3)
```

主對角線上 `row + col` 都為同一個值

副對角線上 col - row 也會是同一個值，但為了避免負數 改為 `col - row + n - 1`

```python
class Solution:
  def totalNQueens(self, n: int) -> int:
    ans = 0  # 用來儲存符合條件的解的總數
    cols = [False] * n  # 用來記錄每一列是否已經有皇后存在
    diag1 = [False] * (2 * n - 1)  # 主對角線
    diag2 = [False] * (2 * n - 1)  # 副對角線

    def dfs(i: int) -> None:
      nonlocal ans
      if i == n:  # 如果已經檢查完所有行，找到了一個符合條件的解
        ans += 1
        return

      for j in range(n):  # 嘗試在當前行的每一個列上放置皇后
				#
        if cols[j] or diag1[i + j] or diag2[j - i + n - 1]:
          continue  # 如果該列或對角線已經有皇后存在，則跳過
        cols[j] = diag1[i + j] = diag2[j - i + n - 1] = True  # 放置皇后，並更新對應的記錄
        dfs(i + 1)  # 遞歸處理下一行
        cols[j] = diag1[i + j] = diag2[j - i + n - 1] = False  # 回溯，移除皇后，恢復記錄

    dfs(0)  # 從第一行開始進行遞歸遍歷
    return ans  # 返回總的解數量
```