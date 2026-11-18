def verdict(n, prerequisites):
    """合法順序不只一種，所以檢查「順序是否滿足所有先修關係」，而不是跟固定答案比對。"""
    got = Solution().findOrder(n, [list(p) for p in prerequisites])
    if not isinstance(got, list):
        return f"回傳的不是 list：{got!r}"
    if sorted(got) != list(range(n)):
        return f"應該包含 0 ~ {n - 1} 每門課各一次，實際得到 {got!r}"
    pos = {course: i for i, course in enumerate(got)}
    for course, pre in prerequisites:
        if pos[pre] > pos[course]:
            return f"{pre} 必須排在 {course} 前面，實際得到 {got!r}"
    return "ok"


def impossible(n, prerequisites):
    return Solution().findOrder(n, [list(p) for p in prerequisites])


check(verdict(2, [[1, 0]]), "ok", "範例 1")
check(verdict(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), "ok", "範例 2：菱形，兩種順序都對")
check(verdict(1, []), "ok", "只有一門課")
check(verdict(3, []), "ok", "沒有任何先修關係")
check(verdict(6, [[2, 0], [2, 1], [3, 2], [4, 2], [5, 3], [5, 4]]), "ok", "兩個起點")
check(verdict(6, [[1, 0], [3, 2], [5, 4]]), "ok", "不連通的三條邊")
check(verdict(5, [[0, 4], [1, 4], [2, 3], [3, 0], [3, 1]]), "ok", "起點不是 0 號課")
check(verdict(4, [[1, 0], [2, 0], [3, 0], [2, 1], [3, 1], [3, 2]]), "ok", "只有唯一一種順序")
check(verdict(300, [[i + 1, i] for i in range(299)]), "ok", "300 門課排成一條鏈")
check(impossible(2, [[1, 0], [0, 1]]), [], "兩門課互為先修")
check(impossible(4, [[1, 0], [2, 1], [3, 2], [1, 3]]), [], "環不包含起點")
check(impossible(3, [[0, 1], [1, 2], [2, 0]]), [], "三門課繞成一圈")
check(impossible(6, [[1, 0], [2, 1], [4, 3], [5, 4], [3, 5]]), [], "只有一部分的課卡在環裡")
