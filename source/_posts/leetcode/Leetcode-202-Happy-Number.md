---
title: "Leetcode#202.\_Happy Number"
tags:
- [Leetcode]
- [Python]
- [easy]

- Hash Table
- Math
- Two Pointers



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-09-08 11:05:44
---

# `Problem`

Write an algorithm to determine if a number `n` is happy.

A **happy number** is a number defined by the following process:

- Starting with any positive integer, replace the number by the sum of the squares of its digits.
- Repeat the process until the number equals 1 (where it will stay), or it **loops endlessly in a cycle** which does not include 1.
- Those numbers for which this process **ends in 1** are happy.

Return `true` *if* `n` *is a happy number, and* `false` *if not*.

**Example 1:**

```
Input: n = 19
Output: true
Explanation:
12 + 92 = 82
82 + 22 = 68
62 + 82 = 100
12 + 02 + 02 = 1

```

**Example 2:**

```
Input: n = 2
Output: false

```

**Constraints:**

- `1 <= n <= 2^31 - 1`

# `Solve`

沒甚麼難度的一題

要想辦法將非happy number的挑出來，所以做了一個memo，當經過迴圈運算後，數字又變成memo裏頭數字時，代表不可能是happy number

### `法1`

```python
class Solution:
    def isHappy(self, n: int) -> bool:
        memo = {}
        
        while n > 0 and n not in memo:
            n2 = 0
            n_s = str(n)

            for i in range(len(n_s)):
                n2 += int(n_s[i])*int(n_s[i])

            if n2 == 1 :
                return True
            memo[n] = False
            
            n = n2
        
        return False
```

memo 可以改成 set()，不用用dict

運算其實可以不用轉變字串

用除於10的餘數來做也是可以

但這邊就不寫了
