# Proposal: leetcode-index-and-nav

## Why

84 篇 LeetCode 文章目前只能透過「按時間倒序的 11 頁列表」或搜尋找到。但這些內容的結構其實非常適合當**參考資料**使用：實測 **84/84 篇的標題都含題號**，難度標籤（easy 26 / medium 48 / hard 11）**100% 覆蓋**，另有 44 個演算法類型標籤。資料齊備，缺的只是一個能查的介面。

同時，文章頁的「上一篇／下一篇」是**按全站日期排序**的，對刷題筆記毫無意義——看 #100 的下一篇可能跳到某篇雜談。讀者（包含作者自己複習時）真正想要的是「同類別的相鄰題目」。

## What Changes

- 新增 `/leetcode` 刷題索引頁：表格列出所有題目的題號、標題、難度、演算法標籤；可依難度與演算法標籤篩選、依題號／難度／日期排序；頁首顯示總數與難度分布
- 文章頁的上／下一篇改為**同分類內的相鄰項目**：Leetcode 分類按題號排序，其餘分類維持日期排序
- 深淺色主題在使用者尚未手動選擇時**跟隨系統設定**（`prefers-color-scheme`），手動切換後才記住偏好
- RSS 改為輸出全文而非 200 字摘要

## Capabilities

### New Capabilities

- `leetcode-index`: 可篩選排序的刷題索引頁
- `sibling-post-nav`: 上／下一篇改為同分類相鄰，Leetcode 按題號
- `system-theme-preference`: 首次造訪跟隨系統深淺色偏好
- `full-content-rss`: RSS 輸出文章全文

### Modified Capabilities

<!-- 既有 specs 皆不涉及這些行為 -->

## Impact

- `react-app/src/pages/LeetcodePage.tsx` — 新增
- `react-app/src/lib/leetcode.ts` — 新增，題號與難度解析（供索引頁與導覽共用）
- `react-app/src/App.tsx`、`src/config/site.ts` — 路由與導覽列
- `react-app/src/pages/PostPage.tsx` — 上／下一篇邏輯
- `react-app/src/components/Nav.tsx`、`index.html` — 系統主題偏好
- `react-app/scripts/build-content.ts` — RSS 全文、`/leetcode` 加入 routes
