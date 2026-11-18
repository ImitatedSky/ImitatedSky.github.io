s = Solution()


def run(lists):
    return list_vals(s.mergeKLists([build_list(vals) for vals in lists]), limit=100000)


check(run([[1, 4, 5], [1, 3, 4], [2, 6]]), [1, 1, 2, 3, 4, 4, 5, 6], "範例 1")
check(run([]), [], "沒有任何串列")
check(run([[]]), [], "只有一條空串列")
check(run([[], []]), [], "全部都是空串列")
check(run([[5], [], [1, 3, 9], [2]]), [1, 2, 3, 5, 9], "夾雜空串列")
check(run([[1, 2, 3]]), [1, 2, 3], "只有一條")
check(run([[2, 2], [2], [2, 2, 2]]), [2, 2, 2, 2, 2, 2], "全部值相同（不能比較節點）")
check(run([[-3, -1, 4], [-2, 0], [-5, 7]]), [-5, -3, -2, -1, 0, 4, 7], "含負數")

rng = random.Random(23)
many = [sorted(rng.randint(-1000, 1000) for _ in range(rng.randint(0, 40))) for _ in range(200)]
check(run(many), sorted(v for vals in many for v in vals), "200 條隨機串列")
