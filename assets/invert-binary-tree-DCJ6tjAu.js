var e=`s = Solution()


def invert(level):
    return tree_vals(s.invertTree(build_tree(level)))


check(invert([4, 2, 7, 1, 3, 6, 9]), [4, 7, 2, 9, 6, 3, 1], "範例 1")
check(invert([2, 1, 3]), [2, 3, 1], "範例 2")
check(invert([]), [], "空樹")
check(invert([1]), [1], "單一節點")
check(invert([1, 2]), [1, None, 2], "只有左小孩 → 變成右小孩")
check(invert([1, None, 2]), [1, 2], "只有右小孩 → 變成左小孩")
check(invert([1, 2, 3, 4, None, None, 5]), [1, 3, 2, 5, None, None, 4], "不對稱的樹")
check(invert([1, 2, None, 3, None, 4]), [1, None, 2, None, 3, None, 4], "左斜樹 → 右斜樹")
check(invert([1, 2, 2, 3, 4, 4, 3]), [1, 2, 2, 3, 4, 4, 3], "對稱的樹翻完長得一樣")
check(invert(invert([5, 3, 8, 1, 4, None, 9, None, 2])), [5, 3, 8, 1, 4, None, 9, None, 2], "翻兩次會回到原樣")
`;export{e as default};