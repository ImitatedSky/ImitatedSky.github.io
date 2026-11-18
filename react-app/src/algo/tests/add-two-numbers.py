def add(a, b):
    return list_vals(Solution().addTwoNumbers(build_list(a), build_list(b)))


check(add([2, 4, 3], [5, 6, 4]), [7, 0, 8], "範例 1：342 + 465 = 807")
check(add([0], [0]), [0], "0 + 0")
check(add([9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]), [8, 9, 9, 9, 0, 0, 0, 1], "範例 3：長度不同且一路進位")
check(add([5], [5]), [0, 1], "最後多出一個進位節點")
check(add([1], [9, 9, 9]), [0, 0, 0, 1], "短的加長的，進位一路傳到最高位")
check(add([9, 9], [1]), [0, 0, 1], "長的加短的")
check(add([0], [7, 3]), [7, 3], "加 0 不變")
check(add([1, 2, 3], [4, 5, 6]), [5, 7, 9], "完全沒有進位")

# 用很長的數字驗證：直接跟 Python 的大數加法比對
x, y = 98765432109876543210987654321, 12345678901234567890
digits = lambda n: [int(c) for c in reversed(str(n))]
check(add(digits(x), digits(y)), digits(x + y), "大數相加")
