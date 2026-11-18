def run(nums, val):
    """回傳 (k, 排序後的前 k 個)；題目不要求順序"""
    k = Solution().removeElement(nums, val)
    return k, sorted(nums[:k])


check(run([3, 2, 2, 3], 3), (2, [2, 2]), "範例 1")
check(run([0, 1, 2, 2, 3, 0, 4, 2], 2), (5, [0, 0, 1, 3, 4]), "範例 2")
check(run([], 1), (0, []), "空陣列")
check(run([4, 4, 4], 4), (0, []), "全部都要拿掉")
check(run([1, 2, 3], 9), (3, [1, 2, 3]), "沒有任何 val")
check(run([5], 5), (0, []), "單一元素且等於 val")
check(run([5], 6), (1, [5]), "單一元素且不等於 val")
check(run([2, 1, 2, 1, 2], 2), (2, [1, 1]), "頭尾都是 val")
