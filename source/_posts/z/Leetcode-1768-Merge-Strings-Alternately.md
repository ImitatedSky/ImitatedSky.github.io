---
title: "Leetcode#1768.\_Merge Strings Alternately"
tags:
- [Leetcode]
- [Python]
- [easy]




- Two Pointers
- String

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 11:52:09
---

# `Problem`

You are given two strings `word1` and `word2`. Merge the strings by adding letters in alternating order, starting with `word1`. If a string is longer than the other, append the additional letters onto the end of the merged string.

Return *the merged string.*

**Example 1:**

```
Input: word1 = "abc", word2 = "pqr"
Output: "apbqcr"
Explanation: The merged string will be merged as so:
word1:  a   b   c
word2:    p   q   r
merged: a p b q c r

```

**Example 2:**

```
Input: word1 = "ab", word2 = "pqrs"
Output: "apbqrs"
Explanation: Notice that as word2 is longer, "rs" is appended to the end.
word1:  a   b
word2:    p   q   r   s
merged: a p b q   r   s

```

**Example 3:**

```
Input: word1 = "abcd", word2 = "pq"
Output: "apbqcd"
Explanation: Notice that as word1 is longer, "cd" is appended to the end.
word1:  a   b   c   d
word2:    p   q
merged: a p b q c   d

```

**Constraints:**

- `1 <= word1.length, word2.length <= 100`
- `word1` and `word2` consist of lowercase English letters.

# `Solve`

```python
class Solution:
    def mergeAlternately(self, word1: str, word2: str) -> str:
        i , j = 0 , 0
        last = 2
        res = ""

        while i < len(word1) or j < len(word2):
            if last == 2:
                if  i < len(word1):
                    res += word1[i]
                else:
                    res += ""
                i += 1
                last = 1
            
            if last == 1:
                if j < len(word2):
                    res += word2[j]
                else:
                    res += ""
                j+=1
                last = 2
        return res
```