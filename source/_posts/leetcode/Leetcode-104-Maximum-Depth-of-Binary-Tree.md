---
title: Leetcode#104. Maximum Depth of Binary Tree
tags:
- [Leetcode]
- [Python]
- [easy]


- [💡]
- Tree
- Depth-First Search
- Breadth-First Search
- Binary Tree


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-06-30 04:02:11
---

# `Problem`

Given the `root` of a binary tree, return *its maximum depth*.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.

**Example 1:**

!https://assets.leetcode.com/uploads/2020/11/26/tmp-tree.jpg

![](https://assets.leetcode.com/uploads/2020/11/26/tmp-tree.jpg)

```
Input: root = [3,9,20,null,null,15,7]
Output: 3

```

**Example 2:**

```
Input: root = [1,null,2]
Output: 2

```

**Constraints:**

- The number of nodes in the tree is in the range `[0, 104]`.
- `100 <= Node.val <= 100`

# `Solve`

## 解1

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root :
            return 0
        _depth = 1
        
        
        def dfs(node , depth):
            nonlocal _depth

            if not node:
                return

            _depth = max(depth , _depth)

            left = dfs(node.left , depth + 1 )
            right = dfs(node.right , depth + 1 )
        
        dfs(root,1)
        return _depth
```

## 使用Divide and Conquer

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root :
            return 0
        
        maxdep_left = self.maxDepth(root.left) + 1
        maxdep_right = self.maxDepth(root.right) + 1

        return max(maxdep_left , maxdep_right , 1)
```