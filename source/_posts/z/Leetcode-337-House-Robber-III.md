---
title: Leetcode#337. House Robber III
tags:
- [Leetcode]
- [Python]
- [medium]
- 施工中
- [💡]

- Dynamic Programming
- Tree
- Depth-First Search
- Binary Tree

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 09:28:45
---

# `Problem`

The thief has found himself a new place for his thievery again. There is only one entrance to this area, called `root`.

Besides the `root`, each house has one and only one parent house. After a tour, the smart thief realized that all houses in this place form a binary tree. It will automatically contact the police if **two directly-linked houses were broken into on the same night**.

Given the `root` of the binary tree, return *the maximum amount of money the thief can rob **without alerting the police***.

**Example 1:**

!https://assets.leetcode.com/uploads/2021/03/10/rob1-tree.jpg

![](https://assets.leetcode.com/uploads/2021/03/10/rob1-tree.jpg)

```
Input: root = [3,2,3,null,3,null,1]
Output: 7
Explanation: Maximum amount of money the thief can rob = 3 + 3 + 1 = 7.

```

**Example 2:**

!https://assets.leetcode.com/uploads/2021/03/10/rob2-tree.jpg

![](https://assets.leetcode.com/uploads/2021/03/10/rob2-tree.jpg)

```
Input: root = [3,4,5,1,3,null,1]
Output: 9
Explanation: Maximum amount of money the thief can rob = 4 + 5 = 9.

```

**Constraints:**

- The number of nodes in the tree is in the range `[1, 104]`.
- `0 <= Node.val <= 104`

# `Solve`

**Time Limit Exceeded**

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:

        def dd(node):
            if not node:
                return (0,0)
            
            left = node.left
            right = node.right

            submax = max( dd(left) ) + max( dd(right) )
            addcurmax = node.val +  dd(left)[1] + dd(right)[1]  

            return (addcurmax , submax)

        return max( dd(root) )
```

改成這樣就沒問題，原先單純沒有把postorder格式寫好，導致會一直重複運算

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:

        def dd(node):
            if not node:
                return (0,0)
            
            left = dd(node.left)
            right = dd(node.right)

            submax = max( left ) + max( right )
            addcurmax = node.val +  left[1] + right[1]  

            return (addcurmax , submax)

        return max( dd(root) )
```