## Context

The blog renders post Markdown as HTML via `dangerouslySetInnerHTML`. Links in that HTML are plain `<a>` tags — React Router's `<Link>` has no effect on them. The original Markdown source posts were written for Hexo, which served them as static pages, so relative links (`../folder/slug`) and inline scripts worked differently there.

## Goals / Non-Goals

**Goals:**
- External links (http/https) in post content → `target="_blank" rel="noopener noreferrer"` (build-time, applied once)
- Internal links in post content → React Router SPA navigation (runtime click interceptor)
- Component-level links (Nav, Aside, PostCard, etc.) → already correct, maintain this

**Non-Goals:**
- Rewriting all Markdown source files (build-time transformation is sufficient)
- Adding `target="_blank"` to mailto/tel links (these open native apps, no new tab needed)
- Modifying TOC anchor links (`#heading-id`) — same-page scrolling, no new tab

## Decisions

**Build-time HTML post-processing order** (in `build-content.ts`):
1. Strip `<script>` tags — prevents arbitrary DOM manipulation from source posts
2. Rewrite `../folder/slug` → `/posts/slug` — fixes Hexo relative link convention
3. Add `target="_blank" rel="noopener noreferrer"` to `href="https?://..."` — opens external links in new tab

**Runtime click interceptor** (`useInternalLinks` hook in PostPage):
- Attaches to the prose `<div>` via event delegation (single listener, no per-link wiring)
- Guards: skip if `href` starts with `http`, `mailto:`, `tel:`, or `#`
- Calls `navigate(href)` for everything else → React Router handles it with no full reload
- Runs on `contentHtml` change so it re-attaches correctly after post navigation

**Component audit results:**
| Location | Link type | Correct? |
|----------|-----------|----------|
| Nav.tsx | Internal via `<Link>` | ✅ |
| Aside.tsx — GitHub, LinkedIn | External `<a>` with `target="_blank"` | ✅ |
| Aside.tsx — mailto | `<a href="mailto:...">` no target | ✅ (email client, no tab needed) |
| Aside.tsx — announcement | External `<a>` with `target="_blank"` | ✅ |
| PostCard.tsx | Internal via `<Link>` | ✅ |
| TagPill.tsx | Internal via `<Link>` | ✅ |
| LinksPage.tsx | External `<a>` with `target="_blank"` | ✅ |
| PostPage — copyright link | External `<a>` with `target="_blank"` | ✅ |
| PostPage — prev/next, related | Internal via `<Link>` | ✅ |
| Search.tsx | Internal via `<Link>` | ✅ |
| TOC.tsx | Same-page `<a href="#...">` | ✅ |
| Post content HTML | Fixed at build time + runtime interceptor | ✅ |

## Risks / Trade-offs

- [Script strip is a blunt regex] If a future post legitimately needs a script tag → it will be stripped → Mitigation: documented in CLAUDE.md note; acceptable trade-off for security
- [Relative link regex is opinionated] Only handles `../folder/slug` pattern, not `./slug` → Mitigation: current posts only use `../` pattern; can extend regex if other patterns appear
