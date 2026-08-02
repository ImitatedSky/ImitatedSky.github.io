## Why

The current blog is built on Hexo + Butterfly theme, a Node.js static site generator that is increasingly difficult to customize and extend. Migrating to Next.js 15 (React) enables full control over UI/UX, modern developer tooling, and a component-driven architecture that scales with future feature additions.

## What Changes

- Replace Hexo + Butterfly with a Next.js 15 App Router project in `react-app/`
- Implement static site generation (SSG) via `generateStaticParams` for all post, tag, category, and archive pages
- Replace Hexo Markdown pipeline with `gray-matter` + `remark` + `rehype` stack
- Replace Butterfly theme UI with custom Tailwind CSS v4 components
- Replace Hexo local search plugin with client-side `fuse.js` search
- Replace Hexo deploy plugin with Next.js static export + `gh-pages` deployment to `gh-page` branch
- Existing Hexo setup in repo root remains untouched during migration

## Capabilities

### New Capabilities

- `post-listing`: Home page showing paginated post cards (10/page) with cover image, title, date, tags, category
- `post-page`: Individual post rendering with front matter (cover, TOC, syntax highlighting, tags, categories, date)
- `toc`: Auto-generated Table of Contents sidebar from post headings
- `syntax-highlight`: Code block highlighting via `rehype-pretty-code` + `shiki`
- `tags-page`: Browsable tag cloud linking to filtered post lists
- `categories-page`: Category tree linking to filtered post lists
- `archives-page`: Chronological full post archive grouped by year/month
- `local-search`: Client-side full-text search over all posts using `fuse.js`
- `friend-links-page`: Renders `source/_data/link.yml` as a visual link card grid
- `dark-light-mode`: Toggle between dark and light themes, persisted via localStorage
- `nav`: Fixed/responsive top navigation (Home / Archives / Tags / Categories / Links / Search)
- `seo`: Per-page meta tags, Open Graph, sitemap.xml, RSS feed
- `github-pages-deploy`: Static export to `out/` and push to `gh-page` branch via `gh-pages` package

### Modified Capabilities

<!-- None — this is a greenfield React app; no existing OpenSpec specs to modify -->

## Impact

- **New dependencies**: Next.js 15, React 19, Tailwind CSS v4, gray-matter, remark, rehype, rehype-pretty-code, shiki, fuse.js, js-yaml, react-icons, gh-pages
- **Source posts**: `source/_posts/**/*.md` read at build time — no modifications to post files
- **Images**: `source/img/` copied to `react-app/public/img/`
- **Deployment**: Same target (`gh-page` branch, GitHub Pages), different toolchain
- **Hexo**: Remains functional in repo root; `react-app/` is a self-contained subdirectory
