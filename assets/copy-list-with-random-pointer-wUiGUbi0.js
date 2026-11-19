var e=`class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random


def build(pairs):
    """[[val, random_index], ...] -> (head, 所有節點)"""
    nodes = [Node(v) for v, _ in pairs]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    for node, (_, r) in zip(nodes, pairs):
        node.random = nodes[r] if r is not None else None
    return (nodes[0] if nodes else None), nodes


def walk(head, limit=5000):
    out = []
    while head and len(out) < limit:
        out.append(head)
        head = head.next
    return out


def serialize(head):
    """串列 -> [[val, random_index], ...]；random 指到串列外的節點時記為 'outside'"""
    nodes = walk(head)
    index = {id(n): i for i, n in enumerate(nodes)}
    return [[n.val, None if n.random is None else index.get(id(n.random), "outside")] for n in nodes]


def run(pairs, label):
    pairs = [list(p) for p in pairs]
    head, originals = build(pairs)
    copied = Solution().copyRandomList(head)
    check(serialize(copied), pairs, f"{label}：複本的值與 random 結構")
    old_ids = {id(n) for n in originals}
    check(any(id(n) in old_ids for n in walk(copied)), False, f"{label}：複本不能重用原本的節點")
    check(serialize(head), pairs, f"{label}：原串列必須保持原樣")


run([[7, None], [13, 0], [11, 4], [10, 2], [1, 0]], "範例 1")
run([[1, 1], [2, 1]], "範例 2")
run([[3, None], [3, 0], [3, None]], "值都相同")
run([[5, 0]], "單一節點 random 指向自己")
run([[5, None]], "單一節點沒有 random")
run([[1, 3], [2, 2], [3, 0], [4, None]], "random 往前也往後指")
run([[i, (i * 7 + 3) % 50] for i in range(50)], "50 個節點")
check(Solution().copyRandomList(None), None, "空串列")
`;export{e as default};