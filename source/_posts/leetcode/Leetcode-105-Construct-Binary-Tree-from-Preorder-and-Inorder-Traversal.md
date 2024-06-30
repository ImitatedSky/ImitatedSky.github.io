---
title: "Leetcode#105.\_Construct Binary Tree from Preorder and Inorder Traversal"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]
- Array
- Hash Table
- Divide and Conquer
- Tree
- Binary Tree



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-25 10:21:29
---

# `Problem`

Given two integer arrays `preorder` and `inorder` where `preorder` is the preorder traversal of a binary tree and `inorder` is the inorder traversal of the same tree, construct and return *the binary tree*.

**Example 1:**

![](https://assets.leetcode.com/uploads/2021/02/19/tree.jpg)

!https://assets.leetcode.com/uploads/2021/02/19/tree.jpg

```
Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
Output: [3,9,20,null,null,15,7]

```

**Example 2:**

```
Input: preorder = [-1], inorder = [-1]
Output: [-1]

```

**Constraints:**

- `1 <= preorder.length <= 3000`
- `inorder.length == preorder.length`
- `3000 <= preorder[i], inorder[i] <= 3000`
- `preorder` and `inorder` consist of **unique** values.
- Each value of `inorder` also appears in `preorder`.
- `preorder` is **guaranteed** to be the preorder traversal of the tree.
- `inorder` is **guaranteed** to be the inorder traversal of the tree.

# `Solve`

## `法1`

### 解

前序的第一點就是TreeNode的root

找到中序的root.val 對應值，左邊就是左子樹，右邊就是右子樹

遞迴下去即可

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        if not preorder or not inorder:
            return None
        root = TreeNode(preorder[0])
        
        n = 0

        for i in range(len(inorder)):
            if inorder[i] == preorder[0]:
                n = i
                break
        root_l_pre = preorder[1:n+1]
        root_r_pre = preorder[n+1:]
        root_l_in = inorder[:n]
        root_r_in = inorder[ n+1 : ]
        
        
        root.left = self.buildTree(root_l_pre,root_l_in)
        root.right = self.buildTree(root_r_pre,root_r_in)

        return root

```

### 整理過後

```python
class Solution:
  def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:

    if not preorder or not inorder:
      return None

    root = TreeNode(preorder[0])
    root_index = inorder.index(preorder[0])

    root.left = self.buildTree(preorder[1:root_index +1], inorder[:root_index ])
    root.right = self.buildTree(preorder[root_index +1:], inorder[root_index +1:])

    return root
```