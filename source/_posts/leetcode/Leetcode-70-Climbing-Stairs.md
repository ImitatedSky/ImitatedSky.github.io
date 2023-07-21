---
title: "Leetcode#70.\_Climbing Stairs"
tags:
- [Leetcode]
- [Python]
- [easy]

- [💡]
- Math
- Dynamic Programming
- Memoization


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-21 10:43:28
---

# `Problem`

You are climbing a staircase. It takes `n` steps to reach the top.

Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?

**Example 1:**

```
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps

```

**Example 2:**

```
Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step

```

**Constraints:**

- `1 <= n <= 45`

# `Solve`

## `用一般的**fibonacci 但時間上無法，所以加一個memory紀錄**`

```python
# Result time-exced limit
class Solution:
    def climbStairs(self, n: int) -> int:

        def climb(n):
            if  n == 1:
                return 1
            if n == 2:
                return 2

            return climb(n-1) + climb(n-2)
        return climb(n)
```

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        memo = {}
        def climb(n):
            if  n == 1:
                return 1
            if n == 2:
                return 2
            if n in memo:
                return memo[n]
            memo[n] = climb(n-1) + climb(n-2)
            return climb(n-1) + climb(n-2)
        return climb(n)
```

## `用DP(可減少遞迴帶來的記憶體開銷)`

用迭代計算所有項目

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        if n == 1:
            return  n

        dp = {}
        dp[1] = 1
        dp[2] = 2
        for i in range(3, n+1):
            dp[i] = dp[i-1] + dp[i-2]
        # print(f)
        return dp[n]
```

通常情況下，使用動態規劃（DP）相對於純遞迴方法可以減少記憶體開銷。

##

在嚴格的定義下，動態規劃是一種將複雜問題分解成簡單子問題的優化技術，並使用迭代的方式計算所有子問題的解，並且通常有一個明確的「狀態轉移方程」來描述子問題之間的關係。這樣的實現方式通常不依賴遞迴，而是使用循環來進行計算。

雖然`(Solve1)`確實使用了 memoization 技術來優化遞迴計算，但在 DP 的嚴格定義下，它仍然被視為是遞迴解法（recursive solution），而不是 DP 解法。遞迴解法仍然有一定的遞迴調用開銷，而真正的 DP 解法則完全避免了遞迴，只使用迭代計算。

總結來說，`(Solve1)`確實使用了 memoization 技術，它在時間和空間上優於純遞迴解法，但嚴格來說不屬於真正的動態規劃（DP）方法。

---

## 費式數列

當爬梯子

可以爬 1 2 3 三種時

n = 4時，有7組解

1. 1 + 1 + 1 + 1
2. 1 + 2 + 1
3. 2 + 1 + 1
4. 1 + 1 + 2
5. 2 + 2
6. 3 + 1
7. 1 + 3

先回到原始的圖解

{% mermaid %}
flowchart TD

start[4]
treenode1[1]
treenode2[2]
treenode3[3]
	treenode3.1[1]
	treenode3.2[1]
	treenode3.3[2]

start -->|4-3|treenode1
start -->|4-2|treenode2
start -->|4-1|treenode3

treenode3 -->|3-3|treenode3.1
treenode3 -->|3-2|treenode3.2
treenode3 -->|3-1|treenode3.3

{% endmermaid %}

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        dp = [0] * (n + 1)
        dp[0] = 1
        dp[1] = 1
        dp[2] = 2

        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3]

        return dp[n]
```
```python
# 可以爬 1 2 3 4 四種時
class Solution:
    def climbStairs(self, n: int) -> int:
        dp = [0] * (n + 1)
        dp[0] = 1 #這邊是把4當作一種
        dp[1] = 1
        dp[2] = 2
        dp[3] = 4

        for i in range(4, n + 1): # 4開始，所以階梯4時也會跑
            dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3] + dp[i-4]

        return dp[n]
```