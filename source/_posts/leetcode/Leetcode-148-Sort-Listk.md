---
title: "Leetcode#148.\_Sort Listk"
date: 2023-07-14 10:38:50
categories: Leetcode
cover: /img/cover/leetcode.jpg
tags: 
- [Leetcode]
- [Python]
- [medium]
- [💡]
- [Linked List]
- [Two Pointers]
- [Divide and Conquer]
- [Sorting]
- [Merge Sort]

updated:
---
# `Problem`

Given the `head` of a linked list, return *the list after sorting it in **ascending order***.

**Example 1:**

!https://assets.leetcode.com/uploads/2020/09/14/sort_list_1.jpg

```
Input: head = [4,2,1,3]
Output: [1,2,3,4]

```

**Example 2:**

!https://assets.leetcode.com/uploads/2020/09/14/sort_list_2.jpg

```
Input: head = [-1,5,3,4,0]
Output: [-1,0,3,4,5]

```

**Example 3:**

```
Input: head = []
Output: []
```

# `Solve`

```python
class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:

        # 沒有 或只只有一個 代表已經排好了
        if not head or not head.next:
            return head
        
        # 用快慢指針找到中間點
        slow = head
        fast = head.next

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        mid= slow.next
        slow.next = None

        # 遞迴調用 sortList 函式 排序左右兩邊
        left = self.sortList(head)
        right = self.sortList(mid)

        # 創建兩個指針，指向相同的 ListNode(0) 
        h = res = ListNode(0)
        
        # 將兩個已排序鏈表的合併
        while left and right:
            if left.val < right.val:
                h.next= left
                left = left.next
                # 如果左半部分鏈表的節點值小於右半部分鏈表的節點值，
                # 將 h 的下一個節點指向 left，同時更新 left 指針到下一個節點。
            else:
                h.next = right
                right = right.next
                # 如果右半部分鏈表的節點值小於等於左半部分鏈表的節點值，
                # 將 h 的下一個節點指向 right，同時更新 right 指針到下一個節點
            h = h.next
            # 更新 h 指針到下一個節點

            
        # 連接剩下的
        h.next = left if left else right
        return res.next
```

### 拆分為三個函式

```python
class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # 如果鏈表為空或只有一個節點，則無需排序，直接返回鏈表
        if not head or not head.next:
            return head
        
        # 獲取鏈表的中間節點
        mid = self.getMiddle(head)
        
        # 遞迴排序左半部分鏈表和右半部分鏈表
        left = self.sortList(head)
        right = self.sortList(mid)
        
        # 合併排序後的左半部分鏈表和右半部分鏈表
        return self.merge(left, right)
    
    def getMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # 使用快慢指針法找到鏈表的中間節點
        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        
        # 將鏈表切分成兩半，並返回中間節點
        mid = slow.next
        slow.next = None
        return mid
    
    def merge(self, left: Optional[ListNode], right: Optional[ListNode]) -> Optional[ListNode]:
        """
        合併兩個已排序的鏈表

        Args:
            left: 第一個已排序的鏈表的頭節點
            right: 第二個已排序的鏈表的頭節點

        Returns:
            合併後的已排序鏈表的頭節點
        """

        # 如果其中一個鏈表為空，則直接返回另一個鏈表
        if not left:
            return right
        if not right:
            return left
        
        # 比較兩個鏈表頭節點的值
        if left.val < right.val:
            # 如果左鏈表的頭節點值較小，則將其連接到合併後的鏈表，
            # 同時遞迴地將左鏈表的下一個節點和右鏈表傳入 merge 函式進行合併
            left.next = self.merge(left.next, right)

            # 返回合併後的鏈表的頭節點
            return left
        else:
            # 如果右鏈表的頭節點值較小或相等，則將其連接到合併後的鏈表，
            # 同時遞迴地將左鏈表和右鏈表的下一個節點傳入 merge 函式進行合併
            right.next = self.merge(left, right.next)

            # 返回合併後的鏈表的頭節點
            return right
```

程式碼將原先的 **`sortList`** 函式拆分為三個函式：**`sortList`**、**`getMiddle`** 和 **`merge`**。**`sortList`** 函式仍然是入口點，用於遞迴調用和合併兩部分鏈表，**`getMiddle`** 函式用於獲取鏈表的中間節點並切斷鏈表，**`merge`** 函式用於合併兩個已排序的鏈表。

在 **`merge`** 函式中，通過比較兩個鏈表的頭節點的值，每次選擇較小的節點，並將其 **`next`** 指針指向遞迴調用的結果，最後返回合併後的鏈表。

這樣的實現方式可以使用合併排序的思想對鏈表進行排序，達到相同的效果。