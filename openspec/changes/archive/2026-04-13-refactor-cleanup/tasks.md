# Tasks: refactor-cleanup

## 1. Delete Dead Files

- [x] 1.1 Delete `src/App.css` (Vite scaffold, not imported anywhere)
- [x] 1.2 Delete `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` (Vite scaffold assets never used by the blog)
- [x] 1.3 Remove `"use client"` directive from top of `src/components/Nav.tsx`
- [x] 1.4 Run `npm run build` — verify clean build with no errors

## 2. Site Config

- [x] 2.1 Create `src/config/site.ts` with `SITE` object containing: `name`, `author`, `baseUrl`, `copyrightFrom`, `github`, `email`, `linkedin`, `announcement`, `typedStrings`; also export `NAV_LINKS` array (moved from Nav.tsx)
- [x] 2.2 Update `src/components/Nav.tsx` — import `NAV_LINKS` from site config, remove the local constant
- [x] 2.3 Update `src/components/Aside.tsx` — import `SITE.author`, `SITE.github`, `SITE.email`, `SITE.linkedin`, `SITE.announcement` from site config
- [x] 2.4 Update `src/pages/Home.tsx` — import `SITE.typedStrings` from site config, remove local `TYPED_STRINGS` constant
- [x] 2.5 Update `src/pages/PostPage.tsx` — import `SITE.author`, `SITE.baseUrl` from site config (used in copyright notice)
- [x] 2.6 Update `src/App.tsx` — import `SITE.copyrightFrom` from site config (footer copyright)
- [x] 2.7 Run `npm run build` — verify clean build

## 3. CSS Color Tokens

- [x] 3.1 Add `--color-primary: #9370db` and `--color-accent: #ff7242` to `:root` in `src/index.css`
- [x] 3.2 Replace hardcoded `#9370db` in scrollbar rules with `var(--color-primary)` (via `--scrollbar-color: var(--color-primary)`)
- [x] 3.3 Replace hardcoded `#ff7242` in `:not(pre) > code` with `var(--color-accent)`; background uses `color-mix(in srgb, var(--color-accent) 10%, transparent)`
- [x] 3.4 Replace `#4ade80` (copied state green) — left as-is (success indicator, not a theme color)
- [x] 3.5 Run `npm run build` — verify no CSS errors

## 4. TagPill Component

- [x] 4.1 Create `src/components/TagPill.tsx` — `<Link to="/tags/:tag">#{tag}</Link>` with two variants: `"default"` (light bg, for cards/listing) and `"overlay"` (white/translucent, for dark banner). Props: `tag: string`, `variant?: "default" | "overlay"`, `className?: string`
- [x] 4.2 Replace tag pills in `src/components/PostCard.tsx` with `<TagPill variant="default" />`
- [x] 4.3 Replace tag pills in `src/pages/PostPage.tsx` banner with `<TagPill variant="overlay" />`
- [x] 4.4 Run `npm run build` — verify no errors; spot-check a post page and home page visually

## 5. CoverImage Component

- [x] 5.1 Create `src/components/CoverImage.tsx` — renders `<div className={cn("relative overflow-hidden", className)}>`, an `<img>` (or gradient fallback div), a `<div className="absolute inset-0 {overlay}">`, and `{children}` overlay content. Props: `src?: string`, `alt?: string`, `fallback?: ReactNode`, `overlay?: string` (Tailwind class, default `"bg-black/50"`), `className?: string`, `children?: ReactNode`
- [x] 5.2 Refactor `src/components/PageBanner.tsx` to use `<CoverImage>` internally
- [x] 5.3 Refactor the cover banner section in `src/pages/PostPage.tsx` to use `<CoverImage>`
- [x] 5.4 Run `npm run build` — verify no errors; check that PageBanner and PostPage banners still look correct

## 6. Final Verification

- [x] 6.1 Run `npm run build` — full clean build, 107 posts, no TypeScript errors
- [ ] 6.2 Start dev server (`npm run dev`) and smoke-test: home page hero + typed animation, a post page (banner, code blocks, tags), archives, tags, links pages
- [ ] 6.3 Confirm no visual regressions: card layout, banners, sidebar, dark/light mode toggle
- [ ] 6.4 Confirm changing `SITE.name` in `site.ts` would be the only edit needed to rename the blog
