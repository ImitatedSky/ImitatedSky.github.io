# Proposal: algo-practice

## Why

部落格已有 LeetCode 題解筆記索引（`/leetcode`），但只是文章列表。需要一個完整的刷題練習區：
把 LeetCode Top Interview 150 全部收錄，每題都有逐步動畫圖解、Python 解法與分類，並附各種排序演算法的視覺化。

## What Changes

- 新增 `/algo` 練習區（獨立版面，不套用部落格的 Nav / 背景特效），沿用全站深淺色主題
- `/algo`：首頁 —— 進度總覽、23 個分類地圖
- `/algo/problems`：150 題列表，可依分類／難度／狀態篩選與搜尋
- `/algo/p/:slug`：題目頁 —— 題意摘要、動畫播放器（與 Python 程式碼逐行同步）、思路、複雜度、標記完成
- `/algo/sorting`、`/algo/sorting/:id`：10 種排序演算法視覺化（可自訂／隨機輸入）
- 題目頁「練習模式」：瀏覽器內以 Pyodide 執行使用者的 Python 並跑測試
- 學習進度存 localStorage
- `build-content.ts` 將 `/algo` 路由加入 routes（prerender + sitemap）
- 部落格導覽列新增入口

## Impact

- 新增 `react-app/src/algo/**`（全部 lazy chunk，不影響首頁 bundle）
- `App.tsx`：`/algo/*` 路由改用獨立版面
- `scripts/verify-algo.ts`：驗證每題的 trace 與 Python 解法（實際執行 python）
- 題目敘述為自行改寫的中文摘要，並連結回 LeetCode 原題（不複製原文）
