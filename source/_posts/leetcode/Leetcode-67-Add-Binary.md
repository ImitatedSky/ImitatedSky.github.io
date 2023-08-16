---
title: Leetcode#67. Add Binary
tags:
- [Leetcode]
- [Python]
- [easy]

- [💡]
- Math
- String
- Bit Manipulation
- Simulation


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-16 09:29:51
---
# `Problem`

Given two binary strings `a` and `b`, return *their sum as a binary string*.

**Example 1:**

```
Input: a = "11", b = "1"
Output: "100"

```

**Example 2:**

```
Input: a = "1010", b = "1011"
Output: "10101"

```

**Constraints:**

- `1 <= a.length, b.length <= 10^4`
- `a` and `b` consist only of `'0'` or `'1'` characters.
- Each string does not contain leading zeros except for the zero itself.

# `Solve`

```python
class Solution:
    def addBinary(self, a: str, b: str) -> str:
      s = []
      carry = 0
      i = len(a) - 1
      j = len(b) - 1

      while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
          total += int(a[i])
          i -= 1
        if j >= 0:
          total += int(b[j])
          j -= 1
        s.append(str(total % 2))
        carry = total // 2
        
      return ''.join(reversed(s))
```

## `偷吃步`

```python
class Solution:
    def addBinary(self, a: str, b: str) -> str:
        x=int(a,2)
        y=int(b,2)
        return bin(x+y)[2:]
```

