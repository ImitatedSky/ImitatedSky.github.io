# Tasks: migrate-to-react-vite

## 1. Project Scaffold

- [x] 1.1 Delete existing `react-app/` directory
- [x] 1.2 Run `npm create vite@latest react-app -- --template react-ts`
- [x] 1.3 Install dependencies: `react-router-dom gray-matter remark remark-gfm remark-rehype rehype rehype-stringify rehype-pretty-code rehype-slug rehype-autolink-headings shiki fuse.js js-yaml gh-pages react-icons @tailwindcss/typography`
- [x] 1.4 Install dev dependencies: `tsx @types/js-yaml @types/node tailwindcss @tailwindcss/vite`
- [x] 1.5 Configure `vite.config.ts`: add Tailwind plugin, set `base: '/'`
- [x] 1.6 Set up `src/index.css` with Tailwind v4 imports and `@custom-variant dark`
- [x] 1.7 Add scripts to `package.json`: `prebuild`, `build`, `deploy`
- [x] 1.8 Copy `source/img/` to `react-app/public/img/`, add `CNAME` and `ads.txt` to `public/`

## 2. Content Pipeline (build-time)

- [x] 2.1 Create `src/types.ts` — `PostMeta`, `Post`, `LinkGroup`, `SearchEntry` interfaces
- [x] 2.2 Create `scripts/build-content.ts` — reads all `../source/_posts/**/*.md`, processes through remark→rehype→rehype-pretty-code pipeline
- [x] 2.3 Implement front matter normalizer (strip `[tag]` brackets, same logic as Next.js version)
- [x] 2.4 Implement `!https://...` → `![](url)` preprocessor for Notion-style images
- [x] 2.5 Write `public/content/posts/{slug}.json` for each post (full HTML + meta)
- [x] 2.6 Write `public/content/index.json` (array of all PostMeta, sorted by date desc)
- [x] 2.7 Write `public/content/search-index.json` (slug, title, tags, categories, date, excerpt)
- [x] 2.8 Parse `source/_data/link.yml` and write `public/content/links.json`
- [x] 2.9 Generate `public/sitemap.xml` and `public/rss.xml` (20 most recent posts)
- [x] 2.10 Wire script as `prebuild` step in `package.json`
- [x] 2.11 Verify all 107 posts process without errors

## 3. App Shell & Routing

- [x] 3.1 Set up `src/main.tsx` with `BrowserRouter`
- [x] 3.2 Add GitHub Pages 404 redirect script to `public/404.html` and path-restore snippet to `index.html`
- [x] 3.3 Create `src/App.tsx` with all routes defined
- [x] 3.4 Create `src/hooks/usePosts.ts` — fetches and caches `index.json`
- [x] 3.5 Create `src/hooks/usePost.ts` — fetches single post JSON by slug

## 4. Layout & Nav

- [x] 4.1 Create `src/components/Nav.tsx` — links, search icon, theme toggle, hamburger (mobile)
- [x] 4.2 Implement dark/light toggle: `@custom-variant dark`, reads/writes `localStorage.theme`, default dark
- [x] 4.3 Add no-flash dark mode script inline in `index.html` `<head>`
- [x] 4.4 Create `src/components/Aside.tsx` — author card (avatar, name, social links, Follow Me), recent posts, categories
- [x] 4.5 Create `src/components/ContentWithAside.tsx` — two-column wrapper used by all pages

## 5. Shared Components

- [x] 5.1 Create `src/components/PostCard.tsx` — cover image, title, date, category, tag badges
- [x] 5.2 Create `src/components/Pagination.tsx` — prev/next controls
- [x] 5.3 Create `src/components/TOC.tsx` — extracts h2/h3 from HTML, sticky, IntersectionObserver highlight
- [x] 5.4 Create `src/components/Search.tsx` — modal overlay, lazy-loads search-index.json, fuse.js

## 6. Pages

- [x] 6.1 Create `src/pages/Home.tsx` — hero banner, post grid (10/page), pagination
- [x] 6.2 Create `src/pages/PostPage.tsx` — fetch post JSON, cover banner, metadata header, prose HTML, TOC
- [x] 6.3 Create `src/pages/TagsPage.tsx` — tag cloud with counts
- [x] 6.4 Create `src/pages/TagPage.tsx` — filtered post grid for a tag
- [x] 6.5 Create `src/pages/CategoriesPage.tsx` — category list with counts
- [x] 6.6 Create `src/pages/CategoryPage.tsx` — filtered post grid for a category
- [x] 6.7 Create `src/pages/ArchivesPage.tsx` — posts grouped by year → month
- [x] 6.8 Create `src/pages/LinksPage.tsx` — friend links from links.json

## 7. Build & Deploy Verification

- [x] 7.1 Run `npm run build` — verify `dist/` is produced with no errors
- [x] 7.2 Confirm `dist/content/posts/*.json` and `dist/index.html` exist
- [ ] 7.3 Serve `dist/` locally and verify routing, dark mode toggle, search, TOC all work
- [ ] 7.4 Test deploy to `gh-page` branch with `npm run deploy`

## 8. Polish & Visual Fixes (post-scaffold)

- [x] 8.1 Replace site name "PocHun" → "ImitatedSky" (Nav logo, hero banner) and footer copyright → "Pat Yeh"
- [x] 8.2 Home hero: replace gradient with actual `index_img.jpg` (compass image) + dark overlay + centered text
- [x] 8.3 PostPage: wrap article content in white/dark card (`bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm`)
- [x] 8.4 Plain code blocks (no language tag): add dark background styling (`bg-zinc-900 rounded-lg p-4 font-mono`)
- [x] 8.5 Inline code: change color to orange `#ff7242` with tinted background, matching original Butterfly theme
- [x] 8.6 rehype-pretty-code CSS fixes: `prose-pre:bg-transparent prose-pre:p-0`, prevent typography plugin overriding token colors
- [x] 8.7 PostPage banner: overlay title, category, date, updated date, tags on the cover image (Butterfly-style)
- [x] 8.8 Add `updated` field to build pipeline (`build-content.ts`), `types.ts`, and `PostMeta` interface
- [x] 8.9 PostPage banner: date and tags on separate lines (date row + tag pills row)
- [x] 8.10 PostPage: add 上一篇/下一篇 prev-next navigation cards below article
- [x] 8.11 PostPage: add 相關推薦 related posts section (scored by shared category + tags, top 3 with cover thumbnails)
