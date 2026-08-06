# Tasks: site-optimization

## 1. Prerendered meta（P0 — SEO / 社群預覽）

- [x] 1.1 `build-content.ts` 輸出 `public/content/routes.json`：每個路由的 path、title、description、image、type（website/article）、lastmod
- [x] 1.2 `build-content.ts` sitemap 加 `<lastmod>`（文章取 `updated ?? date`）
- [x] 1.3 新增 `scripts/prerender.ts`：讀 `dist/index.html` 當 template + `routes.json`，為每個路由寫出 `dist/<path>/index.html`，注入 title / description / canonical / og:* / twitter:*
- [x] 1.4 `package.json` build script 串接：`tsc -b && vite build && tsx scripts/prerender.ts`
- [x] 1.5 驗證產出：**197 個路由**（107 文章 + 72 tag + 2 分類 + 列表頁 + 分頁）meta 正確且互不重複

## 2. Code splitting（P1 — bundle）

- [x] 2.1 `App.tsx`：Archives / Tags / TagPage / Categories / CategoryPage / Links / MessageBoard 改 `React.lazy` + `<Suspense>`；Home 與 PostPage 保留在主 bundle
- [x] 2.2 `Search.tsx`：`fuse.js` 改為開啟時 `await import("fuse.js")`，與搜尋索引 fetch 併行
- [x] 2.3 主 bundle **332 → 290.8 KB**（gzip 105.4 → 88.8 KB），fuse.js 23.8 KB 與 7 個路由 chunk 分離

## 3. Image loading hints（P1 — CLS / 流量）

- [x] 3.1 `PostCard.tsx` 封面圖：前 2 張 eager（首屏），其餘 `loading="lazy"` + `decoding="async"`
- [x] 3.2 `CoverImage.tsx` 加 `loading` prop（預設 eager，banner 用）+ `decoding="async"`
- [x] 3.3 Home hero 加 `fetchPriority="high"`（LCP 元素）；Aside 縮圖本來就有 lazy

## 4. Single source images（P2 — 維護性）

- [x] 4.1 `build-content.ts` 加入 `source/img` → `public/img` 複製（比對 size/mtime 補齊，不清空）
- [x] 4.2 `.gitignore` 加 `react-app/public/img/`，`git rm --cached` 移除 18 個已追蹤副本
- [x] 4.3 CLAUDE.md 註明圖片放 `source/img/`，且 `public/img` 為產物不可直接放

## 5. 文件與歸檔（P2）

- [x] 5.1 CLAUDE.md 移除已失效的 "Before (Hexo)" 整段（178 → 128 行），標題 "After" 改為 "Setup"，發佈流程改為 Actions 自動部署
- [x] 5.2 歸檔 4 個已完成 change；其中 12 個 capability spec 提升至 `openspec/specs/`

## 6. 驗證

- [x] 6.1 `npm run build` 通過，107 篇 + 197 路由 prerender 全數產出
- [x] 6.2 Playwright（對 `dist/` 靜態伺服）：深層連結無 `?/` 轉址、SPA 正常接手、console 零錯誤
- [x] 6.3 Playwright：5 個 lazy 路由直接載入與 client-side 切換皆正常；搜尋（動態 fuse.js）回傳 122 筆
- [x] 6.4 **16 張封面圖 + hero 全部 naturalWidth > 0，零 failed request** — 確認 untrack 後 build 複製機制正確
- [x] 6.5 push main，CI 部署 success；線上驗證：og:* 正確、hero + 16 張封面 + 頭像 + 文章內 6 張圖全部載入、4 個 code block 與 copy 按鈕正常、lazy 路由與搜尋（113 筆）可用、**零 console 錯誤、零 failed request**

## 7. 尾斜線行為（已釐清）

GitHub Pages 對 extensionless 路徑會 **301 轉址**到帶斜線版本並供應 prerender 檔案，因此 `/posts/foo` 與 `/posts/foo/` 都能取得正確的 og:title。先前在 vite preview 觀察到的「不帶斜線回退到 SPA 空殼」只是本機伺服器行為差異，不影響線上。分享按鈕、canonical、sitemap 本來就使用帶斜線網址。
