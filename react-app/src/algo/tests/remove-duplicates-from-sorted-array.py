def run(nums):
    """回傳 (k, 前 k 個)；順序必須保持"""
    k = Solution().removeDuplicates(nums)
    return k, nums[:k]


check(run([1, 1, 2]), (2, [1, 2]), "範例 1")
check(run([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]), (5, [0, 1, 2, 3, 4]), "範例 2")
check(run([5]), (1, [5]), "單一元素")
check(run([7, 7, 7, 7]), (1, [7]), "全部相同")
check(run([1, 2, 3, 4]), (4, [1, 2, 3, 4]), "沒有重複")
check(run([-3, -3, -1, 0, 0, 2]), (4, [-3, -1, 0, 2]), "含負數")
check(run([1, 2, 2]), (2, [1, 2]), "重複在尾端")
check(run(sorted(list(range(50)) * 3)), (50, list(range(50))), "較長的輸入")
