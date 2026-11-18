def run(board, words):
    """回傳排序後的結果（題目不限順序）；同時確認 board 沒有被改壞"""
    grid = [row[:] for row in board]
    got = Solution().findWords(grid, words)
    check(grid, board, "board 用完要還原")
    return sorted(got)


check(
    run(
        [["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]],
        ["oath", "pea", "eat", "rain"],
    ),
    ["eat", "oath"],
    "範例 1",
)
check(run([["a", "b"], ["c", "d"]], ["abcb"]), [], "範例 2")
check(run([["o", "a", "t"], ["o", "e", "h"]], ["oat", "oath", "eat", "dog"]), ["eat", "oat", "oath"], "單字是另一個單字的前綴")
check(run([["a", "b"], ["c", "d"]], ["abdb", "acd"]), ["acd"], "同一格不能重複使用")
check(run([["a"]], ["a"]), ["a"], "1×1 方格")
check(run([["a"]], ["b", "aa"]), [], "1×1 方格找不到")
check(run([["a", "a"], ["a", "a"]], ["aaaa", "aaaaa", "aa"]), ["aa", "aaaa"], "同一個單字有很多條路徑也只回傳一次")
check(run([["a", "b", "c"], ["f", "e", "d"]], ["abcdef", "fedcba", "abe", "cde", "adf"]), ["abcdef", "abe", "cde", "fedcba"], "蛇形路徑")
check(
    run([["a", "b"], ["c", "d"]], ["ab", "ac", "bd", "cd", "ad", "bc", "abdc", "acdb"]),
    ["ab", "abdc", "ac", "acdb", "bd", "cd"],
    "對角線不相鄰",
)

big = [["a"] * 12 for _ in range(12)]
check(run(big, ["a" * 10, "a" * 9 + "b", "b"]), ["a" * 10], "12×12 全部相同字母（需要剪枝才夠快）")
