---
title: "Leetcode#146.\_LRU Cache"
tags:
- [Leetcode]
- [Python]
- [medium]

- [💡]
- Hash Table
- Linked List
- Design
- Doubly-Linked List


cover: /img/cover/leetcode.jpg
categories: Leetcode
comments: false
date: 2023-07-20 15:52:08
---

# `Problem`

Design a data structure that follows the constraints of a **[Least Recently Used (LRU) cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)**.

Implement the `LRUCache` class:

- `LRUCache(int capacity)` Initialize the LRU cache with **positive** size `capacity`.
- `int get(int key)` Return the value of the `key` if the key exists, otherwise return `1`.
- `void put(int key, int value)` Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, **evict** the least recently used key.

The functions `get` and `put` must each run in `O(1)` average time complexity.

**Example 1:**

```
Input
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
Output
[null, null, null, 1, null, -1, null, -1, 3, 4]

Explanation
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // cache is {1=1}
lRUCache.put(2, 2); // cache is {1=1, 2=2}
lRUCache.get(1);    // return 1
lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}
lRUCache.get(1);    // return -1 (not found)
lRUCache.get(3);    // return 3
lRUCache.get(4);    // return 4

```

**Constraints:**

- `1 <= capacity <= 3000`
- `0 <= key <= 10^4`
- `0 <= value <= 10^5`
- At most `2 * 10^5` calls will be made to `get` and `put`.

# `Solve`

題目給的 LRU 是一個儲存器(緩存器)

有放入 拿出功能

放入時，如果超過容量，就要把最久沒有被使用的資料移除

我這邊表示 cache 前後 關係為 舊資料，後面為新資料

```python
ex:
# 初始化一個 LRU Cache 容量為 3，並且放入 1:1 2:5 3:7
# cache is {1=1, 2=5, 3=7}
LRUCache lRUCache = new LRUCache(3);  
lRUCache.put(1, 1); 
lRUCache.put(2, 5); 
lRUCache.put(3, 7); 

'''
# 1:1 2:5 3:7 位置關係是 1:1 在最前面，3:7 在最後面
# 前面的資料是最舊的資料，後面的資料是最新的資料
'''
# 這邊get像是調用資料，但是不會移除資料
lRUCache.get(1);    // return 1

# 這邊put 4:9 會把 2:5 移除，因為 2:5 是最舊的資料
# 順序變成 3:7 1:1 4:9 ，3=7 是最舊的資料，4:9 是最新的資料
lRUCache.put(4, 9); // LRU key was 2, evicts key 2, cache is {3=7, 1=1, 4=9}
```

```python
# 初始化一個 LRU Cache 容量為 2
LRUCache lRUCache = new LRUCache(2);  

lRUCache.put(1, 1); // cache is {1=1} # 放入 1:1

# 放入 2:2 ，位置在 1:1 後面，因為 1:1 是最舊的資料
lRUCache.put(2, 2); // cache is {1=1, 2=2} # 放入 2:2

lRUCache.get(1);    // return 1 # 拿出 1:1
'''
# 做完 get 之後 cache 為 {2=2, 1=1} 
# 這時候 2:2 是最舊的資料，所以下次如果要放入新的資料時，就是把 2:2 移除，並且把新的資料放入
# 所以下次如果要放入新的資料時，就要把 2:2 移除，並且把新的資料放入
'''

lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3} 
'''
# LRU key 用途就是用來記錄最舊的資料，當要放入新的資料時，就可以把最舊的資料移除(evicts)
# 這樣就可以達到 LRU 的效果
# 放入 3:3 並且把 2:2 移除
'''

# 2:2 已經被移除了，所以拿不到資料
lRUCache.get(2);    // returns -1 (not found)

# 放入 4:4 並且把 1:1 移除，4:4 是最新的資料，所以放在最後面
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {3=3, 4=4}

# 1:1 已經被移除了，所以拿不到資料
lRUCache.get(1);    // return -1 (not found)

# 3:3 4:4 還在 cache 裡面
lRUCache.get(3);    // return 3
lRUCache.get(4);    // return 4

```

## `題目要求的 Hash Table Doubly-Linked List`

