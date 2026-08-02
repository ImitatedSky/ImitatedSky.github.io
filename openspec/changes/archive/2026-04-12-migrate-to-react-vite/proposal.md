# Proposal: Migrate Blog from Next.js to React (Vite)

## What

Replace the current `react-app/` (Next.js 16) with a new `react-app/` built on **Vite + React + React Router**. All existing features are preserved; the framework underneath changes.

## Why

The original goal was a plain React blog. Next.js was used in the first migration attempt but it introduces:
- Server-side conventions (App Router, layout files, generateStaticParams) that are unnecessary for a personal blog
- A heavier mental model vs. the simplicity of plain React
- Build-time constraints that are more opaque than a straightforward Vite build script

A Vite + React stack is:
- Simpler to understand and maintain
- Faster to build
- Fully static — identical GitHub Pages compatibility
- Closer to "plain React" as intended

## Scope

**In scope:**
- Replace `react-app/` with a new Vite + React app
- Re-implement all features from the Next.js version:
  - Post listing with pagination
  - Post page with rendered Markdown + TOC
  - Tags, Categories, Archives pages
  - Friend Links page
  - Local search (fuse.js)
  - Dark/light mode (localStorage)
  - Sticky sidebar (author card, recent posts, categories)
  - Hero banner on home page
  - Syntax highlighting (shiki or highlight.js)
  - SEO (page titles, og:image)
  - RSS feed + sitemap (build-time scripts)
  - CNAME + ads.txt in public/
- Build script pre-processes all Markdown posts → JSON at build time
- Deploy to `gh-page` branch via `gh-pages`

**Out of scope:**
- Comments system
- CMS / admin panel
- Server-side rendering

## Non-goals

- SSR or API routes
- MDX (plain Markdown only)
- Rewriting existing post files
