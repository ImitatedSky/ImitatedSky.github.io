---
title: Leetcode#20. Valid Parentheses
tags:
- [Leetcode]
- [Python]
- [easy]

- String
- Stack
- [💡]



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-07-04 10:20:41
---

# `Problem`

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**

```
Input: s = "()"
Output: true

```

**Example 2:**

```
Input: s = "()[]{}"
Output: true

```

**Example 3:**

```
Input: s = "(]"
Output: false

```

**Constraints:**

- `1 <= s.length <= 104`
- `s` consists of parentheses only `'()[]{}'`.

# `Solve`

```python
class Solution:
    def isValid(self, s: str) -> bool:
        brackets = []

        def check(brackets):

            while len(brackets) >= 2 and is_valid( brackets[-2] , brackets[-1]  ):
                brackets.pop()
                brackets.pop()

        def is_valid(s1,s2):
            if s1 == '(' and s2 == ')':
                return True
            elif s1 == '{' and s2 == '}':
                return True
            elif s1 == '[' and s2 == ']':
                return True
            else:
                return False

        for i in range(len(s)):
            brackets.append(s[i])
            check(brackets)
        
        # 空的返回 true
        # print(brackets)
        return not brackets

        
```