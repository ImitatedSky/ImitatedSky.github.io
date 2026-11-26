var e=`s = Solution()


def is_peak(nums, i):
    # 題目允許回傳任意一個峰值，所以檢查「回傳的位置是不是峰」
    if not isinstance(i, int) or not 0 <= i < len(nums):
        return False
    left = nums[i - 1] if i > 0 else -inf
    right = nums[i + 1] if i < len(nums) - 1 else -inf
    return left < nums[i] > right


for nums, label in [
    ([1, 2, 3, 1], "範例 1"),
    ([1, 2, 1, 3, 5, 6, 4], "範例 2：有兩個峰"),
    ([1], "單一元素"),
    ([1, 2], "兩個元素，峰在右"),
    ([2, 1], "兩個元素，峰在左"),
    ([1, 2, 3, 4, 5], "一路上坡"),
    ([6, 5, 4, 3, 2], "一路下坡"),
    ([-3, -1, -2, -5], "負數"),
    ([2, 4, 7, 9, 8, 6, 5, 3, 1], "山形"),
    ([5, 1, 4, 2, 6, 3, 7], "鋸齒狀"),
]:
    check(is_peak(nums, s.findPeakElement(list(nums))), True, label)

big = list(range(1000))
check(s.findPeakElement(big), 999, "長陣列：唯一的峰在最右端")
`;export{e as default};