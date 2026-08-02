## Context

The blog is a Vite + React + TypeScript SPA. All styling uses Tailwind CSS v4. There is no Next.js in the stack — the `"use client"` directive in `Nav.tsx` is a leftover from an earlier scaffold copy-paste and does nothing. The `src/assets/` folder contains three Vite boilerplate files (`react.svg`, `vite.svg`, `hero.png`) and `src/App.css` is a Vite default stylesheet — none are imported anywhere in the blog.

## Goals / Non-Goals

**Goals:**
- One file (`src/config/site.ts`) owns every hardcoded string an editor would want to change: site name, author, URLs, nav structure, typed subtitle strings, announcement text, copyright year
- Two CSS custom properties (`--color-primary`, `--color-accent`) in `:root` cover the two non-Tailwind colors used across the codebase (`#9370db` purple, `#ff7242` orange)
- `TagPill.tsx` eliminates the duplicated tag link pattern between PostCard and PostPage
- `CoverImage.tsx` eliminates the duplicated `img + black overlay` pattern between PageBanner and PostPage banner
- Dead files deleted, `"use client"` removed
- Full build and smoke test after every group of changes

**Non-Goals:**
- Full design token system — only the two non-Tailwind colors need extraction; Tailwind utility classes stay inline
- Changing any visual appearance — pure refactor, zero regression
- Migrating to a different CSS architecture
- Centralizing Tailwind class strings into JS constants (too verbose, no real benefit)

## Decisions

**`src/config/site.ts` structure:**
```ts
export const SITE = {
  name: "Imisky",
  author: "ImitatedSky",
  baseUrl: "https://pochunyeh.com",
  copyrightFrom: 2020,
  github: "https://github.com/ImitatedSky",
  email: "yehforlivelihood@gmail.com",
  linkedin: "https://www.linkedin.com/in/pochunyeh1997/",
  announcement: "如果在使用中遇到問題，可以到 ...",
  typedStrings: ["比起華爾茲...", ...],
};

export const NAV_LINKS = [...]; // moved from Nav.tsx
```
Simple plain object — no class, no proxy, just import what you need.

**CSS custom properties**: Add to `:root` in `index.css`. Replace the two hardcoded hex values:
- `--color-primary: #9370db` (purple — scrollbar, back-to-top button, progress bar)
- `--color-accent: #ff7242` (orange — inline code highlight)
Then update `.copy-code-btn.copied`, `::-webkit-scrollbar-thumb`, and `:not(pre) > code` to use `var(--color-primary)` / `var(--color-accent)`.

**`TagPill.tsx`**: Accepts `tag: string` and optionally `className`. Renders a `<Link to="/tags/:tag">` with the standard pill style. Two visual variants — light background (card/listing) and white/translucent (dark banner overlay) — controlled by a `variant?: "default" | "overlay"` prop.

**`CoverImage.tsx`**: Accepts `src`, `alt`, `fallback` (gradient JSX fallback when no image), `overlay` (opacity string, default `"bg-black/45"`), and `children` (overlay content). Renders relative container, `<img>`, overlay div, children. Used by PageBanner (fixed-height banner) and PostPage (same pattern, different height class passed via `className`).

**Deletion strategy**: Use `git rm` so deletions are tracked in version history. Check that `App.css` is not imported in `main.tsx` before deleting (it should not be — the blog only imports `index.css`).

## Risks / Trade-offs

- [Accidental regression from CoverImage refactor] The PostPage banner and PageBanner have slightly different structure → Mitigation: run full build + visual smoke-test after each component extraction before proceeding to the next.
- [SITE object import adds a module boundary] Any circular import between site.ts and components would break the build → Mitigation: `site.ts` must never import from `src/` — it is a leaf module with no internal dependencies (only plain JS values).
- [TagPill variant prop complexity] Two variants risk over-engineering → Mitigation: only extract if both usages can share >80% of the element; otherwise leave the overlay variant inline in PostPage.
