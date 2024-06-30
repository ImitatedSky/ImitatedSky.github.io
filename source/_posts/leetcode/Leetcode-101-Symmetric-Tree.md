---
title: Leetcode#101. Symmetric Tree
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
date: 2024-06-30 08:23:00
---

# `Problem`

Given the `root` of a binary tree, *check whether it is a mirror of itself* (i.e., symmetric around its center).

**Example 1:**

!https://assets.leetcode.com/uploads/2021/02/19/symtree1.jpg

![](https://assets.leetcode.com/uploads/2021/02/19/symtree1.jpg)

```
Input: root = [1,2,2,3,4,4,3]
Output: true

```

**Example 2:**

!https://assets.leetcode.com/uploads/2021/02/19/symtree2.jpg

![](https://assets.leetcode.com/uploads/2021/02/19/symtree2.jpg)

```
Input: root = [1,2,2,null,3,null,3]
Output: false

```

**Constraints:**

- The number of nodes in the tree is in the range `[1, 1000]`.
- `100 <= Node.val <= 100`

**Follow up:**

Could you solve it both recursively and iteratively?

# `Solve`

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        if not root:
            return True
        
        def dfs(left,right):
            if not left and not right:
                return True
            
            if not left or not right:
                return False
            
            return left.val == right.val and dfs(left.left,right.right) and dfs(left.right, right.left)
        
        return dfs(root.left , root.right)
```
