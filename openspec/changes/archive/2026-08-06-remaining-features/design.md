## Context

The React/Vite blog uses React Router v6 BrowserRouter, Tailwind CSS v4, and a build-time content pipeline (`scripts/build-content.ts` → `public/content/*.json`). Components are in `src/components/`, pages in `src/pages/`. The app has a single `App.tsx` root that renders `Nav`, `Search`, `<main>`, and `<footer>`.

## Goals / Non-Goals

**Goals:**
- Back-to-top button rendered globally (inside App.tsx)
- Reading progress bar scoped to PostPage only
- Utterances comments via iframe in PostPage and MessageBoardPage (shared component)
- Reading time displayed in PostPage banner meta
- medium-zoom applied to prose images after post HTML renders
- `/messageboard` route and nav link
- Global `/` and `Ctrl+K` keyboard shortcut to open search

**Non-Goals:**
- Busuanzi view count (external CDN, unreliable in China)
- Activate-power-mode keyboard effect (author-only tool)
- PJAX page transitions (React Router already handles SPA navigation)
- Server-side comment counts

## Decisions

**Back-to-top button**: New `BackToTop.tsx` component with a `useEffect` scroll listener. Uses `window.scrollY > 300` threshold. Styled as a fixed 44px round button, bottom-right, purple `#9370db` background. Placed in `App.tsx` outside `<main>`.

**Reading progress bar**: A `useEffect` in `PostPage.tsx` that reads `window.scrollY / (document.body.scrollHeight - window.innerHeight)` and sets a fixed `<div>` width. Not extracted to a component—inline in PostPage to keep it scoped. Height 3px, position fixed top-0 left-0, purple color, `z-index: 200`.

**Utterances**: A `Comments.tsx` component that dynamically creates and appends a `<script>` tag (Utterances standard embed pattern) into a container `<div>`. Props: `repo`, `issueTerm` (slug or "pathname"), `theme`. Theme follows the app dark/light state—default `github-dark`. Rendered below the article in PostPage, and as the only content on MessageBoardPage.

**Reading time**: Strip HTML tags from `contentHtml`, split on whitespace, count words. Use 200 words/min for CJK-heavy content. Show "< 1 分鐘" for very short posts. Computed in PostPage render (no separate hook needed).

**Image zoom (medium-zoom)**: Install `medium-zoom` npm package. In PostPage, `useEffect` runs after `contentHtml` dep changes, selects `div.prose img` (the prose content div), and applies `mediumZoom(images, { margin: 24, background: 'rgba(0,0,0,0.8)' })`. Destroy on cleanup.

**MessageBoardPage**: Minimal page—`PageBanner` with title "留言板" and `<Comments>` component. Route `/messageboard` added in `App.tsx`. Nav link added to `Nav.tsx` with `FaCommentDots` icon.

**Search shortcut**: `useEffect` in `App.tsx` adds a `window` keydown listener. Trigger on `key === "/"` (when not focused on input/textarea) or `(e.ctrlKey || e.metaKey) && e.key === "k"`. Calls `setSearchOpen(true)`. Clean up on unmount.

## Risks / Trade-offs

- [Utterances iframe FOUC] Utterances loads asynchronously; comments section will appear after a short delay → Mitigation: Show a subtle "Loading comments…" placeholder div that Utterances replaces.
- [medium-zoom cleanup] If PostPage remounts rapidly, stale zoom instances could accumulate → Mitigation: Call the returned `zoom.detach()` in the useEffect cleanup.
- [Reading progress with sticky nav] The nav is `h-14` sticky, so progress bar at `top-0` sits behind nav → Mitigation: Set `z-index: 200` (above nav's z-50 = 50) but use `top: 0` since fixed positioning is relative to viewport, not document flow; the bar will overlay the nav top edge which is fine.
- [Keyboard shortcut conflict] `/` triggers search while user types in search input → Mitigation: Check `document.activeElement.tagName` is not INPUT/TEXTAREA before triggering.
