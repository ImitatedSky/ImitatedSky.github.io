var e=`s = Solution()
check(s.minMutation("AACCGGTT", "AACCGGTA", ["AACCGGTA"]), 1, "範例 1")
check(s.minMutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"]), 2, "範例 2")
check(s.minMutation("AAAAACCC", "AACCCCCC", ["AAAACCCC", "AAACCCCC", "AACCCCCC"]), 3, "範例 3：一條直線")
check(s.minMutation("AACCGGTT", "AACCGGTA", []), -1, "基因庫是空的")
check(s.minMutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA"]), -1, "目標不在基因庫裡")
check(
    s.minMutation("AAAAAAAA", "CCCCCCCC", ["AAAAAAAC", "AAAAAACC", "CCCCCCCC"]),
    -1,
    "目標在基因庫裡，但中間接不上",
)
check(
    s.minMutation(
        "AACCGGTT",
        "AAACCGTA",
        ["AACCGGTA", "AACCGCTA", "AAACGGTA", "AAACGGTT", "AAACCGTA", "AACCTGTT"],
    ),
    3,
    "有分岔和死路",
)
check(s.minMutation("AACCGGTT", "AACCGGTT", ["AACCGGTT"]), 0, "起點就是目標")
check(
    s.minMutation("AAAAAAAA", "AAAAAATT", ["AAAAAAAT", "AAAAAATA", "AAAAAATT", "AAAAAAAC"]),
    2,
    "兩條一樣長的路",
)
check(
    s.minMutation(
        "AAAAAAAA",
        "CCCCCCCC",
        ["AAAAAAAC", "AAAAAACC", "AAAAACCC", "AAAACCCC", "AAACCCCC", "AACCCCCC", "ACCCCCCC", "CCCCCCCC"],
    ),
    8,
    "八個位置全部要改",
)
check(
    s.minMutation("AACCGGTT", "AACCGGTA", ["AACCGGTA", "AACCGGTA", "AACCGGTC"]),
    1,
    "基因庫有重複的基因",
)
`;export{e as default};