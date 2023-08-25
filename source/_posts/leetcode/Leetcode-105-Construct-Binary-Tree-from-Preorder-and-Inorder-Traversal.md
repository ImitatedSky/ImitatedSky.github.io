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
    def build(preo,ino):
			# 當preo 或 ino 為空時，返回None
      if not preo or not ino :
        return None

      root = TreeNode(preo[0])
      root_index = 0
      
      for i in range(len(ino)):
        if ino[i] == root.val:
          root_index = i
          break
      
      root.left = build( preo[1:root_index+1] , ino[0:root_index])
      root.right = build( preo[root_index+1:len(preo)] , ino[root_index+1:len(ino)])

      return(root)

    return build(preorder,inorder)
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