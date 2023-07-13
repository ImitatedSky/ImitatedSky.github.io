---
title: "Leetcode#14.\_Longest Common Prefix"
date: 2023-07-13 16:53:58
tags: 
- [Leetcode]
- [Python]
categories: Leetcode
cover: /img/cover/leetcode.jpg
---
Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string `""`.

**Example 1:**

```
Input: strs = ["flower","flow","flight"]
Output: "fl"

```

**Example 2:**

```
Input: strs = ["dog","racecar","car"]
Output: ""
Explanation: There is no common prefix among the input strings.
```

## `slove`

```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        pref = ''
        
        i = 0
        minWord = min(strs, key=len)

        while i < len(minWord):
            for word in strs:
                if word[i] != minWord[i]:
                    return pref
            pref += minWord[i]
            i += 1
        return pref
```