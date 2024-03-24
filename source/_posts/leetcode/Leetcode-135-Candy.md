---
title: Leetcode#135. Candy
tags:
- [Leetcode]
- [Python]
- [hard]

- [💡]

- Array
- Greedy



cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-09-06 14:39:13
---
# `Problem`

There are `n` children standing in a line. Each child is assigned a rating value given in the integer array `ratings`.

You are giving candies to these children subjected to the following requirements:

- Each child must have at least one candy.
- Children with a higher rating get more candies than their neighbors.

Return *the minimum number of candies you need to have to distribute the candies to the children*.

**Example 1:**

```
Input: ratings = [1,0,2]
Output: 5
Explanation: You can allocate to the first, second and third child with 2, 1, 2 candies respectively.

```

**Example 2:**

```
Input: ratings = [1,2,2]
Output: 4
Explanation: You can allocate to the first, second and third child with 1, 2, 1 candies respectively.
The third child gets 1 candy because it satisfies the above two conditions.

```

**Constraints:**

- `n == ratings.length`
- `1 <= n <= 2 * 10^4`
- `0 <= ratings[i] <= 2 * 10^4`

# `Solve`

這題看似簡單，但意外讓我卡很久

### `法1`

直接遍歷方式解法，(這解法不確定算不算用到greedy了)

1.每個同學都先發放一顆

2.接下來兩兩比較當下一個較大就多發一顆

3.從後面看回來，同樣的方式，比下一個大的就多發一顆，但多一個加條件，當下一個已經多發就不用改變

```python
class Solution:
    def candy(self, ratings: List[int]) -> int:
        L = len(ratings)
        ans = [1]*L

        for i in range(1,L):
            if ratings[i-1] < ratings[i]:
                ans[i] = ans[i-1]+1

        for i in range(L-1, 0  ,-1):
            if ratings[i-1] > ratings[i] and ans[i-1] <= ans[i]:
                ans[i-1] = ans[i]+1

        return sum(ans)
```

Time Complexity : O(n)

Space Complexity : O(n)