var e=`def drain(level):
    """用 hasNext / next 把整棵樹走完"""
    it = BSTIterator(build_tree(level))
    out = []
    while it.hasNext() and len(out) < 10000:
        out.append(it.next())
    return out


# 範例：操作交錯呼叫
it = BSTIterator(build_tree([7, 3, 15, None, None, 9, 20]))
got = [it.next(), it.next(), it.hasNext(), it.next(), it.hasNext(), it.next(), it.hasNext(), it.next(), it.hasNext()]
check(got, [3, 7, True, 9, True, 15, True, 20, False], "範例 1")

check(drain([1]), [1], "單一節點")
check(drain([8, 3, 10, 1, 6, None, 14, None, None, 4, 7, 13]), [1, 3, 4, 6, 7, 8, 10, 13, 14], "一般的 BST")
check(drain([5, 4, None, 3, None, 2, None, 1]), [1, 2, 3, 4, 5], "左斜樹")
check(drain([1, None, 2, None, 3, None, 4]), [1, 2, 3, 4], "右斜樹")
check(drain([4, 2, 6, 1, 3, 5, 7]), [1, 2, 3, 4, 5, 6, 7], "完整二元樹")
check(drain([0, -5, 5, -8, -2]), [-8, -5, -2, 0, 5], "含負數")

# hasNext 不能消耗元素
it = BSTIterator(build_tree([2, 1, 3]))
check([it.hasNext(), it.hasNext(), it.hasNext()], [True, True, True], "連續呼叫 hasNext")
check([it.next(), it.hasNext(), it.next(), it.next(), it.hasNext()], [1, True, 2, 3, False], "hasNext 不影響 next 的結果")

# 兩個迭代器互不干擾
a = BSTIterator(build_tree([2, 1, 3]))
b = BSTIterator(build_tree([20, 10, 30]))
check([a.next(), b.next(), a.next(), b.next()], [1, 10, 2, 20], "兩個迭代器各自獨立")
`;export{e as default};