---
title: "Leetcode#35.\_Search Insert Position"
tags:
- [Leetcode]
- [Python]
- [easy]

- [💡]

- Array
- Binary Search

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-26 09:58:06
---
# `Problem`

Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with `O(log n)` runtime complexity.

**Example 1:**

```
Input: nums = [1,3,5,6], target = 5
Output: 2

```

**Example 2:**

```
Input: nums = [1,3,5,6], target = 2
Output: 1

```

**Example 3:**

```
Input: nums = [1,3,5,6], target = 7
Output: 4

```

**Constraints:**

- `1 <= nums.length <= 10^4`
- `10^4 <= nums[i] <= 10^4`
- `nums` contains **distinct** values sorted in **ascending** order.
- `10^4 <= target <= 10^4`

# `Solve`

## 就使用 **二分搜尋演算**

```python
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        
        left = 0
        right = len(nums)-1

        while left <= right:
            mid = (left + right) // 2

            if nums[mid] == target:
                return mid
            elif target < nums[mid]:
                right = mid -1
            else:
                left =  mid + 1
        return left
```

最後return left為 target 不在nums 裡

所以應該插在 left 這位置

如果要確切找到，就 return false，代表沒有在裏頭

```python
nums = [2 , 4]
target = 3

'''
left = 0
right = 2-1  = 1

iter1
	mid = (0+1)//2 = 0
	進入 else
	left = mid + 1 = 1
iter2
	mid = (1+1)//2 = 1
	target < nums[mid]   3<4
	right = mid - 1 = 0
iterEND

return left

1

'''
```