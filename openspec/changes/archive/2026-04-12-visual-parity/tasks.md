# Tasks: visual-parity

## 1. Data & Build Pipeline

- [x] 1.1 Add `sticky` field to `PostMeta` and `Post` interfaces in `src/types.ts`
- [x] 1.2 Parse `sticky` front matter in `scripts/build-content.ts` and include in JSON output
- [x] 1.3 Update sort in `build-content.ts`: sticky posts first (by sticky value desc), then date desc

## 2. Site Identity

- [x] 2.1 Change nav logo from "ImitatedSky" to "Imisky" in `Nav.tsx`
- [x] 2.2 Change homepage hero title to "Imisky" in `Home.tsx`
- [x] 2.3 Update footer copyright to "©2020 – present By ImitatedSky" in `App.tsx`

## 3. Homepage Hero

- [x] 3.1 Make hero full-viewport-height (`h-screen`) with `index_img.jpg` background
- [x] 3.2 Add scroll-down arrow at bottom of hero that smooth-scrolls to post list

## 4. Post Card — Horizontal Alternating Layout

- [x] 4.1 Rewrite `PostCard.tsx` to accept an `index` prop and render image left (even) or image right (odd)
- [x] 4.2 Image takes ~40% width, content ~60%, horizontal flex layout on `md+`, stacked on mobile
- [x] 4.3 Show pin icon on sticky posts in card title area
- [x] 4.4 Pass `index` prop from `Home.tsx`, `TagPage.tsx`, `CategoryPage.tsx` listing loops

## 5. Nav Icons

- [x] 5.1 Add `react-icons/fa` icons to each nav link in `Nav.tsx`: FaHome, FaArchive, FaTags, FaFolderOpen, FaLink

## 6. Sidebar — Extended Aside

- [x] 6.1 Add stats row to author card in `Aside.tsx`: 文章 / 標籤 / 分類 counts linking to /archives, /tags, /categories
- [x] 6.2 Add thumbnail image (60×60) to each recent post item in `Aside.tsx`
- [x] 6.3 Add 公告 (announcement) card to `Aside.tsx` with static text
- [x] 6.4 Add Tags cloud card to `Aside.tsx` (top 30 tags, font-size scaled by count, links to /tags/:tag)
- [x] 6.5 Add Archives card to `Aside.tsx` (top 5 years with post count, links to /archives)

## 7. Page Banners & Listing Page Polish

- [x] 7.1 Create `src/components/PageBanner.tsx` — reusable banner with bg image + dark overlay + title text
- [x] 7.2 Add banner to ArchivesPage (title "Archives")
- [x] 7.3 Add banner to TagsPage (title "Tags")
- [x] 7.4 Add banner to TagPage (title "#tag")
- [x] 7.5 Add banner to CategoriesPage (title "Categories")
- [x] 7.6 Add banner to CategoryPage (title "category name")
- [x] 7.7 Add banner to LinksPage (title "Links")

## 8. Archives Page — Butterfly Style

- [x] 8.1 Rewrite ArchivesPage: year-only grouping (no month), thumbnail + date + title per item

## 9. Tags Page — Colored Cloud

- [x] 9.1 Add deterministic per-tag color using hash → hsl, matching Butterfly colorful cloud style

## 10. Links Page — Card Layout

- [x] 10.1 Rewrite link cards: centered icon on top, name, description below (matching original flink-list-item style)

## 11. Code Copy Button

- [x] 11.1 Add copy button to all `[data-rehype-pretty-code-figure]` pre blocks via CSS + JS in PostPage

## 12. Post Copyright Notice

- [x] 12.1 Add copyright notice at bottom of post (author, link, license)

## 13. Verification

- [x] 13.1 Run `npm run build` — no errors, 107 posts built
- [ ] 13.2 Verify all pages have banners
- [ ] 13.3 Verify archives thumbnail layout, tags colors, links card layout
- [ ] 13.4 Verify code copy button works
- [ ] 13.5 Verify copyright notice on post page
