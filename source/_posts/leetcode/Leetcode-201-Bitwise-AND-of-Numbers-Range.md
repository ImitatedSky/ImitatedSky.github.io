---
title: "Leetcode#201.\_Bitwise AND of Numbers Range"
tags:
- [Leetcode]
- [Python]
- [medium]

- [Bit Manipulation]


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-07-18 11:09:31

comments: false
---
# `Problem`

Given two integers `left` and `right` that represent the range `[left, right]`, return *the bitwise(位元運算) AND of all numbers in this range, inclusive*.

**Example 1:**

```
Input: left = 5, right = 7
Output: 4

```

**Example 2:**

```
Input: left = 0, right = 0
Output: 0

```

**Example 3:**

```
Input: left = 1, right = 2147483647
Output: 0

```

**Constraints:**

- `0 <= left <= right <= 2^31 - 1`

# `Solve`

對區間的數字進行位元運算

```bash
根據位元的值（0或1）進行邏輯運算

位元 AND（&）：對兩個二進制數進行對應位元的 AND 運算。當兩個對應位元都為1時，結果的對應位元為1，否則為0。
10101010   (170)
& 
11001100   (204)
----------
10001000   (136)
```

`不過題目要連續`

```python
101   (5)
& 
110   (6)
&
.
.
.
&
1100   (12)
----------
0000   (0)
```

```python
10101010   (170)
& 
10101010   (171)
&
.
.
.
&
11001100   (204)
----------
10000000   (128)
```

## 先說`結論、實際看 就是看位元數有沒有一樣`

因為連續區間 位元 AND 的結果該位元會是 0。

所以只有長度一樣時，才有

```python
class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        shift = 0  #紀錄往右的次數
        while left < right: #當長短不一時會持續進行，最終可能為0  0
            left >>= 1   #位元往右 1
            right >>= 1  #位元往右 1
            shift += 1  #往右次數+1
            
        return left << shift  #位元往左 shift 次
```

### 範例一

當 **`left = 5`**、**`right = 7`** 時

```
scssCopy code
left = 5   (二進制: 101)
right = 7  (二進制: 111)
shift = 0

```

迴圈開始，每次右移 **`left`** 和 **`right`** 一位，同時增加 **`shift`** 的值。

第一次迴圈：

```
scssCopy code
left = 2   (二進制: 10)
right = 3  (二進制: 11)
shift = 1

```

第二次迴圈：

```
scssCopy code
left = 1   (二進制: 1)
right = 1  (二進制: 1)
shift = 2

```

迴圈結束，因為此時 **`left`** 等於 **`right`**。

最後，將 **`left`** 左移 **`shift`** 位：

```
scssCopy code
result = 1 << 2
       = 100  (二進制)
       = 4    (十進制)

```

所以，在區間 **`[5, 7]`** 內的所有數字的位元 AND 運算結果為 **`4`**。

這個方法通過右移邊界來逐漸縮小區間的範圍，同時使用 **`shift`** 變數跟踪右移的位元數。最後，將左邊界左移回來，得到位元 AND 運算的結果。

### 範例二

假設 **`left = 3`**、**`right = 8`**。

```
scssCopy code
left = 3   (二進制: 11)
right = 8  (二進制: 1000)
shift = 0

```

迴圈開始，每次右移 **`left`** 和 **`right`** 一位，同時增加 **`shift`** 的值。

第一次迴圈：

```
scssCopy code
left = 1   (二進制: 1)
right = 4  (二進制: 100)
shift = 1

```

第二次迴圈：

```
scssCopy code
left = 0   (二進制: 0)
right = 2  (二進制: 10)
shift = 2

```

迴圈結束，因為此時 **`left`** 等於 **`right`**。

最後，將 **`left`** 左移 **`shift`** 位：

```
scssCopy code
result = 0 << 2
       = 00  (二進制)
       = 0   (十進制)

```

所以，在區間 **`[3, 8]`** 內的所有數字的位元 AND 運算結果為 **`0`**。

這個方法通過右移邊界來逐漸縮小區間的範圍，同時使用 **`shift`** 變數跟踪右移的位元數。最後，將左邊界左移回來，得到位元 AND 運算的結果。

注意：該程式碼的目的是求解區間內所有數字的位元 AND 運算結果，而不是計算 **`left`** 和 **`right`** 的位元 AND 運算結果。因此，當區間內的數字差異較大時，位元 AND 運算的結果可能為 0。

### 範例三

假設 **`left = 3`**、**`right = 9`**。

```
scssCopy code
left = 3   (二進制: 11)
right = 9  (二進制: 1001)
shift = 0

```

迴圈開始，每次右移 **`left`** 和 **`right`** 一位，同時增加 **`shift`** 的值。

第一次迴圈：

```
scssCopy code
left = 1   (二進制: 1)
right = 4  (二進制: 100)
shift = 1

```

第二次迴圈：

```
scssCopy code
left = 0   (二進制: 0)
right = 2  (二進制: 10)
shift = 2

```

迴圈結束，因為此時 **`left`** 等於 **`right`**。

最後，將 **`left`** 左移 **`shift`** 位：

```
scssCopy code
result = 0 << 2
       = 00  (二進制)
       = 0   (十進制)

```

所以，在區間 **`[3, 9]`** 內的所有數字的位元 AND 運算結果為 **`0`**。

這個方法通過右移邊界來逐漸縮小區間的範圍，同時使用 **`shift`** 變數跟踪右移的位元數。最後，將左邊界左移回來，得到位元 AND 運算的結果。

注意：該程式碼的目的是求解區間內所有數字的位元 AND 運算結果，而不是計算 **`left`** 和 **`right`** 的位元 AND 運算結果。因此，當區間內的數字差異較大時，位元 AND 運算的結果可能為 0。

## 偷吃步

```python
'''
1. right - 1 會將 right 的最右邊的 1 位元轉為 0
2. right &= right - 1 則是將 right 的值和 right - 1 的值進行位元 AND 運算，這一步的目的是將 right 的最右邊的 1 位元消除，因為在 left 和 right 之間的區間內，
必定會有某個數字的該位元為 0。
3. 重複執行以上兩步，直到 left 不再小於 right，即 left 和 right 相等或 left 大於 right。

也就是窮舉法
'''
class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        while left < right:
            right &= right - 1
        return right
```