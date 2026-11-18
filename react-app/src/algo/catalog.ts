/**
 * LeetCode Top Interview 150 — problem metadata only (no React, no problem
 * bodies), so list pages and build scripts can import it cheaply.
 * Order follows the official study plan.
 */
import type { Difficulty } from "./types";

export interface Category {
  id: string;
  name: string;
  nameZh: string;
  /** Hue (0–360) used for this category's accent colour */
  hue: number;
  blurb: string;
}

export interface ProblemMeta {
  id: number;
  slug: string;
  title: string;
  titleZh: string;
  difficulty: Difficulty;
  category: string;
}

export const CATEGORIES: Category[] = [
  { id: "array-string", name: "Array / String", nameZh: "陣列 / 字串", hue: 262, blurb: "原地修改、貪心、前綴與後綴 —— 一切的基本功" },
  { id: "two-pointers", name: "Two Pointers", nameZh: "雙指針", hue: 199, blurb: "兩個指標對向或同向移動，把 O(n²) 壓成 O(n)" },
  { id: "sliding-window", name: "Sliding Window", nameZh: "滑動視窗", hue: 174, blurb: "維護一段連續區間，右擴左縮" },
  { id: "matrix", name: "Matrix", nameZh: "矩陣", hue: 150, blurb: "二維座標的走訪、旋轉與原地標記" },
  { id: "hashmap", name: "Hashmap", nameZh: "雜湊表", hue: 38, blurb: "用空間換時間，O(1) 查找" },
  { id: "intervals", name: "Intervals", nameZh: "區間", hue: 18, blurb: "先排序，再合併或掃描" },
  { id: "stack", name: "Stack", nameZh: "堆疊", hue: 340, blurb: "後進先出：括號、運算式、路徑" },
  { id: "linked-list", name: "Linked List", nameZh: "鏈結串列", hue: 290, blurb: "指標重接的藝術，dummy node 是好朋友" },
  { id: "binary-tree", name: "Binary Tree General", nameZh: "二元樹", hue: 140, blurb: "遞迴思維：把問題交給左右子樹" },
  { id: "binary-tree-bfs", name: "Binary Tree BFS", nameZh: "二元樹 BFS", hue: 160, blurb: "用佇列一層一層走" },
  { id: "bst", name: "Binary Search Tree", nameZh: "二元搜尋樹", hue: 120, blurb: "中序走訪即為遞增序列" },
  { id: "graph", name: "Graph General", nameZh: "圖", hue: 210, blurb: "DFS / BFS、拓撲排序、連通分量" },
  { id: "graph-bfs", name: "Graph BFS", nameZh: "圖 BFS", hue: 225, blurb: "無權圖最短路徑就是 BFS 的層數" },
  { id: "trie", name: "Trie", nameZh: "字典樹", hue: 80, blurb: "共用前綴的樹，字串查找利器" },
  { id: "backtracking", name: "Backtracking", nameZh: "回溯", hue: 0, blurb: "做選擇 → 遞迴 → 撤銷選擇" },
  { id: "divide-conquer", name: "Divide & Conquer", nameZh: "分治", hue: 250, blurb: "切一半、各自解、再合併" },
  { id: "kadane", name: "Kadane's Algorithm", nameZh: "Kadane 演算法", hue: 28, blurb: "最大子陣列和的一次掃描解" },
  { id: "binary-search", name: "Binary Search", nameZh: "二分搜尋", hue: 190, blurb: "每次砍掉一半的搜尋空間" },
  { id: "heap", name: "Heap", nameZh: "堆積", hue: 320, blurb: "隨時拿到最大 / 最小值" },
  { id: "bit", name: "Bit Manipulation", nameZh: "位元運算", hue: 60, blurb: "XOR、位移與遮罩的小技巧" },
  { id: "math", name: "Math", nameZh: "數學", hue: 46, blurb: "進位、質因數、快速冪" },
  { id: "dp-1d", name: "1D DP", nameZh: "一維動態規劃", hue: 275, blurb: "定義狀態、寫出轉移、填表" },
  { id: "dp-multi", name: "Multidimensional DP", nameZh: "多維動態規劃", hue: 305, blurb: "二維表格上的狀態轉移" },
];

