---
title: "Leetcode#62.\_Unique Paths"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Math
- Dynamic Programming
- Combinatorics

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-24 10:23:16
---
```markdown
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Math
- Dynamic Programming
- Combinatorics

cover: /img/cover/leetcode.jpg
categories: Leetcode
```

# `Problem`

There is a robot on an `m x n` grid. The robot is initially located at the **top-left corner** (i.e., `grid[0][0]`). The robot tries to move to the **bottom-right corner** (i.e., `grid[m - 1][n - 1]`). The robot can only move either down or right at any point in time.

Given the two integers `m` and `n`, return *the number of possible unique paths that the robot can take to reach the bottom-right corner*.

The test cases are generated so that the answer will be less than or equal to `2 * 109`.

**Example 1:**

![]https://assets.leetcode.com/uploads/2018/10/22/robot_maze.png

!https://assets.leetcode.com/uploads/2018/10/22/robot_maze.png

```
Input: m = 3, n = 7
Output: 28

```

**Example 2:**

```
Input: m = 3, n = 2
Output: 3
Explanation: From the top-left corner, there are a total of 3 ways to reach the bottom-right corner:
1. Right -> Down -> Down
2. Down -> Down -> Right
3. Down -> Right -> Down

```

**Constraints:**

- `1 <= m, n <= 100`

# `Solve`

| x-1 ,  y-1 | x ,  y-1 |
| --- | --- |
| x-1   ,    y | x   ,   y |

應該是國中數學吧

右下角的為，上方 + 左邊 的方法次數

## `使用dp，memo`

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = {}
        
        dp[(0,0)] = 1

        for i in range(m):
            dp[(i,0)] = 1
        
        for j in range(n):
            dp[(0,j)] = 1

        for i in range(1,m):
            for j in range(1,n):
                dp[(i,j)] = dp[(i-1,j)] + dp[(i,j-1)]

        return dp[(m-1,n-1)]
```