---
title: coding 前python快速複習公式
tags:
  - [python]
cover: /img/cover/cover02.jpg
date: 2024-06-05 19:42:44
---

## 一些公式

### sort

所有使用公式進行排列的**時間複雜度 都是 O(nlogn)**

```python
sorted_numbers = sorted(numbers)

# 逆序排序
sorted_numbers_desc = sorted(numbers, reverse=True)

#對原列表進行
numbers = [5, 2, 9, 1, 5, 6]
numbers.sort()
print(numbers)  # 輸出: [1, 2, 5, 5, 6, 9]
```

### enumerate

使用 `enumerate()` 獲取索引和值

```python
fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits):
    print(f"Index {index} is {fruit}")
    # 輸出:
    # Index 0 is apple
    # Index 1 is banana
    # Index 2 is cherry
```

### zip

使用 `zip()` 合併列表

```python
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]

for name, age in zip(names, ages):
    print(f"{name} is {age} years old")
    # 輸出:
    # Alice is 25 years old
    # Bob is 30 years old
    # Charlie is 35 years old
```

## hashmap

其實python 要建立一個 hashmap 利用字典就可以

```python
# 建立一個空的字典
hashmap = {}
```