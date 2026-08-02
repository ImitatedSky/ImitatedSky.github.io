# Tasks: mobile-toc

> 2026-08-02 完成。按鈕位置定在 `bottom-[5.25rem] right-6`（BackToTop 上方，避免重疊）。

## 1. Component

- [x] 1.1 Create `src/components/MobileTOCButton.tsx` — accepts `html: string` + `postTitle`，複用 TOC.tsx 匯出的 `parseHeadings`（h2/h3 + post-top），returns null if none
- [x] 1.2 Add floating button: `xl:hidden fixed bottom-[5.25rem] right-6 z-[60]`, circular, `var(--color-primary)` background, `FiList` icon
- [x] 1.3 Add open/close state; button opens, overlay/close button/heading tap closes
- [x] 1.4 Add slide-up drawer panel: fixed bottom overlay + panel, `translate-y` transition, heading list with active highlight；開啟時鎖定 body scroll
- [x] 1.5 Add IntersectionObserver for active heading tracking (same logic as TOC.tsx)
- [x] 1.6 Clicking a heading: smooth scroll + close drawer; clicking overlay: close drawer

## 2. Integration

- [x] 2.1 Import and render `<MobileTOCButton html={post.contentHtml} postTitle={post.title} />` in `src/pages/PostPage.tsx`

## 3. Verification

- [x] 3.1 Run `npm run build` — no errors
- [x] 3.2 Open a post at narrow viewport (390×844) — button appears, drawer slides up, heading navigation works（Playwright 實測 + 截圖）
- [x] 3.3 Open same post at xl+ viewport (1600×900) — button is not visible（實測 hidden）
- [x] 3.4 Confirm active heading highlights as user scrolls（同桌面 TOC 的 IntersectionObserver 邏輯；點擊後 active 即時更新）
