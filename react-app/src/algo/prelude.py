from __future__ import annotations
import bisect, collections, functools, heapq, itertools, math, random, string
from bisect import bisect_left, bisect_right
from collections import Counter, OrderedDict, defaultdict, deque
from functools import cache, lru_cache, reduce
from heapq import heapify, heappop, heappush, heappushpop, heapreplace, nlargest, nsmallest
from itertools import accumulate, combinations, pairwise, permutations, product
from math import ceil, comb, floor, gcd, inf, isqrt, log2, sqrt
from typing import Any, Deque, Dict, List, Optional, Set, Tuple


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_list(vals):
    """[1, 2, 3] -> ListNode chain"""
    dummy = cur = ListNode()
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next


def list_vals(node, limit=10000):
    """ListNode chain -> [1, 2, 3]"""
    out = []
    while node and len(out) < limit:
        out.append(node.val)
        node = node.next
    return out


def build_tree(level):
    """LeetCode level-order list ([3, 9, 20, None, None, 15, 7]) -> TreeNode"""
    if not level or level[0] is None:
        return None
    root = TreeNode(level[0])
    q = deque([root])
    i = 1
    while q and i < len(level):
        node = q.popleft()
        if i < len(level) and level[i] is not None:
            node.left = TreeNode(level[i])
            q.append(node.left)
        i += 1
        if i < len(level) and level[i] is not None:
            node.right = TreeNode(level[i])
            q.append(node.right)
        i += 1
    return root


def tree_vals(root):
    """TreeNode -> LeetCode level-order list (trailing None trimmed)"""
    out, q = [], deque([root])
    while q:
        node = q.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


_checks = 0


def check(got, expected, label=""):
    """Assert got == expected with a readable message; counts passed checks."""
    global _checks
    if got != expected:
        raise AssertionError(f"{label + ': ' if label else ''}預期 {expected!r}，實際得到 {got!r}")
    _checks += 1
