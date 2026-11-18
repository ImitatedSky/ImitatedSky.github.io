def close(got, expected):
    """浮點數用相對誤差比較，不要求每一位都相同"""
    return isinstance(got, (int, float)) and abs(got - expected) <= 1e-9 * max(1.0, abs(expected))


s = Solution()
check(close(s.myPow(2.0, 10), 1024.0), True, "範例 1：2^10")
check(close(s.myPow(2.1, 3), 9.261), True, "範例 2：2.1^3")
check(close(s.myPow(2.0, -2), 0.25), True, "範例 3：負指數")
check(close(s.myPow(3.0, 5), 243.0), True, "3^5")
check(close(s.myPow(5.0, 0), 1.0), True, "n = 0")
check(close(s.myPow(7.5, 1), 7.5), True, "n = 1")
check(close(s.myPow(-2.0, 3), -8.0), True, "負底數、奇數次方")
check(close(s.myPow(-2.0, 4), 16.0), True, "負底數、偶數次方")
check(close(s.myPow(0.0, 5), 0.0), True, "底數是 0")
check(close(s.myPow(1.0, 2147483647), 1.0), True, "n 是上限（一個一個乘會超時）")
check(close(s.myPow(-1.0, 2147483647), -1.0), True, "-1 的奇數次方")
check(close(s.myPow(1.0, -2147483648), 1.0), True, "n 是下限")
check(close(s.myPow(2.0, -2147483648), 0.0), True, "非常小，趨近 0")
check(close(s.myPow(0.5, 10), 0.0009765625), True, "小數底數")
check(close(s.myPow(1.0000001, 100000), 1.0000001 ** 100000), True, "接近 1 的大次方")
