---
title: "Leetcode#392.\_Is Subsequence"
tags:
- [Leetcode]
- [Python]
- [easy]



- [💡]

- Two Pointers
- String
- Dynamic Programming


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 15:22:40
---

# `Problem`

Given two strings `s` and `t`, return `true` *if* `s` *is a **subsequence** of* `t`*, or* `false` *otherwise*.

A **subsequence** of a string is a new string that is formed from the original string by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters. (i.e., `"ace"` is a subsequence of `"abcde"` while `"aec"` is not).

**Example 1:**

```
Input: s = "abc", t = "ahbgdc"
Output: true

```

**Example 2:**

```
Input: s = "axc", t = "ahbgdc"
Output: false

```

**Constraints:**

- `0 <= s.length <= 100`
- `0 <= t.length <= 104`
- `s` and `t` consist only of lowercase English letters.

**Follow up:**

Suppose there are lots of incoming

```
s
```

, say

```
s1, s2, ..., sk
```

where

```
k >= 10^9
```

, and you want to check one by one to see if

```
t
```

has its subsequence. In this scenario, how would you change your code?

# `Solve`

```python
class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        j = 0

        for i in range(len(s)):
            if s[i] not in t[j:]:
                return False
            else:
                j = j + t[j:].index(s[i]) +1

        return True
```

簡化一些

```python
class Solution:
    def isSubsequence(self, s: str, t: str) -> bool

        for i in range( len(s) ):
            if s[i] not in t:
                return False
            else:
                ii = t.index(s[i])
                t = t[ii + 1:]
        return True
```