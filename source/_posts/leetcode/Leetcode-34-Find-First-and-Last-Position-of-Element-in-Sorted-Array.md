---
title: "Leetcode#34.\_Find First and Last Position of Element in Sorted Array"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]
- Array
- Binary Search


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-28 09:52:23
---

# `Problem`

Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value.

If `target` is not found in the array, return `[-1, -1]`.

You must write an algorithm with `O(log n)` runtime complexity.

**Example 1:**

```
Input: nums = [5,7,7,8,8,10], target = 8
Output: [3,4]

```

**Example 2:**

```
Input: nums = [5,7,7,8,8,10], target = 6
Output: [-1,-1]

```

**Example 3:**

```
Input: nums = [], target = 0
Output: [-1,-1]

```

**Constraints:**

- `0 <= nums.length <= 10^5`
- `10^9 <= nums[i] <= 10^9`
- `nums` is a non-decreasing array.
- `10^9 <= target <= 10^9`

# `Solve`

使用標準的Binary Search 來做這題

先用二分法找到target

因為target可能有重複，找到後，再前後延伸搜索

```python
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        if not nums:
            return [-1, -1]
        left = 0
        right = len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                left = mid
                right = mid
                while left > 0 and nums[left - 1] == target:
                    left -= 1
                while right < len(nums) - 1 and nums[right + 1] == target:
                    right += 1
                return [left, right]
            elif nums[mid] > target:
                right = mid - 1
            else:
                left = mid + 1
        return [-1, -1]
```