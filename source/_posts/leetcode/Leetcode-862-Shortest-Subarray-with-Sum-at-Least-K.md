---
title: "Leetcode#862.\_Shortest Subarray with Sum at Least K"
tags:
- [Leetcode]
- [Python]

- [hard]


- [💡]
- Array
- Binary Search
- Queue
- Sliding Window
- Heap (Priority Queue)
- Prefix Sum
- Monotonic Queue



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-27 16:37:33
---

# `Problem`

Given an integer array `nums` and an integer `k`, return *the length of the shortest non-empty **subarray** of* `nums` *with a sum of at least* `k`. If there is no such **subarray**, return `-1`.

A **subarray** is a **contiguous** part of an array.

**Example 1:**

```
Input: nums = [1], k = 1
Output: 1

```

**Example 2:**

```
Input: nums = [1,2], k = 4
Output: -1

```

**Example 3:**

```
Input: nums = [2,-1,2], k = 3
Output: 3

```

**Constraints:**

- `1 <= nums.length <= 10^5`
- `10^5 <= nums[i] <= 10^5`
- `1 <= k <= 10^9`

# `Solve`

想破頭 簡單說就是 找到第一組解後 左右去肢

```python
class Solution:
    def shortestSubarray(self, nums: List[int], k: int) -> int:
        n = len(nums)
        
        pre_sum = [0]*(n+1)
        
        # 第 i 個 代表包含 前i個 總和
        for i in range( n):
            pre_sum[i + 1 ] = pre_sum[i] + nums[i]

        min_len = float("inf")
        
        queue = []

        for r in range(n+1):
            # 滿足條件計算
            while queue and pre_sum[r] - pre_sum[ queue[0] ] >= k :
                l = queue.pop(0)
                min_len = min(min_len , r - l)

            # 如果queue 裏頭 比最後一個加總還大，直接將其去掉，
            # 因為下一次做的時候，    - pre_sum[ queue[0] ]  減去更小的 一定會滿足 >= k， 而且長度更短
            # 所以也不需要將繼續放在駐列裡
            while queue and pre_sum[r] <= pre_sum[queue[-1]]:
                queue.pop()

            queue.append(r) 

        return min_len if min_len != float("inf") else -1
```

暴力解，想當然 Time Limt Exceeded

```python
class Solution:
    def shortestSubarray(self, nums: List[int], k: int) -> int:
        n = len(nums)
        res = float("inf") 
        for i in range(n):
            total = 0
            for j in range(i, n):
                total += nums[j]
                if total >= k:
                    res = min(res, j - i + 1)
        return res if res <= n else -1
```

### error錯誤記錄一

因為題目中有負數
所以不能使用 sliding window

```python
# class Solution:
#     def shortestSubarray(self, nums: List[int], k: int) -> int:
#         n = len(nums)
#         if n == 0 :
#             return -1

#         l , r = 0 , 0
#         currSum = 0
#         res = float("inf")

#         for r in range(n):
#             currSum += nums[r]

#             while currSum >= k :
#                 res = min(res , r-l+1)
#                 currSum -= nums[l]
#                 l += 1
                
        
#         return -1 if res==float("inf") else  res
```