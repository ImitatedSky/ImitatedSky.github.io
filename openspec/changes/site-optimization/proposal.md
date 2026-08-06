# Proposal: site-optimization

> 2026-08-06 上線後優化稽核。實測 `dist/` 產出、bundle 組成、圖片大小、content payload 後排出的優先順序。

## Why

網站已上線且功能與原站對齊，但有一個**重傷級問題**：`dist/index.html` 是一個空殼——只有 `<title>Imisky's Blog</title>` 和 `<div id="root"></div>`，**107 篇文章共用同一份沒有內容的 HTML**。後果：

1. **社群分享全部是空白預覽**——我們才剛加上的 FB / X / LINE 分享按鈕，貼出去抓不到標題、描述、縮圖，因為爬蟲不執行 JS
2. **搜尋引擎拿到空頁面**——Google 雖然會嘗試渲染 JS，但權重遠低於靜態 HTML；每篇文章沒有自己的 `<title>`、`description`
3. **深層連結要繞 404.html 轉址**——多一次 redirect，且對爬蟲不友善

其餘為效能與維護性問題：單一 332 KB bundle 無 code splitting、首頁 10 張封面圖無 `loading="lazy"` 也無尺寸（造成 CLS）、`source/img` 與 `react-app/public/img` 有兩份相同副本需手動同步。

## What Changes

### P0 — SEO / 社群預覽（真正的痛點）

- 新增 build 後處理：為每個路由產生獨立的 `dist/<route>/index.html`，注入該頁專屬的 `<title>`、`<meta name="description">`、Open Graph（`og:title`/`og:description`/`og:image`/`og:url`/`og:type`）與 `twitter:card`
- 文章頁的 description 取自 excerpt、og:image 取自 cover
- 加入 `<link rel="canonical">` 避免重複內容
- 因為每個路由都有實體 HTML 檔，深層連結不再需要 404.html 轉址（404.html 保留作為未知路徑的後援）
- sitemap.xml 加上 `<lastmod>`

### P1 — 效能

- 路由層 lazy loading（`React.lazy` + `Suspense`），把非首頁的頁面切出主 bundle
- `fuse.js` 改為搜尋開啟時才動態載入（搜尋索引本來就已經是 lazy fetch）
- 封面圖加 `loading="lazy"`、`decoding="async"` 與明確尺寸比例，消除 CLS 與首頁多餘流量

### P2 — 維護性

- `source/img` 與 `react-app/public/img` 統一為單一來源（build 時複製），避免新增圖片放錯地方
- CLAUDE.md 移除已失效的 "Before (Hexo)" 整段（Hexo 已完全移除）
- 歸檔 4 個已完成的 openspec change

## Capabilities

### New Capabilities

- `prerendered-meta`: 每個路由產生帶有專屬 title/description/OG/canonical 的靜態 HTML
- `route-code-splitting`: 路由與搜尋函式庫延遲載入，縮小初始 bundle
- `image-loading-hints`: 封面圖延遲載入與尺寸提示，消除版面位移
- `single-source-images`: 圖片單一來源，build 時同步

### Modified Capabilities

<!-- openspec/specs/ 仍為空，無既有 spec 需修改 -->

## Impact

- `react-app/scripts/prerender.ts` — 新增，build 後產生各路由 HTML
- `react-app/package.json` — build script 串接 prerender
- `react-app/scripts/build-content.ts` — sitemap 加 lastmod、輸出 prerender 需要的路由清單、複製 source/img
- `react-app/src/App.tsx` — 路由 lazy loading
- `react-app/src/components/Search.tsx` — fuse.js 動態載入
- `react-app/src/components/PostCard.tsx`、`CoverImage.tsx` — 圖片載入提示
- `CLAUDE.md` — 移除 Hexo 段落
- `openspec/changes/` — 歸檔 4 個完成的 change
