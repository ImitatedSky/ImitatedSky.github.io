var e=`def find(node, val):
    """在建好的樹裡找出值為 val 的節點（值都不重複）"""
    if node is None:
        return None
    if node.val == val:
        return node
    return find(node.left, val) or find(node.right, val)


def run(level, pv, qv):
    root = build_tree(level)
    p, q = find(root, pv), find(root, qv)
    ans = Solution().lowestCommonAncestor(root, p, q)
    return ans.val if ans is not None else None


big = [3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]
check(run(big, 5, 1), 3, "範例 1：分居根的兩側")
check(run(big, 5, 4), 5, "範例 2：p 是 q 的祖先")
check(run(big, 4, 5), 5, "q 是 p 的祖先")
check(run([1, 2], 1, 2), 1, "範例 3：只有兩個節點")
check(run(big, 6, 4), 5, "答案在子樹裡")
check(run(big, 7, 4), 2, "兩個兄弟葉節點")
check(run(big, 7, 8), 3, "最深的葉和另一側的葉")
check(run(big, 0, 8), 1, "右子樹內")
check(run(big, 3, 4), 3, "其中一個是根")
check(run([1, 2, None, 3, None, 4], 3, 4), 3, "左斜鏈")
check(run([1, None, 2, None, 3, None, 4], 4, 2), 2, "右斜鏈")
check(run([0, 1, 2, 3, 4, 5, 6], 3, 6), 0, "值包含 0，不能用數值真假判斷")

# 必須回傳樹上的那個節點物件本身
root = build_tree(big)
p, q = find(root, 6), find(root, 4)
check(Solution().lowestCommonAncestor(root, p, q) is find(root, 5), True, "回傳的是原本的節點物件")
`;export{e as default};