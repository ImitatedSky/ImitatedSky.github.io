def run(vals, k):
    return list_vals(Solution().rotateRight(build_list(vals), k))


check(run([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3], "範例 1")
check(run([0, 1, 2], 4), [2, 0, 1], "範例 2：k 大於長度")
check(run([], 3), [], "空串列")
check(run([7], 99), [7], "單一節點")
check(run([1, 2, 3], 0), [1, 2, 3], "k = 0 不變")
check(run([1, 2, 3], 3), [1, 2, 3], "k 等於長度，轉回原樣")
check(run([1, 2, 3, 4], 8), [1, 2, 3, 4], "k 是長度的倍數")
check(run([1, 2], 1), [2, 1], "兩個節點轉一次")
check(run([1, 2, 3, 4, 5], 4), [2, 3, 4, 5, 1], "轉 n - 1 次")
check(run([1, 2, 3], 2000000000), [2, 3, 1], "k 非常大：必須先取餘數")
vals = list(range(500))
check(run(vals, 123), vals[-123:] + vals[:-123], "500 個節點")
