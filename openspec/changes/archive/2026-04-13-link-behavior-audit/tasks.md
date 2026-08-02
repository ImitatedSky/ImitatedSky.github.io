# Tasks: link-behavior-audit

## 1. Build-time HTML Fixes (build-content.ts)

- [x] 1.1 Strip `<script>` tags from post HTML after rendering
- [x] 1.2 Rewrite `../folder/slug` relative hrefs → `/posts/slug`
- [x] 1.3 Add `target="_blank" rel="noopener noreferrer"` to all `href="https?://..."` external links in post HTML

## 2. Runtime Click Interceptor (PostPage.tsx)

- [x] 2.1 Add `useInternalLinks(proseRef, contentHtml)` hook — event delegation on prose div, calls `navigate()` for internal links, skips external/mailto/anchor
- [x] 2.2 Attach `proseRef` to prose `<div>` in PostPage render

## 3. Component-level Link Audit

- [x] 3.1 Nav.tsx — all internal, using `<Link>` ✅
- [x] 3.2 Aside.tsx — GitHub/LinkedIn/announcement external: have `target="_blank"` ✅; mailto: no target (correct) ✅
- [x] 3.3 PostCard.tsx — internal via `<Link>` ✅; TagPill uses `<Link>` ✅
- [x] 3.4 LinksPage.tsx — all external, have `target="_blank" rel="noopener noreferrer"` ✅
- [x] 3.5 PostPage — copyright link external with `target="_blank"` ✅; prev/next/related via `<Link>` ✅
- [x] 3.6 Search.tsx — results via `<Link>` ✅
- [x] 3.7 TOC.tsx — same-page `#anchor` links, no target needed ✅

## 4. Verification

- [x] 4.1 Build passes clean — `npm run build`
- [x] 4.2 Verified external link in post HTML (Leetcode-300): now has `target="_blank" rel="noopener noreferrer"`
- [x] 4.3 Verified `<script>` tag stripped from Leetcode-快速複習的題目 post HTML
- [x] 4.4 Verified relative links rewritten: `../leetcode/Leetcode-34-...` → `/posts/Leetcode-34-...`
- [ ] 4.5 Manual test: open `/posts/Leetcode-快速複習的題目`, click a post link → should navigate within SPA (no page reload)
- [ ] 4.6 Manual test: open any post with external `https://` link, click it → should open new tab
