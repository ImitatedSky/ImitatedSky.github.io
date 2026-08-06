# Tasks: remaining-features

## 1. Dependencies & Setup

- [x] 1.1 Install `medium-zoom` npm package in `react-app/`

## 2. Back-to-Top Button

- [x] 2.1 Create `src/components/BackToTop.tsx` — fixed bottom-right round button, purple `#9370db`, shows when `scrollY > 300`, smooth scrolls to top on click
- [x] 2.2 Render `<BackToTop />` in `App.tsx` (outside `<main>`, after `<Search>`)

## 3. Reading Progress Bar

- [x] 3.1 Add reading progress bar to `PostPage.tsx` — fixed 3px bar at `top-0 left-0 z-[200]`, purple, width % driven by scroll position, scoped to PostPage mount only

## 4. Reading Time

- [x] 4.1 Add `readingTime(html: string): number` helper in `PostPage.tsx` — strip tags, count words, divide by 200, round up; returns minutes
- [x] 4.2 Display "X 分鐘閱讀" in the PostPage banner meta row (next to date)

## 5. Image Zoom

- [x] 5.1 In `PostPage.tsx`, add `useEffect` that imports `medium-zoom`, selects all `img` in the prose `div`, applies `mediumZoom(imgs, { margin: 24, background: 'rgba(0,0,0,0.85)' })`, and detaches on cleanup

## 6. Comments Component

- [x] 6.1 Create `src/components/Comments.tsx` — renders a `<div>` ref, appends Utterances `<script>` with props `repo="ImitatedSky/blog-utterances"`, `issue-term` (prop), `theme` (follows dark mode), `crossorigin="anonymous"`. Show "Loading comments…" placeholder until Utterances fires `resize` message.
- [x] 6.2 Add Comments embed at bottom of PostPage article (below copyright notice, above Prev/Next), with `issueTerm={post.slug}`

## 7. Message Board Page

- [x] 7.1 Create `src/pages/MessageBoardPage.tsx` — `<PageBanner title="留言板" subtitle="歡迎留言" />` + `<Comments issueTerm="messageboard" />`
- [x] 7.2 Add route `<Route path="/messageboard" element={<MessageBoardPage />} />` in `App.tsx`
- [x] 7.3 Add nav link for Message Board to `site.ts` NAV_LINKS with `FaCommentDots` icon and label "Message"

## 8. Search Keyboard Shortcut

- [x] 8.1 In `App.tsx`, add `useEffect` keydown listener: trigger `setSearchOpen(true)` on `/` key (when active element is not input/textarea) or `Ctrl+K` / `Cmd+K`

## 9. Verification

- [x] 9.1 Run `npm run build` — no TypeScript errors, 107 posts built
- [x] 9.2 Verify back-to-top button appears after scrolling and scrolls smoothly to top（2026-08-02 Playwright 實測通過）
- [x] 9.3 Verify reading progress bar fills correctly on a post page（實測中段捲動顯示 54.9%）
- [x] 9.4 Verify reading time shows in post banner（實測通過）
- [x] 9.5 Verify image zoom works on a post with images（2026-08-02 Playwright 實測 Same Tree 篇 6 張圖：點擊後 medium-zoom overlay 開啟、Esc 關閉正常）
- [x] 9.6 Verify comments load on post page and message board page（實測 utterances iframe 均載入；但掛載時有 `insertAdjacentHTML` console error → 已記錄於 `feature-parity-gap` change 的 comments-stability）
- [x] 9.7 Verify `/messageboard` route and nav link work（實測通過）
- [x] 9.8 Verify `/` and `Ctrl+K` open search modal（`/` 實測通過、Esc 關閉正常；Ctrl+K 為同一 handler）
