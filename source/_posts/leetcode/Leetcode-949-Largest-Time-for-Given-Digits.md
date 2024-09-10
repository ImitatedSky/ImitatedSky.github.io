---
title: Leetcode#949. Largest Time for Given Digits
tags:
- [Leetcode]
- [Python]

- [medium]


- [💡]

- Array
- String
- Enumeration



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-09-10 15:12:49
---

# `Problem`

Given an array `arr` of 4 digits, find the latest 24-hour time that can be made using each digit **exactly once**.

24-hour times are formatted as `"HH:MM"`, where `HH` is between `00` and `23`, and `MM` is between `00` and `59`. The earliest 24-hour time is `00:00`, and the latest is `23:59`.

Return *the latest 24-hour time in `"HH:MM"` format*. If no valid time can be made, return an empty string.

**Example 1:**

```
Input: arr = [1,2,3,4]
Output: "23:41"
Explanation: The valid 24-hour times are "12:34", "12:43", "13:24", "13:42", "14:23", "14:32", "21:34", "21:43", "23:14", and "23:41". Of these times, "23:41" is the latest.

```

**Example 2:**

```
Input: arr = [5,5,5,5]
Output: ""
Explanation: There are no valid 24-hour times as "55:55" is not valid.

```

**Constraints:**

- `arr.length == 4`
- `0 <= arr[i] <= 9`

# `Solve`

### 暴力解

很醜O(n^4)
但是因為 n最大也是4

所以沒超出時間

```python
class Solution:
    def largestTimeFromDigits(self, arr: List[int]) -> str:
        def isValid(hh , mm):
            if int(hh) < 24 and int(mm) <60:
                return True
            else:
                return False
        memo = []

        for i in range(4):
            for j in range(4):
                for k in range(4):
                    for l in range(4):
                        if i!=j and i!=k and i!=l and j!=k and j!=l and k!=l:
                            if isValid( str(arr[i]) + str(arr[j]) , str(arr[k]) + str(arr[l]) ):
                                memo.append( str(arr[i]) + str(arr[j]) + str(arr[k]) + str(arr[l]) )
        if not memo:
            return ""
        res = max(memo)
        return str(res)[:2] + ":" + str(res)[2:]
```