def verify(s, length, label):
    """答案可能不只一個：檢查「是 s 的子字串、是回文、長度正確」"""
    got = Solution().longestPalindrome(s)
    check(isinstance(got, str), True, label + "（回傳型別要是 str）")
    check(got in s, True, label + f"（{got!r} 必須是子字串）")
    check(got == got[::-1], True, label + f"（{got!r} 必須是回文）")
    check(len(got), length, label + "（長度）")


verify("babad", 3, "範例 1")
verify("cbbd", 2, "範例 2：偶數長度")
verify("a", 1, "單一字元")
verify("ac", 1, "沒有長度 2 以上的回文")
verify("xabbay", 4, "偶數長度在中間")
verify("racecar", 7, "整個字串都是回文")
verify("aaaa", 4, "全部相同")
verify("abacdfgdcaba", 3, "頭尾對稱但中間不是")
verify("forgeeksskeegfor", 10, "較長的偶數回文")
verify("a" * 1000, 1000, "長度上限")
