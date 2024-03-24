---
title: "Leetcode#283.\_Move Zeroes"
tags:
- [Leetcode]
- [Python]
- [easy]
- 施工中
- Array
- Two Pointers





cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 13:24:22
---

# `Problem`

Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.

**Note** that you must do this in-place without making a copy of the array.

**Example 1:**

```
Input: nums = [0,1,0,3,12]
Output: [1,3,12,0,0]

```

**Example 2:**

```
Input: nums = [0]
Output: [0]

```

**Constraints:**

- `1 <= nums.length <= 10^4`
- `2^31 <= nums[i] <= 2^31 - 1`

**Follow up:**

Could you minimize the total number of operations done?

# `Solve`

```python
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        s = 0
        for i in range( len(nums) ):
            if nums[i] != 0:
                nums[s] = nums[i]
                s += 1 
        for j in range(s , len(nums)):
            nums[j] = 0
```