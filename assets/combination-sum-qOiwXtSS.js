var e=`s = Solution()


def norm(res):
    """順序不限：每組內部排序，再整體排序"""
    return sorted(sorted(c) for c in res)


check(norm(s.combinationSum([2, 3, 6, 7], 7)), [[2, 2, 3], [7]], "範例 1")
check(norm(s.combinationSum([2, 3, 5], 8)), [[2, 2, 2, 2], [2, 3, 3], [3, 5]], "範例 2")
check(norm(s.combinationSum([2], 1)), [], "湊不出來")
check(norm(s.combinationSum([1], 3)), [[1, 1, 1]], "同一個數重複選")
check(norm(s.combinationSum([5, 3], 4)), [], "未排序且無解")
check(
    norm(s.combinationSum([7, 3, 2], 18)),
    [[2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 3, 3], [2, 2, 2, 2, 3, 7], [2, 2, 2, 3, 3, 3, 3],
     [2, 2, 7, 7], [2, 3, 3, 3, 7], [3, 3, 3, 3, 3, 3]],
    "未排序的輸入",
)
check(norm(s.combinationSum([8, 7, 4, 3], 11)), [[3, 4, 4], [3, 8], [4, 7]], "沒有重複的組合")
check(len(s.combinationSum([2, 3, 5, 7, 11], 30)), 64, "較大的 target")
`;export{e as default};