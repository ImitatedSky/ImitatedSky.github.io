s = Solution()
check(
    s.fullJustify(["This", "is", "an", "example", "of", "text", "justification."], 16),
    ["This    is    an", "example  of text", "justification.  "],
    "平均分配，多的給左邊",
)
check(
    s.fullJustify(["What", "must", "be", "acknowledgment", "shall", "be"], 16),
    ["What   must   be", "acknowledgment  ", "shall be        "],
    "單一單字的行靠左",
)
check(
    s.fullJustify(
        ["Science", "is", "what", "we", "understand", "well", "enough", "to", "explain", "to",
         "a", "computer.", "Art", "is", "everything", "else", "we", "do"],
        20,
    ),
    ["Science  is  what we", "understand      well", "enough to explain to",
     "a  computer.  Art is", "everything  else  we", "do                  "],
    "較長的段落",
)
check(
    s.fullJustify(["the", "quick", "brown", "fox", "jumps", "over", "a", "lazy", "dog"], 16),
    ["the  quick brown", "fox jumps over a", "lazy dog        "],
    "剛好塞滿的一行",
)
check(
    s.fullJustify(["algorithm", "is", "fun", "to", "learn"], 10),
    ["algorithm ", "is  fun to", "learn     "],
    "第一行只有一個單字",
)
check(s.fullJustify(["a"], 3), ["a  "], "只有一個單字")
check(s.fullJustify(["abc"], 3), ["abc"], "單字剛好等於寬度")
check(s.fullJustify(["hi", "yo"], 5), ["hi yo"], "只有最後一行")
check(s.fullJustify(["a", "b", "c", "d"], 1), ["a", "b", "c", "d"], "寬度為 1")
check(s.fullJustify(["a", "b", "c"], 3), ["a b", "c  "], "最後一行補空白")
check(s.fullJustify(["ab", "cd", "ef", "g"], 9), ["ab  cd ef", "g        "], "空白除不盡")

out = s.fullJustify(["word"] * 300, 100)
check(all(len(row) == 100 for row in out), True, "大輸入：每行長度都等於 maxWidth")
check(" ".join(" ".join(out).split()), " ".join(["word"] * 300), "大輸入：單字順序不變")
