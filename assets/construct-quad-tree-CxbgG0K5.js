var e=`class Node:
    def __init__(self, val=False, isLeaf=False, topLeft=None, topRight=None, bottomLeft=None, bottomRight=None):
        self.val = val
        self.isLeaf = isLeaf
        self.topLeft = topLeft
        self.topRight = topRight
        self.bottomLeft = bottomLeft
        self.bottomRight = bottomRight


s = Solution()


def shape(node):
    """葉子 -> 0 / 1；內部節點 -> [左上, 右上, 左下, 右下]（內部節點的 val 不檢查）"""
    if node.isLeaf:
        return 1 if node.val else 0
    return [shape(node.topLeft), shape(node.topRight), shape(node.bottomLeft), shape(node.bottomRight)]


def expected_shape(grid, r, c, size):
    """對照用：直接掃描整塊區域是否同值"""
    first = grid[r][c]
    if all(grid[i][j] == first for i in range(r, r + size) for j in range(c, c + size)):
        return first
    h = size // 2
    return [expected_shape(grid, r, c, h), expected_shape(grid, r, c + h, h),
            expected_shape(grid, r + h, c, h), expected_shape(grid, r + h, c + h, h)]


check(shape(s.construct([[0, 1], [1, 0]])), [0, 1, 1, 0], "範例 1")
check(shape(s.construct([[1]])), 1, "1 x 1 的 1")
check(shape(s.construct([[0]])), 0, "1 x 1 的 0")
check(shape(s.construct([[1, 1], [1, 1]])), 1, "全部相同要合併成一個葉子")
check(shape(s.construct([[0] * 4 for _ in range(4)])), 0, "4 x 4 全 0 要一路合併到根")
check(
    shape(s.construct([[1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 1, 1], [0, 1, 1, 1]])),
    [1, 0, [1, 0, 0, 1], 1],
    "4 x 4 混合",
)
g8 = [
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
]
check(shape(s.construct(g8)), [1, [0, 0, 1, 1], 1, 0], "範例 2（8 x 8）")

leaf = s.construct([[1, 1], [1, 1]])
check(bool(leaf.isLeaf) and leaf.topLeft is None and leaf.bottomRight is None, True, "葉子沒有小孩")

rng = random.Random(427)
g16 = [[1 if rng.random() < 0.8 else 0 for _ in range(16)] for _ in range(16)]
for i in range(8):
    for j in range(8):
        g16[i][j] = 1
check(shape(s.construct(g16)), expected_shape(g16, 0, 0, 16), "16 x 16 隨機")
`;export{e as default};