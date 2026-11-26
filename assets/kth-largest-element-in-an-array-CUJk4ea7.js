var e=`s = Solution()
check(s.findKthLargest([3, 2, 1, 5, 6, 4], 2), 5, "範例 1")
check(s.findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4, "範例 2：有重複")
check(s.findKthLargest([1], 1), 1, "單一元素")
check(s.findKthLargest([7, 4, 9, 1], 4), 1, "k = n：最小值")
check(s.findKthLargest([7, 4, 9, 1], 1), 9, "k = 1：最大值")
check(s.findKthLargest([5, 5, 5, 5], 3), 5, "全部相同")
check(s.findKthLargest([-1, -5, -3, -2], 2), -2, "負數")
check(s.findKthLargest([2, 1], 2), 1, "兩個元素")
check(s.findKthLargest([1, 2, 3, 4, 5, 6, 7, 8], 3), 6, "已排序（遞增）")
check(s.findKthLargest([8, 7, 6, 5, 4, 3, 2, 1], 3), 6, "已排序（遞減）")

# 跟「直接排序」的答案比對
rng = random.Random(215)
ok = True
for _ in range(100):
    arr = [rng.randint(-100, 100) for _ in range(rng.randint(1, 30))]
    k = rng.randint(1, len(arr))
    ok = ok and s.findKthLargest(list(arr), k) == sorted(arr, reverse=True)[k - 1]
check(ok, True, "隨機資料對拍")

big = list(range(50000))
rng.shuffle(big)
check(s.findKthLargest(big, 100), 49900, "大陣列")
`;export{e as default};