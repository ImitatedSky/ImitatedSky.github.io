var e=`s = Solution()


def close(got, expected):
    """逐項比較浮點數（容許 1e-5 誤差），回傳是否一致"""
    return (
        isinstance(got, list)
        and len(got) == len(expected)
        and all(abs(g - e) < 1e-5 for g, e in zip(got, expected))
    )


def run(level, expected, label):
    got = s.averageOfLevels(build_tree(level))
    check(got if not close(got, expected) else expected, expected, label)


run([3, 9, 20, None, None, 15, 7], [3.0, 14.5, 11.0], "範例 1")
run([3, 9, 20, 15, 7], [3.0, 14.5, 11.0], "範例 2")
run([5], [5.0], "單一節點")
run([2, -4, 7, 1, None, 5, 3], [2.0, 1.5, 3.0], "含負數")
run([1, 2, None, 3, None, 4], [1.0, 2.0, 3.0, 4.0], "左斜樹")
run([1, 2, 2, 1, 1, 1], [1.0, 2.0, 1.0], "平均剛好是整數")
run([2147483647, 2147483647, 2147483647], [2147483647.0, 2147483647.0], "大數值不溢位")
run([1, 2, 3, 4, 5, 6, 8], [1.0, 2.5, 5.75], "四個節點的一層")
check(isinstance(s.averageOfLevels(build_tree([4, 2, 6]))[0], float), True, "回傳值是浮點數")
`;export{e as default};