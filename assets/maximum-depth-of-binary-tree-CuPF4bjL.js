var e=`s = Solution()
check(s.maxDepth(build_tree([3, 9, 20, None, None, 15, 7])), 3, "範例 1")
check(s.maxDepth(build_tree([1, None, 2])), 2, "只有右小孩")
check(s.maxDepth(build_tree([])), 0, "空樹")
check(s.maxDepth(build_tree([1])), 1, "單一節點")
check(s.maxDepth(build_tree([1, 2, 3, 4, 5, None, None, None, None, 6])), 4, "最深的路在中間")
check(s.maxDepth(build_tree([1, 2, None, 3, None, 4, None, 5])), 5, "左斜樹")
check(s.maxDepth(build_tree([1, 2, 3, 4, 5, 6, 7])), 3, "完全二元樹")

# 60 層的右斜樹
deep = cur = TreeNode(0)
for i in range(1, 60):
    cur.right = TreeNode(i)
    cur = cur.right
check(s.maxDepth(deep), 60, "60 層右斜樹")
`;export{e as default};