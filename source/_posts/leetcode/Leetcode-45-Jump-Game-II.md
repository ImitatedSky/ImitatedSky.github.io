---
title: "Leetcode#45.\_Jump Game II"
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
date: 2023-08-29 16:08:26
---

# `Problem`

You are given a **0-indexed** array of integers `nums` of length `n`. You are initially positioned at `nums[0]`.

Each element `nums[i]` represents the maximum length of a forward jump from index `i`. In other words, if you are at `nums[i]`, you can jump to any `nums[i + j]` where:

- `0 <= j <= nums[i]` and
- `i + j < n`

Return *the minimum number of jumps to reach* `nums[n - 1]`. The test cases are generated such that you can reach `nums[n - 1]`.

**Example 1:**

```
Input: nums = [2,3,1,1,4]
Output: 2
Explanation: The minimum number of jumps to reach the last index is 2. Jump 1 step from index 0 to 1, then 3 steps to the last index.

```

**Example 2:**

```
Input: nums = [2,3,0,1,4]
Output: 2

```

**Constraints:**

- `1 <= nums.length <= 10^4`
- `0 <= nums[i] <= 1000`
- It's guaranteed that you can reach `nums[n - 1]`.

# `Solve`

和**Jump Game I 不同，沒有到不了的問題**

### `法1`

想法蠻簡單的做一個DP，紀錄到達這個節點，最少步數

不需要回頭做

但題目要求要為Greedy algo

```python
class Solution:
    def jump(self, nums: List[int]) -> int:

        dp = {}
        dp[0] = 0

        for i in range(0, len(nums) ):
            
            for j in range(0 , nums[i]+1 ):
                if i+j in dp:
                    continue
                dp[i+j] = dp[i]+1

        return dp[len(nums)-1]
```

 

### `法3 Greedy algo`

其實跟法1想法一樣，但更快且Space complexity 更少

不斷更新reach 最遠可以到達的，當到達紀錄的last點時，

再跳躍一次，更新最遠距離，並將count += 1

```python
# 網路的解
class Solution:
    def jump(self, nums):
        # Initialize reach (maximum reachable index), count (number of jumps), and last (rightmost index reached)
        reach, count, last = 0, 0, 0
        
        # Loop through the array excluding the last element
        for i in range(len(nums)-1):    
            # Update reach to the maximum between reach and i + nums[i]
            reach = max(reach, i + nums[i])
        
            # If i has reached the last index that can be reached with the current number of jumps
            if i == last:
                # Update last to the new maximum reachable index
                last = reach
                # Increment the number of jumps made so far
                count += 1
        
        # Return the minimum number of jumps required
        return count
```