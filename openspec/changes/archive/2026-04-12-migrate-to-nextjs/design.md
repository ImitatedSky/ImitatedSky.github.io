## Context

The blog currently runs on Hexo 7 with the Butterfly theme. All content lives in `source/_posts/` as Markdown files (~95 posts). The site is deployed as static HTML to the `gh-page` branch of the GitHub repo. The migration creates a new `react-app/` subdirectory in the same repo; Hexo is left intact so there is no risk of losing the working site during development.

## Goals / Non-Goals

**Goals:**
- Full feature parity with the existing Hexo/Butterfly site (minus comments)
- Static export — no server runtime, compatible with GitHub Pages
- Markdown posts readable without modification
- Dark/light mode with localStorage persistence
- Local search across all post titles, tags, and content

**Non-Goals:**
- Server-side rendering or API routes at runtime
- Comment system (explicitly deferred)
- CMS or admin panel
- Rewriting or reformatting existing Markdown post files

## Decisions

### 1. Framework: Next.js 15 (App Router, static export)
**Rationale:** `output: 'export'` in `next.config.ts` produces a fully static `out/` directory identical in structure to what Hexo emits. App Router enables per-page `generateStaticParams` and colocation of data-fetching with components.  
**Alternative considered:** Gatsby — heavier plugin ecosystem, slower build times, less momentum.

### 2. Directory layout: `react-app/` subdirectory
**Rationale:** Keeps Hexo working throughout development. The existing `PushGit.py` and deploy workflow are unchanged until the React app is production-ready.  
**Alternative considered:** Replace repo root — risky; one mistake breaks the live site.

### 3. Markdown pipeline: gray-matter + remark + rehype
**Rationale:** Composable, well-maintained, TypeScript-friendly. `gray-matter` handles front matter; `remark-gfm` adds GitHub Flavored Markdown; `rehype-pretty-code` + `shiki` handles syntax highlighting with zero CSS overhead.  
**Alternative considered:** `next-mdx-remote` — adds MDX overhead not needed for plain Markdown posts.

### 4. Styling: Tailwind CSS v4
**Rationale:** Utility-first CSS keeps component files self-contained. v4's CSS-first config reduces boilerplate. Custom design inspired by Butterfly's dark card aesthetic.  
**Alternative considered:** CSS Modules — more verbose for theming; styled-components — runtime overhead.

### 5. Search: fuse.js (client-side)
**Rationale:** No server needed. Build step writes a `search-index.json` with all post titles, tags, categories, and excerpts. Fuse.js fuzzy-searches it at runtime.  
**Alternative considered:** Algolia — requires external service and API keys.

### 6. Post file reading strategy: Node.js `fs` at build time only
**Rationale:** Next.js SSG runs `fs` calls inside `generateStaticParams` and page `props` functions at build time. Posts are read from `../source/_posts/**/*.md` relative to `react-app/`.

### 7. Deployment: `gh-pages` npm package
**Rationale:** `npx gh-pages -d out` pushes the static export to the `gh-page` branch, matching the existing Hexo deploy target exactly.  
**Alternative considered:** GitHub Actions — viable but requires secrets setup; `gh-pages` CLI is simpler for a solo developer.

### 8. Front matter tag normalization
**Rationale:** Existing posts use a non-standard YAML tag format (`- [tagname]`). A build-time normalizer strips brackets during parsing so the React app doesn't need to handle the quirk.

## Risks / Trade-offs

- **Front matter inconsistency** → Mitigation: Write a `lib/posts.ts` normalizer that handles both `- [tag]` and `- tag` formats; log warnings for unrecognized shapes.
- **Image paths** → Mitigation: Copy `source/img/` to `react-app/public/img/` once; update `next.config.ts` to serve static assets correctly.
- **Large post count (95+) → slow cold build** → Mitigation: Next.js incremental builds; `shiki` language loading is lazy.
- **Permalink format mismatch** (`posts/:title/` in Hexo) → Mitigation: Mirror the same route structure in Next.js (`/posts/[slug]/`) to avoid broken inbound links.
- **Tailwind purge missing dynamic classes** → Mitigation: Use static class strings; avoid constructing class names from runtime data.

## Migration Plan

1. Scaffold `react-app/` with Next.js + Tailwind + dependencies
2. Build Markdown pipeline and verify all 95 posts parse cleanly
3. Implement pages in order: Home → Post → Tags → Categories → Archives → Links
4. Add Search, Dark/Light mode, Nav
5. Copy `source/img/` to `react-app/public/img/`
6. Verify static export (`next build`) produces correct `out/` structure
7. Test deploy to `gh-page` branch from `react-app/`
8. Update `PushGit.py` to point at `react-app/` for deploy step
9. Decommission Hexo (optional, later)

**Rollback:** Hexo remains intact throughout. If React app has issues, revert `PushGit.py` to use Hexo deploy.

## Open Questions

- Should the URL structure remain exactly `/posts/:title/` or is a clean `/blog/:slug/` acceptable? (Current assumption: keep `/posts/:title/` to avoid broken links)
- Will `source/_data/link.yml` stay as the source of truth for friend links, or should it be migrated into the React app?