```python
class Node:
    def __init__(self, key, val):
        self.key = key  # 節點的鍵（對比  LRU Cache 中的 key）
        self.val = val  # 節點的值（對比  LRU Cache 中的 value）
        self.prev = None  # 上一個節點的指針
        self.next = None  # 下一個節點的指針

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity  # LRU Cache 的容量
        self.dict = dict()  # 哈希表用於快速查找節點
        self.head = Node(0, 0)  # 鏈表的頭節點
        self.tail = Node(0, 0)  # 鏈表的尾節點
        self.head.next = self.tail  # 頭節點的下一個指向尾節點
        self.tail.prev = self.head  # 尾節點的上一個指向頭節點
    
    def get(self, key):
        if key in self.dict:  # 如果 key 存在於哈希表中
            n = self.dict[key]  # 獲得對應的節點
            self._remove(n)  # 從鏈表中移除節點
            self._add(n)  # 將節點添加到鏈表尾部，表示最近訪問
            return n.val  # 返回節點的值
        return -1  # 如果 key 不存在，返回 -1
    
    def put(self, key, value):
        if key in self.dict:  # 如果 key 已經存在於哈希表中
            self._remove(self.dict[key])  # 從鏈表中移除對應節點
        n = Node(key, value)  # 創建新的節點
        self._add(n)  # 將節點添加到鏈表尾部，表示最近訪問
        self.dict[key] = n  # 在哈希表中添加鍵值對的引用
        if len(self.dict) > self.capacity:  # 如果超過容量上限
            n = self.head.next  # 獲得鏈表中第一個節點（即最久未使用的節點）
            self._remove(n)  # 從鏈表中移除節點
            del self.dict[n.key]  # 從哈希表中刪除鍵值對的引用
    
    def _remove(self, node):
        # 將節點從鏈表中移除
        p = node.prev
        n = node.next
        p.next = n
        n.prev = p
    
    def _add(self, node):
        # 將節點添加到鏈表尾部，表示最近訪問
        p = self.tail.prev
        p.next = node
        self.tail.prev = node
        node.prev = p
        node.next = self.tail
```

## `但python dict 可以變有序 !!!`

可以像 list 這樣做

但list 搜尋是用 for

時間複雜為O(n)，所以失敗

## `用list for迴圈，但效能上有問題 O(n) (失敗)`

```python
class LRUCache:
    def __init__(self, capacity: int):
        self.list = []
        self.capacity = capacity

    def get(self, key: int) -> int:
        for i in range(len(self.list)):
            if self.list[i][0] == key:
                # self.list.pop(i)
                # self.list.append((key, value))
                self.list.append(self.list.pop(i))
                return self.list[-1][1]
        return -1
        

    def put(self, key: int, value: int) -> None:
        for i in range(len(self.list)):
            if self.list[i][0] == key:
                self.list.pop(i)
                break
        if len(self.list) == self.capacity:
            self.list.pop(0)
        self.list.append((key, value))
```

`時間複雜度: O(n)`

邏輯沒錯 但是 時間跑太久

## `利用iter(dict) 為有序的`(python 3.7~)

```python
class LRUCache:

    def __init__(self, capacity: int):
        self.dict = {}
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.dict:
            return -1
        val = self.dict.pop(key)  #Remove it first before inserting it at the end again
        self.dict[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.dict:
            self.dict.pop(key)
        else:
            if len(self.dict) == self.capacity:
                del self.dict[next(iter(self.dict))]
        self.dict[key] = value

'''
iter(self.dict)：iter() 函數將字典轉換成一個迭代器（iterator）
next(iter(self.dict)) 取得第一個鍵
del self.dict[next(iter(self.dict))]  將取得的第一個鍵刪除
'''
```

在 Python 3.7 之後，**`dict`** 在保留插入順序方面是有序的。因此，**`iter(self.dict)`** 返回的迭代器將按照鍵（key）插入的順序來迭代字典中的鍵。

`時間複雜度:O(1)`

- iterator : 迭代器是 Python 中一種特殊的物件，它允許遍歷（迭代）容器中的元素，而不需要事先知道容器的結構。字典、列表、元組等可迭代的容器都可以通過 **`iter()`** 函數轉換成迭代器。
- **`iter()`** 函數：用於將可迭代的容器（如字典、列表、元組等）轉換成迭代器當使用迭代器時，我們可以使用 **`next()`** 函數依次取得容器中的元素。

1. **`iter(self.dict)`**：這一部分將字典 **`self.dict`** 轉換為一個迭代器。這是因為字典本身並不是一個迭代器，但我們希望能夠逐一訪問其中的鍵。
2. **`next(iter(self.dict))`**：這一部分使用 **`next()`** 函數取得迭代器 **`iter(self.dict)`** 中的下一個元素（這裡是字典中的第一個鍵）。換句話說，它返回字典中的第一個鍵。

## `偷吃步、直接載入有序的dict`

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.dict = OrderedDict()  # 使用OrderedDict來保持插入順序
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key in self.dict:
            # 移動查詢到的鍵值對到字典的末尾，表示最近使用
            self.dict.move_to_end(key)
            return self.dict[key]
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.dict:
            self.dict.move_to_end(key)
        else:
            if len(self.dict) == self.capacity:
                # 如果容量已滿，刪除字典的第一個元素（最久未使用）
                self.dict.popitem(last=False)
        self.dict[key] = value
```