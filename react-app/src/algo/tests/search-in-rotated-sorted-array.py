s = Solution()
check(s.search([4, 5, 6, 7, 0, 1, 2], 0), 4, "範例 1")
check(s.search([4, 5, 6, 7, 0, 1, 2], 3), -1, "範例 2：不存在")
check(s.search([1], 0), -1, "單一元素，找不到")
check(s.search([1], 1), 0, "單一元素，找得到")
check(s.search([3, 1], 1), 1, "兩個元素（lo == mid）")
check(s.search([3, 1], 3), 0, "兩個元素，找第一個")
check(s.search([1, 3], 3), 1, "兩個元素，沒旋轉")
check(s.search([1, 2, 3, 4, 5], 4), 3, "沒有旋轉")
check(s.search([5, 1, 2, 3, 4], 5), 0, "只轉一格")
check(s.search([2, 3, 4, 5, 1], 1), 4, "最小值在尾端")
check(s.search([4, 5, 6, 7, 8, 0, 1, 2, 3], 1), 6, "較長的陣列")
check(s.search([6, 7, 0, 1, 2, 3, 4, 5], 7), 1, "斷點偏左")

# 每一種旋轉位置、每一個元素都要找得到
base = list(range(0, 40, 3))
ok = True
for k in range(len(base)):
    rot = base[k:] + base[:k]
    for i, v in enumerate(rot):
        ok = ok and s.search(rot, v) == i
    ok = ok and s.search(rot, 100) == -1 and s.search(rot, 4) == -1
check(ok, True, "所有旋轉位置")
