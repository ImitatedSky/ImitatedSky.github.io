# Tasks: site-optimization

## 1. Prerendered meta（P0 — SEO / 社群預覽）

- [ ] 1.1 `build-content.ts` 輸出 `public/content/routes.json`：每個路由的 path、title、description、image、type（website/article）、lastmod
- [ ] 1.2 `build-content.ts` sitemap 加 `<lastmod>`（文章取 `updated ?? date`）
- [ ] 1.3 新增 `scripts/prerender.ts`：讀 `dist/index.html` 當 template + `routes.json`，為每個路由寫出 `dist/<path>/index.html`，注入 title / description / canonical / og:* / twitter:*
- [ ] 1.4 `package.json` build script 串接：`tsc -b && vite build && tsx scripts/prerender.ts`
- [ ] 1.5 驗證產出：文章頁、首頁、tags 子頁的 meta 正確且互不重複

## 2. Code splitting（P1 — bundle）

- [ ] 2.1 `App.tsx`：Archives / Tags / TagPage / Categories / CategoryPage / Links / MessageBoard 改 `React.lazy` + `<Suspense>`；Home 與 PostPage 保留在主 bundle
- [ ] 2.2 `Search.tsx`：`fuse.js` 改為開啟時 `await import("fuse.js")`
- [ ] 2.3 比對 build 前後主 bundle 大小

## 3. Image loading hints（P1 — CLS / 流量）

- [ ] 3.1 `PostCard.tsx` 封面圖加 `loading="lazy"` + `decoding="async"`
- [ ] 3.2 `CoverImage.tsx` 加 `loading`（可由 prop 控制，hero 用 eager）+ `decoding="async"`
- [ ] 3.3 `Aside.tsx` 最新文章縮圖已有 lazy — 確認一致

## 4. Single source images（P2 — 維護性）

- [ ] 4.1 `build-content.ts` 加入 `source/img` → `public/img` 複製（補齊式，不清空）
- [ ] 4.2 `.gitignore` 加 `react-app/public/img/`，並從 git 索引移除已追蹤的副本
- [ ] 4.3 CLAUDE.md 註明圖片放 `source/img/`

## 5. 文件與歸檔（P2）

- [ ] 5.1 CLAUDE.md 移除已失效的 "Before (Hexo)" 整段
- [ ] 5.2 歸檔 4 個已完成 change：remaining-features、background-effects、mobile-toc、feature-parity-gap

## 6. 驗證

- [ ] 6.1 `npm run build` 通過，107 篇 + prerender 全數產出
- [ ] 6.2 Playwright：prerender 後各路由 SPA 仍正常接手，console 無錯誤
- [ ] 6.3 Playwright：延遲載入的頁面切換正常、搜尋仍可用
- [ ] 6.4 確認所有文章引用的圖片路徑可解析（無 404）
- [ ] 6.5 push main，CI 部署成功，線上驗證 og:* 與深層連結無轉址
