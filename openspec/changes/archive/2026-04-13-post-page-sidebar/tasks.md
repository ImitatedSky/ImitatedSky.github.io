# Tasks: post-page-sidebar

## 1. PostPage Sidebar Update

- [x] 1.1 Import `Aside` in `src/pages/PostPage.tsx`
- [x] 1.2 Update sidebar column width to `w-72`
- [x] 1.3 Add `tocSlot?: React.ReactNode` prop to `Aside` — rendered between 公告 and 最新文章
- [x] 1.4 Add `splitSticky?: boolean` prop to `Aside`
- [x] 1.5 When `splitSticky=true`: author card + announcement in normal flow; TOC + widgets in `sticky top-20` block
- [x] 1.6 Wrap `tocSlot` in card box matching other sidebar widgets
- [x] 1.7 Sidebar outer div: `self-stretch` so sticky inner block spans full article height
- [x] 1.8 Aside outer div: `h-full` so sticky block is bounded by article height

## 2. Verification

- [x] 2.1 Run `npm run build` — no errors
- [x] 2.2 On xl+ viewport: author card + 公告 scroll off; TOC + 最新文章 + 分類 + 標籤 + 歸檔 stay sticky
- [x] 2.3 TOC card has card box wrapper (bg-white, border, rounded)
- [x] 2.4 Sidebar hidden on viewports below xl
