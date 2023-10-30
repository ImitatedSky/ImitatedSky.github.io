---
title: "Leetcode#855.\_Exam Room"
tags:
- [Leetcode]
- [Python]

- [medium]


- [💡]
- Design
- Heap (Priority Queue)
- Ordered Set


cover: /img/cover/leetcode.jpg
categories: Leetcode
date: 2023-10-30 16:04:09
---

# `Problem`

There is an exam room with `n` seats in a single row labeled from `0` to `n - 1`.

When a student enters the room, they must sit in the seat that maximizes the distance to the closest person. If there are multiple such seats, they sit in the seat with the lowest number. If no one is in the room, then the student sits at seat number `0`.

Design a class that simulates the mentioned exam room.

Implement the `ExamRoom` class:

- `ExamRoom(int n)` Initializes the object of the exam room with the number of the seats `n`.
- `int seat()` Returns the label of the seat at which the next student will set.
- `void leave(int p)` Indicates that the student sitting at seat `p` will leave the room. It is guaranteed that there will be a student sitting at seat `p`.

**Example 1:**

```
Input
["ExamRoom", "seat", "seat", "seat", "seat", "leave", "seat"]
[[10], [], [], [], [], [4], []]
Output
[null, 0, 9, 4, 2, null, 5]

Explanation
ExamRoom examRoom = new ExamRoom(10);
examRoom.seat(); // return 0, no one is in the room, then the student sits at seat number 0.
examRoom.seat(); // return 9, the student sits at the last seat number 9.
examRoom.seat(); // return 4, the student sits at the last seat number 4.
examRoom.seat(); // return 2, the student sits at the last seat number 2.
examRoom.leave(4);
examRoom.seat(); // return 5, the student sits at the last seat number 5.

```

**Constraints:**

- `1 <= n <= 10^9`
- It is guaranteed that there is a student sitting at seat `p`.
- At most `10^4` calls will be made to `seat` and `leave`.

# `Solve`

### `Heapq`

```python
(-9 , 0 , 9)
0 1 2 3 4 5 6 7 8 9
--------------------------------
(-8 , 1 , 9 ) (1 , 0 , -1) 
v
0 1 2 3 4 5 6 7 8 9
--------------------------------
(-7 , 1 , 8)
v                 v
0 1 2 3 4 5 6 7 8 9
--------------------------------
(-2 , 1 , 3) (-3 , 5 , 8) 
v       v         v
0 1 2 3 4 5 6 7 8 9

-------------leave 4---------------
(-7 , 1 , 8) ~~(-2 , 1 , 3) (-3 , 5 , 8)~~
v                 v
0 1 2 3 4 5 6 7 8 9
```

```python
import heapq

class ExamRoom:

    def __init__(self, n: int):
        self.n = n
        self.room  = []

        self.room.append((-self.dist(0, n - 1), 0, n - 1))

    def seat(self) -> int:
        # 取出最長的空座位
        dist  , left , right = heapq.heappop(self.room)

        if left == 0:
            res = 0
        elif right == self.n - 1:
            res = self.n - 1
        else:
            res = left - dist
        
        if res > left:
            heappush(self.room, (-self.dist(left, res - 1), left, res - 1))
        
        if res < right:
            heappush(self.room, (-self.dist(res + 1, right), res + 1, right))

        return res

    def leave(self, p: int) -> None:
        pre_interval , next_interval = None , None
        left , right = p , p

        for item in self.room:
            if item[2] + 1 == p :
                pre_interval = item

            if item[1] - 1 == p :
                next_interval = item

        if pre_interval:
            left = pre_interval[1]
            self.room.remove(pre_interval)
        if next_interval:
            right = next_interval[2]
            self.room.remove(next_interval)

        

        heapq.heappush(self.room , ( -self.dist(left , right) ,left,right)  )
        
    def dist(self , l , r):
        # 計算將點放進後與邊距離
        # 由於0 n-1 在邊邊 所以不是放在中間

        if l == 0 or r == self.n -1 :
            return r - l
        else:
            return (r - l)//2
```

### `error`

由於經常在邊界時候會有問題所以乾脆不加進去

leave也要判別 有一邊沒有的時候

