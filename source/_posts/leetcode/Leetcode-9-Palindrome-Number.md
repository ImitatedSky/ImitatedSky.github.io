---
title: "Leetcode#9.\_Palindrome Number"
tags:
- [Leetcode]
- [Python]
- [easy]
- [💡]
- Math


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-18 11:22:06
---

# `Problem`

Given an integer `x`, return `true` *if* `x` *is a*

***palindrome***

*, and* **false** *otherwise*

```
Palindrome
An integer is a palindrome when it reads the same forward and backward.

For example, 121 is a palindrome while 123 is not
```

.

**Example 1:**

```
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

```

**Example 2:**

```
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

```

**Example 3:**

```
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.

```

**Constraints:**

- `2^31 <= x <= 2^31 - 1`

# `Solve`

## `利用字串`

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        str_x = str(x)
        r_str_x = str_x[::-1]
        if str_x == r_str_x:
            return True
        else:
            return False
```

### `簡化`

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        str_x = str(x)

        if str_x == str_x[::-1]:
            return True
        
        return False
```

## `數學`

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x != 0 and x % 10 == 0):
            return False

        reversed_num = 0
        original = x

        while x > reversed_num:
            reversed_num = reversed_num * 10 + x % 10
            x //= 10

        return x == reversed_num or x == reversed_num // 10
```