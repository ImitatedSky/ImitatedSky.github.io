---
title: "Leetcode#684.\_Redundant Connection"
tags:
- [Leetcode]
- [Python]

- [medium]

- 施工中

- [💡]

- Depth-First Search
- Breadth-First Search
- Union Find
- Graph


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-25 13:23:18
---
# `Problem`

In this problem, a tree is an **undirected graph** that is connected and has no cycles.

You are given a graph that started as a tree with `n` nodes labeled from `1` to `n`, with one additional edge added. The added edge has two **different** vertices chosen from `1` to `n`, and was not an edge that already existed. The graph is represented as an array `edges` of length `n` where `edges[i] = [ai, bi]` indicates that there is an edge between nodes `ai` and `bi` in the graph.

Return *an edge that can be removed so that the resulting graph is a tree of* `n` *nodes*. If there are multiple answers, return the answer that occurs last in the input.

**Example 1:**

![](https://assets.leetcode.com/uploads/2021/05/02/reduntant1-1-graph.jpg)

!https://assets.leetcode.com/uploads/2021/05/02/reduntant1-1-graph.jpg

```
Input: edges = [[1,2],[1,3],[2,3]]
Output: [2,3]

```

**Example 2:**

![](https://assets.leetcode.com/uploads/2021/05/02/reduntant1-2-graph.jpg)

!https://assets.leetcode.com/uploads/2021/05/02/reduntant1-2-graph.jpg

```
Input: edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]
Output: [1,4]

```

**Constraints:**

- `n == edges.length`
- `3 <= n <= 1000`
- `edges[i].length == 2`
- `1 <= ai < bi <= edges.length`
- `ai != bi`
- There are no repeated edges.
- The given graph is connected.

# `Solve`

```python
class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:

        n = len(edges)
        
        parent = [-1]*( len(edges) + 1 )

        def find(u):
            if parent[u] == -1:
                return u
            
            return find(parent[u])

        def union(u,v):

            u_p = find(u)
            v_p = find(v)

            if u_p != v_p:
                parent[v_p] = u_p

                return False
            else:

                return True

        for i in range(len(edges)):
            if  union( edges[i][0] , edges[i][1] )  :

                return [ edges[i][0] , edges[i][1]   ]
```