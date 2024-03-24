---
title: "Leetcode#200.\_Number of Islands"
tags:
- [Leetcode]
- [Python]

- [medium]

- 施工中

- [💡]

- Array
- Depth-First Search
- Breadth-First Search
- Union Find
- Matrix


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-25 13:22:20
---

# `Problem`

Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

**Example 1:**

```
Input: grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
Output: 1

```

**Example 2:**

```
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3

```

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 300`
- `grid[i][j]` is `'0'` or `'1'`.

# `Solve`

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:

        m = len(grid)
        n = len(grid[0])
        island = 0

        def dps(grid,i,j):
            if i < 0 or m <= i or j < 0 or n <= j :
                return
            if grid[i][j] != "1":
                return
        
            grid[i][j] = "*"
            dps(grid,i+1,j)
            dps(grid,i,j+1)
            dps(grid,i-1,j)
            dps(grid,i,j-1)
        
        for i in range(m):
            for j in range(n):
                if grid[i][j] == "1":
                    dps(grid,i,j)
                    island += 1
        
        return island
```