# Design: Migrate to React (Vite)

## Architecture Overview

```
react-app/                        ← replaces current Next.js app
├── scripts/
│   └── build-content.ts          ← pre-processes all posts → JSON
├── public/
│   ├── content/
│   │   ├── posts/
│   │   │   └── {slug}.json       ← one JSON file per post (html + meta)
│   │   ├── index.json            ← all post metadata (for listing/search)
│   │   └── search-index.json     ← fuse.js search index
│   ├── img/                      ← copied from source/img/
│   ├── rss.xml                   ← generated at build time
│   ├── sitemap.xml               ← generated at build time
│   ├── CNAME
│   └── ads.txt
├── src/
│   ├── main.tsx
│   ├── App.tsx                   ← React Router routes
│   ├── types.ts                  ← PostMeta, Post, LinkGroup interfaces
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Aside.tsx
│   │   ├── ContentWithAside.tsx
│   │   ├── PostCard.tsx
│   │   ├── Pagination.tsx
│   │   ├── TOC.tsx
│   │   └── Search.tsx
│   └── pages/
│       ├── Home.tsx
│       ├── PostPage.tsx
│       ├── TagsPage.tsx
│       ├── TagPage.tsx
│       ├── CategoriesPage.tsx
│       ├── CategoryPage.tsx
│       ├── ArchivesPage.tsx
│       └── LinksPage.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts (or CSS)
└── package.json
```

## Key Design Decisions

### 1. Build-time content pipeline

Since Vite/React has no server-side file access at runtime, all Markdown processing happens in a **prebuild script** (`scripts/build-content.ts`):

```
source/_posts/**/*.md
  → gray-matter (front matter)
  → remark + rehype + rehype-pretty-code (HTML)
  → public/content/posts/{slug}.json   (per-post HTML + meta)
  → public/content/index.json          (all PostMeta, no HTML)
  → public/content/search-index.json   (title + tags + excerpt)
```

Pages fetch these JSON files at runtime using `fetch('/content/...')`.

### 2. Routing: React Router v6 (HashRouter or BrowserRouter + 404 fallback)

GitHub Pages doesn't support HTML5 pushState for deep links. Two options:
- **HashRouter** (`/#/posts/slug`) — simple, no server config needed
- **BrowserRouter** + `404.html` redirect trick — clean URLs, slightly more complex

**Decision: BrowserRouter + 404.html trick** to keep clean `/posts/slug/` URLs matching the existing Hexo/Next.js structure (avoids broken inbound links).

### 3. Styling: Tailwind CSS v4 + @tailwindcss/typography

Same as the Next.js version. `@custom-variant dark` for class-based dark mode.

### 4. Syntax highlighting: rehype-pretty-code + shiki

Same pipeline as Next.js version, runs entirely in the prebuild script.

### 5. Deployment

```bash
npm run build   # prebuild (content) + vite build → dist/
npm run deploy  # gh-pages -d dist -b gh-page
```

`PushGit.py` already calls `cd react-app && npm run deploy`.

## Data Flow

```
Build time:
  source/_posts/ → scripts/build-content.ts → public/content/

Runtime:
  React app → fetch('/content/index.json') → PostMeta[]
  React app → fetch('/content/posts/{slug}.json') → Post
  React app → fetch('/content/search-index.json') → SearchEntry[]
```

## Route Map

| URL | Component |
|-----|-----------|
| `/` | Home (page 1) |
| `/page/:n` | Home (page n) |
| `/posts/:slug` | PostPage |
| `/tags` | TagsPage |
| `/tags/:tag` | TagPage |
| `/categories` | CategoriesPage |
| `/categories/:cat` | CategoryPage |
| `/archives` | ArchivesPage |
| `/links` | LinksPage |

## Permalink Compatibility

Existing Hexo/Next.js URLs were `/posts/:slug/` (trailing slash). React Router routes use `/posts/:slug` (no trailing slash). Both will work with `BrowserRouter`.

## GitHub Pages 404 Trick

`public/404.html` redirects all unknown paths to `index.html` with the path encoded in the query string. `index.html` reads and restores it before React Router boots.
