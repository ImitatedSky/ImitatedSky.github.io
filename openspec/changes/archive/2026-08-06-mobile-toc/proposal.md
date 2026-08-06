## Why

On viewports narrower than `xl` (1280px), the right sidebar — including the Table of Contents — is hidden. Readers of long posts on mobile/tablet have no way to navigate to a specific section without scrolling the entire article.

## What Changes

- Add a floating TOC button in the bottom-right corner, visible only on viewports below `xl` breakpoint (when sidebar is hidden)
- Tapping the button opens a TOC drawer/sheet that lists all headings in the current post
- Tapping a heading entry smooth-scrolls to that section and closes the drawer
- Active heading is highlighted as the reader scrolls (same IntersectionObserver logic as desktop TOC)
- Button and drawer only render on `PostPage`; no change to other pages

## Capabilities

### New Capabilities
- `mobile-toc`: Floating TOC button + slide-up drawer for post pages on small/medium viewports

### Modified Capabilities
<!-- No existing spec-level behavior changes -->

## Impact

- New component: `src/components/MobileTOCButton.tsx`
- Modified: `src/pages/PostPage.tsx` — import and render `<MobileTOCButton>`
- Existing `TOC` component logic (heading parse + IntersectionObserver) can be reused or referenced
- No new dependencies; uses existing Tailwind, React state, and IntersectionObserver
