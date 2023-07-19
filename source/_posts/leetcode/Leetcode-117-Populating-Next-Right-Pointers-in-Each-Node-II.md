---
title: "Leetcode#117.\_Populating Next Right Pointers in Each Node II"
tags:
  - []
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
date: 2023-07-19 13:15:45
---

# `Problem`

Given a binary tree

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

![](https://assets.leetcode.com/uploads/2019/02/15/117_sample.png)

```
Input: root = [1,2,3,4,5,null,7]
Output: [1,#,2,3,#,4,5,7,#]
Explanation:Given the above binary tree (Figure A), your function should populate each next pointer to point to its next right node, just like in Figure B. The serialized output is in level order as connected by the next pointers, with '#' signifying the end of each level.

```

**Example 2:**

```
Input: root = []
Output: []

```

**Constraints:**

- The number of nodes in the tree is in the range `[0, 6000]`.
- `100 <= Node.val <= 100`

**Follow-up:**

- You may only use constant extra space.
- The recursive approach is fine. You may assume implicit stack space does not count as extra space for this problem.

# `Solve`

可以先去看看116

這邊就是多一 `指針` `curr`，協助找子節點 next

```python
if root is None:
            return None
        
        # 左子節點和右子節點的 next 指針連接
        if root.left:
            if root.right:
                root.left.next = root.right  # 左子節點 next 指向右子節點
            else:
                # 找右側存在的節點
                curr = root.next
                
                # 重複尋找右側存在的子節點
                while curr:
                    if curr.left:
                        root.left.next = curr.left # 左子節點 next
                        break # 找到後就跳出
                    elif curr.right:
                        root.left.next = curr.right
                        break # 找到後就跳出
                    curr = curr.next
        
        # 右子節點和右子節點的 next 指針連接
        if root.right:
            # 找右側存在的節點
            curr = root.next

            # 重複尋找右側存在的子節點
            while curr:
                if curr.left:
                    root.right.next = curr.left
                    break
                elif curr.right:
                    root.right.next = curr.right
                    break
                curr = curr.next
        
        # 遞迴處理右子樹和左子樹
        # 先處理右子樹，因為左子樹的 next 指針可能會用到右子樹的 next 指針
        self.connect(root.right)
        self.connect(root.left)
        
        return root
```