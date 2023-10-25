---
title: "Leetcode#5.\_Longest Palindromic Substring"
tags:
- [Leetcode]
- [Python]

- [medium]

- 施工中

- [💡]

- String
- Dynamic Programming

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-25 13:21:17
---

# `Problem`

Given a string `s`, return *the longest*

*palindromic*

*substring*

in

```
s
```

.

**Example 1:**

```
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.

```

**Example 2:**

```
Input: s = "cbbd"
Output: "bb"

```

**Constraints:**

- `1 <= s.length <= 1000`
- `s` consist of only digits and English letters.

# `Solve`

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        res = ""

        for i in range(len(s)):
            # odd

            l , r = i ,  i
            while -1 < l and r < len(s) and s[l] == s[r]:
                if r-l+1 > len(res):
                    res = s[l:r+1]
                l-=1
                r+=1
            l , r = i ,  i+1  
            while -1 < l and r < len(s) and s[l] == s[r]:
                if r-l+1 > len(res):
                    res = s[l:r+1]
                l-=1
                r+=1

        return res
```