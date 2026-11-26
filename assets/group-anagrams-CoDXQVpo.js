var e=`def norm(groups):
    """組內、組間的順序都不限，排序後再比較"""
    return sorted(sorted(g) for g in groups)


s = Solution()
check(
    norm(s.groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])),
    [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]],
    "範例 1",
)
check(norm(s.groupAnagrams([""])), [[""]], "只有一個空字串")
check(norm(s.groupAnagrams(["a"])), [["a"]], "單一字串")
check(norm(s.groupAnagrams(["", "b", ""])), [["", ""], ["b"]], "多個空字串同組")
check(norm(s.groupAnagrams(["aab", "aba", "abb", "baa"])), [["aab", "aba", "baa"], ["abb"]], "字母相同但數量不同要分開")
check(norm(s.groupAnagrams(["abc", "def", "ghi"])), [["abc"], ["def"], ["ghi"]], "每個自成一組")
check(norm(s.groupAnagrams(["ab", "ba", "ab"])), [["ab", "ab", "ba"]], "重複的字串都要保留")
check(norm(s.groupAnagrams(["cab", "a", "abc", "a"])), [["a", "a"], ["abc", "cab"]], "不同長度")
big = ["abcde"[i % 5 :] + "abcde"[: i % 5] for i in range(2000)] + ["zzzzz"]
check([len(g) for g in norm(s.groupAnagrams(big))], [2000, 1], "大量輸入")
`;export{e as default};