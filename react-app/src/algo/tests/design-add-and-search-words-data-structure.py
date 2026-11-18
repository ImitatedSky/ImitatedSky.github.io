def run(ops, args):
    """照 LeetCode 的方式依序執行操作，回傳每一步的回傳值"""
    obj, out = None, []
    for op, arg in zip(ops, args):
        if op == "WordDictionary":
            obj = WordDictionary()
            out.append(None)
        else:
            out.append(getattr(obj, op)(*arg))
    return out


check(
    run(
        ["WordDictionary", "addWord", "addWord", "addWord", "search", "search", "search", "search"],
        [[], ["bad"], ["dad"], ["mad"], ["pad"], ["bad"], [".ad"], ["b.."]],
    ),
    [None, None, None, None, False, True, True, True],
    "範例 1",
)
check(
    run(
        ["WordDictionary", "addWord", "addWord", "addWord", "search", "search", "search", "search"],
        [[], ["bat"], ["cab"], ["can"], ["..n"], [".a"], ["ca."], ["bat."]],
    ),
    [None, None, None, None, True, False, True, False],
    "需要回溯的萬用字元",
)
check(
    run(
        ["WordDictionary", "search", "addWord", "search", "search", "search"],
        [[], ["."], ["a"], ["."], [".."], ["a"]],
    ),
    [None, False, None, True, False, True],
    "空字典與單一字母",
)

d = WordDictionary()
for w in ["at", "and", "an", "add"]:
    d.addWord(w)
check(d.search("a"), False, "只是前綴，不是完整單字")
check(d.search(".at"), False, "查詢比單字長")
d.addWord("bat")
check(d.search(".at"), True, "加入後找得到")
check([d.search("an."), d.search("a.d."), d.search("b."), d.search("a.d")], [True, False, False, True], "萬用字元在尾端與中間")
check([d.search("..."), d.search(".."), d.search("....")], [True, True, False], "全部都是萬用字元")
check(d.search("xyz"), False, "完全不存在的單字")

a, b = WordDictionary(), WordDictionary()
a.addWord("hello")
check(b.search("hello"), False, "兩個物件互不影響")

big = WordDictionary()
for i in range(26):
    for j in range(26):
        big.addWord(chr(97 + i) + chr(97 + j) + "q")
check([big.search("..q"), big.search("..z"), big.search("z.q"), big.search(".z.")], [True, False, True, True], "大量分支")
