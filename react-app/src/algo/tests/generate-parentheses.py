s = Solution()


def valid(p):
    bal = 0
    for ch in p:
        bal += 1 if ch == "(" else -1
        if bal < 0:
            return False
    return bal == 0


check(sorted(s.generateParenthesis(3)), ["((()))", "(()())", "(())()", "()(())", "()()()"], "範例 n = 3")
check(sorted(s.generateParenthesis(1)), ["()"], "n = 1")
check(sorted(s.generateParenthesis(2)), ["(())", "()()"], "n = 2")
got = s.generateParenthesis(4)
check(len(got), 14, "n = 4 共 14 個")
check(len(set(got)), 14, "n = 4 沒有重複")
check(all(len(p) == 8 and valid(p) for p in got), True, "n = 4 每個都合法")
got = s.generateParenthesis(8)
check(len(set(got)), 1430, "n = 8 共 1430 個")
check(all(len(p) == 16 and valid(p) for p in got), True, "n = 8 每個都合法")
