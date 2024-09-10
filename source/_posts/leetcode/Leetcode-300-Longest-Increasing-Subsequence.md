---
title: Leetcode#300. Longest Increasing Subsequence
tags:
- [Leetcode]
- [Python]

- [medium]
- [hard]

- [💡]

- Array
- Binary Search
- Dynamic Programming

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-09-10 15:16:35
---

# `Problem`

Given an integer array `nums`, return *the length of the longest **strictly increasing***

***subsequence***

.

**Example 1:**

```
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The longest increasing subsequence is [2,3,7,101], therefore the length is 4.

```

**Example 2:**

```
Input: nums = [0,1,0,3,2,3]
Output: 4

```

**Example 3:**

```
Input: nums = [7,7,7,7,7,7,7]
Output: 1

```

**Constraints:**

- `1 <= nums.length <= 2500`
- `104 <= nums[i] <= 104`

**Follow up:** Can you come up with an algorithm that runs in `O(n log(n))` time complexity?

# `Solve`

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        dp = [1]*(len(nums)+1)

        for i in range( len(nums) ):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max( dp[i] , dp[j] + 1 )
        
        return max(dp)
        
```

寫的時候1次過，嘿嘿[**(,,・ω・,,)**](https://symbols.wisdom-life.in/zh-TW/emoticon/shy)