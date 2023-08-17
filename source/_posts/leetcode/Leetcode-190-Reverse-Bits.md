---
title: "Leetcode#190.\_Reverse Bits"
tags:
- [Leetcode]
- [Python]
- [easy]
- [💡]
- Divide and Conquer
- Bit Manipulation


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-08-17 11:28:21
---
# `Problem`

Reverse bits of a given 32 bits unsigned integer.

**Note:**

- Note that in some languages, such as Java, there is no unsigned integer type. In this case, both input and output will be given as a signed integer type. They should not affect your implementation, as the integer's internal binary representation is the same, whether it is signed or unsigned.
- In Java, the compiler represents the signed integers using [2's complement notation](https://en.wikipedia.org/wiki/Two%27s_complement). Therefore, in **Example 2** above, the input represents the signed integer `3` and the output represents the signed integer `1073741825`.

**Example 1:**

```
Input: n = 00000010100101000001111010011100
Output:    964176192 (00111001011110000010100101000000)
Explanation:The input binary string00000010100101000001111010011100 represents the unsigned integer 43261596, so return 964176192 which its binary representation is00111001011110000010100101000000.

```

**Example 2:**

```
Input: n = 11111111111111111111111111111101
Output:   3221225471 (10111111111111111111111111111111)
Explanation:The input binary string11111111111111111111111111111101 represents the unsigned integer 4294967293, so return 3221225471 which its binary representation is10111111111111111111111111111111.

```

**Constraints:**

- The input must be a **binary string** of length `32`

# `Solve`

## `位元的方法`

### `利用位元移位`

```python
class Solution:
    def reverseBits(self, n: int) -> int:
        res = 0  
        
        for i in range(32):
          if n & 1:
            res += 2**(31 - i)
          n=n>>1
        
        return res
```

### `純位元`

```python
class Solution:
    def reverseBits(self, n: int) -> int:
        res = 0  # 初始化結果為 0
        
        for i in range(32):
            # 計算 n 的最後一位（最低有效位）
            bit = n & 1
            # 將這一位按照反轉後的位置，加入到結果中
            res |= bit << (31 - i)
            # 將 n 向右移一位，以獲取下一位元
            n >>= 1
        
        return res  # 返回反轉後的整數結果
```

## `字串方法`

### `.`

1.轉成字串+補字元

2.反轉

3.運算

```python
class Solution:
    def reverseBits(self, n: int) -> int:
        r_n = "0"*(32-len(bin(n)[2:])) + str(bin(n)[2:])
        r_n = r_n[::-1] 
        level = 0
        res = 0
        cursor = 31
        
        while cursor >= 0  :
            res += int( r_n[cursor] ) *(2**level)
            level += 1
            cursor -= 1

        return  res
```

### `網路縮寫`

```python
class Solution:
    def reverseBits(self, n: int) -> int:
        # convert the input integer to a binary string
        binary_str = bin(n)[2:]
        binary_str = "0"*(32-len(binary_str))+ binary_str 
        # reverse the binary string
        reversed_str = binary_str[::-1]
        
        # convert the reversed binary string back to an integer
        reversed_int = int(reversed_str, 2)
        
        return reversed_int
```