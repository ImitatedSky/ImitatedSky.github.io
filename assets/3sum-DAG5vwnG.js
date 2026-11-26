var e=`def norm(triplets):
    # 組合內與組合之間的順序都不限，排序後再比較
    return sorted(sorted(x) for x in triplets)


s = Solution()
check(norm(s.threeSum([-1, 0, 1, 2, -1, -4])), [[-1, -1, 2], [-1, 0, 1]], "範例 1")
check(norm(s.threeSum([0, 1, 1])), [], "沒有答案")
check(norm(s.threeSum([0, 0, 0])), [[0, 0, 0]], "三個 0")
check(norm(s.threeSum([0, 0, 0, 0, 0])), [[0, 0, 0]], "很多個 0 只能算一組")
check(norm(s.threeSum([2, -2, 0, 0, 2, -2, 0])), [[-2, 0, 2], [0, 0, 0]], "大量重複值")
check(norm(s.threeSum([3, 1, 2, -1, 4])), [], "只有一個負數湊不出來")
check(norm(s.threeSum([-2, 0, 1, 1, 2])), [[-2, 0, 2], [-2, 1, 1]], "同一個 i 有兩組")
check(norm(s.threeSum([-1, -1, -1, 2, 2])), [[-1, -1, 2]], "兩端都有重複")
check(norm(s.threeSum([1, 2, 3])), [], "全是正數")
check(norm(s.threeSum([-3, -2, -1])), [], "全是負數")
check(
    norm(s.threeSum([-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6])),
    [[-4, -2, 6], [-4, 0, 4], [-4, 1, 3], [-4, 2, 2], [-2, -2, 4], [-2, 0, 2]],
    "綜合",
)
check(norm(s.threeSum([0] * 3000)), [[0, 0, 0]], "3000 個 0")
`;export{e as default};