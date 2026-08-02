## Why

The post page (`PostPage.tsx`) has its own hand-rolled two-column layout that only puts a `<TOC>` in the right sidebar. Every other listing page (Home, Archives, Tags, Categories, Links) uses `<ContentWithAside>` which renders the full `<Aside>` — author card, stats row, announcement, recent posts with thumbnails, categories list, tags cloud, archives. The post page sidebar is therefore missing all of that context, making it feel inconsistent with the rest of the site.

## What Changes

- Widen the PostPage right sidebar from `w-56` to `w-72` (matching `ContentWithAside`)
- Add `<TOC>` at the top of the right sidebar (keep existing behavior)
- Add `<Aside>` below the TOC in the same right column, separated by a small gap
- The TOC is sticky at `top-20`; the Aside content scrolls normally below it
- Both are hidden below `xl` breakpoint (same as current TOC behavior)

## Capabilities

### New Capabilities

### Modified Capabilities

- `post-page-layout`: PostPage right sidebar now contains TOC + full Aside, matching other pages

## Impact

- `src/pages/PostPage.tsx` — update sidebar column: widen to w-72, add `<Aside />` below `<TOC />`
- No changes to `Aside.tsx`, `TOC.tsx`, or any other file
