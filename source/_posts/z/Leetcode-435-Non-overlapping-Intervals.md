---
title: "Leetcode#435.\_Non-overlapping Intervals"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Array
- Dynamic Programming
- Greedy
- Sorting

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 11:41:13
---

# `Problem`

Given an array of intervals `intervals` where `intervals[i] = [starti, endi]`, return *the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping*.

**Example 1:**

```
Input: intervals = [[1,2],[2,3],[3,4],[1,3]]
Output: 1
Explanation: [1,3] can be removed and the rest of the intervals are non-overlapping.

```

**Example 2:**

```
Input: intervals = [[1,2],[1,2],[1,2]]
Output: 2
Explanation: You need to remove two [1,2] to make the rest of the intervals non-overlapping.

```

**Example 3:**

```
Input: intervals = [[1,2],[2,3]]
Output: 0
Explanation: You don't need to remove any of the intervals since they're already non-overlapping.

```

**Constraints:**

- `1 <= intervals.length <= 10^5`
- `intervals[i].length == 2`
- `5 * 10^4 <= starti < endi <= 5 * 10^4`

# `Solve`

```python
class Solution:

    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        if not intervals:
            return 0

        intervals.sort()

        last_end = intervals[0][1]

        res = 0

        for i in range(1 , len(intervals )):
            if intervals[i][0] >= last_end:
                last_end = intervals[i][1]
            else:
                last_end = min(last_end , intervals[i][1])
                res +=1
        return res
```