var e=`class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def build_graph(adj):
    """相鄰串列（節點值從 1 開始）-> 值為 1 的 Node；空圖回傳 None"""
    if not adj:
        return None
    nodes = [Node(i + 1) for i in range(len(adj))]
    for i, neighbors in enumerate(adj):
        nodes[i].neighbors = [nodes[j - 1] for j in neighbors]
    return nodes[0]


def collect(start, limit=1000):
    """從 start 出發走訪，回傳所有碰得到的 Node 物件（以物件身分去重）"""
    if start is None:
        return []
    seen = {id(start): start}
    stack = [start]
    while stack and len(seen) < limit:
        cur = stack.pop()
        for nei in cur.neighbors:
            if id(nei) not in seen:
                seen[id(nei)] = nei
                stack.append(nei)
    return list(seen.values())


def to_adj(nodes):
    """Node 物件們 -> 相鄰串列（每份鄰居清單排序過，因為順序不影響正確性）"""
    by_val = sorted(nodes, key=lambda x: x.val)
    return [sorted(nei.val for nei in x.neighbors) for x in by_val]


def run(adj, label):
    src = build_graph(adj)
    originals = collect(src)
    got = Solution().cloneGraph(src)
    if not adj:
        check(got, None, label)
        return
    check(isinstance(got, Node), True, f"{label}：要回傳 Node")
    check(got.val, 1, f"{label}：回傳的節點值")
    copies = collect(got)
    original_ids = {id(x) for x in originals}
    reused = sorted(x.val for x in copies if id(x) in original_ids)
    check(reused, [], f"{label}：複製圖裡不能出現原圖的節點物件")
    check(sorted(x.val for x in copies), list(range(1, len(adj) + 1)), f"{label}：每個節點恰好複製一次")
    want = [sorted(neighbors) for neighbors in adj]
    check(to_adj(copies), want, f"{label}：連線關係")
    check(to_adj(originals), want, f"{label}：原圖不能被改動")


run([[2, 4], [1, 3], [2, 4], [1, 3]], "範例 1：四個節點圍成一圈")
run([[]], "只有一個節點")
run([], "空圖")
run([[2], [1]], "兩個節點")
run([[2, 3], [1, 3, 4], [1, 2], [2, 5], [4]], "三角形加一條尾巴")
run([[2, 3, 4, 5], [1], [1], [1], [1]], "星狀圖")
run([[2, 3, 4], [1, 3, 4], [1, 2, 4], [1, 2, 3]], "完全圖 K4")
run([[2], [1, 3], [2, 4], [3, 5], [4, 6], [5]], "一條長鏈")
`;export{e as default};