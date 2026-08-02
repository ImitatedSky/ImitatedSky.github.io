# Tasks: feature-parity-gap

> 優先順序：1–3 為 bug 級（Playwright 實測確認的缺陷），4–8 為 parity 級，9–10 為 nice-to-have。
> 2026-08-02 實作完成，全項目經 Playwright 實測驗證（截圖存 session scratchpad `shots-verify/`）。

## 1. Page Titles（page-titles）

- [x] 1.1 新增 `src/hooks/usePageTitle.ts` — `usePageTitle(title?: string | null)`：string 設 `<title> | Imisky`、null 設回預設、undefined 略過（載入中）
- [x] 1.2 `PostPage.tsx` 於 post 載入後呼叫 `usePageTitle(post.title)`；404 分支設 `404`
- [x] 1.3 各列表頁（Archives / Tags / TagPage / Categories / CategoryPage / Links / MessageBoard / Home）與 App 的 NotFound 呼叫 `usePageTitle`
- [x] 1.4 Playwright 驗證：文章頁 `Leetcode#100. Same Tree | Imisky`、Archives/Tags/Links/留言板/404 均正確、返回首頁還原預設

## 2. Code Block Parity（code-block-parity）

- [x] 2.1 `scripts/build-content.ts`：rehypePrettyCode 加 `defaultLang: "text"`，無語言標註的 fenced block 也會包進 figure 並帶 `data-language`
- [x] 2.2 `PostPage.tsx` `useCopyButtons` 改掃 `.prose pre`，raw-HTML `<pre>` 於 runtime 包進等價 figure，確保每個 code block 都有 Copy 按鈕
- [x] 2.3 CSS 以 `pre[data-language]::before` 顯示語言標籤（絕對定位於 figure，不隨橫向捲動）；raw pre 補深色底
- [x] 2.4 `npm run build` 107 篇全數通過；Playwright 實測 Same Tree 篇 4/4 pre 有 Copy 按鈕與語言標籤
- [x] 2.5 （追加）確認相關推薦 3 篇維持現狀（原站 6 篇，視覺微調不立 spec）

## 3. Comments Stability（comments-stability）

- [x] 3.1 `Comments.tsx`：注入延後一個 tick + `container.isConnected` / iframe 去重檢查，StrictMode 雙掛載不再重複注入
- [x] 3.2 Playwright 驗證：文章頁與留言板 `insertAdjacentHTML` 錯誤 0 件、utterances iframe 恰一個

## 4. Nav Categories Dropdown（nav-categories-dropdown）

- [x] 4.1 `Nav.tsx`：Categories 改為 dropdown（📑 All + 依 `usePosts` 動態產生的分類），桌面 hover/focus-within 展開
- [x] 4.2 手機漢堡選單內 Categories 子項可展開（chevron 按鈕切換、縮排列表）
- [x] 4.3 Playwright 驗證：hover 顯示 All / Leetcode / ~algo；手機展開子選單正常

## 5. Site Stats Widget（site-stats-widget）

- [x] 5.1 「最後更新日期」改為前端由 index.json 的 `updated ?? date` 取最大值計算（index.json 為陣列格式、不動 schema，比原定 build-time meta 更簡單）
- [x] 5.2 `Aside.tsx` 新增網站資訊卡：文章總數、最後更新日期；busuanzi 留 `SITE.busuanzi` 開關（預設關，切站時再開）
- [x] 5.3 Playwright 驗證卡片顯示正確

## 6. Share Buttons（share-buttons）

- [x] 6.1 `PostPage.tsx` 版權區塊內加 FB / X / LINE 分享按鈕（share URL 開新視窗，`SHARE_URLS` 集中於 `config/site.ts`）
- [x] 6.2 Playwright 驗證 3 個分享按鈕存在；URL 由 `SITE.baseUrl + slug` 組成並 encodeURIComponent

## 7. Copy Copyright（copy-copyright）

- [x] 7.1 `PostPage.tsx`：prose 容器掛 `copy` 事件，選取 >100 字時 `clipboardData` 附加版權宣告
- [x] 7.2 Playwright 驗證：823 字選取附版權+文章連結、99 字不攔截、code block Copy 按鈕（`navigator.clipboard.writeText`）不受影響

## 8. Back-to-Top Percent（back-to-top-percent）

- [x] 8.1 `BackToTop.tsx`：捲動時顯示百分比整數（rAF 節流），hover 切換箭頭
- [x] 8.2 Playwright 驗證：頁面中段顯示 67

## 9. Newest Comments Widget（newest-comments-widget，低優先）

- [x] 9.1 新增 `src/components/NewestComments.tsx`：GitHub API 取 blog-utterances 最近 6 則 comments，localStorage 快取 5 分鐘，失敗/無留言時整卡隱藏
- [x] 9.2 驗證：目前 repo 無留言 → API 回空陣列 → 卡片正確隱藏、console 無錯誤（有留言後會自動顯示）

## 10. Power Mode Effect（power-mode-effect，低優先）

- [x] 10.1 新增 `src/components/PowerMode.tsx`：輸入框 input 事件粒子特效（自製輕量 canvas、量測游標位置），`prefers-reduced-motion` 與 coarse pointer（行動裝置）停用
- [x] 10.2 Playwright 驗證：連續輸入 22 字不掉字、canvas 建立、console 無錯誤

## 11. 整體驗證

- [x] 11.1 `cd react-app && npm run build`（含 `tsc -b`）全數通過，107 篇文章正常
- [x] 11.2 Playwright 全站走查 + 截圖：console 僅剩 canvas-nest 的 `getAttribute` 錯誤（屬 `background-effects` change 範圍），其餘 0 錯誤

## 12. 附帶修正（本次一併處理）

- [x] 12.1 修 root `.gitignore`：`public/` → `/public/`（原規則誤將 `react-app/public/` 靜態資源整個排除在 git 之外）；補 `react-app/dist/`、`react-app/public/content/`、`sitemap.xml`、`rss.xml`、`.playwright-mcp/` 規則

## 13. Bug: 上一篇/下一篇有時不跳轉（2026-08-02 使用者回報）

- [x] 13.1 修 `usePost.ts`：slug 變更且目標已在快取時 effect 提前 return、從不 setPost，導致 URL 變了但內容停留在舊文章（只在導向「看過的文章」時發生 → 「有時候」）；改為快取命中也要 setPost，並加 cancelled 防止快速切換的 race
- [x] 13.2 SPA 路由切換後回到頁面頂部（App.tsx 監聽 pathname → scrollTo(0,0)；原站整頁重載天然回頂，SPA 停在底部會讓上/下一篇看起來沒反應）
- [x] 13.3 Playwright 驗證：A→B→回 A（快取命中）內容正確更新、scrollY 歸零、document.title 同步、瀏覽器返回鍵正常、console 無錯誤
- [x] 13.4 驗證通過後 push main 由 Actions 部署

## 14. 背景粒子滑鼠吸附（2026-08-02 使用者回報：原站有、新版沒有）

- [x] 14.1 `CanvasNest.tsx` 加滑鼠互動：游標視為節點，MOUSE_DIST=200 內粒子連線到游標、外圈帶（0.6–1.0×）粒子被吸向游標（同原 canvas-nest 行為）；mouseleave 時解除
- [x] 14.2 Playwright 驗證：游標懸停 3 秒後周圍 200×200 px 的 canvas alpha 總和 2513 → 32702（13 倍），吸附與連線生效
