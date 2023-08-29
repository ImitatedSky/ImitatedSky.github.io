---
title: "Leetcode#55.\_Jump Game"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Array
- Dynamic Programming
- Greedy



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-29 11:09:02
---
# `Problem`

You are given an integer array `nums`. You are initially positioned at the array's **first index**, and each element in the array represents your maximum jump length at that position.

Return `true` *if you can reach the last index, or* `false` *otherwise*.

**Example 1:**

```
Input: nums = [2,3,1,1,4]
Output: true
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.

```

**Example 2:**

```
Input: nums = [3,2,1,0,4]
Output: false
Explanation: You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.

```

**Constraints:**

- `1 <= nums.length <= 10^4`
- `0 <= nums[i] <= 10^5`

# `Solve`

## `法一`

想法做一個DP，紀錄節點可以往前走的步數

DP[i] = max( DP[i-1] -1  , nums[i] ) 和前面一點比較誰可以走更遠，取大值

最後當 DP[i]可以往前的步數+ 當前位置，超出最後一點，`return True`

當有一節點會往回走，或是沒有前進`return False`

```python
# 直接將想法刻出來，蠻醜的
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        if len(nums) <= 1:
            return True
        elif nums[0]<= 0:
            return False
        dp = {}
        dp[0] = nums[0]

        for i in range(1 , len(nums)):
            dp[i] = max(dp[i-1] -1  , nums[i] )
            
            if dp[i] + i >= len(nums)-1 :
                return True
            elif dp[i] <= 0:
                return False
```

### `優化1`

改變 **往前走的步數** → 最遠可達到的位置

```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        if len(nums) <= 1:
            return True
        elif nums[0]<= 0:
            return False

        dp = {}
        dp[0] = nums[0]

        for i in range(1, len(nums)):
            

            dp[i] = max(dp[i-1] , i + nums[i])

            if dp[i] >= len(nums) - 1:
                return True
            elif dp[i] <= i:
                return False

        return False
```

`然後發現根本不需要DP記錄所有`

所以 判斷變成

沒往前就`return False`

超過就`return True`

```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        if len(nums) <= 1:
            return True

        dp = nums[0]

        for i in range(1, len(nums)):
            if dp < i:
                return False

            dp = max(dp, i + nums[i])

            if dp >= len(nums) - 1:
                return True

        return False
```