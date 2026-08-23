# Tasks: leetcode-index-and-nav

> 2026-08-23 實作完成，本機 Playwright 全項驗證通過。

## 1. 共用解析邏輯

- [x] 1.1 新增 `src/lib/leetcode.ts`：`problemNumber`、`difficulties`、`difficultyRank`、`algoTags`、`isWip`、`DIFFICULTY_STYLES`
- [x] 1.2 `isLeetcode(post)` 判斷是否屬 Leetcode 分類

## 2. 刷題索引頁（leetcode-index）

- [x] 2.1 新增 `src/pages/LeetcodePage.tsx`：表格列出題號／標題／難度／演算法／日期
- [x] 2.2 頁首統計：`共 84 題 · easy 26 · medium 48 · hard 11`
- [x] 2.3 難度 chips + 演算法 select 篩選，狀態存於 `useSearchParams`
- [x] 2.4 排序：題號／難度／日期可切換升降序，預設題號升序
- [x] 2.5 深淺色樣式一致；`usePageTitle`；「施工中」標記顯示為 badge（14 篇）
- [x] 2.6 路由 `/leetcode`（lazy，5.71 KB chunk）+ 導覽列項目
- [x] 2.7 `build-content.ts` routes 加入 `/leetcode`（prerender 196 → 含此頁，sitemap 同步）

## 3. 上／下一篇同分類相鄰（sibling-post-nav）

- [x] 3.1 `PostPage.tsx` 改為同分類相鄰；Leetcode 按題號升序，其餘按日期
- [x] 3.2 分類內少於 2 篇時退回全站日期排序

## 4. 系統主題偏好（system-theme-preference）

- [x] 4.1 `index.html` inline script 改為 `localStorage.theme === null` 時讀 `prefers-color-scheme`
- [x] 4.2 `Nav.tsx` 初始狀態同步同一邏輯（兩處必須一致，否則首屏閃動）

## 5. RSS 全文（full-content-rss）

- [x] 5.1 RSS 加 `content:encoded`（CDATA，`]]>` 已轉義）並宣告 content namespace；保留 `description` 摘要供舊閱讀器

## 6. 驗證

- [x] 6.1 `npm run build` 通過；prerender 195 → **196** 路由；主 bundle 291.98 → 294.01 KB（+2 KB，索引頁另切 5.71 KB chunk）
- [x] 6.2 索引頁 **84 列**、統計正確、預設題號升序（1/5/9/14）
- [x] 6.3 篩選：`hard` → 11 列 `?d=hard`；`hard + Dynamic Programming` → 3 列 `?d=hard&t=Dynamic+Programming`；重新載入該網址結果相同（可分享）；清除篩選回 84 列
- [x] 6.4 排序：難度升序全 easy、降序全 hard；題號降序 2924/2923/1768；日期降序 2025-02-18 起
- [x] 6.5 上／下一篇：`#100` → 上一篇 `#92`、下一篇 `#101`（題號相鄰，非日期相鄰）
- [x] 6.6 主題：系統淺色→淺色、系統深色→深色（`localStorage` 為 null）；手動切深色後即使系統為淺色仍維持深色
- [x] 6.7 RSS：268 KB、20 個 item 皆含 `content:encoded`，首篇全文 19,843 字元且含 code block，XML 標籤平衡
- [x] 6.8 零 console 錯誤、零 failed request
- [ ] 6.9 push main，CI 部署成功，線上驗證

## 7. 實作過程的發現（記錄備查）

- **#300 同時標記 `medium` 與 `hard`**，因此難度計數合計 85 > 84。`difficulties()` 回傳陣列而非單值，該題在兩種難度篩選下都會出現——忠於原始標記，不擅自挑一個。若你認為是誤標，改 front matter 即可。
- **22 篇文章沒有分類**、`~algo` 只有 1 篇，所以同分類導覽實際只作用於 84 篇 Leetcode，其餘走全站日期 fallback（符合設計）。
- `💡` 標籤出現在 71/84 篇、`施工中` 14 篇；兩者都不是演算法類型，已從演算法篩選中排除（施工中改以 badge 呈現）。
