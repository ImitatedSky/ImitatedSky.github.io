def merge(a, b):
    return list_vals(Solution().mergeTwoLists(build_list(a), build_list(b)))


check(merge([1, 2, 4], [1, 3, 4]), [1, 1, 2, 3, 4, 4], "範例 1")
check(merge([], []), [], "兩條都是空的")
check(merge([], [0]), [0], "list1 是空的")
check(merge([5], []), [5], "list2 是空的")
check(merge([2, 5, 6, 8, 9], [1, 3]), [1, 2, 3, 5, 6, 8, 9], "長度差很多")
check(merge([1, 2, 3], [4, 5, 6]), [1, 2, 3, 4, 5, 6], "list1 全部比較小")
check(merge([4, 5, 6], [1, 2, 3]), [1, 2, 3, 4, 5, 6], "list2 全部比較小")
check(merge([-3, 0, 0], [-3, 0, 2]), [-3, -3, 0, 0, 0, 2], "負數與重複值")

# 必須重用原本的節點，而不是建立新節點
a, b = build_list([1, 3]), build_list([2, 4])
originals = set()
for head in (a, b):
    while head:
        originals.add(id(head))
        head = head.next
node, reused = Solution().mergeTwoLists(a, b), True
while node:
    reused = reused and id(node) in originals
    node = node.next
check(reused, True, "結果要由原本的節點串接而成")
