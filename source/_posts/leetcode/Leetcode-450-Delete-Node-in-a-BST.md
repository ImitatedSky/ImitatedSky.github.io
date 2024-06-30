---
title: Leetcode#450. Delete Node in a BST
tags:
- [Leetcode]
- [Python]

- [medium]

- [💡]

- Tree
- Binary Search Tree
- Binary Tree

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-06-30 22:42:10
---
# `Problem`

Given a root node reference of a BST and a key, delete the node with the given key in the BST. Return *the **root node reference** (possibly updated) of the BST*.

Basically, the deletion can be divided into two stages:

1. Search for a node to remove.
2. If the node is found, delete the node.

**Example 1:**

!https://assets.leetcode.com/uploads/2020/09/04/del_node_1.jpg

![](https://assets.leetcode.com/uploads/2020/09/04/del_node_1.jpg)

```
Input: root = [5,3,6,2,4,null,7], key = 3
Output: [5,4,6,2,null,null,7]
Explanation: Given key to delete is 3. So we find the node with value 3 and delete it.
One valid answer is [5,4,6,2,null,null,7], shown in the above BST.
Please notice that another valid answer is [5,2,6,null,4,null,7] and it's also accepted.

```

!https://assets.leetcode.com/uploads/2020/09/04/del_node_supp.jpg

![](https://assets.leetcode.com/uploads/2020/09/04/del_node_supp.jpg)

**Example 2:**

```
Input: root = [5,3,6,2,4,null,7], key = 0
Output: [5,3,6,2,4,null,7]
Explanation: The tree does not contain a node with value = 0.

```

**Example 3:**

```
Input: root = [], key = 0
Output: []

```

**Constraints:**

- The number of nodes in the tree is in the range `[0, 104]`.
- `105 <= Node.val <= 105`
- Each node has a **unique** value.
- `root` is a valid binary search tree.
- `105 <= key <= 105`

**Follow up:** Could you solve it with time complexity `O(height of tree)`?

# `Solve`

## 解

照BST 的刪除方法

第一次解意外的難，但是看過的書上(王者歸來)有詳解，當時還覺得簡單呢

```python
# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:
        if not root :
            return 
        def findmin(node):
            # inorder -> 找第一個就好(因為bst 所以第一個會是最小的)
            # while node.left:
            #     node = node.left
            if node.left:
                node = findmin(node.left)
            return node

        
        if key < root.val:
            root.left = self.deleteNode(root.left , key)
        elif root.val < key:
            root.right = self.deleteNode(root.right , key)
        elif root.val == key:
            if not root.left:
                return root.right
            elif not root.right:
                return root.left
            
            min_node = findmin(root.right)
            root.val = min_node.val
            root.right = self.deleteNode(root.right , min_node.val)
        return root
```

### 原先寫的錯誤

沒有依照bst 的刪除程序(如果右邊的補上來，應該找右邊最小的當根、如果左邊的補上來，應該找左邊最大的當根)

資測只有 71 / 92 

```python
# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
class Solution:
    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:
        if not root:
            return

        def delete(node , key):

            left = node.left
            right = node.right
            if not left and not right:
                return 

            if right :
                node.val = right.val
                node.right = delete(right , right.val )
                node.left = left
            elif left:
                node.val = left.val
                node.left = delete(left , left.val )
                node.right = right 
                 
            return node

        def bfs(node):
            if not node:
                return
            left = node.left
            right = node.right

            if left and left.val == key:
                node.left = delete(left , key)
            if right and right.val == key:
                node.right = delete(right , key)

            bfs(left)
            bfs(right)
            return node

        if root.val == key:
            return delete(root,key)
        
        bfs(root )

        return root
        
```