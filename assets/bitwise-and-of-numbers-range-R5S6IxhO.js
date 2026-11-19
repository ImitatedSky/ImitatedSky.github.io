var e=`s = Solution()
check(s.rangeBitwiseAnd(5, 7), 4, "範例 1")
check(s.rangeBitwiseAnd(0, 0), 0, "範例 2")
check(s.rangeBitwiseAnd(1, 2147483647), 0, "範例 3：整個範圍")
check(s.rangeBitwiseAnd(26, 30), 24, "共同前綴 11")
check(s.rangeBitwiseAnd(3, 4), 0, "沒有共同前綴")
check(s.rangeBitwiseAnd(6, 6), 6, "left == right")
check(s.rangeBitwiseAnd(2147483646, 2147483647), 2147483646, "上限附近")
check(s.rangeBitwiseAnd(2147483647, 2147483647), 2147483647, "最大值")
check(s.rangeBitwiseAnd(0, 1), 0, "0 和 1")
for lo, hi in [(8, 15), (12, 13), (100, 120), (1000, 1023), (17, 17)]:
    check(s.rangeBitwiseAnd(lo, hi), reduce(lambda a, b: a & b, range(lo, hi + 1)), f"對照暴力解 [{lo}, {hi}]")
`;export{e as default};