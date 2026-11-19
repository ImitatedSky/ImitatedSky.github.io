var e=`s = Solution()
check(s.singleNumber([2, 2, 1]), 1, "範例 1")
check(s.singleNumber([4, 1, 2, 1, 2]), 4, "範例 2")
check(s.singleNumber([1]), 1, "只有一個元素")
check(s.singleNumber([5, 3, 6, 3, 7, 6, 5]), 7, "成對的數不相鄰")
check(s.singleNumber([-1, -1, -2]), -2, "負數")
check(s.singleNumber([0, 7, 7]), 0, "落單的是 0")
check(s.singleNumber([30000, -30000, 30000]), -30000, "邊界值")
big = list(range(1, 5001)) * 2 + [12345]
check(s.singleNumber(big), 12345, "大量資料")
`;export{e as default};