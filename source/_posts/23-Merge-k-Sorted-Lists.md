---
title: 23. Merge k Sorted Lists
tags:
- [Leetcode]
- [Python]
- [hard]

- [💡]
- Linked List
- Divide and Conquer
- Heap (Priority Queue)
- Merge Sort

date: 2023-07-17 11:30:40
cover: /img/cover/leetcode.jpg
categories: Leetcode
---

## `Problem`

You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*

**Example 1:**

```
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6

```

**Example 2:**

```
Input: lists = []
Output: []

```

**Example 3:**

```
Input: lists = [[]]
Output: []

```

**Constraints:**

- `k == lists.length`
- `0 <= k <= 104`
- `0 <= lists[i].length <= 500`
- `104 <= lists[i][j] <= 104`
- `lists[i]` is sorted in **ascending order**.
- The sum of `lists[i].length` will not exceed `104`.

## `Solve`

Leetcode#**148**

```python
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:

        # if lists is empty, return None
        if not lists:
            return None

        # if lists has only one element, return that element
        if len(lists) == 1:
            return lists[0]

        # if lists has more than one element, merge them
        # merge the first two lists, and then merge the result with the third list, and so on
        # until all lists are merged
        merged_list = lists[0]
        for i in range(1, len(lists)):
            merged_list = self.mergeTwoLists(merged_list, lists[i])

        return merged_list
    
    def mergeTwoLists(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # if l1 is empty, return l2
        if not l1:
            return l2

        # if l2 is empty, return l1
        if not l2:
            return l1

        # if l1 and l2 are not empty, merge them
        # create a new list to store the merged list
        merged_list = ListNode()
        # create a pointer to traverse the merged list
        pointer = merged_list

        # while l1 and l2 are not empty, compare the first elements of l1 and l2
        # add the smaller one to the merged list
        # move the pointer to the next element of the merged list
        while l1 and l2:
            if l1.val <= l2.val:
                pointer.next = l1
                l1 = l1.next
            else:
                pointer.next = l2
                l2 = l2.next
            pointer = pointer.next

        # if l1 is empty, add the rest of l2 to the merged list
        if not l1:
            pointer.next = l2

        # if l2 is empty, add the rest of l1 to the merged list
        if not l2:
            pointer.next = l1

        return merged_list.next
```

## 可以過 但速度太慢

原先寫得
但時間複雜度太慘， 

- 每回合的合併需要花：O(n)
- 總共需要回合數：O(n log n)  ?這邊還要想一下是不是

想法是:

將每一個對比合併，但思考後 應該可以用(Leetcode#**148**)的方法
先將全部合併，在merge sort 排序

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:

        min_val = -10**4

        if not lists :
            return None
        
        if len(lists) == 1 :
            return lists[0]

        h = res = ListNode(min_val)

        for i in range( len(lists)):
            h = self.merge(h,lists[i])

        return res.next

    def merge(self,l1: List[Optional[ListNode]],l2: List[Optional[ListNode]]):

        if not l1:
            return l2
        if not l2:
            return l1

        while l1 and l2:
            if l1.val < l2.val:
                l1.next = self.merge(l1.next , l2)
                return l1
            else:
                l2.next = self.merge(l1 , l2.next)
                return l2
```

## 偷吃步

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:

        # merge all lists into one list
        merged_list = []
        for i in lists:
            while i:
                merged_list.append(i.val)
                i = i.next

           
                
                
        # sort the merged list
        a = sorted(merged_list,reverse=True)
        
        final=None

        for i in a:
            final=ListNode(i,final)

        return final
```

```python
# merge all lists into one list
        merged_list = []
        for i in lists:
            while i:
                merged_list.append(i.val)
                i = i.next

           
                
                
        # sort the merged list
        merged_list.sort()
        # reverse the merged list
        merged_list.reverse()
        
        final=None

        for i in merged_list:
            final=ListNode(i,final)

        return final
```