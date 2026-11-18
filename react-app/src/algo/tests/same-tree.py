s = Solution()


def same(p, q):
    return s.isSameTree(build_tree(p), build_tree(q))


check(same([1, 2, 3], [1, 2, 3]), True, "範例 1")
check(same([1, 2], [1, None, 2]), False, "值相同但形狀不同")
check(same([1, 2, 1], [1, 1, 2]), False, "形狀相同但值不同")
check(same([], []), True, "兩棵都是空樹")
check(same([1], []), False, "只有 q 是空樹")
check(same([], [1]), False, "只有 p 是空樹")
check(same([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]), True, "三層相同")
check(same([1, 2, 3, 4, 5], [1, 2, 3, 4, 6]), False, "只有最深的葉節點不同")
check(same([1, 2, 3, 4], [1, 2, 3]), False, "p 多一個節點")
check(same([1, 2, 3], [1, 2, 3, None, None, 4]), False, "q 多一個節點")
check(same([0, -5], [0, -5]), True, "含 0 與負數")
check(same([0], [1]), False, "根的值就不同（含 0）")
