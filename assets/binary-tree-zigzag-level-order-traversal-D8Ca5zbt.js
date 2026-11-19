var e=`s = Solution()
check(s.zigzagLevelOrder(build_tree([3, 9, 20, None, None, 15, 7])), [[3], [20, 9], [15, 7]], "範例 1")
check(s.zigzagLevelOrder(build_tree([1])), [[1]], "單一節點")
check(s.zigzagLevelOrder(build_tree([])), [], "空樹")
check(
    s.zigzagLevelOrder(build_tree([1, 2, 3, 4, 5, 6, 7, 8, None, None, 9])),
    [[1], [3, 2], [4, 5, 6, 7], [9, 8]],
    "四層",
)
check(s.zigzagLevelOrder(build_tree([1, 2, 3, 4, None, None, 5])), [[1], [3, 2], [4, 5]], "兩側各一個孫節點")
check(s.zigzagLevelOrder(build_tree([1, 2, None, 3, None, 4])), [[1], [2], [3], [4]], "左斜樹")
check(s.zigzagLevelOrder(build_tree([1, 2, 3])), [[1], [3, 2]], "兩層")
`;export{e as default};