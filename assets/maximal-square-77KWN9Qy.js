var e=`def grid(*rows):
    """grid("101", "111") -> [["1","0","1"], ["1","1","1"]]"""
    return [list(r) for r in rows]


s = Solution()
check(s.maximalSquare(grid("10100", "10111", "11111", "10010")), 4, "範例 1")
check(s.maximalSquare(grid("01", "10")), 1, "範例 2")
check(s.maximalSquare(grid("0")), 0, "單一個 0")
check(s.maximalSquare(grid("1")), 1, "單一個 1")
check(s.maximalSquare(grid("0111", "1111", "0111")), 9, "邊長 3")
check(s.maximalSquare(grid("000", "000")), 0, "全部是 0")
check(s.maximalSquare(grid("1111", "1111", "1111", "1111")), 16, "全部是 1")
check(s.maximalSquare(grid("11111")), 1, "只有一列：邊長最多 1")
check(s.maximalSquare(grid("1", "1", "1")), 1, "只有一行：邊長最多 1")
check(s.maximalSquare(grid("1101", "1101", "1111")), 4, "長方形不算，只取正方形")
check(s.maximalSquare(grid("11100", "11100", "11111", "01111", "01111")), 9, "兩個邊長 3 的正方形重疊")
`;export{e as default};