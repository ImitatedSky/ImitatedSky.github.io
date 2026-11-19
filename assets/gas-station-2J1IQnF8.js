var e=`s = Solution()
check(s.canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), 3, "範例 1")
check(s.canCompleteCircuit([2, 3, 4], [3, 4, 3]), -1, "總油量不足")
check(s.canCompleteCircuit([5, 1, 2, 3, 4], [4, 4, 1, 5, 1]), 4, "起點在最後一站")
check(s.canCompleteCircuit([5], [4]), 0, "只有一站，油夠")
check(s.canCompleteCircuit([2], [3]), -1, "只有一站，油不夠")
check(s.canCompleteCircuit([3, 1, 1], [1, 2, 2]), 0, "起點在第 0 站")
check(s.canCompleteCircuit([1, 2, 3, 4, 5, 5, 70], [2, 3, 4, 3, 9, 6, 2]), 6, "最後一站一次補滿")
check(s.canCompleteCircuit([0, 0, 0, 2], [0, 0, 1, 1]), 3, "淨值剛好為 0 的站")

# 大輸入：只有最後一站有賺，O(n²) 的寫法會太慢
n = 20000
gas = [1] * (n - 1) + [n]
cost = [2] * (n - 1) + [1]
check(s.canCompleteCircuit(gas, cost), n - 1, "大輸入")
`;export{e as default};