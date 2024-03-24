---
title: "Leetcode#198.\_House Robber"
tags:
- [Leetcode]
- [Python]
- [medium]
- [💡]

- Array
- Dynamic Programming

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-21 13:39:19
---
可以先看看
[leetcode70](../Leetcode-70-Climbing-Stairs)

# `Problem`

You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array `nums` representing the amount of money of each house, return *the maximum amount of money you can rob tonight **without alerting the police***.

**Example 1:**

```
Input: nums = [1,2,3,1]
Output: 4
Explanation: Rob house 1 (money = 1) and then rob house 3 (money = 3).
Total amount you can rob = 1 + 3 = 4.

```

**Example 2:**

```
Input: nums = [2,7,9,3,1]
Output: 12
Explanation: Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1).
Total amount you can rob = 2 + 9 + 1 = 12.

```

**Constraints:**

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 400`

# `Solve`

## `遞迴`

```python
#Time Limit Exceeded
class Solution:
    def rob(self, nums: List[int]) -> int:
        

        def dp(nums):
            n = len(nums)
            if n == 0: return 0
            if n == 1: return nums[0]
            if n == 2: return max(nums[0], nums[1])

            return max(dp(nums[:-2]) + nums[-1], dp(nums[:-1]))
            
        return dp(nums)
```

加上 menory

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        meno = {}

        def dp(nums):
            n = len(nums)

            if n in meno: return meno[n]
            if n == 0: return 0
            if n == 1: return nums[0]
            if n == 2: return max(nums[0], nums[1])

            meno[n] = max(dp(nums[:-2]) + nums[-1], dp(nums[:-1]))

            return meno[n]
            
        return dp(nums)
```

## `dp`

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1: return nums[0]
        if len(nums) == 2: return max(nums)

        dp = [0]*len(nums)
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])

        for i in range(2,len(nums)):
            dp[i] = max(dp[i-2] + nums[i], dp[i-1])
        return dp[-1]
```