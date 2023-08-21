---
title: "Leetcode#530.\_Minimum Absolute Difference in BST"
tags:
- [Leetcode]
- [Python]
- [easy]

- [💡]
- Tree
- Depth-First Search
- Breadth-First Search
- Binary Search Tree
- Binary Tree


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-21 11:09:32
---

# `Problem`

Given the `root` of a Binary Search Tree (BST), return *the minimum absolute difference between the values of any two different nodes in the tree*.

**Example 1:**

![](https://assets.leetcode.com/uploads/2021/02/05/bst1.jpg)

!https://assets.leetcode.com/uploads/2021/02/05/bst1.jpg

```
Input: root = [4,2,6,1,3]
Output: 1

```

**Example 2:**

![](https://assets.leetcode.com/uploads/2021/02/05/bst2.jpg)

!https://assets.leetcode.com/uploads/2021/02/05/bst2.jpg

```
Input: root = [1,0,48,null,null,12,49]
Output: 1

```

**Constraints:**

- The number of nodes in the tree is in the range `[2, 10^4]`.
- `0 <= Node.val <= 10^5`

# `Solve`

### `法一`

由於有`有序`性質、且`正整數`

遍歷一遍，後項減前項，找出最小即可

```python
class Solution:
    def __init__(self):
				#結果先放入無限大，後面比對方便
        self.res = float('inf')
        self.pre = None

    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        self.order_traversal(root)
        return self.res

    # 先從最左邊開始，一路往右邊走
    # self.pre 紀錄前一個節點，當root.left為None時，self.pre = root.val
    # 所以在root.right時，self.pre 剛好是他的父節點
    def order_traversal(self, root):
        # root為None時，返回
        if not root:
            return

        # dfs 先往左邊走
        self.order_traversal(root.left)

        # 計算結果
        if self.pre is not None:
            self.res = min(self.res, root.val - self.pre)

        # 紀錄前一個節點
        self.pre = root.val

        # dfs 往右邊走
        self.order_traversal(root.right)
```

### `Note`

BST 若為有序

遍歷的順序為 

1              2               3               4               5               6               7

root.left.left → root.left → root.left.right → root → root.right.left → root.right → root.right.right

```javascript
      4
     / \
    2   6
   / \ / \
  1  3 5  7
```

down-top 的走法