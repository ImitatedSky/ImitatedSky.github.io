/**
 * Technique tags — what a problem's solution *uses*, so similar problems can be
 * found across the study plan's categories (e.g. every two-pointer problem,
 * not only the ones filed under "Two Pointers").
 */

export interface Tag {
  id: string;
  name: string;
  nameZh: string;
}

/** Ordered roughly from basic to advanced; this is also the display order */
export const TAGS: Tag[] = [
  { id: "hash-map", name: "Hash Map", nameZh: "雜湊表" },
  { id: "counting", name: "Counting", nameZh: "計數" },
  { id: "two-pointers", name: "Two Pointers", nameZh: "雙指針" },
  { id: "fast-slow", name: "Fast & Slow Pointers", nameZh: "快慢指針" },
  { id: "sliding-window", name: "Sliding Window", nameZh: "滑動視窗" },
  { id: "prefix-sum", name: "Prefix Sum", nameZh: "前綴和" },
  { id: "in-place", name: "In-place", nameZh: "原地修改" },
  { id: "sorting", name: "Sorting", nameZh: "排序" },
  { id: "greedy", name: "Greedy", nameZh: "貪心" },
  { id: "string", name: "String", nameZh: "字串處理" },
  { id: "simulation", name: "Simulation", nameZh: "模擬" },
  { id: "matrix", name: "Matrix", nameZh: "矩陣" },
  { id: "interval", name: "Intervals", nameZh: "區間" },
  { id: "stack", name: "Stack", nameZh: "堆疊" },
  { id: "linked-list", name: "Linked List", nameZh: "鏈結串列" },
  { id: "binary-search", name: "Binary Search", nameZh: "二分搜尋" },
  { id: "dfs", name: "DFS / Recursion", nameZh: "DFS／遞迴" },
  { id: "bfs", name: "BFS", nameZh: "BFS" },
  { id: "bst", name: "Binary Search Tree", nameZh: "二元搜尋樹" },
  { id: "graph", name: "Graph", nameZh: "圖" },
  { id: "topological-sort", name: "Topological Sort", nameZh: "拓撲排序" },
  { id: "trie", name: "Trie", nameZh: "字典樹" },
  { id: "heap", name: "Heap", nameZh: "堆積" },
  { id: "backtracking", name: "Backtracking", nameZh: "回溯" },
  { id: "divide-conquer", name: "Divide & Conquer", nameZh: "分治" },
  { id: "dp", name: "Dynamic Programming", nameZh: "動態規劃" },
  { id: "bit", name: "Bit Manipulation", nameZh: "位元運算" },
  { id: "math", name: "Math", nameZh: "數學" },
  { id: "design", name: "Design", nameZh: "資料結構設計" },
];

export const TAG_BY_ID = new Map(TAGS.map((t) => [t.id, t]));

export function tagLabel(id: string, lang: "en" | "zh"): string {
  const t = TAG_BY_ID.get(id);
  if (!t) return id;
  return lang === "en" ? t.name : t.nameZh;
}

