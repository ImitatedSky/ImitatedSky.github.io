## Why

The codebase has grown organically across multiple sessions and now has scattered hardcoded strings, dead Vite-scaffold files, a misplaced Next.js directive, and repeated styling patterns. This makes future changes brittle — e.g., renaming the site or changing the primary color requires hunting across 8+ files. A focused refactor pass will centralize config, extract reusable primitives, and delete dead code before the codebase grows further.

## What Changes

- **Delete unused scaffold files**: `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` (Vite default files never imported by the blog)
- **Remove `"use client"` directive** from `Nav.tsx` (Next.js artifact, meaningless in a Vite app)
- **Create `src/config/site.ts`** — single source of truth for: site name, author name, social URLs, announcement text, typed strings, nav links definition, copyright start year, blog base URL
- **Update all consumers** of those hardcoded values to import from `site.ts`
- **Extract `src/components/TagPill.tsx`** — the `#tag` pill link used in PostCard and PostPage banner
- **Extract `src/components/CoverImage.tsx`** — the `<img>` + `<div className="absolute inset-0 bg-black/...">` overlay pattern shared by PageBanner and PostPage banner
- **Add CSS custom properties** for primary and accent colors to `index.css` (`--color-primary`, `--color-accent`) so they're tunable from one place
- **Verify**: full build passes, all pages render, no regressions

## Capabilities

### New Capabilities

- `site-config`: Centralized site metadata and content config module

### Modified Capabilities

## Impact

- `src/config/site.ts` — new file
- `src/components/TagPill.tsx` — new file
- `src/components/CoverImage.tsx` — new file
- `src/components/Nav.tsx` — remove `"use client"`, import nav links from site config
- `src/components/Aside.tsx` — import author, social, announcement from site config
- `src/components/PageBanner.tsx` — use CoverImage internally
- `src/pages/Home.tsx` — import typed strings from site config
- `src/pages/PostPage.tsx` — import author/URL from site config, use TagPill and CoverImage
- `src/App.tsx` — import copyright year from site config
- `src/index.css` — add `--color-primary`, `--color-accent` vars; replace hardcoded hex in `.copy-code-btn.copied` and scrollbar
- Delete: `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`
