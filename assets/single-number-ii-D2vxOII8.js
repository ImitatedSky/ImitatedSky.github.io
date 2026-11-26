var e=`s = Solution()
check(s.singleNumber([2, 2, 3, 2]), 3, "範例 1")
check(s.singleNumber([0, 1, 0, 1, 0, 1, 99]), 99, "範例 2")
check(s.singleNumber([7]), 7, "只有一個元素")
check(s.singleNumber([5, 9, 5, 5]), 9, "落單的在中間")
check(s.singleNumber([-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]), -4, "答案是負數")
check(s.singleNumber([-1, -1, -1, 0]), 0, "落單的是 0，其他是負數")
check(s.singleNumber([2147483647, -2147483648, 2147483647, 2147483647]), -2147483648, "最小值")
check(s.singleNumber([-2147483648, 2147483647, -2147483648, -2147483648]), 2147483647, "最大值")
big = list(range(-3000, 3000)) * 3 + [424242]
check(s.singleNumber(big), 424242, "大量資料")
`;export{e as default};