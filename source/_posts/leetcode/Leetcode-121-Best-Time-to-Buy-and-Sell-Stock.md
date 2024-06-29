---
title: "Leetcode#121.\_Best Time to Buy and Sell Stock"
tags:
- [Leetcode]
- [Python]
- [easy]

- [Array]
- [Dynamic Programming]


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-18 10:48:19


---

# `Problem`

You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return `0`.

**Example 1:**

```
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.

```

**Example 2:**

```
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.

```

**Constraints:**

- `1 <= prices.length <= 10^5`
- `0 <= prices[i] <= 10^4`

# `Solve`

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf') #正無窮大
        max_profit = 0

        for price in prices:
            min_price = min(min_price, price)
            max_profit = max(max_profit, price - min_price)

        return max_profit
```

O (n) time and O(1) space

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        _min = prices[0]
        maxProfit = 0

        for i in range(len(prices)):
            _min = min(_min , prices[i])
            if prices[i]- _min   > maxProfit:
                maxProfit = prices[i]- _min
        return maxProfit
```

O (n) time and O(1) space