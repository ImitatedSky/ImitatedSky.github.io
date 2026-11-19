var e=`def _board(rows):
    return [list(row) for row in rows]


VALID = [
    "53..7....",
    "6..195...",
    ".98....6.",
    "8...6...3",
    "4..8.3..1",
    "7...2...6",
    ".6....28.",
    "...419..5",
    "....8..79",
]
EMPTY = ["........."] * 9

s = Solution()
check(s.isValidSudoku(_board(VALID)), True, "範例 1：合法盤面")
check(s.isValidSudoku(_board(["83..7...."] + VALID[1:])), False, "範例 2：九宮格內重複")
check(s.isValidSudoku(_board(EMPTY)), True, "全空盤面")
check(s.isValidSudoku(_board(["1......1."] + EMPTY[1:])), False, "同一列重複")
check(s.isValidSudoku(_board(["..3......"] + EMPTY[1:4] + ["..3......"] + EMPTY[5:])), False, "同一欄重複")
check(s.isValidSudoku(_board(["1........", ".........", "..1......"] + EMPTY[3:])), False, "同宮但不同列不同欄")
check(s.isValidSudoku(_board(["1........", "...1.....", "......1.."] + EMPTY[3:])), True, "同數字分散在不同列欄宮")
check(s.isValidSudoku(_board(EMPTY[:8] + ["9.......9"])), False, "最後一列重複")
check(
    s.isValidSudoku(_board(["123456789", "456789123", "789123456", "214365897", "365897214", "897214365", "531642978", "642978531", "978531642"])),
    True,
    "完整填滿的合法解",
)
`;export{e as default};