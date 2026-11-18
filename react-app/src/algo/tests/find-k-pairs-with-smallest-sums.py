s = Solution()


def valid(nums1, nums2, k, got):
    # 和相同的組合誰先誰後不固定，所以比的是：
    # 1) 回傳的每一對都是真的 (nums1 的數, nums2 的數)，而且沒有多拿
    # 2) 各對的「和」排序後，等於所有組合中最小的 k 個和
    if not isinstance(got, list):
        return False
    want = sorted(a + b for a in nums1 for b in nums2)[:k]
    if len(got) != len(want):
        return False
    pool = Counter((a, b) for a in nums1 for b in nums2)
    used = Counter(tuple(p) for p in got)
    if any(used[p] > pool[p] for p in used):
        return False
    return sorted(a + b for a, b in got) == want


check(sorted(s.kSmallestPairs([1, 7, 11], [2, 4, 6], 3)), [[1, 2], [1, 4], [1, 6]], "範例 1")
check(sorted(s.kSmallestPairs([1, 1, 2], [1, 2, 3], 2)), [[1, 1], [1, 1]], "範例 2：有重複")
check(sorted(s.kSmallestPairs([1, 2], [3], 5)), [[1, 3], [2, 3]], "不到 k 對，全部回傳")
check(sorted(s.kSmallestPairs([1], [1], 1)), [[1, 1]], "各一個")
check(sorted(s.kSmallestPairs([1, 7, 11], [2, 4, 6], 5)), [[1, 2], [1, 4], [1, 6], [7, 2], [7, 4]], "跨到第二列")
check(sorted(s.kSmallestPairs([-10, -4, 0], [-3, 5], 2)), [[-10, -3], [-4, -3]], "負數")
check(sorted(s.kSmallestPairs([1, 2, 3], [1, 2, 3], 9)), sorted([a, b] for a in [1, 2, 3] for b in [1, 2, 3]), "k = 全部")

for nums1, nums2, k, label in [
    ([1, 1, 2], [1, 2, 3], 3, "和相同時任一組都算對"),
    ([1, 2, 4, 5, 6], [3, 5, 7, 9], 7, "交錯"),
    ([0, 0, 0], [0, 0], 4, "全部是 0"),
    ([1, 5, 9], [1, 2, 3, 4, 5, 6], 10, "nums2 比較長"),
]:
    check(valid(nums1, nums2, k, s.kSmallestPairs(list(nums1), list(nums2), k)), True, label)

big1 = list(range(0, 100000))
big2 = list(range(0, 100000))
check(valid(big1[:300], big2[:300], 1000, s.kSmallestPairs(big1, big2, 1000)), True, "大陣列（不能列舉全部組合）")
