---
title: "Leetcode#149.\_Max Points on a Line"
tags:
- [Leetcode]
- [Python]
- [hard]

- [💡]

- Array
- Hash Table
- Math
- Geometry

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-18 11:03:36
---

# `Problem`

Given an array of `points` where `points[i] = [xi, yi]` represents a point on the **X-Y** plane, return *the maximum number of points that lie on the same straight line*.

**Example 1:**

![](https://assets.leetcode.com/uploads/2021/02/25/plane1.jpg)

!https://assets.leetcode.com/uploads/2021/02/25/plane1.jpg

```
Input: points = [[1,1],[2,2],[3,3]]
Output: 3

```

**Example 2:**

![](https://assets.leetcode.com/uploads/2021/02/25/plane2.jpg)

!https://assets.leetcode.com/uploads/2021/02/25/plane2.jpg

```
Input: points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]
Output: 4

```

**Constraints:**

- `1 <= points.length <= 300`
- `points[i].length == 2`
- `10^4 <= xi, yi <= 10^4`
- All the `points` are **unique**.

# `Solve`

### `法一`

找到最多

兩點斜率公式 y = tan * x + res             ( y = a x  + b)

“#” 為垂直線

```python
class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
				# At least the last point, if the list is not empty
        max_value = 1
        for i in range(len(points)):
            memo = {}
            for j in range( i + 1 ,len(points)):

                dx = points[i][0]-points[j][0]
                dy = points[i][1]-points[j][1]

                if dx == 0:
                    if ("#",-points[i][0]) in memo:
                        memo[("#",-points[i][0])] += 1
                    else:
                        memo[("#",-points[i][0])] = 2

                else:
                    tan = dy / dx
                    res = points[i][1] - tan*points[i][0]
                    if (tan , res) in memo:
                        memo[(tan,res)] += 1
                    else:
                        memo[(tan,res)] = 2
                
            if memo:
                max_value = max(max_value , max(memo.values()))

            
        return max_value
```

Time complexity :

O( n^2)

### `優化`

發現 res 根本不重要

畢竟在 第 i 點上

所以res 一定一樣

```python
class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
        max_value = 1
        for i in range(len(points)):
            memo = {}
            for j in range( i + 1 ,len(points)):

                dx = points[i][0]-points[j][0]
                dy = points[i][1]-points[j][1]

                if dx == 0:
                    if "#" in memo:
                        memo["#"] += 1
                    else:
                        memo["#"] = 2
                else:
                    tan = dy / dx
                    if (tan) in memo:
                        memo[tan] += 1
                    else:
                        memo[tan] = 2
                        
            if memo:
                max_value = max(max_value , max(memo.values()))

            
        return max_value
```