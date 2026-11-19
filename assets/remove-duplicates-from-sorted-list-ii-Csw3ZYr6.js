var e=`def run(vals):
    return list_vals(Solution().deleteDuplicates(build_list(vals)))


check(run([1, 2, 3, 3, 4, 4, 5]), [1, 2, 5], "範例 1：中間兩段重複")
check(run([1, 1, 1, 2, 3]), [2, 3], "範例 2：開頭就重複")
check(run([]), [], "空串列")
check(run([1]), [1], "單一節點")
check(run([1, 1]), [], "全部重複，刪光")
check(run([1, 2, 2, 2]), [1], "結尾重複")
check(run([1, 1, 2, 2, 3, 3]), [], "連續好幾段重複，全部刪光")
check(run([1, 1, 2, 3, 3]), [2], "頭尾都重複，只剩中間")
check(run([1, 2, 3, 4]), [1, 2, 3, 4], "沒有任何重複")
check(run([-3, -3, -1, 0, 0, 0, 2]), [-1, 2], "含負數")
check(run([v for v in range(100) for _ in range(v % 3 + 1)]), list(range(0, 100, 3)), "較長的串列")
`;export{e as default};