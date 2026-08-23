## Context

`index.json` 已含每篇的 slug/title/date/tags/categories/cover/excerpt，前端 `usePosts` 一次載入全部 107 筆（52 KB，gzip 後約 10 KB）。索引頁所需資料**完全不需要新的 build 產物或額外請求**，純前端從既有資料衍生即可。

題號來源：標題格式穩定為 `Leetcode#<n>. <題名>`，slug 為 `Leetcode-<n>-<題名>`。兩者皆可解析，實測 84/84 成功。

## Goals / Non-Goals

**Goals:**
- 讓「找某一題」從翻頁／搜尋變成一眼可見、可篩選
- 修正上／下一篇對刷題筆記無意義的排序
- 兩項低風險的體驗修正（系統主題、RSS 全文）

**Non-Goals:**
- 不引入表格套件（TanStack Table 等）。84 筆資料用原生 `useMemo` + `Array.sort` 綽綽有餘，加套件只會膨脹 bundle
- 不做「刷題進度打勾」等需要持久化狀態的功能（會需要後端或 localStorage 狀態管理，且與「筆記索引」定位無關）
- 不動 LeetCode 官方題號以外的編號體系

## Decisions

1. **題號與難度解析集中在 `src/lib/leetcode.ts`。** 索引頁與 PostPage 的上下題導覽都需要，抽成單一函式避免兩處各寫一份正則而行為分歧。

2. **難度採「標籤中出現的難度」而非單一值。** 實測 #300 同時標了 `medium` 與 `hard`（可能是作者認為介於兩者），所以型別是 `string[]` 而非 `string`。篩選時該題會同時出現在兩個難度下——這比擅自挑一個更忠於原始標記。

3. **篩選與排序狀態放 URL query string（`?d=hard&t=Dynamic+Programming`）。** 這樣「難題 + DP」這種組合可以直接分享或加書籤，也讓瀏覽器返回鍵行為正確。用 `useSearchParams`，不需要額外狀態管理。

4. **上／下一篇改為同分類相鄰。** 同一分類內：Leetcode 按題號升序，其他分類按日期降序（維持現狀語意）。無分類或分類內只有自己時，退回全站日期排序，避免導覽突然消失。

5. **系統主題偏好只在「使用者從未手動切換」時生效。** `localStorage.theme` 為 null 時讀 `prefers-color-scheme`，否則尊重已存的選擇。`index.html` 的 inline script 也要同步改，否則首屏會閃一下錯誤主題。

6. **RSS 全文直接放 `contentHtml`。** 需包在 `<![CDATA[...]]>` 內，且因為內容含 shiki 產生的大量 inline style，RSS 檔會從約 20 KB 長到數百 KB——對靜態站可接受，且訂閱者體驗明顯更好。只取最近 20 篇，維持現狀。

## Risks / Trade-offs

- [索引頁一次渲染 84 列 DOM] → 84 列對現代瀏覽器無壓力（不需虛擬滾動）；已量測首頁 16 張圖的頁面 CLS 0.0004，此頁無圖片更輕
- [題號解析依賴標題格式] → 解析失敗時該題仍列出（題號顯示為「—」），不會整頁壞掉；84/84 目前皆成功
- [RSS 全文含 shiki inline style，檔案變大] → 只影響 rss.xml 體積，不影響網頁；若日後過大可改回摘要
- [同分類導覽讓跨分類瀏覽變得不可能] → 這正是意圖：讀 LeetCode 時想看下一題，不是下一篇雜談
- [URL query 篩選狀態需與 prerender 共存] → `/leetcode` 只 prerender 無參數版本，query 由前端處理，爬蟲看到的是完整清單（對 SEO 有利）
