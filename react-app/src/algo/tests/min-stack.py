def run(ops, args):
    """照 LeetCode 的格式執行一連串操作，回傳每個操作的回傳值"""
    obj, out = None, []
    for op, a in zip(ops, args):
        if op == "MinStack":
            obj = MinStack()
            out.append(None)
        else:
            out.append(getattr(obj, op)(*a))
    return out


check(
    run(
        ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
        [[], [-2], [0], [-3], [], [], [], []],
    ),
    [None, None, None, None, -3, None, 0, -2],
    "範例 1",
)
check(
    run(
        ["MinStack", "push", "push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin", "pop", "getMin"],
        [[], [5], [3], [7], [3], [], [], [], [], [], [], []],
    ),
    [None, None, None, None, None, 3, None, 3, None, 3, None, 5],
    "最小值重複出現",
)
check(
    run(
        ["MinStack", "push", "push", "getMin", "pop", "getMin", "top"],
        [[], [0], [0], [], [], [], []],
    ),
    [None, None, None, 0, None, 0, 0],
    "兩個相同的最小值，pop 一個之後還在",
)
check(
    run(
        ["MinStack", "push", "push", "push", "getMin", "top", "pop", "getMin"],
        [[], [1], [2], [3], [], [], [], []],
    ),
    [None, None, None, None, 1, 3, None, 1],
    "遞增：最小值一直是最底下那個",
)
check(
    run(
        ["MinStack", "push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin"],
        [[], [3], [2], [1], [], [], [], [], []],
    ),
    [None, None, None, None, 1, None, 2, None, 3],
    "遞減：每次 pop 最小值都會變",
)
check(
    run(
        ["MinStack", "push", "pop", "push", "getMin", "top"],
        [[], [1], [], [9], [], []],
    ),
    [None, None, None, None, 9, 9],
    "清空之後再 push",
)
check(
    run(
        ["MinStack", "push", "push", "getMin", "top"],
        [[], [2147483647], [-2147483648], [], []],
    ),
    [None, None, None, -2147483648, -2147483648],
    "32 位元整數的邊界",
)

# 兩個實例之間不能共用狀態
a, b = MinStack(), MinStack()
a.push(1)
b.push(5)
check([a.getMin(), b.getMin()], [1, 5], "兩個實例互不影響")

# 大量操作：getMin 若是 O(n) 會非常慢
big = MinStack()
for v in range(30000, 0, -1):
    big.push(v)
check(sum(big.getMin() for _ in range(30000)), 30000, "三萬次 getMin")
mins = []
for _ in range(29999):
    big.pop()
    mins.append(big.getMin())
check(mins[:3] + mins[-1:], [2, 3, 4, 30000], "一路 pop 時最小值逐步回復")
