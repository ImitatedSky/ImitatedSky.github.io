var e=`s = Solution()
check(s.findMin([3, 4, 5, 1, 2]), 1, "範例 1")
check(s.findMin([4, 5, 6, 7, 0, 1, 2]), 0, "範例 2")
check(s.findMin([11, 13, 15, 17]), 11, "範例 3：沒旋轉")
check(s.findMin([1]), 1, "單一元素")
check(s.findMin([2, 1]), 1, "兩個元素，有旋轉")
check(s.findMin([1, 2]), 1, "兩個元素，沒旋轉")
check(s.findMin([2, 3, 4, 5, 1]), 1, "最小值在最後")
check(s.findMin([5, 1, 2, 3, 4]), 1, "最小值在第二格")
check(s.findMin([3, 4, 5, -2, -1, 0]), -2, "含負數")
check(s.findMin([4, 5, 6, 7, 8, 9, 1, 2, 3]), 1, "較長的陣列")

# 每一種旋轉位置
base = list(range(-7, 30, 3))
check(all(s.findMin(base[k:] + base[:k]) == -7 for k in range(len(base))), True, "所有旋轉位置")
`;export{e as default};