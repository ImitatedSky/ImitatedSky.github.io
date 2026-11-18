s = Solution()
check(s.countNodes(build_tree([1, 2, 3, 4, 5, 6])), 6, "範例 1")
check(s.countNodes(build_tree([])), 0, "空樹")
check(s.countNodes(build_tree([1])), 1, "單一節點")
check(s.countNodes(build_tree([1, 2])), 2, "只有左小孩")
check(s.countNodes(build_tree([1, 2, 3])), 3, "高度 2 的滿二元樹")
check(s.countNodes(build_tree([1, 2, 3, 4])), 4, "最後一層只有 1 個")
check(s.countNodes(build_tree([1, 2, 3, 4, 5, 6, 7])), 7, "高度 3 的滿二元樹")
check(s.countNodes(build_tree(list(range(1, 13)))), 12, "12 個節點")

# 每一種大小都試一遍
for n in range(0, 70):
    check(s.countNodes(build_tree(list(range(n)) if n else [])), n, "節點數 %d" % n)

check(s.countNodes(build_tree([7] * 5000)), 5000, "5000 個節點")
