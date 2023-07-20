---
title: "Leetcode#226.\_Invert Binary Tree"
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

date: 2023-07-18 13:56:59

comments: false

---
# `Problem`

Given the `root` of a binary tree, invert the tree, and return *its root*.

**Example 1:**

![](https://assets.leetcode.com/uploads/2021/03/14/invert1-tree.jpg)

```
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]

```

**Example 2:**

![](https://assets.leetcode.com/uploads/2021/03/14/invert2-tree.jpg)

```
Input: root = [2,1,3]
Output: [2,3,1]

```

**Example 3:**

```
Input: root = []
Output: []

```

**Constraints:**

- The number of nodes in the tree is in the range `[0, 100]`.
- `100 <= Node.val <= 100`

# `Solve`

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        def invert(node):
            if not node:
                return None
            node.left , node.right = node.right , node.left  #交換
						#如果還有就繼續做
            if node.left:
                invert(node.left)
            if node.right:
                invert(node.right)
            return node
        
        return invert(root)
```