def run(capacity, ops):
    """ops: ("put", key, value) 或 ("get", key)；回傳每個操作的輸出（put 為 None）"""
    cache = LRUCache(capacity)
    out = []
    for op in ops:
        if op[0] == "put":
            out.append(cache.put(op[1], op[2]))
        else:
            out.append(cache.get(op[1]))
    return out


check(
    run(2, [("put", 1, 1), ("put", 2, 2), ("get", 1), ("put", 3, 3), ("get", 2),
            ("put", 4, 4), ("get", 1), ("get", 3), ("get", 4)]),
    [None, None, 1, None, -1, None, -1, 3, 4],
    "經典範例",
)
check(run(1, [("get", 5)]), [-1], "空快取查不到")
check(
    run(1, [("put", 2, 1), ("get", 2), ("put", 3, 2), ("get", 2), ("get", 3)]),
    [None, 1, None, -1, 2],
    "容量 1：每次 put 新 key 都會淘汰舊的",
)
check(
    run(2, [("put", 1, 1), ("put", 2, 2), ("put", 1, 10), ("put", 3, 3), ("get", 2), ("get", 1), ("get", 3)]),
    [None, None, None, None, -1, 10, 3],
    "更新已存在的 key 也算使用，而且不佔新的容量",
)
check(
    run(2, [("put", 2, 1), ("put", 2, 2), ("get", 2), ("put", 1, 1), ("put", 4, 1), ("get", 2)]),
    [None, None, 2, None, None, -1],
    "重複 put 同一個 key 只算一筆",
)
check(
    run(2, [("put", 1, 1), ("put", 2, 2), ("get", 1), ("get", 1), ("put", 3, 3), ("get", 1), ("get", 2)]),
    [None, None, 1, 1, None, 1, -1],
    "get 會把 key 變成最近使用",
)
check(
    run(3, [("put", 1, 10), ("put", 2, 20), ("put", 3, 30), ("put", 1, 11), ("put", 4, 40),
            ("get", 2), ("get", 1), ("get", 3), ("get", 4)]),
    [None, None, None, None, None, -1, 11, 30, 40],
    "容量 3",
)
check(run(2, [("put", 0, 0), ("get", 0), ("put", 0, 5), ("get", 0)]), [None, 0, None, 5], "key 與 value 可以是 0")

# 和 OrderedDict 寫的參考實作比對一長串操作，同時確認速度（必須是 O(1)）
ops, ref, expected = [], OrderedDict(), []
state = 12345
for _ in range(20000):
    state = (state * 1103515245 + 12345) % (2 ** 31)
    key = state % 60
    if state % 3:
        value = state % 1000
        ops.append(("put", key, value))
        ref[key] = value
        ref.move_to_end(key)
        if len(ref) > 25:
            ref.popitem(last=False)
        expected.append(None)
    else:
        ops.append(("get", key))
        if key in ref:
            ref.move_to_end(key)
            expected.append(ref[key])
        else:
            expected.append(-1)
check(run(25, ops) == expected, True, "兩萬次隨機操作與參考實作一致")
