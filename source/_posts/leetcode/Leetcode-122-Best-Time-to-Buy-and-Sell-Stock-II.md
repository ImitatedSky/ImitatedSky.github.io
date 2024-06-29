---
title: "Leetcode#122.\_Best Time to Buy and Sell Stock II"
tags:
- [Leetcode]
- [Python]

- [medium]


- [💡]


- Array
- Dynamic Programming
- Greedy


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2024-06-30 01:24:05
---

# `Problem`

You are given an integer array `prices` where `prices[i]` is the price of a given stock on the `ith` day.

On each day, you may decide to buy and/or sell the stock. You can only hold **at most one** share of the stock at any time. However, you can buy it then immediately sell it on the **same day**.

Find and return *the **maximum** profit you can achieve*.

**Example 1:**

```
Input: prices = [7,1,5,3,6,4]
Output: 7
Explanation: Buy on day 2 (price = 1) and sell on day 3 (price = 5), profit = 5-1 = 4.
Then buy on day 4 (price = 3) and sell on day 5 (price = 6), profit = 6-3 = 3.
Total profit is 4 + 3 = 7.

```

**Example 2:**

```
Input: prices = [1,2,3,4,5]
Output: 4
Explanation: Buy on day 1 (price = 1) and sell on day 5 (price = 5), profit = 5-1 = 4.
Total profit is 4.

```

**Example 3:**

```
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: There is no way to make a positive profit, so we never buy the stock to achieve the maximum profit of 0.

```

**Constraints:**

- `1 <= prices.length <= 3 * 10^4`
- `0 <= prices[i] <= 10^4`

# `Solve`

[Leetcode-121-Best-Time-to-Buy-and-Sell-Stock](../Leetcode-121-Best-Time-to-Buy-and-Sell-Stock)

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        new_ = []

        for i in range(1 , len(prices)):

            new_.append( prices[i] - prices[i-1] )

        res = 0
        for i in range(len(new_)):
            if new_[i] > 0:
                res += new_[i]

        return res
        
        
        
#two point
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        
        res = 0

        i = 0
        _min = prices[0]
        for j in range(len(prices)):
            if _min > prices[j]:
                _min = prices[j]
            elif _min < prices[j]:
                res += prices[j] - _min
                _min = prices[j]

        return res

        
```

## 優化

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:

        res = 0
        for i in range(1 , len(prices)):
            if prices[i] - prices[i-1] > 0:
                res += prices[i] - prices[i-1]

        return res
```