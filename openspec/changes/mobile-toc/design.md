## Context

`PostPage.tsx` has a right sidebar (`hidden xl:flex`) containing TOC + Aside. On viewports below 1280px the sidebar is hidden. The existing `TOC` component already parses headings from `contentHtml` and tracks active heading via IntersectionObserver. The goal is to expose this same TOC on small screens via a floating button + slide-up drawer.

## Goals / Non-Goals

**Goals:**
- Floating circular button (bottom-right) visible only below `xl` breakpoint
- Tapping opens a slide-up drawer listing all headings
- Tapping a heading scrolls to it and closes the drawer
- Active heading highlighted as reader scrolls
- Self-contained in a single new component `MobileTOCButton`

**Non-Goals:**
- Changing the desktop sidebar or `TOC` component
- Adding mobile TOC to pages other than `PostPage`
- Persisting drawer open/closed state across navigation

## Decisions

**Single self-contained component**: `MobileTOCButton` receives `html: string` (same as `TOC`), parses headings internally, and manages its own open/active state. This avoids prop-drilling through `PostPage` and keeps the desktop `TOC` unchanged.

**Slide-up drawer vs modal**: Drawer slides up from the bottom edge — matches mobile UX conventions better than a centered modal for list navigation. Implemented with a fixed-position overlay + panel using Tailwind `translate-y` transition.

**Reuse IntersectionObserver logic**: Copy the same observer setup from `TOC.tsx` (rootMargin `0px 0px -70% 0px`) rather than importing from a shared util, keeping both components independently understandable.

**Show/hide with Tailwind responsive prefix**: Button renders in DOM always but uses `xl:hidden` so it disappears at large breakpoints. This avoids a JS window-resize listener.

**Icon**: Use `FiList` (react-icons/fi) for the button icon — recognizable "list" affordance.

## Risks / Trade-offs

- [Heading parse runs twice] Both desktop `TOC` and `MobileTOCButton` parse headings from `contentHtml`. Parsing is cheap (DOM creation on string), acceptable duplication.
- [Drawer z-index] Must be above navbar (`z-50`) — use `z-[60]` for overlay and `z-[61]` for panel.
- [Short posts] If no headings, button is hidden (same behavior as `TOC` returning null).
