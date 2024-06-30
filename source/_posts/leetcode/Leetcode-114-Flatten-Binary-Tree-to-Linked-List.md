---
title: Leetcode#114. Flatten Binary Tree to Linked List
tags:
- [Leetcode]
- [Python]

- [medium]


- [💡]
- Linked List
- Stack
- Tree
- Depth-First Search
- Binary Tree


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-07-01 02:24:49
---

# `Problem`

Given the `root` of a binary tree, flatten the tree into a "linked list":

- The "linked list" should use the same `TreeNode` class where the `right` child pointer points to the next node in the list and the `left` child pointer is always `null`.
- The "linked list" should be in the same order as a [**pre-order traversal**](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR) of the binary tree.

**Example 1:**

!https://assets.leetcode.com/uploads/2021/01/14/flaten.jpg

![](https://assets.leetcode.com/uploads/2021/01/14/flaten.jpg)

```
Input: root = [1,2,5,3,4,null,6]
Output: [1,null,2,null,3,null,4,null,5,null,6]

```

**Example 2:**

```
Input: root = []
Output: []

```

**Example 3:**

```
Input: root = [0]
Output: [0]

```

**Constraints:**

- The number of nodes in the tree is in the range `[0, 2000]`.
- `100 <= Node.val <= 100`

**Follow up:**

Can you flatten the tree in-place (with

```
O(1)
```

extra space)?

# `Solve`

前幾次試錯直接對[**(,,・ω・,,)**](https://symbols.wisdom-life.in/zh-TW/emoticon/shy)

想法沒錯後，直接DFS

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        if not root :
            return
        left = root.left
        right = root.right

        def findlast(node):
            if node.right:
                node = findlast(node.right)
            return node
        root.left = None #記得把左清空
        root.right = self.flatten(left)
        findlast(root).right = self.flatten(right)

        return root

        
```
