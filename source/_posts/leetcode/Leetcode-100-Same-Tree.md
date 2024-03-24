---
title: "Leetcode#100.\_Same Tree"
tags:
- [Leetcode]
- [Python]
- [medium]

- Tree
- Depth-First Search
- Breadth-First Search
- Binary Tree



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-25 10:06:07
---
# `Problem`

Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.

**Example 1:**

![](https://assets.leetcode.com/uploads/2020/12/20/ex1.jpg)

!https://assets.leetcode.com/uploads/2020/12/20/ex1.jpg

```
Input: p = [1,2,3], q = [1,2,3]
Output: true

```

**Example 2:**

![](https://assets.leetcode.com/uploads/2020/12/20/ex2.jpg)

!https://assets.leetcode.com/uploads/2020/12/20/ex2.jpg

```
Input: p = [1,2], q = [1,null,2]
Output: false

```

**Example 3:**

![](https://assets.leetcode.com/uploads/2020/12/20/ex3.jpg)

!https://assets.leetcode.com/uploads/2020/12/20/ex3.jpg

```
Input: p = [1,2,1], q = [1,1,2]
Output: false

```

**Constraints:**

- The number of nodes in both trees is in the range `[0, 100]`.
- `10^4 <= Node.val <= 10^4`

# `Solve`

```python
class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p and not q:
            return True
        elif not p or not q or p.val != q.val:
            return False
        return (self.isSameTree(p.left,q.left) and self.isSameTree(p.right,q.right))
```