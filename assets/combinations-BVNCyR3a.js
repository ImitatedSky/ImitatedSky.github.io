var e=`s = Solution()


def norm(res):
    """順序不限：每組內部排序，再整體排序"""
    return sorted(sorted(c) for c in res)


check(norm(s.combine(4, 2)), [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]], "範例 1")
check(norm(s.combine(1, 1)), [[1]], "n = k = 1")
check(norm(s.combine(4, 4)), [[1, 2, 3, 4]], "k == n 只有一組")
check(norm(s.combine(5, 1)), [[1], [2], [3], [4], [5]], "k = 1")
check(norm(s.combine(5, 3)), [list(c) for c in combinations(range(1, 6), 3)], "n = 5, k = 3")
got = s.combine(10, 4)
check(len(got), 210, "C(10, 4) = 210 組")
check(norm(got), [list(c) for c in combinations(range(1, 11), 4)], "n = 10, k = 4 的內容")
`;export{e as default};