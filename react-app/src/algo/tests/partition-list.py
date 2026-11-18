def run(vals, x):
    # limit 可以在答案不小心繞成環時，避免測試跑不完
    return list_vals(Solution().partition(build_list(vals), x), limit=len(vals) + 5)


check(run([1, 4, 3, 2, 5, 2], 3), [1, 2, 2, 4, 3, 5], "範例 1")
check(run([2, 1], 2), [1, 2], "範例 2")
check(run([], 0), [], "空串列")
check(run([1], 2), [1], "單一節點，比 x 小")
check(run([3], 2), [3], "單一節點，比 x 大")
check(run([4, 3, 5], 2), [4, 3, 5], "沒有比 x 小的節點")
check(run([1, 2, 3], 5), [1, 2, 3], "全部都比 x 小")
check(run([6, 5, 1, 7, 2], 5), [1, 2, 6, 5, 7], "等於 x 的節點屬於後半段")
check(run([3, 1, 2], 3), [1, 2, 3], "最後一個節點比較小（尾巴沒斷開會成環）")
check(run([-1, 5, -3, 0, 2], 0), [-1, -3, 5, 0, 2], "負數")
vals = [(i * 37) % 101 - 50 for i in range(200)]
check(run(vals, 7), [v for v in vals if v < 7] + [v for v in vals if v >= 7], "200 個節點")
