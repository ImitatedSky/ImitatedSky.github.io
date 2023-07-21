---
title: "Leetcode#120.\_Triangle"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]
- Array
- Dynamic Programming


cover: /img/cover/leetcode.jpg
categories: Leetcode

date: 2023-07-21 15:52:50
---

[leetcode62]

# `Problem`

Given a `triangle` array, return *the minimum path sum from top to bottom*.

For each step, you may move to an adjacent number of the row below. More formally, if you are on index `i` on the current row, you may move to either index `i` or index `i + 1` on the next row.

**Example 1:**

```
Input: triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]
Output: 11
Explanation: The triangle looks like:
   2
  3 4
 6 5 7
4 1 8 3
The minimum path sum from top to bottom is 2 + 3 + 5 + 1 = 11 (underlined above).

```

**Example 2:**

```
Input: triangle = [[-10]]
Output: -10

```

**Constraints:**

- `1 <= triangle.length <= 200`
- `triangle[0].length == 1`
- `triangle[i].length == triangle[i - 1].length + 1`
- `-10^4 <= triangle[i][j] <= 10^4`

# `Solve`

## `use recursion`

```python
# Time Limit Exceeded
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        
        def dp(i,j):
            if i == len(triangle)-1:
                return triangle[i][j]

            return triangle[i][j] + min(dp(i+1,j),dp(i+1,j+1))

        return dp(0,0)

# dp(0,0) return triangle[0][0] + min(dp(1,0),dp(1,1))
# dp(1,0) return triangle[1][0]
# dp(1,1) return triangle[1][1]

# dp(i,j) return triangle[i][j] + min(dp(i+1,j),dp(i+1,j+1))
# dp(i+1,j) return triangle[i+1][j]
# dp(i+1,j+1) return triangle[i+1][j+1]
```

O(2^n) time, O(n) space

```python
# add meno
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        memo = {}
        def dp(i, j):
            if i == len(triangle) - 1:
                return triangle[i][j]
            if (i, j) in memo:
                return memo[(i, j)]
            memo[(i, j)] = triangle[i][j] + min(dp(i+1, j), dp(i+1, j+1))
            return memo[(i, j)]
        return dp(0, 0)
```

O(n^2) time, O(n^2) space

## `use dp`(# 與 recursion 不同 ，recursion 是從上往下推，dp 是從下往上推)

```python
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        n = len(triangle)

        # 建立一個二維陣列，用來儲存每個點的最小值
        # n 行 n 列
        dp = [[0]*n for _ in range(n)]

        # 最後一列的值，最後一個 triangle[n-1][n-1]
        # 將最後一列的值，都加入到 dp 中
        for j in range(n):
            dp[n-1][j]=triangle[n-1][j]
        
        # 從倒數第二列開始，往上推
        # (n-2, n-2) -> (0, 0)
        for i in range(n-2,-1,-1):
            # 從左到右推，長度為 i+1
            # (i, 0) -> (i, i)
            for j in range(i+1):
                dp[i][j] = min(dp[i+1][j], dp[i+1][j+1]) + triangle[i][j]
        
        return dp[0][0]
```

O(n^2) time
O(n^2) space

## `看到最簡便的`

```python
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        for i in range(len(triangle)-2,-1,-1):
            for j in range(0,len(triangle[i])):
                triangle[i][j]+=min(triangle[i+1][j+1],triangle[i+1][j])
        return triangle[0][0]
```

O(n^2) time

O(1) space

直接不用儲存