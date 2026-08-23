# Design: site-optimization

## Context

react-app 是 Vite + React Router SPA，`vite build` 只產生一份 `dist/index.html` 空殼。內容在 build 時已經被 `scripts/build-content.ts` 轉成 JSON（`public/content/index.json` 含全部 107 篇的 slug/title/excerpt/cover/date），所以**產生每頁 meta 所需的資料在 build 階段已經全部就位**——不需要跑瀏覽器或 headless render，純字串處理即可。

GitHub Pages 供應靜態檔案：若 `dist/posts/<slug>/index.html` 存在，訪問 `/posts/<slug>` 會直接命中該檔，不會走 404.html。

## Goals / Non-Goals

**Goals:**

- 每個路由（首頁、分頁、107 篇文章、archives/tags/categories/links/messageboard、各 tag/category 子頁）都有實體 HTML，帶專屬 title/description/OG/canonical
- 縮小初始 bundle，消除首頁 CLS
- 圖片單一來源，避免手動同步

**Non-Goals:**

- **不做內容 SSR/SSG**（不用 `react-dom/server` 把文章 HTML 渲染進去）。只注入 `<head>` meta。理由見 Decisions 1。
- 不重新編碼圖片（WebP/壓縮）——會動到使用者的原始素材，屬不可逆操作，另案處理
- 不改 react-router 大版本、不動 eslint/typescript 大版本升級

## Decisions

1. **只 prerender `<head>` meta，不 prerender 內容。**
   爬蟲與社群卡片抓的是 `<head>`：Facebook/X/LINE 的 scraper 完全不執行 JS，只讀 og:*；Google 讀 title/description 後才決定要不要花預算渲染 JS。把 meta 靜態化就解決 95% 的問題，而且**零執行期風險**（純字串注入，不需要讓 React 在 Node 端跑起來、不會有 hydration mismatch）。完整 SSG 的收益是首屏內容更快，但代價是要處理 `document`/`window` 依賴（CanvasNest、PowerMode、medium-zoom、localStorage 主題判斷全都碰 DOM），風險與工作量高一個數量級。
   替代方案（`vite-plugin-ssr`、遷回 Next.js）都需要重構，與現況不成比例。

2. **prerender 腳本吃 `index.json`，不重複解析 Markdown。** build-content 已經算好 excerpt 與 cover，prerender 只讀 JSON、套 template、寫檔。單一資料來源，不會出現 meta 與頁面內容不一致。

3. **路由清單由 build-content 輸出到 `public/content/routes.json`。** 讓「有哪些路由」這件事只有一個定義處（build-content 已經在為 sitemap 算同一份清單），prerender 與 sitemap 共用，不會漏頁。

4. **保留 404.html。** 已知路由都有實體檔案，但未知路徑（打錯、舊 Hexo permalink）仍需要它導回 SPA 顯示 404 頁。

5. **路由 lazy loading 只切非首頁。** Home 與 PostPage 是絕大多數流量，切出去反而多一次往返；Archives/Tags/Categories/Links/MessageBoard 用 `React.lazy`。fuse.js 改成 `await import("fuse.js")` 在搜尋首次開啟時載入。

6. **圖片單一來源選 `source/img` → build 時複製到 `public/img`。** 理由：`source/` 是內容作者的心智模型（文章、友鏈、圖片都在 source 下），而 `public/img` 是產物。複製方向反過來會讓「寫文章時圖片放哪」變得反直覺。複製後 `public/img` 加入 gitignore。

## Risks / Trade-offs

- [prerender 寫出 107+ 個 HTML 檔，若 template 有誤會全站壞掉] → prerender 後用 Playwright 實測數個代表性路由（首頁、文章、tag 子頁），並檢查 SPA 仍正常接手（不能因為 HTML 變了就 hydration 失敗——因為只改 head，body 仍是空 root，風險極低）
- [每頁 HTML 都內嵌相同的 dark-mode / SPA-redirect inline script，體積重複] → 單檔約 1.2 KB，107 頁約 130 KB，gzip 後可忽略；換來的是每頁可獨立被索引
- [`public/img` 改為 build 產物後，若有人手動放圖到 public/img 會被清掉] → 複製採「補齊」而非「清空重建」，且 CLAUDE.md 明記圖片要放 `source/img`
- [lazy route 首次切換多一次網路往返] → 只切低流量頁面；bundle 縮小對首屏的收益大於偶發的分頁延遲

## Open Questions

- 是否要在未來加上 WebP 轉檔（需 `sharp` devDependency，build 時產生 `.webp` 並用 `<picture>`）？圖片總量約 800 KB，收益明確但屬另案。
