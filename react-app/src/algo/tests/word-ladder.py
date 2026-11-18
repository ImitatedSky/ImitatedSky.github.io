s = Solution()
check(s.ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]), 5, "範例 1")
check(s.ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]), 0, "範例 2：終點不在字典裡")
check(s.ladderLength("hit", "cog", ["hot", "dot", "cog"]), 0, "終點在字典裡，但中間接不上")
check(s.ladderLength("a", "c", ["a", "b", "c"]), 2, "單一字母：直接一步到位")
check(s.ladderLength("hot", "dot", ["dot"]), 2, "只差一個字母")
check(s.ladderLength("hot", "dog", ["hot", "dog"]), 0, "差兩個字母卻沒有中繼單字")
check(
    s.ladderLength("cold", "warm", ["cord", "card", "ward", "warm", "corm", "worm", "word"]),
    5,
    "四個字母，多條一樣長的路",
)
check(s.ladderLength("hit", "hot", ["hot", "hit"]), 2, "起點也在字典裡")
check(
    s.ladderLength("red", "tax", ["ted", "tex", "red", "tax", "tad", "den", "rex", "pee"]),
    4,
    "有死路的字典",
)
check(
    s.ladderLength("lost", "cost", ["most", "fist", "lost", "cost", "fish"]),
    2,
    "鄰居很多但終點就在旁邊",
)
check(
    s.ladderLength("aaaa", "bbbb", ["baaa", "bbaa", "bbba", "bbbb", "abbb", "aabb"]),
    5,
    "每個位置都要改",
)
# 字典很大時，兩兩比較找鄰居會太慢；換字母查集合才夠快
big = [a + b + c for a in "abcdefghij" for b in "abcdefghij" for c in "abcdefghij"]
check(s.ladderLength("aaa", "jjj", big), 4, "1000 個單字的字典")
