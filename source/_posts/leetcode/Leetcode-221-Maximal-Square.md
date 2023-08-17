---
title: "Leetcode#221.\_Maximal Square"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Array
- Dynamic Programming
- Matrix

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-17 14:37:17
---

# `Problem`

Given an `m x n` binary `matrix` filled with `0`'s and `1`'s, *find the largest square containing only* `1`'s *and return its area*.

**Example 1:**

![]https://assets.leetcode.com/uploads/2020/11/26/max1grid.jpg

!https://assets.leetcode.com/uploads/2020/11/26/max1grid.jpg

```
Input: matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]
Output: 4

```

**Example 2:**

![]https://assets.leetcode.com/uploads/2020/11/26/max2grid.jpg

!https://assets.leetcode.com/uploads/2020/11/26/max2grid.jpg

```
Input: matrix = [["0","1"],["1","0"]]
Output: 1

```

**Example 3:**

```
Input: matrix = [["0"]]
Output: 0

```

**Constraints:**

- `m == matrix.length`
- `n == matrix[i].length`
- `1 <= m, n <= 300`
- `matrix[i][j]` is `'0'` or `'1'`.

# `Solve`

好像memo 不會有問題，多此一舉了

```python
class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        memo = {}

        for r in range(len(matrix)):
            memo[(r,0)] = int(matrix[r][0])

        for c in range(len(matrix[0])):
            memo[(0,c)] = int(matrix[0][c])
    
        
        def dp(i, j):
            if(i, j) in memo  :
                return memo[(i,j)]

            if matrix[i][j] == "0":
                memo[(i,j)] = 0
                
            elif matrix[i][j] == "1" and memo[(i-1,j)] != 0 and memo[(i,j-1)] != 0:
                memo[(i,j)] = min(memo[(i-1,j)] , memo[(i,j-1)] , memo[(i-1, j-1)] ) + 1
            else:
                memo[(i,j)] = 1

            return memo[(i, j)]
            

        res = 0
        for i in range( len(matrix) ):
            for j in range( len(matrix[0]) ):
                dp(i, j)
                res = max(res,memo[(i,j)])
        return res*res
```

### `優化`

```python
class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        if not matrix:
            return 0
        
        m, n = len(matrix), len(matrix[0])
				# 全部填充為0
        memo = [[0] * n for _ in range(m)]
        res = 0

				# 製作邊界 同時運算res
        for r in range(m):
            memo[r][0] = int(matrix[r][0])
            res = max(res, memo[r][0])

        for c in range(n):
            memo[0][c] = int(matrix[0][c])
            res = max(res, memo[0][c])

				# 從[1][1]開始
        for i in range(1, m):
            for j in range(1, n):
                if int(matrix[i][j]) == 1:
                    memo[i][j] = min(memo[i-1][j], memo[i][j-1], memo[i-1][j-1]) + 1
                    res = max(res, memo[i][j])

        return res * res
```