```python
import heapq

class ExamRoom:

    def __init__(self, n: int):
        self.room =[]
        self.n = n
        # -dist left right # max_heap
        heapq.heappush(self.room , ( - self.dist(0 ,  self.n -1) , 0 , self.n -1  )  ) 

    def seat(self) -> int:
        # 取出最長的空座位
        dist  , left , right = heapq.heappop(self.room)

        if left == 0:
            res = 0
        elif right == self.n - 1 :
            res = self.n - 1
        else:
            res = left - dist

        heapq.heappush(self.room , ( - self.dist(left ,  res-1)  , left , res-1 )  )
        heapq.heappush(self.room , ( - self.dist(res+1 , right) , res+1 , right )  )
        

        return res
        

    def leave(self, p: int) -> None:
        pre_interval , next_interval = None , None
        left , right = 0 , 0

        for item in self.room:
            if item[2] + 1 == p :
                pre_interval = item
                left = item[1]

            if item[1] - 1 == p :
                next_interval = item
                right = item[2]

        if pre_interval:
            self.room.remove(pre_interval)
        if next_interval:
            self.room.remove(next_interval)

        if not pre_interval:
            left = 0
        if not next_interval:
            right = self.n - 1
        

        heapq.heappush(self.room , ( -self.dist(left , right) ,left,right)  )

    def dist(self , l , r):
        # 計算將點放進後與邊距離
        # 由於0 n-1 在邊邊 所以不是放在中間

        if l == 0 or r == self.n -1 :
            return r - l
        else:
            return (r - l)//2

# Your ExamRoom object will be instantiated and called as such:
# obj = ExamRoom(n)
# param_1 = obj.seat()
# obj.leave(p)
```

### `一般計算距離後的解`

```python
class ExamRoom:

    def __init__(self, n: int):
        self.room =[]
        self.n = n
        # []0 ~ n-1]

    def seat(self) -> int:
        if not self.room:
            self.room.append(0)
            return 0

        # 找到兩個相鄰學生最遠距離 
        max_distance = self.room[0] - 0 
        index = 0

        for i in range(1 ,len(self.room)):

            dist = ( self.room[i] - self.room[i-1] ) // 2

            if dist > max_distance :
                max_distance = dist
                index = i   # i-1  v  i
        
        
        if  self.n -1 - self.room[-1]  > max_distance :
            res = self.n - 1
            index = -1
        elif index == 0:
            res = 0
        else:
            res = ( self.room[index -1 ] + self.room[index] ) //2

        self.room.append(res)
        self.room = sorted(self.room)

        return res
        

    def leave(self, p: int) -> None:
        #self.room.remove(p)

        i =  self.room.index(p)
        self.room.pop(i)

        

# Your ExamRoom object will be instantiated and called as such:
# obj = ExamRoom(n)
# param_1 = obj.seat()
# obj.leave(p)
```

### `錯誤紀錄`

蠻奇怪的

原因是因為，求距離時 只看與兩者選最短的距離

另外問題是 當0被拔除 沒有考慮到與0的距離

```python
[0,4,9]

0 1 2 3 4 5 6 7 8 9 
v       v         v

下面的程式
由於 
0 - 4 dist:4
4 - 9 dist:5
所以選擇 4 - 9 區間
但!!!
0 - 4 dist 應該為 min(2 , 2)
4 - 9 dist 應該為 min(2 , 3)

所以這時res應該放在 0 - 4 之間 

所以才改成 dist = (pre - curr)//2
```

```python
class ExamRoom:

    def __init__(self, n: int):
        self.room =[]
        self.n = n
        # []0 ~ n-1]

    def seat(self) -> int:
        if not self.room:
            self.room.append(0)
            return 0

        # 找到兩個相鄰學生最遠距離 
        max_distance = 0
        index = 0

        for i in range(1,len(self.room)):
            dist = self.room[i] - self.room[i-1]

            if dist > max_distance :
                max_distance = dist
                index = i   # i-1  v  i
        
        if self.n -1 - self.room[-1] > max_distance :
            res = self.n - 1
            index = -1
        else:
            res = ( self.room[index -1 ] + self.room[index] ) //2

        self.room.append(res)
        self.room = sorted(self.room)

        return res
        

    def leave(self, p: int) -> None:
        print(self.room)

        i =  self.room.index(p)
        self.room.pop(i)

        

# Your ExamRoom object will be instantiated and called as such:
# obj = ExamRoom(n)
# param_1 = obj.seat()
# obj.leave(p)
```

```python
Wrong Answer
2 / 126 testcases passed
Editorial
Input
["ExamRoom","seat","seat","seat","seat","leave","seat"]
[[10],[],[],[],[],[4],[]]

Use Testcase
Stdout
[0, 4, 6, 9]
Output
[null,0,9,4,6,null,3]
Expected
[null,0,9,4,2,null,5]
```