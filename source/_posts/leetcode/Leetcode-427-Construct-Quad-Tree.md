---
title: "Leetcode#427.\_Construct Quad Tree"
date: 2023-07-14 15:13:59
categories: Leetcode
cover: /img/cover/leetcode.jpg
tags:
- [Leetcode]
- [Python]
- [medium]
- [💡]
- Array
- Divide and Conquer
- Tree
- Matrix

updated:
---

# `Problem`

Given a `n * n` matrix `grid` of `0's` and `1's` only. We want to represent `grid` with a Quad-Tree.

Return *the root of the Quad-Tree representing* `grid`.

A Quad-Tree is a tree data structure in which each internal node has exactly four children. Besides, each node has two attributes:

- `val`: True if the node represents a grid of 1's or False if the node represents a grid of 0's. Notice that you can assign the `val` to True or False when `isLeaf` is False, and both are accepted in the answer.
- `isLeaf`: True if the node is a leaf node on the tree or False if the node has four children.

```
class Node {
    public boolean val;
    public boolean isLeaf;
    public Node topLeft;
    public Node topRight;
    public Node bottomLeft;
    public Node bottomRight;
}
```

We can construct a Quad-Tree from a two-dimensional area using the following steps:

1. If the current grid has the same value (i.e all `1's` or all `0's`) set `isLeaf` True and set `val` to the value of the grid and set the four children to Null and stop.
2. If the current grid has different values, set `isLeaf` to False and set `val` to any value and divide the current grid into four sub-grids as shown in the photo.
3. Recurse for each of the children with the proper sub-grid.

!https://assets.leetcode.com/uploads/2020/02/11/new_top.png

If you want to know more about the Quad-Tree, you can refer to the [wiki](https://en.wikipedia.org/wiki/Quadtree).

**Quad-Tree format:**

You don't need to read this section for solving the problem. This is only if you want to understand the output format here. The output represents the serialized format of a Quad-Tree using level order traversal, where `null` signifies a path terminator where no node exists below.

It is very similar to the serialization of the binary tree. The only difference is that the node is represented as a list `[isLeaf, val]`.

If the value of `isLeaf` or `val` is True we represent it as **1** in the list `[isLeaf, val]` and if the value of `isLeaf` or `val` is False we represent it as **0**.

**Example 1:**

!https://assets.leetcode.com/uploads/2020/02/11/grid1.png

```
Input: grid = [[0,1],[1,0]]
Output: [[0,1],[1,0],[1,1],[1,1],[1,0]]
Explanation: The explanation of this example is shown below:
Notice that 0 represnts False and 1 represents True in the photo representing the Quad-Tree.

```

!https://assets.leetcode.com/uploads/2020/02/12/e1tree.png

**Example 2:**

!https://assets.leetcode.com/uploads/2020/02/12/e2mat.png

```
Input: grid = [[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0]]
Output: [[0,1],[1,1],[0,1],[1,1],[1,0],null,null,null,null,[1,0],[1,0],[1,1],[1,1]]
Explanation: All values in the grid are not the same. We divide the grid into four sub-grids.
The topLeft, bottomLeft and bottomRight each has the same value.
The topRight have different values so we divide it into 4 sub-grids where each has the same value.
Explanation is shown in the photo below:

```

```python
Input: grid = 
[[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0],
[1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1],
[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0]]
```

!https://assets.leetcode.com/uploads/2020/02/12/e2tree.png

# `Solve`

```python
"""
# Definition for a QuadTree node.
class Node:
    def __init__(self, val, isLeaf, topLeft, topRight, bottomLeft, bottomRight):
        self.val = val
        self.isLeaf = isLeaf
        self.topLeft = topLeft
        self.topRight = topRight
        self.bottomLeft = bottomLeft
        self.bottomRight = bottomRight
"""

class Solution:
    def construct(self, grid: List[List[int]]) -> 'Node':
		def dfs(x, y, l):
            if l == 1:
                return Node(grid[x][y] == 1, True, None, None, None, None)
            l = l // 2
            topLeft = dfs(x, y, l)
            topRight = dfs(x, y + l, l)
            bottomLeft = dfs(x + l, y, l)
            bottomRight = dfs(x + l, y + l, l)
            if topLeft.isLeaf and topRight.isLeaf and bottomLeft.isLeaf and bottomRight.isLeaf and topLeft.val == topRight.val == bottomLeft.val == bottomRight.val:
                return Node(topLeft.val, True, None, None, None, None)
            else:
                return Node(True, False, topLeft, topRight, bottomLeft, bottomRight)
        return dfs(0, 0, len(grid))
```

### 分解

```python
Input: grid = 
[[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0],
[1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1],
[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0],
[1,1,1,1,0,0,0,0]]

len(grid)    # is the number of rows ， List[List[int]] 有多少個list
# [1,1,1,1,0,0,0,0] 1
# [1,1,1,1,0,0,0,0] 2
# .
# .
# .
# [1,1,1,1,0,0,0,0] 8

len(grid[0]) # is the number of columns ， List[List[int]] 每個list有多少個元素

# [1,1,1,1,0,0,0,0] 8

node.topLeft = constructTree([row[:n//2] for row in grid[:n//2]])
# [row[:n//2] for row in grid[:n//2]]  # 0-3行，0-3列

node.bottomLeft = constructTree([row[:n//2] for row in grid[n//2:]])
# [row[:n//2] for row in grid[n//2:]]  # 4-7行，0-3列

node.topRight = constructTree([row[n//2:] for row in grid[:n//2]])
# [row[n//2:] for row in grid[:n//2]]  # 0-3行，4-7列

node.bottomRight = constructTree([row[n//2:] for row in grid[n//2:]])
# [row[n//2:] for row in grid[n//2:]]  # 4-7行，4-7列


grid[:n//2] 是一個切片操作，它取出 grid 列表的前半部分。
row[n//2:]  是一個切片操作，它取出grid 每一 row 列表的後半部分。
```

```python
class Solution:
    def construct(self, grid: List[List[int]]) -> 'Node':

        # 1. check if the grid is leaf ，all same
        def isLeaf(grid):
            val = grid[0][0]
            for i in range(len(grid)):
                for j in range(len(grid[0])):
                    if grid[i][j] != val:
                        return False
            return True
        
        # 2. construct the node
        def constructNode(grid):
            node = Node()
            node.isLeaf = isLeaf(grid)
            node.val = grid[0][0]
            node.topLeft = None
            node.topRight = None
            node.bottomLeft = None
            node.bottomRight = None
            return node
        
        # 3. construct the tree
        def constructTree(grid):
            node = constructNode(grid)
            if node.isLeaf:
                return node
            else:
                n = len(grid)
                node.topLeft = constructTree([row[:n//2] for row in grid[:n//2]]) #記得要加中括弧
                node.topRight = constructTree([row[n//2:] for row in grid[:n//2]])
                node.bottomLeft = constructTree([row[:n//2] for row in grid[n//2:]])
                node.bottomRight = constructTree([row[n//2:] for row in grid[n//2:]])
                return node
        
        return constructTree(grid)
```