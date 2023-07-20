---
title: "Leetcode#87.\_Scramble String"
tags:
- [Leetcode]
- [Python]
- [hard]

- [💡]

- String
- Dynamic Programming

cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-19 15:27:32


---

# `Problem`

We can scramble a string s to get a string t using the following algorithm:

1. If the length of the string is 1, stop.
2. If the length of the string is > 1, do the following:
    - Split the string into two non-empty substrings at a random index, i.e., if the string is `s`, divide it to `x` and `y` where `s = x + y`.
    - **Randomly** decide to swap the two substrings or to keep them in the same order. i.e., after this step, `s` may become `s = x + y` or `s = y + x`.
    - Apply step 1 recursively on each of the two substrings `x` and `y`.

Given two strings `s1` and `s2` of **the same length**, return `true` if `s2` is a scrambled string of `s1`, otherwise, return `false`.

**Example 1:**

```
Input: s1 = "great", s2 = "rgeat"
Output: true
Explanation: One possible scenario applied on s1 is:
"great" --> "gr/eat" // divide at random index.
"gr/eat" --> "gr/eat" // random decision is not to swap the two substrings and keep them in order.
"gr/eat" --> "g/r / e/at" // apply the same algorithm recursively on both substrings. divide at random index each of them.
"g/r / e/at" --> "r/g / e/at" // random decision was to swap the first substring and to keep the second substring in the same order.
"r/g / e/at" --> "r/g / e/ a/t" // again apply the algorithm recursively, divide "at" to "a/t".
"r/g / e/ a/t" --> "r/g / e/ a/t" // random decision is to keep both substrings in the same order.
The algorithm stops now, and the result string is "rgeat" which is s2.
As one possible scenario led s1 to be scrambled to s2, we return true.

```

**Example 2:**

```
Input: s1 = "abcde", s2 = "caebd"
Output: false

```

**Example 3:**

```
Input: s1 = "a", s2 = "a"
Output: true

```

**Constraints:**

- `s1.length == s2.length`
- `1 <= s1.length <= 30`
- `s1` and `s2` consist of lowercase English letters.

# `Solve`

題目簡單解釋，str分割可以得到  x1 + y1  ，可以互換，若能互換後相同就為scrambled

~~當初看超久~~

```
    rgeat
   /    \
  rg    eat
 / \    /  \
r   g  e   at
           / \
          a   t

    great
    /  \
  gr    eat
 / \    /  \
g  r   e    at
           /  \
         a     t
```

前面gr 與 rg 為scrambled ， eat當然就一樣

所以也能延伸

```bash
     greta
    /     \
   gr      eta
  /  \    /   \
 g   r   e    ta
            /    \
           t      a
```

at &  ta ⇒ `True` ( scrambled )   →  eat  &  ate  ⇒ `True`

→  great  &    grate    ⇒   `True`

```bash
     abb
    /   \
  ab      b
 /  \
a    b

   bba
  /   \
b     ba
      /  \
     b    a

```

```bash
			bab
      /   \
     b     ab
          /  \
         a    b
```

這種情況也是    abb & bba  ⇒`True`

由於 abb  &   bab   ⇒  `True`   第一層互換

ab  &  ba  ⇒ `True`     → abb  &  bba  ⇒  `True`

## `可以但超過時間`

```python
# 類似用遞迴窮舉
# 但會超過時間
class Solution:
    def isScramble(self, s1: str, s2: str) -> bool:
        if len(s1)!=len(s2):
            return False
        if s1==s2:
            return True
        
        n = len(s1)

        for i in range(1,len(s1)):
            if self.isScramble(s1[:i],s2[:i]) and self.isScramble(s1[i:],s2[i:]):
                return True
            if self.isScramble(s1[:i] , s2[n-i:]) and self.isScramble(s1[i:] , s2[:n-i]):
                return True
        return False
```

## `借鏡別人的`

做一個儲存庫

這樣不用每次都從新跑

```python
class Solution:
    def isScramble(self, s1: str, s2: str) -> bool:

        # memoization: (s1, s2) -> bool ，表示 s1 和 s2 是否 scramble
        memo = {}

        def helper(s1, s2):
            # 先判斷是否已經計算過
            if (s1, s2) in memo:
                return memo[(s1, s2)]
            
            # 長度不同 或者 字母不同，則不可能 scramble
            if len(s1) != len(s2) or sorted(s1) != sorted(s2):
                # 記錄結果
                memo[(s1, s2)] = False
                return False
            
            # 一樣的字母，則為 True
            if s1 == s2:
                # 記錄結果
                memo[(s1, s2)] = True
                return True

            n = len(s1)
            for i in range(1, n):
                # 不交換的情況  or 交換的情況
                if (helper(s1[:i], s2[:i]) and helper(s1[i:], s2[i:])) or (helper(s1[:i], s2[n-i:]) and helper(s1[i:], s2[:n-i])):
                    # 記錄結果
                    memo[(s1, s2)] = True
                    return True
                
            # 記錄結果
            memo[(s1, s2)] = False
            return False

        return helper(s1, s2)
```

```python
great  &  rgeta

memo = {
    ("g", "r"): False,
    ("r", "g"): False,
    ("gr", "rg"): True,
    ("rg", "gr"): True,
    ("g", "e"): False,
    ("e", "g"): False,
    ("gr", "at"): True,
    ("at", "gr"): True,
    ("rg", "ea"): True,
    ("ea", "rg"): True,
    ("g", "at"): False,
    ("at", "g"): False,
    ("gr", "eat"): True,
    ("eat", "gr"): True,
    ("rg", "eat"): True,
    ("eat", "rg"): True,
    ("g", "rge"): False,
    ("rge", "g"): False,
    ("gr", "ge"): False,
    ("ge", "gr"): False,
    ("g", "eat"): False,
    ("eat", "g"): False,
    ("gr", "reat"): False,
    ("reat", "gr"): False,
    ("rg", "eat"): True,
    ("eat", "rg"): True,
    ...
}
```

## `目前看到的最佳解之一`

使用的Memory更少

```python
class Solution:
    def isScramble(self,s1, s2):
        m ={}
        def func(s1, s2):
            if (s1, s2) in m:
                return m[(s1, s2)]
            if not sorted(s1) == sorted(s2):
                return False
            if len(s1) == 1:
                return True
            

            for i in range(1, len(s1)):
                if func(s1[:i], s2[-i:]) and func(s1[i:], s2[:-i]) or func(s1[:i], s2[:i]) and func(s1[i:], s2[i:]):
                    m[(s1, s2)] = True
                    return True
            m[(s1, s2)] = False
            return False
        return func(s1, s2)
```