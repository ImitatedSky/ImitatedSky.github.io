---
title: Leetcode#189. Rotate Arra
tags:
- [Leetcode]
- [Python]

- [medium]
- Array
- Math
- Two Pointers


- [💡]



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-06-30 01:04:44
---

# `Problem`

Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.

**Example 1:**

```
Input: nums = [1,2,3,4,5,6,7], k = 3
Output: [5,6,7,1,2,3,4]
Explanation:
rotate 1 steps to the right: [7,1,2,3,4,5,6]
rotate 2 steps to the right: [6,7,1,2,3,4,5]
rotate 3 steps to the right: [5,6,7,1,2,3,4]

```

**Example 2:**

```
Input: nums = [-1,-100,3,99], k = 2
Output: [3,99,-1,-100]
Explanation:
rotate 1 steps to the right: [99,-1,-100,3]
rotate 2 steps to the right: [3,99,-1,-100]

```

**Constraints:**

- `1 <= nums.length <= 105`
- `231 <= nums[i] <= 231 - 1`
- `0 <= k <= 105`

**Follow up:**

- Try to come up with as many solutions as you can. There are at least **three** different ways to solve this problem.
- Could you do it in-place with `O(1)` extra space?

# `Solve`

### 錯1

```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n = len(nums)
        nums = nums[ n - k:] + nums[:n-k]
```

由於leetcode 判定nums = nums[ n - k:n] + nums[0:n-k]

為建造新的一個變數，所以原先的並未改變

### 改成(`但資測一樣錯的`)，只是記錄一下leetcode的機制

nums=

→

nums[:]

```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n = len(nums)
        nums[:] = nums[ n - k:] + nums[:n-k]
'''
nums = [1,2]
k=5
Output = [1,2]
Expected = [2,1]
'''
```

## `解`

```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n = len(nums)
        k = k % n
        nums[:] = nums[ n - k:n] + nums[0:n-k]
```

%做餘數

確保k 在[0,n-1]