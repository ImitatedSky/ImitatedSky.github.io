def run(level):
    root = build_tree(level)
    Solution().flatten(root)
    # 攤平後沿著 right 走；任何節點還留著 left 就算錯
    out, node = [], root
    while node and len(out) < 10000:
        if node.left is not None:
            return "節點 %r 的 left 不是 None" % node.val
        out.append(node.val)
        node = node.right
    return out


check(run([1, 2, 5, 3, 4, None, 6]), [1, 2, 3, 4, 5, 6], "範例 1")
check(run([]), [], "空樹")
check(run([0]), [0], "單一節點")
check(run([1, 2, 3, 4, 5, 6, 7]), [1, 2, 4, 5, 3, 6, 7], "完整二元樹")
check(run([1, 2, None, 3, None, 4]), [1, 2, 3, 4], "左斜樹")
check(run([1, None, 2, None, 3]), [1, 2, 3], "本來就是右斜鏈")
check(run([1, None, 2, 3]), [1, 2, 3], "右小孩有左子樹")
check(run([5, 3, 8, 1, 4, 7, 9, None, 2]), [5, 3, 1, 2, 4, 8, 7, 9], "較深的樹")

root = build_tree([1, 2, 5, 3, 4, None, 6])
Solution().flatten(root)
check(tree_vals(root), [1, None, 2, None, 3, None, 4, None, 5, None, 6], "層序表示法")
