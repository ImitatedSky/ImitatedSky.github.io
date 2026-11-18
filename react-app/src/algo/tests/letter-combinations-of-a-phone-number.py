s = Solution()
check(sorted(s.letterCombinations("23")), ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"], "範例 1")
check(sorted(s.letterCombinations("2")), ["a", "b", "c"], "單一數字")
check(s.letterCombinations(""), [], "空字串")
check(sorted(s.letterCombinations("7")), ["p", "q", "r", "s"], "7 有四個字母")
check(
    sorted(s.letterCombinations("79")),
    sorted(a + b for a in "pqrs" for b in "wxyz"),
    "兩個四字母的鍵",
)
got = s.letterCombinations("2345")
check(len(got), 81, "四個數字共 81 種")
check(len(set(got)), 81, "四個數字沒有重複")
check(sorted(got), sorted("".join(p) for p in product("abc", "def", "ghi", "jkl")), "四個數字的內容")
