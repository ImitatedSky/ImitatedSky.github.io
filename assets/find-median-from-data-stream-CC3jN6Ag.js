var e=`def run(ops, args):
    """照 LeetCode 的格式執行一連串操作，回傳每個操作的回傳值"""
    obj, out = None, []
    for op, a in zip(ops, args):
        if op == "MedianFinder":
            obj = MedianFinder()
            out.append(None)
        else:
            out.append(getattr(obj, op)(*a))
    return out


check(
    run(
        ["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"],
        [[], [1], [2], [], [3], []],
    ),
    [None, None, None, 1.5, None, 2.0],
    "範例 1",
)
check(
    run(
        ["MedianFinder", "addNum", "addNum", "addNum", "findMedian", "addNum", "findMedian", "addNum", "addNum", "findMedian"],
        [[], [5], [2], [8], [], [1], [], [9], [4], []],
    ),
    [None, None, None, None, 5.0, None, 3.5, None, None, 4.5],
    "亂序加入",
)
check(
    run(
        ["MedianFinder", "addNum", "findMedian", "addNum", "findMedian", "addNum", "findMedian"],
        [[], [-1], [], [-1], [], [-3], []],
    ),
    [None, None, -1.0, None, -1.0, None, -1.0],
    "負數與重複",
)
check(run(["MedianFinder", "addNum", "findMedian"], [[], [7], []]), [None, None, 7.0], "只有一個數")
check(
    run(["MedianFinder", "addNum", "addNum", "findMedian"], [[], [0], [0], []]),
    [None, None, None, 0.0],
    "兩個 0",
)


def medians(nums):
    """每加入一個數就查一次中位數"""
    mf, out = MedianFinder(), []
    for x in nums:
        mf.addNum(x)
        out.append(mf.findMedian())
    return out


check(medians([1, 2, 3, 4, 5]), [1.0, 1.5, 2.0, 2.5, 3.0], "遞增加入")
check(medians([5, 4, 3, 2, 1]), [5.0, 4.5, 4.0, 3.5, 3.0], "遞減加入")
check(medians([2, 2, 2, 2]), [2.0, 2.0, 2.0, 2.0], "全部相同")
check(medians([-100000, 100000, 0]), [-100000.0, 0.0, 0.0], "數值範圍的邊界")

# 兩個實例之間不能共用狀態
a, b = MedianFinder(), MedianFinder()
a.addNum(1)
b.addNum(9)
check([a.findMedian(), b.findMedian()], [1.0, 9.0], "兩個實例互不影響")

# 跟「每次都排序」的答案比對
rng = random.Random(295)
nums = [rng.randint(-1000, 1000) for _ in range(300)]
want, seen = [], []
for x in nums:
    bisect.insort(seen, x)
    k = len(seen)
    want.append(float(seen[k // 2]) if k % 2 else (seen[k // 2 - 1] + seen[k // 2]) / 2)
check(medians(nums), want, "隨機資料對拍")

# 大量操作：addNum 若是 O(n) 會非常慢
big = MedianFinder()
for v in range(50000):
    big.addNum(v)
check(big.findMedian(), 24999.5, "五萬次 addNum")
`;export{e as default};