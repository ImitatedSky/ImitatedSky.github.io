s = Solution()
check(s.findMedianSortedArrays([1, 3], [2]), 2.0, "範例 1：總數奇數")
check(s.findMedianSortedArrays([1, 2], [3, 4]), 2.5, "範例 2：總數偶數")
check(s.findMedianSortedArrays([], [1]), 1.0, "nums1 是空的")
check(s.findMedianSortedArrays([2], []), 2.0, "nums2 是空的")
check(s.findMedianSortedArrays([], [2, 3]), 2.5, "一邊空，另一邊偶數個")
check(s.findMedianSortedArrays([1], [2]), 1.5, "各一個")
check(s.findMedianSortedArrays([3, 8, 10, 14, 20], [1, 5, 9, 12, 16, 18, 22]), 11.0, "互相交錯")
check(s.findMedianSortedArrays([1, 3, 7, 9], [2, 5]), 4.0, "nums1 比較長")
check(s.findMedianSortedArrays([1, 2, 3], [10, 11, 12, 13]), 10.0, "完全不重疊")
check(s.findMedianSortedArrays([10, 11, 12, 13], [1, 2, 3]), 10.0, "完全不重疊（反過來）")
check(s.findMedianSortedArrays([2, 2, 2], [2, 2]), 2.0, "全部相同")
check(s.findMedianSortedArrays([-5, -3, -1], [-4, -2]), -3.0, "負數")
check(s.findMedianSortedArrays([0, 0], [0, 0]), 0.0, "全部是 0")

# 跟「直接合併排序」的答案比對
rng = random.Random(4)
ok = True
for _ in range(200):
    a = sorted(rng.randint(-50, 50) for _ in range(rng.randint(0, 9)))
    b = sorted(rng.randint(-50, 50) for _ in range(rng.randint(0 if a else 1, 9)))
    merged = sorted(a + b)
    k = len(merged)
    want = float(merged[k // 2]) if k % 2 else (merged[k // 2 - 1] + merged[k // 2]) / 2
    ok = ok and s.findMedianSortedArrays(list(a), list(b)) == want
check(ok, True, "隨機資料對拍")