type Row = [number, string, string, string, "E" | "M" | "H"];

const D = { E: "Easy", M: "Medium", H: "Hard" } as const;

const RAW: Record<string, Row[]> = {
  "array-string": [
    [88, "merge-sorted-array", "Merge Sorted Array", "合併兩個有序陣列", "E"],
    [27, "remove-element", "Remove Element", "移除元素", "E"],
    [26, "remove-duplicates-from-sorted-array", "Remove Duplicates from Sorted Array", "刪除有序陣列中的重複項", "E"],
    [80, "remove-duplicates-from-sorted-array-ii", "Remove Duplicates from Sorted Array II", "刪除有序陣列中的重複項 II", "M"],
    [169, "majority-element", "Majority Element", "多數元素", "E"],
    [189, "rotate-array", "Rotate Array", "輪轉陣列", "M"],
    [121, "best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "買賣股票的最佳時機", "E"],
    [122, "best-time-to-buy-and-sell-stock-ii", "Best Time to Buy and Sell Stock II", "買賣股票的最佳時機 II", "M"],
    [55, "jump-game", "Jump Game", "跳躍遊戲", "M"],
    [45, "jump-game-ii", "Jump Game II", "跳躍遊戲 II", "M"],
    [274, "h-index", "H-Index", "H 指數", "M"],
    [380, "insert-delete-getrandom-o1", "Insert Delete GetRandom O(1)", "O(1) 時間插入、刪除和取得隨機元素", "M"],
    [238, "product-of-array-except-self", "Product of Array Except Self", "除自身以外陣列的乘積", "M"],
    [134, "gas-station", "Gas Station", "加油站", "M"],
    [135, "candy", "Candy", "分發糖果", "H"],
    [42, "trapping-rain-water", "Trapping Rain Water", "接雨水", "H"],
    [13, "roman-to-integer", "Roman to Integer", "羅馬數字轉整數", "E"],
    [12, "integer-to-roman", "Integer to Roman", "整數轉羅馬數字", "M"],
    [58, "length-of-last-word", "Length of Last Word", "最後一個單字的長度", "E"],
    [14, "longest-common-prefix", "Longest Common Prefix", "最長共同前綴", "E"],
    [151, "reverse-words-in-a-string", "Reverse Words in a String", "反轉字串中的單字", "M"],
    [6, "zigzag-conversion", "Zigzag Conversion", "Z 字形變換", "M"],
    [28, "find-the-index-of-the-first-occurrence-in-a-string", "Find the Index of the First Occurrence in a String", "找出字串中第一個匹配項的索引", "E"],
    [68, "text-justification", "Text Justification", "文字左右對齊", "H"],
  ],
  "two-pointers": [
    [125, "valid-palindrome", "Valid Palindrome", "驗證回文串", "E"],
    [392, "is-subsequence", "Is Subsequence", "判斷子序列", "E"],
    [167, "two-sum-ii-input-array-is-sorted", "Two Sum II - Input Array Is Sorted", "兩數之和 II - 輸入有序陣列", "M"],
    [11, "container-with-most-water", "Container With Most Water", "盛最多水的容器", "M"],
    [15, "3sum", "3Sum", "三數之和", "M"],
  ],
  "sliding-window": [
    [209, "minimum-size-subarray-sum", "Minimum Size Subarray Sum", "長度最小的子陣列", "M"],
    [3, "longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "無重複字元的最長子字串", "M"],
    [30, "substring-with-concatenation-of-all-words", "Substring with Concatenation of All Words", "串聯所有單字的子字串", "H"],
    [76, "minimum-window-substring", "Minimum Window Substring", "最小覆蓋子字串", "H"],
  ],
  matrix: [
    [36, "valid-sudoku", "Valid Sudoku", "有效的數獨", "M"],
    [54, "spiral-matrix", "Spiral Matrix", "螺旋矩陣", "M"],
    [48, "rotate-image", "Rotate Image", "旋轉圖像", "M"],
    [73, "set-matrix-zeroes", "Set Matrix Zeroes", "矩陣置零", "M"],
    [289, "game-of-life", "Game of Life", "生命遊戲", "M"],
  ],
  hashmap: [
    [383, "ransom-note", "Ransom Note", "贖金信", "E"],
    [205, "isomorphic-strings", "Isomorphic Strings", "同構字串", "E"],
    [290, "word-pattern", "Word Pattern", "單字規律", "E"],
    [242, "valid-anagram", "Valid Anagram", "有效的字母異位詞", "E"],
    [49, "group-anagrams", "Group Anagrams", "字母異位詞分組", "M"],
    [1, "two-sum", "Two Sum", "兩數之和", "E"],
    [202, "happy-number", "Happy Number", "快樂數", "E"],
    [219, "contains-duplicate-ii", "Contains Duplicate II", "存在重複元素 II", "E"],
    [128, "longest-consecutive-sequence", "Longest Consecutive Sequence", "最長連續序列", "M"],
  ],
  intervals: [
    [228, "summary-ranges", "Summary Ranges", "彙總區間", "E"],
    [56, "merge-intervals", "Merge Intervals", "合併區間", "M"],
    [57, "insert-interval", "Insert Interval", "插入區間", "M"],
    [452, "minimum-number-of-arrows-to-burst-balloons", "Minimum Number of Arrows to Burst Balloons", "用最少數量的箭引爆氣球", "M"],
  ],
  stack: [
    [20, "valid-parentheses", "Valid Parentheses", "有效的括號", "E"],
    [71, "simplify-path", "Simplify Path", "簡化路徑", "M"],
    [155, "min-stack", "Min Stack", "最小堆疊", "M"],
    [150, "evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation", "逆波蘭表示式求值", "M"],
    [224, "basic-calculator", "Basic Calculator", "基本計算機", "H"],
  ],
  "linked-list": [
    [141, "linked-list-cycle", "Linked List Cycle", "環形鏈結串列", "E"],
    [2, "add-two-numbers", "Add Two Numbers", "兩數相加", "M"],
    [21, "merge-two-sorted-lists", "Merge Two Sorted Lists", "合併兩個有序鏈結串列", "E"],
    [138, "copy-list-with-random-pointer", "Copy List with Random Pointer", "複製帶隨機指標的鏈結串列", "M"],
    [92, "reverse-linked-list-ii", "Reverse Linked List II", "反轉鏈結串列 II", "M"],
    [25, "reverse-nodes-in-k-group", "Reverse Nodes in k-Group", "K 個一組翻轉鏈結串列", "H"],
    [19, "remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "刪除鏈結串列的倒數第 N 個節點", "M"],
    [82, "remove-duplicates-from-sorted-list-ii", "Remove Duplicates from Sorted List II", "刪除有序鏈結串列中的重複元素 II", "M"],
    [61, "rotate-list", "Rotate List", "旋轉鏈結串列", "M"],
    [86, "partition-list", "Partition List", "分隔鏈結串列", "M"],
    [146, "lru-cache", "LRU Cache", "LRU 快取", "M"],
  ],
  "binary-tree": [
    [104, "maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "二元樹的最大深度", "E"],
    [100, "same-tree", "Same Tree", "相同的樹", "E"],
    [226, "invert-binary-tree", "Invert Binary Tree", "翻轉二元樹", "E"],
    [101, "symmetric-tree", "Symmetric Tree", "對稱二元樹", "E"],
    [105, "construct-binary-tree-from-preorder-and-inorder-traversal", "Construct Binary Tree from Preorder and Inorder Traversal", "從前序與中序走訪建構二元樹", "M"],
    [106, "construct-binary-tree-from-inorder-and-postorder-traversal", "Construct Binary Tree from Inorder and Postorder Traversal", "從中序與後序走訪建構二元樹", "M"],
    [117, "populating-next-right-pointers-in-each-node-ii", "Populating Next Right Pointers in Each Node II", "填充每個節點的下一個右側節點指標 II", "M"],
    [114, "flatten-binary-tree-to-linked-list", "Flatten Binary Tree to Linked List", "二元樹展開為鏈結串列", "M"],
    [112, "path-sum", "Path Sum", "路徑總和", "E"],
    [129, "sum-root-to-leaf-numbers", "Sum Root to Leaf Numbers", "根節點到葉節點數字之和", "M"],
    [124, "binary-tree-maximum-path-sum", "Binary Tree Maximum Path Sum", "二元樹中的最大路徑和", "H"],
    [173, "binary-search-tree-iterator", "Binary Search Tree Iterator", "二元搜尋樹迭代器", "M"],
    [222, "count-complete-tree-nodes", "Count Complete Tree Nodes", "完全二元樹的節點個數", "E"],
    [236, "lowest-common-ancestor-of-a-binary-tree", "Lowest Common Ancestor of a Binary Tree", "二元樹的最近共同祖先", "M"],
  ],
  "binary-tree-bfs": [
    [199, "binary-tree-right-side-view", "Binary Tree Right Side View", "二元樹的右視圖", "M"],
    [637, "average-of-levels-in-binary-tree", "Average of Levels in Binary Tree", "二元樹的層平均值", "E"],
    [102, "binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "二元樹的層序走訪", "M"],
    [103, "binary-tree-zigzag-level-order-traversal", "Binary Tree Zigzag Level Order Traversal", "二元樹的鋸齒形層序走訪", "M"],
  ],
  bst: [
    [530, "minimum-absolute-difference-in-bst", "Minimum Absolute Difference in BST", "二元搜尋樹的最小絕對差", "E"],
    [230, "kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST", "二元搜尋樹中第 K 小的元素", "M"],
    [98, "validate-binary-search-tree", "Validate Binary Search Tree", "驗證二元搜尋樹", "M"],
  ],
  graph: [
    [200, "number-of-islands", "Number of Islands", "島嶼數量", "M"],
    [130, "surrounded-regions", "Surrounded Regions", "被圍繞的區域", "M"],
    [133, "clone-graph", "Clone Graph", "複製圖", "M"],
    [399, "evaluate-division", "Evaluate Division", "除法求值", "M"],
    [207, "course-schedule", "Course Schedule", "課程表", "M"],
    [210, "course-schedule-ii", "Course Schedule II", "課程表 II", "M"],
  ],
  "graph-bfs": [
    [909, "snakes-and-ladders", "Snakes and Ladders", "蛇梯棋", "M"],
    [433, "minimum-genetic-mutation", "Minimum Genetic Mutation", "最小基因變化", "M"],
    [127, "word-ladder", "Word Ladder", "單字接龍", "H"],
  ],
  trie: [
    [208, "implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", "實作 Trie（字首樹）", "M"],
    [211, "design-add-and-search-words-data-structure", "Design Add and Search Words Data Structure", "新增與搜尋單字 - 資料結構設計", "M"],
    [212, "word-search-ii", "Word Search II", "單字搜尋 II", "H"],
  ],
  backtracking: [
    [17, "letter-combinations-of-a-phone-number", "Letter Combinations of a Phone Number", "電話號碼的字母組合", "M"],
    [77, "combinations", "Combinations", "組合", "M"],
    [46, "permutations", "Permutations", "全排列", "M"],
    [39, "combination-sum", "Combination Sum", "組合總和", "M"],
    [52, "n-queens-ii", "N-Queens II", "N 皇后 II", "H"],
    [22, "generate-parentheses", "Generate Parentheses", "括號生成", "M"],
    [79, "word-search", "Word Search", "單字搜尋", "M"],
  ],
  "divide-conquer": [
    [108, "convert-sorted-array-to-binary-search-tree", "Convert Sorted Array to Binary Search Tree", "將有序陣列轉換為二元搜尋樹", "E"],
    [148, "sort-list", "Sort List", "排序鏈結串列", "M"],
    [427, "construct-quad-tree", "Construct Quad Tree", "建立四元樹", "M"],
    [23, "merge-k-sorted-lists", "Merge k Sorted Lists", "合併 K 個有序鏈結串列", "H"],
  ],
  kadane: [
    [53, "maximum-subarray", "Maximum Subarray", "最大子陣列和", "M"],
    [918, "maximum-sum-circular-subarray", "Maximum Sum Circular Subarray", "環形子陣列的最大和", "M"],
  ],
  "binary-search": [
    [35, "search-insert-position", "Search Insert Position", "搜尋插入位置", "E"],
    [74, "search-a-2d-matrix", "Search a 2D Matrix", "搜尋二維矩陣", "M"],
    [162, "find-peak-element", "Find Peak Element", "尋找峰值", "M"],
    [33, "search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "搜尋旋轉排序陣列", "M"],
    [34, "find-first-and-last-position-of-element-in-sorted-array", "Find First and Last Position of Element in Sorted Array", "在排序陣列中尋找元素的第一個和最後一個位置", "M"],
    [153, "find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "尋找旋轉排序陣列中的最小值", "M"],
    [4, "median-of-two-sorted-arrays", "Median of Two Sorted Arrays", "尋找兩個有序陣列的中位數", "H"],
  ],
  heap: [
    [215, "kth-largest-element-in-an-array", "Kth Largest Element in an Array", "陣列中的第 K 個最大元素", "M"],
    [502, "ipo", "IPO", "IPO", "H"],
    [373, "find-k-pairs-with-smallest-sums", "Find K Pairs with Smallest Sums", "尋找和最小的 K 對數字", "M"],
    [295, "find-median-from-data-stream", "Find Median from Data Stream", "資料流的中位數", "H"],
  ],
  bit: [
    [67, "add-binary", "Add Binary", "二進位求和", "E"],
    [190, "reverse-bits", "Reverse Bits", "顛倒二進位位元", "E"],
    [191, "number-of-1-bits", "Number of 1 Bits", "位元 1 的個數", "E"],
    [136, "single-number", "Single Number", "只出現一次的數字", "E"],
    [137, "single-number-ii", "Single Number II", "只出現一次的數字 II", "M"],
    [201, "bitwise-and-of-numbers-range", "Bitwise AND of Numbers Range", "數字範圍按位元 AND", "M"],
  ],
  math: [
    [9, "palindrome-number", "Palindrome Number", "回文數", "E"],
    [66, "plus-one", "Plus One", "加一", "E"],
    [172, "factorial-trailing-zeroes", "Factorial Trailing Zeroes", "階乘後的零", "M"],
    [69, "sqrtx", "Sqrt(x)", "x 的平方根", "E"],
    [50, "powx-n", "Pow(x, n)", "Pow(x, n)", "M"],
    [149, "max-points-on-a-line", "Max Points on a Line", "直線上最多的點數", "H"],
  ],
  "dp-1d": [
    [70, "climbing-stairs", "Climbing Stairs", "爬樓梯", "E"],
    [198, "house-robber", "House Robber", "打家劫舍", "M"],
    [139, "word-break", "Word Break", "單字拆分", "M"],
    [322, "coin-change", "Coin Change", "零錢兌換", "M"],
    [300, "longest-increasing-subsequence", "Longest Increasing Subsequence", "最長遞增子序列", "M"],
  ],
  "dp-multi": [
    [120, "triangle", "Triangle", "三角形最小路徑和", "M"],
    [64, "minimum-path-sum", "Minimum Path Sum", "最小路徑和", "M"],
    [63, "unique-paths-ii", "Unique Paths II", "不同路徑 II", "M"],
    [5, "longest-palindromic-substring", "Longest Palindromic Substring", "最長回文子字串", "M"],
    [97, "interleaving-string", "Interleaving String", "交錯字串", "M"],
    [72, "edit-distance", "Edit Distance", "編輯距離", "M"],
    [123, "best-time-to-buy-and-sell-stock-iii", "Best Time to Buy and Sell Stock III", "買賣股票的最佳時機 III", "H"],
    [188, "best-time-to-buy-and-sell-stock-iv", "Best Time to Buy and Sell Stock IV", "買賣股票的最佳時機 IV", "H"],
    [221, "maximal-square", "Maximal Square", "最大正方形", "M"],
  ],
};

export const PROBLEMS: ProblemMeta[] = CATEGORIES.flatMap((c) =>
  RAW[c.id].map(([id, slug, title, titleZh, d]) => ({
    id,
    slug,
    title,
    titleZh,
    difficulty: D[d],
    category: c.id,
  })),
);

export const BY_SLUG = new Map(PROBLEMS.map((p) => [p.slug, p]));
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export const leetcodeUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`;
