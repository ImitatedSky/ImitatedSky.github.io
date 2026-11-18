def run(ops, args):
    """照 LeetCode 的方式依序執行操作，回傳每一步的回傳值"""
    obj, out = None, []
    for op, arg in zip(ops, args):
        if op == "Trie":
            obj = Trie()
            out.append(None)
        else:
            out.append(getattr(obj, op)(*arg))
    return out


check(
    run(
        ["Trie", "insert", "search", "search", "startsWith", "insert", "search"],
        [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]],
    ),
    [None, None, True, False, True, None, True],
    "範例 1",
)
check(
    run(
        ["Trie", "insert", "insert", "insert", "search", "startsWith", "search", "search"],
        [[], ["car"], ["cat"], ["dog"], ["ca"], ["ca"], ["cow"], ["dog"]],
    ),
    [None, None, None, None, False, True, False, True],
    "分岔的單字",
)
check(
    run(["Trie", "search", "startsWith", "insert", "search"], [[], ["a"], ["a"], ["a"], ["a"]]),
    [None, False, False, None, True],
    "空的 trie",
)

t = Trie()
t.insert("apple")
check(t.search("apples"), False, "比已存單字更長")
check(t.startsWith("apples"), False, "前綴比已存單字更長")
check(t.startsWith("apple"), True, "完整單字也算是自己的前綴")
check(t.search("b"), False, "第一個字母就不存在")
t.insert("apple")
check(t.search("apple"), True, "重複插入")
t.insert("a")
check([t.search("a"), t.search("ap"), t.search("apple")], [True, False, True], "插入既有單字的前綴")

a, b = Trie(), Trie()
a.insert("hello")
check(b.search("hello"), False, "兩個 Trie 物件互不影響")

long = "ab" * 1000
t.insert(long)
check([t.search(long), t.search(long[:-1]), t.startsWith(long[:-1])], [True, False, True], "長度 2000 的單字")
