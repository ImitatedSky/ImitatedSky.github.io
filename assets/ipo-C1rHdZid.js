var e=`s = Solution()
check(s.findMaximizedCapital(2, 0, [1, 2, 3], [0, 1, 1]), 4, "範例 1")
check(s.findMaximizedCapital(3, 0, [1, 2, 3], [0, 1, 2]), 6, "範例 2")
check(s.findMaximizedCapital(3, 1, [2, 3, 5, 1, 8], [1, 2, 3, 0, 6]), 16, "逐步解鎖")
check(s.findMaximizedCapital(3, 0, [4, 2, 6], [0, 5, 9]), 4, "資金不夠，提前結束")
check(s.findMaximizedCapital(1, 0, [5, 6], [1, 2]), 0, "一個都做不起")
check(s.findMaximizedCapital(10, 0, [1, 2, 3], [0, 0, 0]), 6, "k 比專案數多")
check(s.findMaximizedCapital(1, 2, [1, 2, 3], [1, 1, 2]), 5, "只能做一個：挑最賺的")
check(s.findMaximizedCapital(2, 5, [0, 0], [0, 0]), 5, "利潤為 0")
check(s.findMaximizedCapital(2, 1, [3, 3, 1], [1, 1, 1]), 7, "利潤相同")
check(s.findMaximizedCapital(1, 100, [7], [100]), 107, "門檻剛好等於資金")

n = 50000
check(s.findMaximizedCapital(n, 0, [1] * n, list(range(n))), n, "大資料：每輪解鎖一個")
`;export{e as default};