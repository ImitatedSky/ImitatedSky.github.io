# Design: feature-parity-gap

## Context

react-app 為 Vite + React Router SPA，文章內容在 build 時由 `scripts/build-content.ts` 轉成 JSON（index.json / search-index.json / links.json / sitemap.xml / rss.xml），前端以 `usePosts` / `usePost` 讀取。文章 HTML 由 remark/rehype + rehype-pretty-code 產生，於 `PostPage.tsx` 以 `dangerouslySetInnerHTML` 渲染，副作用（copy 按鈕、內部連結攔截、medium-zoom）都用 `useEffect` 掛在渲染後的 DOM 上。

Playwright 實測（2026-08-02，dev server localhost:5175）確認：現有功能大多正常，缺陷集中在「per-page title 不更新」「無語言標註的 code block 沒有 copy 按鈕」「Comments 元件 console error」，以及一批原站 Butterfly 有啟用、React 版尚未實作的 widget/特效。

## Goals / Non-Goals

**Goals:**

- 補齊 proposal 列出的 10 個 capability，優先順序：page-titles、code-block-parity、comments-stability（bug 級）→ nav-categories-dropdown、site-stats-widget、share-buttons、copy-copyright、back-to-top-percent（parity 級）→ newest-comments-widget、power-mode-effect（nice-to-have）
- 全程不新增重量級依賴；優先用原生 API 與現有套件

**Non-Goals:**

- canvas-nest 背景修復（`background-effects` change 處理）
- 手機版 TOC（`mobile-toc` change 處理）
- per-page SEO meta / OG tags 的 pre-render（需 SSG 架構決策，另開 change）
- 閱讀模式（readmode）：原站按鈕使用率低，暫列記錄不實作
- 相關推薦 3→6 篇、側欄歸檔改月份：視覺微調，實作時順手處理即可，不立 spec

## Decisions

1. **page-titles 用自訂 `usePageTitle(title)` hook**，各頁 `useEffect` 設 `document.title`，卸載時還原預設。不引入 react-helmet（SPA 只需 title，helmet 過重）。文章頁格式 `${post.title} | ${SITE.name}`，列表頁 `${頁名} | ${SITE.name}`，首頁維持 `Imisky's Blog`。
2. **code-block-parity 改在 build 時統一包裝**：`build-content.ts` 的 rehype pipeline 後處理，確保每個 `<pre>`（含無語言者）都包進 `[data-rehype-pretty-code-figure]` 等價容器並帶 `data-language`（無語言顯示 `text`）；前端 `useCopyButtons` 改成掃 `figure` 或直接掃 `.prose pre`。選 build 時處理是因為語言資訊在 mdast/hast 階段最可靠。前端顯示語言標籤用 CSS `::before` 讀 `data-language`。
3. **comments-stability**：`Comments.tsx` 於 append Utterances `<script>` 前檢查容器仍掛在 DOM（`ref.current?.isConnected`），並在 cleanup 清空容器、防 StrictMode 雙掛載重複注入（用 `ref` flag 或清空後重建）。
4. **nav-categories-dropdown 資料來源用 `usePosts` 動態產生分類清單**（與原站選單一致地固定列 All + Leetcode 亦可，但動態產生免維護）。桌面 hover + focus-within 顯示、手機選單內縮排展開，純 CSS/DOM，不加 headless-ui。
5. **site-stats-widget 的「最後更新日期」由 build-content.ts 寫入 index.json 頂層 meta**（取所有 post `updated ?? date` 最大值）。busuanzi 為外部 script 且常慢/失效，改為 optional：預設不啟用，留 config 開關。
6. **share-buttons 用純 share URL**（`https://www.facebook.com/sharer/...`、`https://twitter.com/intent/tweet`、`https://social-plugins.line.me/lineit/share`）開新視窗，不引 AddToAny script，零依賴、無隱私追蹤。
7. **copy-copyright 攔截 prose 容器的 `copy` 事件**：`e.clipboardData.setData('text/plain', selection + 版權文字)`，僅在選取字數 >100 時附加，與原站 Butterfly 行為一致。
8. **back-to-top-percent**：BackToTop 改為顯示百分比數字（捲動中），到頂前 hover 顯示箭頭；沿用既有 scroll listener，計算與 reading-progress 相同公式，`requestAnimationFrame` 節流。
9. **newest-comments-widget 用 GitHub REST API**（`GET /repos/ImitatedSky/blog-utterances/issues/comments?sort=created&direction=desc&per_page=6`，未認證 60 req/hr 足夠），結果 localStorage cache 5 分鐘（同原站 storage: 5）。失敗時整卡隱藏。
10. **power-mode-effect 自行實作輕量 canvas 粒子**（監聽 input/textarea keydown，於游標位置噴粒子），不引 activate-power-mode 套件（已無維護）；`prefers-reduced-motion` 時停用；桌面限定（同原站 mobile: false）。

## Risks / Trade-offs

- [rehype pipeline 改動影響全部 107 篇文章渲染] → 改動後 `npm run build` 全量跑過，抽查含/不含語言標註、含 HTML 區塊的文章
- [GitHub API rate limit / 離線] → newest-comments 卡片失敗時靜默隱藏 + localStorage cache
- [copy 事件攔截可能干擾 code block 的 Copy 按鈕] → copy-copyright 只掛在 prose 文字區，Copy 按鈕用 `navigator.clipboard.writeText` 不經 copy 事件，需以 Playwright 驗證兩者互不影響
- [share URL 政策變動（Twitter→X）] → 集中在一個 `SHARE_URLS` config，壞了只改一處
- [document.title 還原時序（快速切頁）] → hook 只設不還原，每頁自己設，永遠最後掛載者贏

## Open Questions

- busuanzi 是否要在正式切換 domain 時啟用（計數會從原站延續，因為以 domain 為 key）？→ 預設關，切站時再決定
- newest-comments 是否值得 60 req/hr 的限制？若常觸頂可改 build 時抓一次快照
