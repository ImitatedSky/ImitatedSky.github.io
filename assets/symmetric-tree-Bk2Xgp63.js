var e=`s = Solution()


def sym(level):
    return s.isSymmetric(build_tree(level))


check(sym([1, 2, 2, 3, 4, 4, 3]), True, "範例 1")
check(sym([1, 2, 2, None, 3, None, 3]), False, "值對稱但形狀不對稱")
check(sym([1]), True, "單一節點")
check(sym([1, 2, 2]), True, "兩層對稱")
check(sym([1, 2, 3]), False, "左右小孩的值不同")
check(sym([1, 2]), False, "只有左小孩")
check(sym([1, None, 2]), False, "只有右小孩")
check(sym([1, 2, 2, 3, 4, 5, 3]), False, "內側的值不同")
check(sym([1, 2, 2, 3, None, None, 3]), True, "只有外側有節點")
check(sym([1, 2, 2, None, 3, 3]), True, "只有內側有節點")
check(sym([1, 2, 2, 3, 4, 3, 4]), False, "左右子樹相同但不是鏡像")
check(sym([0, 0, 0, 0, None, None, 0]), True, "值全為 0")
check(sym([5, 4, 4, 3, 2, 2, 3, 1, None, None, None, None, None, None, 1]), True, "四層對稱")
check(sym([5, 4, 4, 3, 2, 2, 3, 1, None, None, None, None, None, 1]), False, "最深一層位置不對稱")
`;export{e as default};