---
title: "Leetcode#224.\_Basic Calculator"
tags:
- [Leetcode]
- [Python]
- [hard]

- Math
- String
- Stack
- Recursion



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-23 10:18:29
---

# `Problem`

Given a string `s` representing a valid expression, implement a basic calculator to evaluate it, and return *the result of the evaluation*.

**Note:** You are **not** allowed to use any built-in function which evaluates strings as mathematical expressions, such as `eval()`.

**Example 1:**

```
Input: s = "1 + 1"
Output: 2

```

**Example 2:**

```
Input: s = " 2-1 + 2 "
Output: 3

```

**Example 3:**

```
Input: s = "(1+(4+5+2)-3)+(6+8)"
Output: 23

```

**Constraints:**

- `1 <= s.length <= 3 * 10^5`
- `s` consists of digits, `'+'`, `'-'`, `'('`, `')'`, and `' '`.
- `s` represents a valid expression.
- `'+'` is **not** used as a unary operation (i.e., `"+1"` and `"+(2 + 3)"` is invalid).
- `'-'` could be used as a unary operation (i.e., `"-1"` and `"-(2 + 3)"` is valid).
- There will be no two consecutive operators in the input.
- Every number and running calculation will fit in a signed 32-bit integer.

# `Solve`

這題不能用既有的公式，所以就土法煉鋼，將整段刻出來

其中可能有括弧中又有括弧的問題，所以用stack將記錄

```python
class Solution:
    def calculate(self, s: str) -> int:
        stack = [] # 用來放置 括弧的計算
        num = 0
        sign = 1  # 初始化正號
        result = 0

				# 是否為數字
        def is_digit(char):
            return '0' <= char <= '9'

        for char in s:
            if is_digit(char):
                num = num * 10 + int(char)  # 最開始是0，當連續讀到數字 num*10 + char
            elif char == '+':
                result += sign * num  # 將當前數字加入結果，根據當前符號加減
                num = 0  # 重置數字
                sign = 1  # 設置為正號
            elif char == '-':
                result += sign * num  # res
                num = 0  
                sign = -1  

						# 括弧的運算，利用 stack儲存括弧前的result
						# 括弧中有括弧也不會有問題
            elif char == '(':
                stack.append((result, sign))  # 將括弧前的結果 和 前面的符號  放進stack
                result = 0  
                sign = 1  
            elif char == ')':
                result += sign * num  # 這是括弧內 # res
                num = 0  
                prev_result, prev_sign = stack.pop()  # 取出最後一個放入stack的
                result = prev_result + prev_sign * result  # 使用前一個結果和符號更新當前結果

        result += sign * num  # 加上最後一個數字
        return result
```

Time complexity : O(n) ~~雖然好像是廢話 XD~~