def _brute(nums):
    """O(n²) 暴力解：枚舉每個起點，往後最多取 n 個"""
    n = len(nums)
    best = nums[0]
    for i in range(n):
        acc = 0
        for k in range(n):
            acc += nums[(i + k) % n]
            best = max(best, acc)
    return best


s = Solution()
check(s.maxSubarraySumCircular([1, -2, 3, -2]), 3, "範例 1：不繞圈")
check(s.maxSubarraySumCircular([5, -3, 5]), 10, "範例 2：繞圈")
check(s.maxSubarraySumCircular([-3, -2, -3]), -2, "範例 3：全部是負數")
check(s.maxSubarraySumCircular([7]), 7, "只有一個數")
check(s.maxSubarraySumCircular([-7]), -7, "單一負數")
check(s.maxSubarraySumCircular([8, -1, -3, 8, -6, -9, 2, 4]), 18, "挖掉中間最小的一段")
check(s.maxSubarraySumCircular([1, 2, 3, 4]), 10, "全部是正數：整圈都拿")
check(s.maxSubarraySumCircular([3, -1, 2, -1]), 4, "繞圈與不繞圈一樣大")
check(s.maxSubarraySumCircular([0, 0, 0]), 0, "全部是 0")
check(s.maxSubarraySumCircular([-2, 4, -5, 4, -5, 9, 4]), 15, "尾巴接開頭")

rng = random.Random(918)
for case in range(60):
    arr = [rng.randint(-9, 9) for _ in range(rng.randint(1, 12))]
    check(s.maxSubarraySumCircular(arr[:]), _brute(arr), f"隨機測資 {arr}")
