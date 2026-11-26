var e=`class Node:
    def __init__(self, val: int = 0, left: 'Node' = None, right: 'Node' = None, next: 'Node' = None):
        self.val = val
        self.left = left
        self.right = right
        self.next = next


def build_nodes(level):
    """LeetCode level-order list -> Node tree（next 全部是 None）"""
    if not level or level[0] is None:
        return None
    root = Node(level[0])
    q = deque([root])
    i = 1
    while q and i < len(level):
        node = q.popleft()
        if i < len(level) and level[i] is not None:
            node.left = Node(level[i])
            q.append(node.left)
        i += 1
        if i < len(level) and level[i] is not None:
            node.right = Node(level[i])
            q.append(node.right)
        i += 1
    return root


def by_next(root):
    """每一層從最左邊的節點出發，沿著 next 走，收集走到的值"""
    out = []
    row = [root] if root else []
    while row:
        vals, node = [], row[0]
        while node is not None and len(vals) <= len(row):
            vals.append(node.val)
            node = node.next
        out.append(vals)
        row = [c for n in row for c in (n.left, n.right) if c]
    return out


def exact(root):
    """每個節點的 next 是否「正好是」同一層右邊那個節點物件（最右邊的是 None）"""
    row = [root] if root else []
    while row:
        for a, b in zip(row, row[1:] + [None]):
            if a.next is not b:
                return False
        row = [c for n in row for c in (n.left, n.right) if c]
    return True


def run(level):
    root = build_nodes(level)
    out = Solution().connect(root)
    if out is not root:
        return "connect() 應該回傳原本的 root"
    if not exact(root):
        return ("next 接錯了", by_next(root))
    return by_next(root)


check(run([1, 2, 3, 4, 5, None, 7]), [[1], [2, 3], [4, 5, 7]], "範例 1")
check(run([]), [], "空樹")
check(run([1]), [[1]], "單一節點")
check(run([1, 2, 3, 4, 5, 6, 7]), [[1], [2, 3], [4, 5, 6, 7]], "完美二元樹")
check(run([1, 2, 3, 4, None, None, 5]), [[1], [2, 3], [4, 5]], "中間有缺口")
check(run([1, 2, 3, 4, None, None, 5, 6, None, None, 7]), [[1], [2, 3], [4, 5], [6, 7]], "連續兩層都有缺口")
check(run([1, 2, None, 3, None, 4]), [[1], [2], [3], [4]], "左斜樹")
check(run([1, None, 2, None, 3]), [[1], [2], [3]], "右斜樹")
check(
    run([1, 2, 3, 4, 5, 6, 7, 8, None, None, None, None, None, None, 9]),
    [[1], [2, 3], [4, 5, 6, 7], [8, 9]],
    "要跨過好幾個沒有小孩的節點",
)
check(run([1, 2, 3, None, None, 4, 5]), [[1], [2, 3], [4, 5]], "左子樹比較淺")
check(run([7, 7, 7, 7, None, 7, 7]), [[7], [7, 7], [7, 7, 7]], "值全部相同")
`;export{e as default};