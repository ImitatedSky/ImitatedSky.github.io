---
title: Leetcode#274. H-Index
tags:
- [Leetcode]
- [Python]

- [medium]


- [💡]
- Array
- Sorting
- Counting Sort


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-06-30 03:00:30
---

# `Problem`

Given an array of integers `citations` where `citations[i]` is the number of citations a researcher received for their `ith` paper, return *the researcher's h-index*.

According to the [definition of h-index on Wikipedia](https://en.wikipedia.org/wiki/H-index): The h-index is defined as the maximum value of `h` such that the given researcher has published at least `h` papers that have each been cited at least `h` times.

**Example 1:**

```
Input: citations = [3,0,6,1,5]
Output: 3
Explanation: [3,0,6,1,5] means the researcher has 5 papers in total and each of them had received 3, 0, 6, 1, 5 citations respectively.
Since the researcher has 3 papers with at least 3 citations each and the remaining two with no more than 3 citations each, their h-index is 3.

```

**Example 2:**

```
Input: citations = [1,3,1]
Output: 1

```

**Constraints:**

- `n == citations.length`
- `1 <= n <= 5000`
- `0 <= citations[i] <= 1000`

# `Solve`

```python
class Solution:
    def hIndex(self, citations: List[int]) -> int:
        nums = sorted(citations)
        n = len(nums)

        for i in range(n):
            if n - i <= nums[i]:
                return n-i
        
        return 0

```

改enumerate

```python
class Solution:
    def hIndex(self, citations: List[int]) -> int:
        nums = sorted(citations)
        n = len(nums)

        for i,val in  enumerate(nums):
            if n - i <= val:
                return n-i
        
        return 0

```