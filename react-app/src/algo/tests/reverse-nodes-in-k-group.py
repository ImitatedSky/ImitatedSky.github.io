def run(vals, k):
    return list_vals(Solution().reverseKGroup(build_list(vals), k))


check(run([1, 2, 3, 4, 5], 2), [2, 1, 4, 3, 5], "範例 1：k = 2，尾巴剩 1 個")
check(run([1, 2, 3, 4, 5], 3), [3, 2, 1, 4, 5], "範例 2：k = 3，尾巴剩 2 個")
check(run([1, 2, 3, 4, 5, 6, 7, 8], 3), [3, 2, 1, 6, 5, 4, 7, 8], "兩組加上不足的尾巴")
check(run([1, 2, 3, 4], 4), [4, 3, 2, 1], "k 等於長度：整條反轉")
check(run([1, 2, 3, 4, 5, 6], 2), [2, 1, 4, 3, 6, 5], "剛好整除")
check(run([1, 2, 3], 1), [1, 2, 3], "k = 1 不變")
check(run([7], 1), [7], "單一節點")
check(run([1, 2], 2), [2, 1], "兩個節點一組")
check(run([1, 2, 3, 4, 5, 6, 7], 4), [4, 3, 2, 1, 5, 6, 7], "剩下 3 個不足 4 個")

n, k = 2000, 7
expected = []
for i in range(0, n, k):
    chunk = list(range(i, min(i + k, n)))
    expected += chunk[::-1] if len(chunk) == k else chunk
check(run(list(range(n)), k), expected, "2000 個節點")
