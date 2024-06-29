---
title: Leetcode#169. Majority Element
tags:
- [Leetcode]
- [Python]
- [easy]
- Array
- Hash Table
- Divide and Conquer
- Sorting
- Counting
- [💡]



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-06-30 00:24:26
---

# `Problem`

Given an array `nums` of size `n`, return *the majority element*.

The majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array.

**Example 1:**

```
Input: nums = [3,2,3]
Output: 3

```

**Example 2:**

```
Input: nums = [2,2,1,1,1,2,2]
Output: 2

```

**Constraints:**

- `n == nums.length`
- `1 <= n <= 5 * 104`
- `109 <= nums[i] <= 109`

**Follow-up:**

Could you solve the problem in linear time and in

```
O(1)
```

space?

# `Solve`

## 解1

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        dicts = {}
        for i in range(len(nums)):
            if nums[i] in dicts:
                dicts[nums[i]]+=1
            else:
                dicts[nums[i]] = 1
            if dicts[nums[i]] > len(nums) / 2:
                return nums[i]
```

## 簡化

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        dicts = {}
        for num in nums:
            if num in dicts:
                dicts[num] += 1
            else:
                dicts[num] = 1

            if dicts[num] > len(nums) / 2:
                return num
```

## 特殊解法

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        nums.sort()
        ans = len(nums) // 2
        return nums[ans]
        
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        nums.sort()
        n = len(nums)
        return nums[n//2]
```