var e=`s = Solution()
check(list_vals(s.reverseBetween(build_list([1, 2, 3, 4, 5]), 2, 4)), [1, 4, 3, 2, 5], "範例 1")
check(list_vals(s.reverseBetween(build_list([5]), 1, 1)), [5], "單一節點")
check(list_vals(s.reverseBetween(build_list([1, 2, 3, 4, 5, 6]), 1, 6)), [6, 5, 4, 3, 2, 1], "整條反轉")
check(list_vals(s.reverseBetween(build_list([3, 5]), 1, 2)), [5, 3], "從頭開始")
check(list_vals(s.reverseBetween(build_list([1, 2, 3]), 3, 3)), [1, 2, 3], "left == right")
`;export{e as default};