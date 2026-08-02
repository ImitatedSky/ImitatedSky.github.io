## Why

The React Vite rebuild has functional parity but several visual gaps compared to the original Hexo/Butterfly site at pochunyeh.com. Users visiting the rebuilt site will notice layout, component, and style differences that make it feel like a different product.

## What Changes

- **Site title**: Change all instances of "ImitatedSky" (nav logo) to "Imisky" to match the original
- **Homepage hero**: Full-viewport-height hero with scroll-down arrow, matching the original full_page header
- **Post card layout**: Replace grid (image-top) cards with alternating horizontal left/right layout (Butterfly style)
- **Sidebar — author card**: Add post/tag/category counts (文章/標籤/分類) as stat row linking to /archives, /tags, /categories
- **Sidebar — recent posts**: Add thumbnail image to each recent post item (currently text-only)
- **Sidebar — announcement card**: Add 公告 card with static announcement text
- **Sidebar — tags cloud card**: Add tag cloud widget to sidebar
- **Sidebar — archives card**: Add monthly archives widget to sidebar
- **Nav icons**: Add Font Awesome / react-icons icons before each nav link label
- **Footer**: Update copyright year range and custom text to match original (©2020–present)
- **`sticky` field**: Parse `sticky` front matter; show pin icon on sticky posts and sort them first

## Capabilities

### New Capabilities
- `post-card-horizontal`: Alternating left/right horizontal post card layout for the home/listing pages
- `sidebar-extended`: Full Butterfly-style sidebar with stats, thumbnail recent posts, announcement, tags cloud, archives widgets

### Modified Capabilities
- `home-hero`: Hero section changes from fixed-height banner to full-viewport with scroll indicator

## Impact

- `src/components/PostCard.tsx` — replaced with horizontal layout
- `src/components/Aside.tsx` — extended with stats, thumbnails, announcement, tags, archives widgets
- `src/pages/Home.tsx` — hero height + scroll-down arrow
- `src/components/Nav.tsx` — add icons to nav links
- `src/App.tsx` — footer update
- `src/types.ts` — add `sticky` field to PostMeta
- `scripts/build-content.ts` — parse `sticky` front matter, sort sticky posts first
