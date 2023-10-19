---
title: "Leetcode#33.\_Search in Rotated Sorted Array"
tags:
- [Leetcode]
- [Python]
- [medium]
- 施工中
- [💡]

- Array
- Binary Search

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 10:14:27
---

# `Problem`

There is an integer array `nums` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, `nums` is **possibly rotated** at an unknown pivot index `k` (`1 <= k < nums.length`) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (**0-indexed**). For example, `[0,1,2,4,5,6,7]` might be rotated at pivot index `3` and become `[4,5,6,7,0,1,2]`.

Given the array `nums` **after** the possible rotation and an integer `target`, return *the index of* `target` *if it is in* `nums`*, or* `-1` *if it is not in* `nums`.

You must write an algorithm with `O(log n)` runtime complexity.

**Example 1:**

```
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4

```

**Example 2:**

```
Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1

```

**Example 3:**

```
Input: nums = [1], target = 0
Output: -1

```

**Constraints:**

- `1 <= nums.length <= 5000`
- `10^4 <= nums[i] <= 10^4`
- All values of `nums` are **unique**.
- `nums` is an ascending array that is possibly rotated.
- `10^4 <= target <= 10^4`

# `Solve`

寫一個 最複雜的，而且還沒用到O(log(n))

```python
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        if target not in nums:
            return -1

        idx = nums.index(target)

        left = nums[idx:]
        right = nums[:idx]

        b1 = False
        b2 = False

        for i in range( 1 , len(left) ):
            if left[i-1] > left[i]:
                b1 = -1

        for i in range( 1 , len(right) ):
            if right[i-1] > right[i]:
                b2 = -1
                
        if b1 ==-1 and b2 == -1:
            return -1

        return nums.index(target)
```

# `Solution2 - Binary Search`

改正為 **Binary Search**

```python
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        if target not in nums:
            return -1

        left = 0
        right = len(nums)-1

        while left <= right:
            mid = (left+right)//2

            if nums[mid] == target:
                return mid

            if nums[mid] >= nums[left]:
                if nums[left] <= target <= nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] <= target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return -1
```