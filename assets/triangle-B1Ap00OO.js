var e=`s = Solution()
check(s.minimumTotal([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]), 11, "範例 1")
check(s.minimumTotal([[-10]]), -10, "只有一列")
check(s.minimumTotal([[1], [2, 3], [4, -5, 6]]), -2, "含負數")
check(s.minimumTotal([[1], [2, 3]]), 3, "兩列")
check(s.minimumTotal([[-1], [2, 3], [1, -1, -3]]), -1, "貪心會走錯邊")
check(s.minimumTotal([[1], [1, 100], [100, 1, 100], [100, 100, 1, 100]]), 4, "最佳路徑先走左再往右")
check(s.minimumTotal([[1], [1, 100], [100, 1, 1], [100, 100, 100, 1]]), 103, "最後一列逃不掉 100")
check(s.minimumTotal([[0], [0, 0], [0, 0, 0]]), 0, "全部是 0")

# 不可以依賴輸入被修改後的狀態：同一份輸入算兩次要一樣
tri = [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]
first = s.minimumTotal([row[:] for row in tri])
check(s.minimumTotal([row[:] for row in tri]), first, "重複呼叫結果一致")
`;export{e as default};