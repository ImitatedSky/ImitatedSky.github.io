---
title: "Leetcode#116.\_Populating Next Right Pointers in Each Node"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]
- Linked List
- Tree
- Depth-First Search
- Breadth-First Search
- Binary Tree


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-19 09:50:48
comments: false
---

# `Problem`

You are given a **perfect binary tree** where all leaves are on the same level, and every parent has two children. The binary tree has the following definition:

```
struct Node {
  int val;
  Node *left;
  Node *right;
  Node *next;
}

```

Populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to `NULL`.

Initially, all next pointers are set to `NULL`.

**Example 1:**

![](https://assets.leetcode.com/uploads/2019/02/14/116_sample.png)

```
Input: root = [1,2,3,4,5,6,7]
Output: [1,#,2,3,#,4,5,6,7,#]
Explanation:Given the above perfect binary tree (Figure A), your function should populate each next pointer to point to its next right node, just like in Figure B. The serialized output is in level order as connected by the next pointers, with '#' signifying the end of each level.

```

**Example 2:**

```
Input: root = []
Output: []

```

**Constraints:**

- The number of nodes in the tree is in the range `[0, 212 - 1]`.
- `1000 <= Node.val <= 1000`

**Follow-up:**

- You may only use constant extra space.
- The recursive approach is fine. You may assume implicit stack space does not count as extra space for this problem.

# `Solve`

top-down  recursive

```python
class Solution:
    def connect(self, root: 'Optional[Node]') -> 'Optional[Node]':

        def set_node(root):

            if not root:
                return
            if root.left:
                root.left.next = root.right
            if root.right and root.next:
                root.right.next = root.next.left
            
            #兩個順序可以調換
            set_node(root.left) 
            set_node(root.right)
            
            return root

        return set_node(root)
```

簡化一點

```python
class Solution:
    def connect(self, root: 'Optional[Node]') -> 'Optional[Node]':

        if not root:
            return root
        
        if root.left:
            root.left.next = root.right
        if root.right and root.next:
            root.right.next = root.next.left
        
        #兩個順序可以調換
        self.connect(root.left)
        self.connect(root.right)

        return root
```