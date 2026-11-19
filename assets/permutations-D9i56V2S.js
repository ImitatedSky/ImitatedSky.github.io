var e=`s = Solution()

check(sorted(s.permute([1, 2, 3])), [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], "範例 1")
check(sorted(s.permute([0, 1])), [[0, 1], [1, 0]], "兩個元素")
check(sorted(s.permute([1])), [[1]], "單一元素")
check(sorted(s.permute([-1, 5, 3])), sorted(list(p) for p in permutations([-1, 5, 3])), "含負數")
got = s.permute([4, 1, 3, 2])
check(len(got), 24, "4! = 24 個")
check(sorted(got), sorted(list(p) for p in permutations([1, 2, 3, 4])), "四個元素的內容")
got = s.permute([6, 5, 4, 3, 2, 1])
check(len(got), 720, "6! = 720 個")
check(len(set(map(tuple, got))), 720, "六個元素沒有重複")
`;export{e as default};