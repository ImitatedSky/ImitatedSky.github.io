def build_cycle(vals, pos):
    """建出串列，並把尾巴接回第 pos 個節點（-1 = 不接）"""
    nodes = [ListNode(v) for v in vals]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if nodes and pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0] if nodes else None


s = Solution()
check(s.hasCycle(build_cycle([3, 2, 0, -4], 1)), True, "範例 1：尾巴接回索引 1")
check(s.hasCycle(build_cycle([1, 2], 0)), True, "範例 2：兩個節點互相繞")
check(s.hasCycle(build_cycle([1], -1)), False, "單一節點、沒有環")
check(s.hasCycle(build_cycle([], -1)), False, "空串列")
check(s.hasCycle(build_cycle([1], 0)), True, "單一節點指向自己")
check(s.hasCycle(build_cycle([1, 2, 3, 4, 5], -1)), False, "沒有環的長串列")
check(s.hasCycle(build_cycle([1, 2, 3, 4, 5, 6, 7], 3)), True, "環在後半段")
check(s.hasCycle(build_cycle([1, 1, 1, 1], -1)), False, "值重複但沒有環")
check(s.hasCycle(build_cycle(list(range(1000)), 999)), True, "很長的串列，尾巴自己繞自己")
check(s.hasCycle(build_cycle(list(range(1000)), -1)), False, "很長的串列，沒有環")
