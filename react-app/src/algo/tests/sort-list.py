s = Solution()


def run(vals):
    return list_vals(s.sortList(build_list(vals)), limit=100000)


check(run([4, 2, 1, 3]), [1, 2, 3, 4], "範例 1")
check(run([-1, 5, 3, 4, 0]), [-1, 0, 3, 4, 5], "範例 2")
check(run([]), [], "空串列")
check(run([1]), [1], "單一節點")
check(run([2, 1]), [1, 2], "兩個節點")
check(run([3, 3, 1, 2, 1, 3]), [1, 1, 2, 3, 3, 3], "有重複值")
check(run([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5], "本來就排好")
check(run([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5], "完全反序")

rng = random.Random(148)
big = [rng.randint(-100000, 100000) for _ in range(5000)]
check(run(big), sorted(big), "5000 個隨機節點")
