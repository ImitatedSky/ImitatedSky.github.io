---
title: Leetcode#1319. Number of Operations to Make Network Connected
tags:
- [Leetcode]
- [Python]

- [medium]

- Depth-First Search
- Breadth-First Search
- Union Find
- Graph
- [💡]



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-07-02 13:35:58
---

# `Problem`

There are `n` computers numbered from `0` to `n - 1` connected by ethernet cables `connections` forming a network where `connections[i] = [ai, bi]` represents a connection between computers `ai` and `bi`. Any computer can reach any other computer directly or indirectly through the network.

You are given an initial computer network `connections`. You can extract certain cables between two directly connected computers, and place them between any pair of disconnected computers to make them directly connected.

Return *the minimum number of times you need to do this in order to make all the computers connected*. If it is not possible, return `-1`.

**Example 1:**

!https://assets.leetcode.com/uploads/2020/01/02/sample_1_1677.png

```
Input: n = 4, connections = [[0,1],[0,2],[1,2]]
Output: 1
Explanation: Remove cable between computer 1 and 2 and place between computers 1 and 3.

```

**Example 2:**

!https://assets.leetcode.com/uploads/2020/01/02/sample_2_1677.png

```
Input: n = 6, connections = [[0,1],[0,2],[0,3],[1,2],[1,3]]
Output: 2

```

**Example 3:**

```
Input: n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]
Output: -1
Explanation: There are not enough cables.

```

**Constraints:**

- `1 <= n <= 105`
- `1 <= connections.length <= min(n * (n - 1) / 2, 105)`
- `connections[i].length == 2`
- `0 <= ai, bi < n`
- `ai != bi`
- There are no repeated connections.
- No two computers are connected by more than one cable.

# `Solve`

```python
class Solution:
    def makeConnected(self, n: int, connections: List[List[int]]) -> int:
        if n-1 > len(connections)  :
            return -1

        p = [i for i  in range(n) ]
        
        def find(x):
            if x != p[x]:
                p[x] = find( p[x] )
            return p[x]
        
        def union( u , v):
            pu = find(u)
            pv = find(v)

            if pu != pv:
                # 連接一個
                p[pu] = pv 
        
        for conn in connections:

            union( conn[0] , conn[1] )

        # 算有幾個獨立的
        pset = set()
        for i in range(n):
            pset.add(find(i))

        return len(pset) -1
        
```