---
title: "Leetcode#172.\_Factorial Trailing Zeroes"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]

- Math


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-09-07 10:50:12
---

# `Problem`

Given an integer `n`, return *the number of trailing zeroes in* `n!`.

Note that `n! = n * (n - 1) * (n - 2) * ... * 3 * 2 * 1`.

**Example 1:**

```
Input: n = 3
Output: 0
Explanation: 3! = 6, no trailing zero.

```

**Example 2:**

```
Input: n = 5
Output: 1
Explanation: 5! = 120, one trailing zero.

```

**Example 3:**

```
Input: n = 0
Output: 0

```

**Constraints:**

- `0 <= n <= 10^4`

**Follow up:** Could you write a solution that works in logarithmic time complexity?

# `Solve`

這題先搞懂 *trailing zeroes，*是指尾巴的0

要計算尾巴有幾個0很簡單就是算其中乘了幾次(5*2)

由於每次乘到5前，一定有2，所以找5有幾個就好

### `法1`

```python

class Solution:
    def trailingZeroes(self, n: int) -> int:
        output = 0

        for i in range(1, n + 1):
            while i % 5 == 0:
                output += 1
                i //= 5

        return output
```

Time Complexity : O(n)

**當然這題不需要這麼麻煩**

### `法2` 簡單

其實這題數學更簡單的思考方法，直接計算幾個5就好

只需要注意當超過5的指數項，會增多

所以也不用O(n)

ex: 

n = 10 2個5

n = 25 6個5

```python
class Solution:
    def trailingZeroes(self, n: int) -> int:
        output = 0
        while n>=5:
            output += n//5
            n = n//5
        return output
```