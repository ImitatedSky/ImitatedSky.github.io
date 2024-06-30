---
title: coding 前python快速複習公式
tags:
  - [python]
cover: /img/cover/cover02.jpg
date: 2024-06-05 19:42:44
sticky: 99
---
linknode

好處 插入只要O(1)

壞處 訪問要O(n)

full binary tree  v.s. complete binary tree

## 一些公式/函數

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

### pop

`pop()` 方法從列表中移除並返回指定位置的元素，如果不指定索引，則默認移除並返回列表的最後一個元素。

```python
person = {"name": "Alice", "age": 25, "city": "New York"}

# 移除並返回鍵 "age" 對應的值
age = person.pop("age")
print(age)    # 輸出: 25
print(person) # 輸出: {'name': 'Alice', 'city': 'New York'}

# 如果鍵不存在，使用默認值
city = person.pop("city", "Unknown")
print(city)   # 輸出: New York

# 嘗試移除不存在的鍵，使用默認值
country = person.pop("country", "Unknown")
print(country) # 輸出: Unknown

```

### append

`append()` 方法在列表的末尾添加一個元素。

```python
numbers = [10, 20, 30]

# 在列表末尾添加元素40
numbers.append(40)
print(numbers)  # 輸出: [10, 20, 30, 40]

# 添加字符串
fruits = ["apple", "banana"]
fruits.append("cherry")
print(fruits)  # 輸出: ["apple", "banana", "cherry"]

```

### insert

`insert()` 方法在指定位置插入元素

```python
numbers = [10, 20, 30, 40, 50]

# 在索引2處插入25
numbers.insert(2, 25)
print(numbers)  # 輸出: [10, 20, 25, 30, 40, 50]

```

### remove

`remove()` 方法移除列表中第一次出現的指定元素。

```python
numbers = [10, 20, 30, 40, 50, 30]

# 移除第一次出現的30
numbers.remove(30)
print(numbers)  # 輸出: [10, 20, 40, 50, 30]

```

### len

`len()` 函數用來獲取序列（如列表、字典、字符串等）的長度。

```python
# 列表
numbers = [10, 20, 30, 40, 50]
print(len(numbers))  # 輸出: 5

# 字符串
text = "hello"
print(len(text))  # 輸出: 5

# 字典
person = {"name": "Alice", "age": 25, "city": "New York"}
print(len(person))  # 輸出: 3

```

### set

列表轉換為集合

```python
# 原始列表
numbers = [1, 2, 2, 3, 4, 4, 5]

# 將列表轉換為集合
set_numbers= set(numbers)

print(set_numbers)  # 輸出: {1, 2, 3, 4, 5}

```

```python
# 兩個列表
list1 = [1, 2, 3, 4, 5]
list2 = [4, 5, 6, 7, 8]

# 將列表轉換為集合
set1 = set(list1)
set2 = set(list2)

# 聯集
union_set = set1.union(set2)
print(union_set)  # 輸出: {1, 2, 3, 4, 5, 6, 7, 8}

# 交集
intersection_set = set1.intersection(set2)
print(intersection_set)  # 輸出: {4, 5}

# 差集
difference_set = set1.difference(set2)
print(difference_set)  # 輸出: {1, 2, 3}

```

集合轉換回列表

```python
# 集合
set_numbers = {1, 2, 3, 4, 5}

# 將集合轉換回列表
numbers_list = list(set_numbers)

print(numbers_list)  # 輸出: [1, 2, 3, 4, 5]

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

### index

使用`index()` 獲取第一個的索引

```python

numbers = [10, 20, 30, 20, 40]

index_of_20 = numbers.index(20)

print(index_of_20)  # 輸出: 1
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

### defaultdict

`defaultdict` 是 `collections` 模組中的一個子類，用於當鍵不存在時提供默認值。

```python
from collections import defaultdict

# 創建一個默認值為 list 的 defaultdict
dd = defaultdict(list)
dd['a'].append(1)
dd['b'].append(2)
print(dd)  # 輸出: defaultdict(<class 'list'>, {'a': [1], 'b': [2]})

# 創建一個默認值為 int 的 defaultdict
dd = defaultdict(int)
dd['a'] += 1
dd['b'] += 2
print(dd)  # 輸出: defaultdict(<class 'int'>, {'a': 1, 'b': 2})

```

### heapq

`heapq` 模組提供了堆隊列算法，也稱為優先隊列算法。

```python
import heapq

# 創建一個空堆
heap = []

# 向堆中添加元素
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
heapq.heappush(heap, 2)
print(heap)  # 輸出: [1, 3, 2]

# 從堆中取出最小元素
smallest = heapq.heappop(heap)
print(smallest)  # 輸出: 1
print(heap)  # 輸出: [2, 3]

```

```python
a = 10
b = 5
c = 3

# 加法
add_result = a + b
print(f"{a} + {b} = {add_result}")  # 輸出: 10 + 5 = 15

# 減法
sub_result = a - b
print(f"{a} - {b} = {sub_result}")  # 輸出: 10 - 5 = 5

# 乘法
mul_result = a * b
print(f"{a} * {b} = {mul_result}")  # 輸出: 10 * 5 = 50

# 除法
div_result = a / b
print(f"{a} / {b} = {div_result}")  # 輸出: 10 / 5 = 2.0

# 整數除法
int_div_result = a // c
print(f"{a} // {c} = {int_div_result}")  # 輸出: 10 // 3 = 3

# 取餘數
mod_result = a % c
print(f"{a} % {c} = {mod_result}")  # 輸出: 10 % 3 = 1
```