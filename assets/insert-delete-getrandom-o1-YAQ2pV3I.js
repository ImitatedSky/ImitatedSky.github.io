var e=`rs = RandomizedSet()
check(rs.insert(1), True, "insert(1) 新元素")
check(rs.remove(2), False, "remove(2) 不存在")
check(rs.insert(2), True, "insert(2) 新元素")
check(rs.getRandom() in (1, 2), True, "getRandom 要回傳集合裡的元素")
check(rs.remove(1), True, "remove(1) 存在")
check(rs.insert(2), False, "insert(2) 已存在")
check(rs.getRandom(), 2, "只剩一個元素時 getRandom 只能是它")

# 刪到空之後再插入
rs = RandomizedSet()
check(rs.insert(4), True, "insert(4)")
check(rs.remove(4), True, "remove(4) 刪掉唯一的元素")
check(rs.remove(4), False, "remove(4) 已經不在了")
check(rs.insert(4), True, "刪掉之後可以再插入")
check(rs.getRandom(), 4, "重新插入後 getRandom")

# 刪中間、刪尾端、刪開頭，其他元素都要還在
rs = RandomizedSet()
for v in [5, 8, 3, 9, -1, 0]:
    check(rs.insert(v), True, f"insert({v})")
check(rs.remove(8), True, "刪中間的元素")
check(rs.remove(0), True, "刪最後插入的元素")
check(rs.remove(5), True, "刪最早插入的元素")
check(rs.remove(8), False, "重複刪除")
check(rs.insert(8), True, "被刪掉的可以再插入")
alive = {3, 9, -1, 8}
seen = {rs.getRandom() for _ in range(400)}
check(seen <= alive, True, "getRandom 不能回傳已刪除或不存在的元素")
check(seen, alive, "getRandom 抽很多次後，每個元素都應該出現過")
for v in sorted(alive):
    check(rs.insert(v), False, f"insert({v}) 已存在")
for v in sorted(alive):
    check(rs.remove(v), True, f"remove({v})")
check(rs.insert(7), True, "清空後再插入")
check(rs.getRandom(), 7, "清空後 getRandom")

# 大量操作後仍然一致
rs = RandomizedSet()
check(all(rs.insert(v) for v in range(2000)), True, "插入 2000 個")
check(all(rs.remove(v) for v in range(0, 2000, 2)), True, "刪掉所有偶數")
check(any(rs.remove(v) for v in range(0, 2000, 2)), False, "偶數都不在了")
check(all(rs.getRandom() % 2 == 1 for _ in range(200)), True, "getRandom 只會抽到奇數")
`;export{e as default};