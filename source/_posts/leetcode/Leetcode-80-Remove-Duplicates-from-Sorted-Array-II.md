---
title: Leetcode#80. Remove Duplicates from Sorted Array II
tags:
- [Leetcode]
- [Python]

- [medium]


- [💡]
- Array
- Two Pointers



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-06-30 00:02:05
---


# `Problem`

Given an integer array `nums` sorted in **non-decreasing order**, remove some duplicates [**in-place**](https://en.wikipedia.org/wiki/In-place_algorithm) such that each unique element appears **at most twice**. The **relative order** of the elements should be kept the **same**.

Since it is impossible to change the length of the array in some languages, you must instead have the result be placed in the **first part** of the array `nums`. More formally, if there are `k` elements after removing the duplicates, then the first `k` elements of `nums` should hold the final result. It does not matter what you leave beyond the first `k` elements.

Return `k` *after placing the final result in the first* `k` *slots of* `nums`.

Do **not** allocate extra space for another array. You must do this by **modifying the input array [in-place](https://en.wikipedia.org/wiki/In-place_algorithm)** with O(1) extra memory.

**Custom Judge:**

The judge will test your solution with the following code:

```
int[] nums = [...]; // Input array
int[] expectedNums = [...]; // The expected answer with correct length

int k = removeDuplicates(nums); // Calls your implementation

assert k == expectedNums.length;
for (int i = 0; i < k; i++) {
    assert nums[i] == expectedNums[i];
}

```

If all assertions pass, then your solution will be **accepted**.

**Example 1:**

```
Input: nums = [1,1,1,2,2,3]
Output: 5, nums = [1,1,2,2,3,_]
Explanation: Your function should return k = 5, with the first five elements of nums being 1, 1, 2, 2 and 3 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).

```

**Example 2:**

```
Input: nums = [0,0,1,1,1,1,2,3,3]
Output: 7, nums = [0,0,1,1,2,3,3,_,_]
Explanation: Your function should return k = 7, with the first seven elements of nums being 0, 0, 1, 1, 2, 3 and 3 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).

```

**Constraints:**

- `1 <= nums.length <= 3 * 104`
- `104 <= nums[i] <= 104`
- `nums` is sorted in **non-decreasing** order.

# `Solve`

[Leetcode-26-Remove-Duplicates-from-Sorted-Array](../Leetcode-26-Remove-Duplicates-from-Sorted-Array)

two point 重點

0~i : 已經處理過`要保留的`

i~j : 已經處理過 `不需要保留`

j~ : `未見過得` 

所以從i = 2開始看

```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:

        i = 2
        
        for j in range(2,len(nums)):
            if nums[j] != nums[i-2]:

                nums[i]=nums[j]
                i+=1
        
        return i
```

## 錯誤紀錄

```python
def removeDuplicates(nums):

    i = 0
    star = True
    for j in range(1 , len(nums)):
        if nums[j] == nums[i] and star:
            i+=1
            star = False
        if nums[j] != nums[i]:
            star = True
            i+=1
            nums[i]= nums[j]
    print(i)
    print(nums[:i+1])

nums = [1,1,1,2,2,3]
removeDuplicates(nums)

nums = [0,0,1,1,1,1,2,3,3,3]
removeDuplicates(nums)
'''
4
[1, 1, 2, 2, 3]
8
[0, 0, 1, 1, 2, 3, 2, 3, 3]
'''
```