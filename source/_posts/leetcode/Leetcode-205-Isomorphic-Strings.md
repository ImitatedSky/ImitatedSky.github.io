---
title: Leetcode#205. Isomorphic Strings
tags:
- [Leetcode]
- [Python]
- [easy]


- [💡]
- Hash Table
- String


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-08-30 17:24:55
---

# `Problem`

Given two strings `s` and `t`, *determine if they are isomorphic*.

Two strings `s` and `t` are isomorphic if the characters in `s` can be replaced to get `t`.

All occurrences of a character must be replaced with another character while preserving the order of characters. No two characters may map to the same character, but a character may map to itself.

**Example 1:**

**Input:** s = "egg", t = "add"

**Output:** true

**Explanation:**

The strings `s` and `t` can be made identical by:

- Mapping `'e'` to `'a'`.
- Mapping `'g'` to `'d'`.

**Example 2:**

**Input:** s = "foo", t = "bar"

**Output:** false

**Explanation:**

The strings `s` and `t` can not be made identical as `'o'` needs to be mapped to both `'a'` and `'r'`.

**Example 3:**

**Input:** s = "paper", t = "title"

**Output:** true

**Constraints:**

- `1 <= s.length <= 5 * 104`
- `t.length == s.length`
- `s` and `t` consist of any valid ascii character.

# `Solve`

## 1

```python
class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        
        st_map = {}
        ts_map = {}
        
        for i in range(len(s)):
            if s[i] not in st_map:
                st_map[s[i]] = t[i]
            if t[i] not in ts_map:
                ts_map[t[i]] = s[i]
            
            if st_map[s[i]] != t[i] or ts_map[t[i]] != s[i]:
                return False
        
        return True
```

## 還不錯的

```python
class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        s_map = []
        t_map = []

        for c in s:
            s_map.append(s.index(c))
        
        for c in t:
            t_map.append(t.index(c))
        if s_map == t_map:
            return True
        return False
```