def build(inorder, postorder):
    # 傳入複本：解法就算會修改輸入陣列（例如 postorder.pop()）也不影響其他測試
    return tree_vals(Solution().buildTree(list(inorder), list(postorder)))


check(build([9, 3, 15, 20, 7], [9, 15, 7, 20, 3]), [3, 9, 20, None, None, 15, 7], "範例 1")
check(build([-1], [-1]), [-1], "單一節點")
check(build([2, 1], [2, 1]), [1, 2], "只有左小孩")
check(build([1, 2], [2, 1]), [1, None, 2], "只有右小孩")
check(build([3, 2, 1], [3, 2, 1]), [1, 2, None, 3], "左斜樹")
check(build([1, 2, 3], [3, 2, 1]), [1, None, 2, None, 3], "右斜樹")
check(build([4, 2, 5, 1, 3, 6], [4, 5, 2, 6, 3, 1]), [1, 2, 3, 4, 5, None, 6], "三層")
check(build([4, 2, 5, 1, 6, 3, 7], [4, 5, 2, 6, 7, 3, 1]), [1, 2, 3, 4, 5, 6, 7], "完全二元樹")
check(build([3, 4, 5, 6, 8], [4, 3, 6, 8, 5]), [5, 3, 8, None, 4, 6], "之字形")
check(build([-10, -3, 0, 5, 9], [-10, -3, 5, 9, 0]), [0, -3, 9, -10, None, 5], "含 0 與負數")

# 同一個 Solution 物件連續呼叫兩次，狀態不能互相干擾
s = Solution()
check(tree_vals(s.buildTree([1, 2, 3], [1, 3, 2])), [2, 1, 3], "重複使用同一個物件（第 1 次）")
check(tree_vals(s.buildTree([7, 8], [8, 7])), [7, None, 8], "重複使用同一個物件（第 2 次）")
