---
title: "Leetcode#76.\_Minimum Window Substring"
tags:
- [Leetcode]
- [Python]

- [hard]
- 施工中

- [💡]

- Hash Table
- String
- Sliding Window



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-25 16:07:53
---
# `Problem`

Given two strings `s` and `t` of lengths `m` and `n` respectively, return *the **minimum window***

***substring***

*of*

```
s
```

*such that every character in*

```
t
```

*(**including duplicates**) is included in the window*

. If there is no such substring, return

*the empty string*

```
""
```

.

The testcases will be generated such that the answer is **unique**.

**Example 1:**

```
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.

```

**Example 2:**

```
Input: s = "a", t = "a"
Output: "a"
Explanation: The entire string s is the minimum window.

```

**Example 3:**

```
Input: s = "a", t = "aa"
Output: ""
Explanation: Both 'a's from t must be included in the window.
Since the largest window of s only has one 'a', return empty string.

```

**Constraints:**

- `m == s.length`
- `n == t.length`
- `1 <= m, n <= 105`
- `s` and `t` consist of uppercase and lowercase English letters.

**Follow up:** Could you find an algorithm that runs in `O(m + n)` time?

# `Solve`

目前沒有優化
runtime和別人有些差距

```python
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if s == t :
            return s

        hm_t = {}

        for i in range(len(t)):
            if t[i] in hm_t:
                hm_t[ t[i] ] += 1

            else:
                hm_t[  t[i] ] = 1
        
        hm_s = {}

        for i in hm_t:
            hm_s[ i ] = 0

        # sliding window
        l , r = 0 , 0
        res = s
        res_min = float("inf")

        for r in range( len(s) ):

            if s[r] in hm_s:
                hm_s[ s[r] ] += 1

            while all( hm_t[i] <= hm_s[i]  for i in hm_t ) :
                if r-l+1 < res_min:
                    res = s[l:r+1]
                    res_min = r-l+1

                if  s[l] in hm_s:
                    hm_s[ s[l] ] -= 1

                l += 1

        # 當 sliding window 沒有跑時
        if res_min == float("inf"):
            return ""

        return res
```