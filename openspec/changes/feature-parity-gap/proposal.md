# Proposal: feature-parity-gap

> 2026-08-02 功能對照稽核：以「code 直接檢查」+「Playwright 實測（dev server + 截圖）」兩種方式，比對 react-app（Vite + React Router 重寫版）與原 Hexo Butterfly 網站（目前仍部署於 https://pochunyeh.com/ ）的功能差距。本 change 記錄尚缺的功能並排入實作。

## Why

React 重寫版已完成大部分頁面與功能（首頁 hero + 打字副標、文章卡片與分頁、側欄六個 widget、深色模式、fuse.js 搜尋含 `/`、`Ctrl+K` 快捷鍵、文章頁的閱讀進度條/閱讀時間/桌面 TOC/版權區塊/上下篇/相關推薦/Utterances 留言、Archives/Tags/Categories/Links/留言板頁、build 時產出 RSS 與 sitemap），但 Playwright 實測與程式碼盤點顯示仍有一批原站（Butterfly 主題啟用中）的功能缺失或故障。若要讓 pochunyeh.com 從 Hexo 切換到 React 版而不損失使用者體驗，需補齊這些差距。

## What Changes

### Playwright 實測發現的缺陷（confirmed bugs）

- **canvas-nest 背景特效完全沒有渲染**：頁面上 0 個 `<canvas>`，且每頁載入都拋出 `Cannot read properties of null (reading 'getAttribute')` console error（CDN script 與 Vite/SPA 時序不合）。→ 已由現存 change `background-effects` 追蹤，本 change 不重複。
- **手機版（<xl）沒有任何 TOC 入口**：側欄整個隱藏。→ 已由現存 change `mobile-toc` 追蹤，本 change 不重複。
- **文章頁 `document.title` 不會更新**：所有頁面恆為 "Imisky's Blog"；原站每頁有「文章標題 | Imisky」。影響 SEO、書籤、分頁辨識。
- **Copy 按鈕只出現在有語言標註的 code block**：實測一篇文章 4 個 `<pre>` 只有 1 個有按鈕（只有 `[data-rehype-pretty-code-figure]` 會被掛上）；原站所有代碼塊都有複製按鈕與語言標籤。
- **Comments 元件在掛載時拋出 `insertAdjacentHTML: The element has no parent` console error**（文章頁與留言板皆出現；留言最終仍載入成功，但錯誤需修）。

### Code 盤點發現的功能缺失（原站有、React 版沒有）

- **導覽列 Categories 下拉子選單**（原站：📑All / 🧭Leetcode）；React 版只有扁平連結。
- **側欄網站資訊卡（card_webinfo）**：文章總數、最後更新日期；原站另有 busuanzi 訪問人數 UV/PV 統計。
- **側欄最新留言 widget（newest_comments）**：原站顯示最近 6 則留言。
- **文章分享按鈕（AddToAny：facebook / twitter / line）**。
- **複製文章內容自動附加版權宣告**（copy.copyright，>100 字時附加）。
- **Back-to-top 按鈕的滾動百分比顯示**（rightside_scroll_percent）。
- **打字特效 activate_power_mode**（輸入時冒光粒子 + 抖動；原站啟用 colorful + shake）。
- **閱讀模式（readmode）按鈕**。

### 小差異（列入記錄，低優先）

- 相關推薦原站 6 篇、React 版 3 篇。
- 側欄歸檔原站按「月」列出（連到 /archives/YYYY/MM/），React 版按「年」且一律連到 /archives。
- 文章頁尚無 per-page `<meta description>` / OG tags（SPA 限制；原站為靜態 HTML 每頁皆有）。
- Footer 缺原站的自訂歡迎文字。

## Capabilities

### New Capabilities

- `page-titles`: 每頁動態更新 `document.title`（文章頁 = 文章標題、列表頁 = 頁面名稱），並於路由切換時生效
- `code-block-parity`: 所有 code block（含無語言標註者）都有複製按鈕與語言標籤，與原站行為一致
- `nav-categories-dropdown`: 導覽列 Categories 提供下拉子選單（All / Leetcode），桌面 hover、手機展開
- `site-stats-widget`: 側欄網站資訊卡：文章總數、最後更新日期（busuanzi UV/PV 為 optional）
- `share-buttons`: 文章頁分享按鈕（Facebook / Twitter(X) / LINE），使用各平台 share URL、不引入第三方 script
- `copy-copyright`: 複製文章內文超過 100 字時，剪貼簿內容自動附加作者與出處版權宣告
- `back-to-top-percent`: Back-to-top 按鈕捲動時顯示目前閱讀百分比，hover 或到頂時顯示箭頭
- `comments-stability`: 修復 Utterances Comments 元件 `insertAdjacentHTML` console error（StrictMode 雙掛載防護）
- `newest-comments-widget`: 側欄最新留言卡（GitHub Issues API 讀取 blog-utterances repo 最近留言；低優先）
- `power-mode-effect`: activate_power_mode 打字粒子特效（留言板/搜尋輸入時；低優先、尊重 prefers-reduced-motion）

### Modified Capabilities

<!-- openspec/specs/ 目前為空，無既有 spec 需修改 -->

## Impact

- `react-app/src/pages/PostPage.tsx` — page title、code block copy 修正、分享按鈕、copy-copyright
- `react-app/src/pages/*.tsx` — 各頁 page title
- `react-app/src/components/Nav.tsx` — Categories 下拉
- `react-app/src/components/Aside.tsx` — 網站資訊卡、最新留言卡
- `react-app/src/components/BackToTop.tsx` — 滾動百分比
- `react-app/src/components/Comments.tsx` — 雙掛載防護
- `react-app/scripts/build-content.ts` — 需輸出「最後更新日期」與（若需要）字數統計至 index.json
- 相關現存 change：`background-effects`（canvas-nest 修復）、`mobile-toc`（手機 TOC）、`remaining-features`（其 9.x 驗證項目本次 Playwright 已大多驗證通過，另行勾選）
- 不動 Hexo 舊檔與 `source/_posts/`
