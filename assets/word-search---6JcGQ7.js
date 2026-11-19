var e=`s = Solution()


def grid():
    # 每次都給一份新的，因為解法可能會就地修改 board
    return [list("ABCE"), list("SFCS"), list("ADEE")]


check(s.exist(grid(), "ABCCED"), True, "範例 1")
check(s.exist(grid(), "SEE"), True, "範例 2")
check(s.exist(grid(), "ABCB"), False, "同一格不能用兩次")
check(s.exist([["A"]], "A"), True, "1 x 1 命中")
check(s.exist([["A"]], "B"), False, "1 x 1 沒有")
check(s.exist([["A"]], "AA"), False, "word 比格子還長")
check(s.exist([list("CAA"), list("AAA"), list("BCD")], "AAB"), True, "需要回頭並還原標記")
check(s.exist([list("ABCE"), list("SFES"), list("ADEE")], "ABCESEEEFS"), True, "蛇形長路徑")
check(s.exist([list("AB"), list("CD")], "ABDC"), True, "繞一圈")
check(s.exist([list("AB"), list("CD")], "ADBC"), False, "不能走斜的")
check(s.exist([list("aA")], "Aa"), True, "區分大小寫，往左走")

# 找完之後 board 應該維持原狀（有還原標記）
b = grid()
s.exist(b, "ABCB")
s.exist(b, "ABCCED")
check(s.exist(b, "SEE"), True, "連續搜尋同一個 board")
`;export{e as default};