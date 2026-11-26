var e=`def run(vals, n):
    return list_vals(Solution().removeNthFromEnd(build_list(vals), n))


check(run([1, 2, 3, 4, 5], 2), [1, 2, 3, 5], "範例 1：刪中間")
check(run([1], 1), [], "只有一個節點，刪完變空")
check(run([1, 2], 1), [1], "刪尾巴")
check(run([1, 2], 2), [2], "刪頭節點")
check(run([1, 2, 3], 3), [2, 3], "n 等於長度：刪頭節點")
check(run([1, 2, 3, 4, 5], 1), [1, 2, 3, 4], "刪最後一個")
check(run([1, 2, 3, 4, 5], 5), [2, 3, 4, 5], "刪第一個")
check(run([4, 4, 4, 4], 3), [4, 4, 4], "值都相同")
for n in (1, 15, 30):
    vals = list(range(30))
    check(run(vals, n), vals[: 30 - n] + vals[30 - n + 1 :], f"30 個節點，n = {n}")
`;export{e as default};