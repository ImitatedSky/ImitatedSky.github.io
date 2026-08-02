## Why

Post content currently uses `max-w-none` prose and sits inside a `max-w-6xl` container shared with the sidebar. On wide monitors the prose line length is too long, making it harder to read. Ideal reading line length is 65–75 characters (roughly 600–700px). This needs to be constrained independently of the outer page layout.

## What Changes

- Constrain prose text width inside the post card to an optimal reading width (e.g. `max-w-3xl` / ~768px or `max-w-2xl` / ~672px), centered within the card
- The outer `max-w-6xl` layout and sidebar remain unchanged — only the prose content area is narrowed
- Optionally adjust heading sizes, line-height, and paragraph spacing to improve the overall reading rhythm

## Capabilities

### New Capabilities
<!-- No new capabilities; this is a CSS/layout-only change -->

### Modified Capabilities
<!-- No spec-level behavior changes -->

## Impact

- Modified: `src/pages/PostPage.tsx` — add `max-w` + `mx-auto` to prose wrapper div
- No component changes, no new dependencies
