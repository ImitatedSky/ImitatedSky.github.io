s = Solution()


def inorder(root):
    out, stack, node = [], [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right
    return out


def balanced(root):
    """回傳是否高度平衡（每個節點左右子樹高度差 <= 1）"""
    def height(node):
        if not node:
            return 0
        lh, rh = height(node.left), height(node.right)
        if lh < 0 or rh < 0 or abs(lh - rh) > 1:
            return -1
        return 1 + max(lh, rh)
    return height(root) >= 0


def verify(nums, label):
    # 答案不唯一：只檢查「中序走訪 == 原陣列」（是 BST 且沒漏沒多）和「高度平衡」
    root = s.sortedArrayToBST(list(nums))
    check(inorder(root), list(nums), label + "：中序走訪要等於原陣列")
    check(balanced(root), True, label + "：要高度平衡")


verify([-10, -3, 0, 5, 9], "範例 1")
verify([1, 3], "兩個元素")
verify([7], "單一元素")
verify([1, 2, 3, 4, 5, 6, 7], "完美二元樹")
verify([-5, -4, -3, -2, -1, 0], "偶數個、含負數")
verify(list(range(0, 1000, 2)), "500 個元素")
