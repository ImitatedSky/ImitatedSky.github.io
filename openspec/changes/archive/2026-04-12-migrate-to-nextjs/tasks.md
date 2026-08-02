## 1. Project Scaffold

- [x] 1.1 Run `npx create-next-app@latest react-app` with TypeScript, Tailwind CSS, App Router, no src/ dir
- [x] 1.2 Install dependencies: `gray-matter remark remark-gfm rehype rehype-pretty-code shiki rehype-slug rehype-autolink-headings fuse.js js-yaml gh-pages react-icons`
- [x] 1.3 Configure `next.config.ts` with `output: 'export'` and `trailingSlash: true`
- [x] 1.4 Add `deploy` script in `react-app/package.json`: `next build && gh-pages -d out -b gh-page`
- [x] 1.5 Copy `source/img/` to `react-app/public/img/`
- [x] 1.6 Add `react-app/` to `.gitignore` build outputs (`out/`, `.next/`)

## 2. Markdown Pipeline

- [x] 2.1 Create `react-app/lib/posts.ts` — reads all `../source/_posts/**/*.md` recursively using `fs` + `glob`
- [x] 2.2 Implement front matter tag normalizer: strip `[` `]` from tag strings
- [x] 2.3 Parse front matter with `gray-matter` and return typed `PostMeta` interface
- [x] 2.4 Implement `getPostBySlug(slug)` that returns rendered HTML via `remark` → `rehype` pipeline
- [x] 2.5 Configure `rehype-pretty-code` + `shiki` with `one-dark-pro` theme and line numbers
- [x] 2.6 Add `rehype-slug` and `rehype-autolink-headings` for anchor-linked headings
- [x] 2.7 Verify all 95 posts parse without errors (run a test script)

## 3. Layout & Nav

- [x] 3.1 Create `app/layout.tsx` with dark-mode class injection script in `<head>` (no-flash)
- [x] 3.2 Build `components/Nav.tsx` with links: Home / Archives / Tags / Categories / Links + search icon + theme toggle
- [x] 3.3 Implement hamburger menu collapse for mobile (below 768px)
- [x] 3.4 Implement active link highlighting using `usePathname()`
- [x] 3.5 Implement dark/light toggle: reads/writes `localStorage.theme`, applies `dark` class on `<html>`

## 4. Home Page (Post Listing)

- [x] 4.1 Create `app/page.tsx` — fetch first 10 posts, pass to `PostList` component
- [x] 4.2 Build `components/PostCard.tsx` — cover image, title, date, category, tag badges
- [x] 4.3 Create `app/page/[page]/page.tsx` with `generateStaticParams` for all pages
- [x] 4.4 Build `components/Pagination.tsx` with prev/next controls

## 5. Post Page

- [x] 5.1 Create `app/posts/[slug]/page.tsx` with `generateStaticParams` for all post slugs
- [x] 5.2 Render post HTML using `dangerouslySetInnerHTML` inside a `prose` Tailwind class container
- [x] 5.3 Display cover image banner, title, date, category, tags in post header
- [x] 5.4 Add `generateMetadata` returning post title + og:image

## 6. TOC

- [x] 6.1 Create `components/TOC.tsx` — extract `h2`/`h3` headings from post HTML (regex or unified tree)
- [x] 6.2 Render TOC as sticky sidebar (hidden below 1024px via Tailwind `lg:block`)
- [x] 6.3 Implement IntersectionObserver in TOC to highlight active heading on scroll

## 7. Tags Page

- [x] 7.1 Create `app/tags/page.tsx` — aggregate all tags with counts, render tag cloud
- [x] 7.2 Create `app/tags/[tag]/page.tsx` with `generateStaticParams` for all tags
- [x] 7.3 Filter and render post list for selected tag

## 8. Categories Page

- [x] 8.1 Create `app/categories/page.tsx` — aggregate all categories with counts
- [x] 8.2 Create `app/categories/[category]/page.tsx` with `generateStaticParams` for all categories
- [x] 8.3 Filter and render post list for selected category

## 9. Archives Page

- [x] 9.1 Create `app/archives/page.tsx` — group all posts by year then month
- [x] 9.2 Render grouped post links with year/month section headers

## 10. Friend Links Page

- [x] 10.1 Create `lib/links.ts` — reads and parses `source/_data/link.yml` using `js-yaml`
- [x] 10.2 Create `app/links/page.tsx` — render link groups and cards with avatar, name, description
- [x] 10.3 Handle missing avatar with fallback `/img/friend_404.gif`

## 11. Local Search

- [x] 11.1 Create `scripts/build-search-index.ts` — generates `public/search-index.json` from all posts
- [x] 11.2 Wire script into `package.json` prebuild step
- [x] 11.3 Build `components/Search.tsx` — modal/overlay with input, loads index lazily, runs fuse.js
- [x] 11.4 Display results as clickable post links; show "no results" message when empty

## 12. SEO & Feeds

- [x] 12.1 Add root `generateMetadata` in `app/layout.tsx` for site-wide defaults
- [x] 12.2 Create `app/sitemap.ts` using Next.js `MetadataRoute.Sitemap` returning all page URLs
- [x] 12.3 Create `scripts/build-rss.ts` — generates `public/rss.xml` with 20 most recent posts
- [x] 12.4 Wire RSS script into `package.json` prebuild step

## 13. Deploy & Integration

- [x] 13.1 Run `npm run build` and verify `out/` structure matches expected URL layout
- [x] 13.2 Confirm `/posts/:title/index.html` exists for a sample post
- [ ] 13.3 Test deploy to `gh-page` branch with `npm run deploy` from `react-app/`
- [x] 13.4 Update `PushGit.py` deploy step to use `react-app/` instead of Hexo
- [x] 13.5 Add `CNAME` file containing `pochunyeh.com` to `react-app/public/`

## 14. Bug Fixes (post-review)

- [x] 14.1 Preprocess `!https://...` (Notion-style image syntax) in post content → convert to standard `![](url)` before remark pipeline
- [x] 14.2 Fix inline `code` element styling in prose — add visible background color for dark mode

## 15. Visual Design — Hero & Sidebar

- [x] 15.1 Add full-width hero banner on home page using `index_img.jpg`
- [x] 15.2 Build `components/Aside.tsx` — sticky sidebar with author card (avatar, name, GitHub button, social links)
- [x] 15.3 Add recent posts list to aside (latest 5)
- [x] 15.4 Add category list to aside
- [x] 15.5 Create `components/ContentWithAside.tsx` wrapper — two-column layout (content | Aside), used by all pages
- [x] 15.6 Apply ContentWithAside to all listing/content pages: home, page/[page], archives, tags, tags/[tag], categories, categories/[category], links, posts/[slug]
