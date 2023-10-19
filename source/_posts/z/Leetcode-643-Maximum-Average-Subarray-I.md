---
title: "Leetcode#643.\_Maximum Average Subarray I"
tags:
- [Leetcode]
- [Python]
- [easy]

- [💡]

- Array
- Sliding Window

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 14:45:10
---

# `Problem`

You are given an integer array `nums` consisting of `n` elements, and an integer `k`.

Find a contiguous subarray whose **length is equal to** `k` that has the maximum average value and return *this value*. Any answer with a calculation error less than `10-5` will be accepted.

**Example 1:**

```
Input: nums = [1,12,-5,-6,50,3], k = 4
Output: 12.75000
Explanation: Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75

```

**Example 2:**

```
Input: nums = [5], k = 1
Output: 5.00000

```

**Constraints:**

- `n == nums.length`
- `1 <= k <= n <= 10^5`
- `10^4 <= nums[i] <= 10^4`

# `Solve`

醜醜的

```python
class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        li = []
        res = []
        for i in range(len(nums)):
            li.append( nums[i] / k )
        
        sums = 0
        for i in range(k):
            sums += li[i]
        
        res.append(sums)

        for i in range( k, len(li) ):
            sums += li[i]
            sums -= li[i-k]
            res.append(sums)

        return max(res)
```