/** slug → technique tags, most characteristic first (assigned from each problem's reference solution) */
export const TAGS_BY_SLUG: Record<string, string[]> = {
  // Array / String
  "merge-sorted-array": ["two-pointers", "in-place"],
  "remove-element": ["two-pointers", "in-place"],
  "remove-duplicates-from-sorted-array": ["two-pointers", "in-place"],
  "remove-duplicates-from-sorted-array-ii": ["two-pointers", "in-place"],
  "majority-element": ["counting"],
  "rotate-array": ["in-place", "two-pointers"],
  "best-time-to-buy-and-sell-stock": ["greedy", "dp"],
  "best-time-to-buy-and-sell-stock-ii": ["greedy", "dp"],
  "jump-game": ["greedy"],
  "jump-game-ii": ["greedy"],
  "h-index": ["sorting", "counting"],
  "insert-delete-getrandom-o1": ["design", "hash-map"],
  "product-of-array-except-self": ["prefix-sum"],
  "gas-station": ["greedy", "prefix-sum"],
  candy: ["greedy"],
  "trapping-rain-water": ["two-pointers", "prefix-sum"],
  "roman-to-integer": ["hash-map", "string"],
  "integer-to-roman": ["greedy", "string"],
  "length-of-last-word": ["string"],
  "longest-common-prefix": ["string"],
  "reverse-words-in-a-string": ["string", "two-pointers"],
  "zigzag-conversion": ["string", "simulation"],
  "find-the-index-of-the-first-occurrence-in-a-string": ["string", "two-pointers"],
  "text-justification": ["string", "simulation", "greedy"],
  // Two Pointers
  "valid-palindrome": ["two-pointers", "string"],
  "is-subsequence": ["two-pointers", "greedy"],
  "two-sum-ii-input-array-is-sorted": ["two-pointers"],
  "container-with-most-water": ["two-pointers", "greedy"],
  "3sum": ["two-pointers", "sorting"],
  // Sliding Window
  "minimum-size-subarray-sum": ["sliding-window"],
  "longest-substring-without-repeating-characters": ["sliding-window", "hash-map"],
  "substring-with-concatenation-of-all-words": ["sliding-window", "hash-map", "string"],
  "minimum-window-substring": ["sliding-window", "hash-map", "counting"],
  // Matrix
  "valid-sudoku": ["matrix", "hash-map"],
  "spiral-matrix": ["matrix", "simulation"],
  "rotate-image": ["matrix", "in-place"],
  "set-matrix-zeroes": ["matrix", "in-place"],
  "game-of-life": ["matrix", "in-place", "simulation"],
  // Hashmap
  "ransom-note": ["hash-map", "counting"],
  "isomorphic-strings": ["hash-map", "string"],
  "word-pattern": ["hash-map", "string"],
  "valid-anagram": ["hash-map", "counting"],
  "group-anagrams": ["hash-map", "sorting", "string"],
  "two-sum": ["hash-map"],
  "happy-number": ["hash-map", "math"],
  "contains-duplicate-ii": ["hash-map", "sliding-window"],
  "longest-consecutive-sequence": ["hash-map"],
  // Intervals
  "summary-ranges": ["interval"],
  "merge-intervals": ["interval", "sorting"],
  "insert-interval": ["interval"],
  "minimum-number-of-arrows-to-burst-balloons": ["interval", "sorting", "greedy"],
  // Stack
  "valid-parentheses": ["stack", "string"],
  "simplify-path": ["stack", "string"],
  "min-stack": ["stack", "design"],
  "evaluate-reverse-polish-notation": ["stack", "math"],
  "basic-calculator": ["stack", "math", "string"],
  // Linked List
  "linked-list-cycle": ["linked-list", "fast-slow"],
  "add-two-numbers": ["linked-list", "math"],
  "merge-two-sorted-lists": ["linked-list", "two-pointers"],
  "copy-list-with-random-pointer": ["linked-list", "hash-map"],
  "reverse-linked-list-ii": ["linked-list"],
  "reverse-nodes-in-k-group": ["linked-list"],
  "remove-nth-node-from-end-of-list": ["linked-list", "fast-slow"],
  "remove-duplicates-from-sorted-list-ii": ["linked-list"],
  "rotate-list": ["linked-list"],
  "partition-list": ["linked-list", "two-pointers"],
  "lru-cache": ["design", "linked-list", "hash-map"],
  // Binary Tree General
  "maximum-depth-of-binary-tree": ["dfs"],
  "same-tree": ["dfs"],
  "invert-binary-tree": ["dfs"],
  "symmetric-tree": ["dfs"],
  "construct-binary-tree-from-preorder-and-inorder-traversal": ["divide-conquer", "hash-map"],
  "construct-binary-tree-from-inorder-and-postorder-traversal": ["divide-conquer", "hash-map"],
  "populating-next-right-pointers-in-each-node-ii": ["bfs", "linked-list"],
  "flatten-binary-tree-to-linked-list": ["linked-list", "in-place"],
  "path-sum": ["dfs"],
  "sum-root-to-leaf-numbers": ["dfs"],
  "binary-tree-maximum-path-sum": ["dfs", "dp"],
  "binary-search-tree-iterator": ["bst", "stack", "design"],
  "count-complete-tree-nodes": ["dfs", "divide-conquer"],
  "lowest-common-ancestor-of-a-binary-tree": ["dfs"],
  // Binary Tree BFS
  "binary-tree-right-side-view": ["bfs"],
  "average-of-levels-in-binary-tree": ["bfs"],
  "binary-tree-level-order-traversal": ["bfs"],
  "binary-tree-zigzag-level-order-traversal": ["bfs"],
  // Binary Search Tree
  "minimum-absolute-difference-in-bst": ["bst", "dfs"],
  "kth-smallest-element-in-a-bst": ["bst", "stack"],
  "validate-binary-search-tree": ["bst", "dfs"],
  // Graph General
  "number-of-islands": ["graph", "dfs", "matrix"],
  "surrounded-regions": ["graph", "dfs", "matrix"],
  "clone-graph": ["graph", "bfs", "hash-map"],
  "evaluate-division": ["graph", "bfs"],
  "course-schedule": ["topological-sort", "graph", "dfs"],
  "course-schedule-ii": ["topological-sort", "graph", "bfs"],
  // Graph BFS
  "snakes-and-ladders": ["bfs", "matrix"],
  "minimum-genetic-mutation": ["bfs", "string"],
  "word-ladder": ["bfs", "string"],
  // Trie
  "implement-trie-prefix-tree": ["trie", "design"],
  "design-add-and-search-words-data-structure": ["trie", "design", "dfs"],
  "word-search-ii": ["trie", "backtracking", "matrix"],
  // Backtracking
  "letter-combinations-of-a-phone-number": ["backtracking", "string"],
  combinations: ["backtracking"],
  permutations: ["backtracking"],
  "combination-sum": ["backtracking"],
  "n-queens-ii": ["backtracking"],
  "generate-parentheses": ["backtracking", "string"],
  "word-search": ["backtracking", "matrix"],
  // Divide & Conquer
  "convert-sorted-array-to-binary-search-tree": ["divide-conquer", "bst"],
  "sort-list": ["divide-conquer", "linked-list", "sorting", "fast-slow"],
  "construct-quad-tree": ["divide-conquer", "matrix"],
  "merge-k-sorted-lists": ["heap", "linked-list"],
  // Kadane's Algorithm
  "maximum-subarray": ["dp", "greedy"],
  "maximum-sum-circular-subarray": ["dp", "greedy"],
  // Binary Search
  "search-insert-position": ["binary-search"],
  "search-a-2d-matrix": ["binary-search", "matrix"],
  "find-peak-element": ["binary-search"],
  "search-in-rotated-sorted-array": ["binary-search"],
  "find-first-and-last-position-of-element-in-sorted-array": ["binary-search"],
  "find-minimum-in-rotated-sorted-array": ["binary-search"],
  "median-of-two-sorted-arrays": ["binary-search", "divide-conquer"],
  // Heap
  "kth-largest-element-in-an-array": ["heap", "sorting"],
  ipo: ["heap", "greedy", "sorting"],
  "find-k-pairs-with-smallest-sums": ["heap"],
  "find-median-from-data-stream": ["heap", "design"],
  // Bit Manipulation
  "add-binary": ["bit", "math", "string"],
  "reverse-bits": ["bit"],
  "number-of-1-bits": ["bit"],
  "single-number": ["bit"],
  "single-number-ii": ["bit", "counting"],
  "bitwise-and-of-numbers-range": ["bit"],
  // Math
  "palindrome-number": ["math"],
  "plus-one": ["math"],
  "factorial-trailing-zeroes": ["math"],
  sqrtx: ["binary-search", "math"],
  "powx-n": ["math", "divide-conquer"],
  "max-points-on-a-line": ["math", "hash-map"],
  // 1D DP
  "climbing-stairs": ["dp"],
  "house-robber": ["dp"],
  "word-break": ["dp", "string"],
  "coin-change": ["dp"],
  "longest-increasing-subsequence": ["dp", "binary-search"],
  // Multidimensional DP
  triangle: ["dp"],
  "minimum-path-sum": ["dp", "matrix"],
  "unique-paths-ii": ["dp", "matrix"],
  "longest-palindromic-substring": ["two-pointers", "string"],
  "interleaving-string": ["dp", "string"],
  "edit-distance": ["dp", "string"],
  "best-time-to-buy-and-sell-stock-iii": ["dp"],
  "best-time-to-buy-and-sell-stock-iv": ["dp"],
  "maximal-square": ["dp", "matrix"],
};
