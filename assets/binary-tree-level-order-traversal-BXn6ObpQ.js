var e=`s = Solution()
check(s.levelOrder(build_tree([3, 9, 20, None, None, 15, 7])), [[3], [9, 20], [15, 7]], "範例 1")
check(s.levelOrder(build_tree([1])), [[1]], "單一節點")
check(s.levelOrder(build_tree([])), [], "空樹")
check(s.levelOrder(build_tree([1, 2, 3, 4, 5, None, 6])), [[1], [2, 3], [4, 5, 6]], "三層")
check(s.levelOrder(build_tree([1, 2, None, 3, None, 4])), [[1], [2], [3], [4]], "左斜樹")
`;export{e as default};