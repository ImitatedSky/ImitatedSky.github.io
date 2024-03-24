---
title: "Leetcode#1493.\_Longest Subarray of 1's After Deleting One Element"
tags:
- [Leetcode]
- [Python]

- [medium]
- 施工中
- [💡]

- Array
- Dynamic Programming
- Sliding Window

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 15:11:41
---

# `Problem`

Given a binary array `nums`, you should delete one element from it.

Return *the size of the longest non-empty subarray containing only* `1`*'s in the resulting array*. Return `0` if there is no such subarray.

**Example 1:**

```
Input: nums = [1,1,0,1]
Output: 3
Explanation: After deleting the number in position 2, [1,1,1] contains 3 numbers with value of 1's.

```

**Example 2:**

```
Input: nums = [0,1,1,1,0,1,1,0,1]
Output: 5
Explanation: After deleting the number in position 4, [0,1,1,1,1,1,0,1] longest subarray with value of 1's is [1,1,1,1,1].

```

**Example 3:**

```
Input: nums = [1,1,1]
Output: 2
Explanation: You must delete one element.

```

**Constraints:**

- `1 <= nums.length <= 10^5`
- `nums[i]` is either `0` or `1`.

# `Solve`

直接用**[1004. Max Consecutive Ones III](https://leetcode.com/problems/max-consecutive-ones-iii/) 作法去改**



```python
class Solution:
    def longestSubarray(self, nums: List[int]) -> int:

        l , r = 0 , 0

        k = 1

        for r in range(len(nums)):

            if nums[r] == 0 :
                k-=1
            
            if k < 0:
                if nums[l] == 0:
                    k +=1

                l+=1

        return r - l
```