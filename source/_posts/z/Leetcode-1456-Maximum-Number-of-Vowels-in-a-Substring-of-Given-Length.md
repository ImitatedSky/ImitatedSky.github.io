---
title: "Leetcode#1456.\_Maximum Number of Vowels in a Substring of Given Length"
tags:
- [Leetcode]
- [Python]

- [medium]

- 施工中
- [💡]

- String
- Sliding Window


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-19 14:57:15
---

# `Problem`

Given a string `s` and an integer `k`, return *the maximum number of vowel letters in any substring of* `s` *with length* `k`.

**Vowel letters** in English are `'a'`, `'e'`, `'i'`, `'o'`, and `'u'`.

**Example 1:**

```
Input: s = "abciiidef", k = 3
Output: 3
Explanation: The substring "iii" contains 3 vowel letters.

```

**Example 2:**

```
Input: s = "aeiou", k = 2
Output: 2
Explanation: Any substring of length 2 contains 2 vowels.

```

**Example 3:**

```
Input: s = "leetcode", k = 3
Output: 2
Explanation: "lee", "eet" and "ode" contain 2 vowels.

```

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists of lowercase English letters.
- `1 <= k <= s.length`

# `Solve`

醜醜

```python
class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        l , r = 0 , 0
        vowel = "aeiou"
        
        res = 0
        
        for i in range(k):
            if s[i] in vowel:
                res +=1
        max_res=res

        for i in range( k, len(s) ):
            if s[i] in vowel:
                res +=1

            if s[ i-k ]  in vowel:
                res -= 1
            max_res = max(max_res,res)

        return max_res
```