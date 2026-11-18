def run(nums, k):
    Solution().rotate(nums, k)
    return nums


check(run([1, 2, 3, 4, 5, 6, 7], 3), [5, 6, 7, 1, 2, 3, 4], "範例 1")
check(run([-1, -100, 3, 99], 2), [3, 99, -1, -100], "範例 2")
check(run([1], 0), [1], "單一元素，k = 0")
check(run([1], 5), [1], "單一元素，k > n")
check(run([1, 2, 3], 0), [1, 2, 3], "k = 0")
check(run([1, 2, 3], 3), [1, 2, 3], "k 等於 n")
check(run([1, 2, 3, 4, 5], 7), [4, 5, 1, 2, 3], "k 大於 n")
check(run([1, 2], 1), [2, 1], "兩個元素")
check(run([1, 2, 3, 4, 5, 6], 1), [6, 1, 2, 3, 4, 5], "只轉一步")
check(run(list(range(1000)), 123456), list(range(544, 1000)) + list(range(544)), "較長的輸入")
