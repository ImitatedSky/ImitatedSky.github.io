def run(rows):
    """每個字串是一列；回傳修改後的棋盤（同樣用字串表示每一列）。"""
    board = [list(row) for row in rows]
    Solution().solve(board)
    return ["".join(row) for row in board]


check(run(["XXXX", "XOOX", "XXOX", "XOXX"]), ["XXXX", "XXXX", "XXXX", "XOXX"], "範例 1")
check(run(["X"]), ["X"], "只有一格 X")
check(run(["O"]), ["O"], "只有一格 O（在邊界上）")
check(run(["OO", "OO"]), ["OO", "OO"], "全部都在邊界上")
check(run(["XXX", "XOX", "XXX"]), ["XXX", "XXX", "XXX"], "正中央被包圍")
check(run(["OXO", "XOX", "OXO"]), ["OXO", "XXX", "OXO"], "四個角保留、中央翻掉")
check(
    run(["XXXXX", "XOOXX", "XXOXO", "XOXOO", "XOXXX"]),
    ["XXXXX", "XXXXX", "XXXXO", "XOXOO", "XOXXX"],
    "一塊被包圍、兩塊靠邊",
)
check(
    run(["XXXXX", "XOOOX", "XOXOX", "XOOOO", "XXXXX"]),
    ["XXXXX", "XOOOX", "XOXOX", "XOOOO", "XXXXX"],
    "環狀區域只靠一格連到邊界",
)
check(run(["XOXOX"]), ["XOXOX"], "單列")
check(run(["OOO", "OOO", "OOO"]), ["OOO", "OOO", "OOO"], "全部是 O")
check(
    run(["XXXX", "XOOX", "XOOX", "XXXX"]),
    ["XXXX", "XXXX", "XXXX", "XXXX"],
    "2×2 區域整塊被包圍",
)
