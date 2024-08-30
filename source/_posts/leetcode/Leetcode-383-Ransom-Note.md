---
title: Leetcode#383. Ransom Note
tags:
- [Leetcode]
- [Python]
- [easy]


- [💡]
- Hash Table
- String
- Counting


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-08-30 17:01:03
---

# `Problem`

Given two strings `ransomNote` and `magazine`, return `true` *if* `ransomNote` *can be constructed by using the letters from* `magazine` *and* `false` *otherwise*.

Each letter in `magazine` can only be used once in `ransomNote`.

**Example 1:**

```
Input: ransomNote = "a", magazine = "b"
Output: false

```

**Example 2:**

```
Input: ransomNote = "aa", magazine = "ab"
Output: false
```

**Example 3:**

```
Input: ransomNote = "aa", magazine = "aab"
Output: true

```

**Constraints:**

- `1 <= ransomNote.length, magazine.length <= 105`
- `ransomNote` and `magazine` consist of lowercase English letters.

# `Solve`

## 解1

```python
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        r_hashmap = {}
        m_hashmap = {}

        for i in range(len(ransomNote)):
            if ransomNote[i] in r_hashmap:
                r_hashmap[ ransomNote[i]  ] += 1
            else:
                r_hashmap[ ransomNote[i]  ] = 1
        

        for i in range(len(magazine)):
            if magazine[i] in m_hashmap:
                m_hashmap[ magazine[i]  ] += 1
            else:
                m_hashmap[ magazine[i]  ] = 1

        for a in r_hashmap:
            if a not in magazine or r_hashmap[a] > m_hashmap[a] :
                return False
 
        return True
```

把可讀性寫好一點

```python
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        r_hashmap = {}
        m_hashmap = {}

        for c in ransomNote:
            if c in r_hashmap:
                r_hashmap[ c  ] += 1
            else:
                r_hashmap[ c  ] = 1
        

        for c in magazine:
            if c in m_hashmap:
                m_hashmap[ c  ] += 1
            else:
                m_hashmap[ c  ] = 1

        for a in r_hashmap:
            if a not in magazine or r_hashmap[a] > m_hashmap[a] :
                return False
 
        return True
        

```

## 優化1

```python
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        m_hashmap = {}
        
        for c in magazine:
            if c in m_hashmap:
                m_hashmap[ c  ] += 1
            else:
                m_hashmap[ c  ] = 1

        for c in ransomNote:
            if c not in m_hashmap or m_hashmap[c] - 1 < 0:
                return False
            
            m_hashmap[c] -= 1 
 
        return True
        

```

## 看到好的解法

```python
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        for c in set(ransomNote):
            if magazine.count(c)<ransomNote.count(c):
                return False
        return True
        
```