---
title: "Leetcode#53.\_Maximum Subarray"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Array
- Divide and Conquer
- Dynamic Programming

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-09-15 16:08:17
---

# `Problem`

Given an integer array `nums`, find the

subarray

with the largest sum, and return

*its sum*

.

**Example 1:**

```
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

```

**Example 2:**

```
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.

```

**Example 3:**

```
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.

```

**Constraints:**

- `1 <= nums.length <= 10^5`
- `10^4 <= nums[i] <= 10^4`

**Follow up:** If you have figured out the `O(n)` solution, try coding another solution using the **divide and conquer** approach, which is more subtle.

# `Solve`

## `法1`

原理就是每次作判別，計算當前最大的，和nums[ i ]比較原因是，代表nums[ i ]，比前面都大

e.g.

nums =[1,-1,0,-1,1]

⇒dp =[1, 0, 0, -1, 1]

---

nums =[-1 ,-2 ,0]

⇒dp =[-1, -2, 0]

---

nums =[5,4,-1,7,8]

⇒dp =[5, 9, 8, 15, 23]

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        dp = [0]*len(nums)
        dp[0] = nums[0]
        for i in range(1,len(nums)):
            dp[i] = max(dp[i-1]+nums[i],nums[i])

        return max(dp)
```

Time Complexity: O(N)

Space Complexity:O(N)

---

這邊可以改成兩個變數，currMax、sumMax，這樣Space Complexity 可降為O(1)

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        currMax = 0
        sumMax= float('-inf')
        for num in nums:
            currMax = max(num, num + currMax)
            sumMax= max(currMax, sumMax)
        return sumMax
```

Time Complexity: O(N)

Space Complexity:O(1)

## `法2`

題目說除了O(n) 還有利用**divide and conquer 的解，關鍵就是`拆分→計算→合併`**

在遞迴時，

```python
                    [整串數列]
          /             |           \
     [左半部分]      [中間部分]     [右半部分]
     /   |   \       /   |   \     /   |   \
[左]   [中] [右]  [左] [中] [右]  [左] [中] [右]
  ...           ...             ...
```

`拆成`三部分 左 中 右

`計算` 左右遍歷，中的最大值

`合併` Max(左 ,中 ,右)

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # 中間往左右計算，找最大
        def maxCrossingSum(nums, low, mid, high):
            left_sum = float('-inf')
            right_sum = float('-inf')
            max_left = 0
            max_right = 0

            # 往左邊慢慢加
            # 計算左半部分的最大子list和
            for i in range(mid, low - 1, -1):
                max_left += nums[i]
                if max_left > left_sum:
                    left_sum = max_left
            # 往右邊慢慢加
            # 計算右半部分的最大子list和
            for i in range(mid + 1, high + 1):
                max_right += nums[i]
                if max_right > right_sum:
                    right_sum = max_right

            # 返回跨越中點的最大子list和
            return left_sum + right_sum

        # 遞迴函数
        def findMaxSubArray(nums, low, high):
            # 最下層：只有一個元素
            if low == high:
                return nums[low]

            # 找到中點
            mid = (low + high) // 2

            # 遞迴地找到左半部分和右半部分的最大子list和
            left_max = findMaxSubArray(nums, low, mid)
            right_max = findMaxSubArray(nums, mid + 1, high)

            # 找到跨越中點的最大子list和
            cross_max = maxCrossingSum(nums, low, mid, high)

            # 返回三者中的最大值
            return max(left_max, right_max, cross_max)

        if not nums:
            return 0

        return findMaxSubArray(nums, 0, len(nums) - 1)
```

Time Complexity: O(nlogn)

Space Complexity:O(logn) #主要來自 遞迴的