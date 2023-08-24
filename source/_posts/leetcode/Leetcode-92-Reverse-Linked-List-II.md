---
title: "Leetcode#92.\_Reverse Linked List II"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Linked List



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-24 11:15:17
---

# `Problem`

Given the `head` of a singly linked list and two integers `left` and `right` where `left <= right`, reverse the nodes of the list from position `left` to position `right`, and return *the reversed list*.

**Example 1:**

![](https://assets.leetcode.com/uploads/2021/02/19/rev2ex2.jpg)

!https://assets.leetcode.com/uploads/2021/02/19/rev2ex2.jpg

```
Input: head = [1,2,3,4,5], left = 2, right = 4
Output: [1,4,3,2,5]

```

**Example 2:**

```
Input: head = [5], left = 1, right = 1
Output: [5]

```

**Constraints:**

- The number of nodes in the list is `n`.
- `1 <= n <= 500`
- `500 <= Node.val <= 500`
- `1 <= left <= right <= n`

# `Solve`

### `法1`

題目一開始沒有看清楚

原來是 position ‘left’ 、 position ‘right’，還以為是跑到與left、right 相同的數字進行反轉，導致一直錯

這類題目就是用一個指標指向開頭，將後面節點進行一陣操作後

返回指向 **開頭的節點** 的指標

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:  
        curr = head
        dummy = ListNode(0)
        dummy.next = head
        
        # prev 會是在left 前一個
        prev = dummy
        for _ in range(left - 1):
            prev = prev.next

        # curr 是 left節點
        curr = prev.next
        
        for _ in range(right - left): # 執行 right - left 次
            # nxt 是 curr 的下一個節點
            nxt = curr.next
            # 將 curr 的下一個節點指向 nxt 的下一個節點
            curr.next = nxt.next
            # 將 nxt 的下一個節點指向 prev 的下一個節點
            nxt.next = prev.next
            # 將 prev 的下一個節點指向 nxt
            prev.next = nxt

        return dummy.next
```

