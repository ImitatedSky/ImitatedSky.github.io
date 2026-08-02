## Context

The original site uses Hexo + Butterfly theme. The rebuild uses React + Vite + Tailwind CSS v4. The original Butterfly theme renders post cards in a horizontal alternating layout and has a rich multi-widget sidebar. The current rebuild has a grid card layout and a minimal sidebar. All data comes from pre-built JSON files — no server-side rendering.

## Goals / Non-Goals

**Goals:**
- Match the original site's visual layout as closely as practical in React/Tailwind
- Improve the sidebar with stats, thumbnail recent posts, tags cloud, archives, and announcement
- Horizontal alternating post card layout on home/listing pages
- Full-viewport hero with scroll-down indicator on homepage
- Icons on nav links

**Non-Goals:**
- Pixel-perfect replication of every Butterfly CSS detail
- Dynamic features requiring a backend (comments, view counts, real-time data)
- Paginated sidebar (tags/archives in sidebar are limited to top N, not full lists)

## Decisions

**Post card layout — horizontal alternating:**
Each PostCard in listing pages renders image left for even indexes, image right for odd indexes (matching Butterfly `.post_cover.left/.right`). Image takes ~40% width, content takes ~60%. On mobile, stacks vertically.

**Sidebar stats row:**
Post/tag/category counts are derived client-side from `usePosts()` data — `posts.length`, unique tag count, unique category count. Links to `/archives`, `/tags`, `/categories`.

**Sidebar recent posts thumbnails:**
Add `<img>` from `p.cover` alongside each recent post item. Cover image takes a fixed 60×60 rounded square.

**Sidebar tags cloud:**
Pull all tags from `usePosts()` with counts. Show up to 30 tags, font-size scaled by count. Limit to keep sidebar compact.

**Sidebar archives widget:**
Group posts by year, show year + count, link to `/archives`. Top 5 years only in sidebar.

**Sticky posts:**
Parse `sticky` front matter (integer; higher = more sticky). Add `sticky` field to `PostMeta`. In `build-content.ts`, sort: sticky posts first (by sticky value desc), then by date desc.

**Nav icons:**
Use `react-icons/fa` to add icons matching the originals: FaHome, FaArchive, FaTags, FaFolderOpen, FaLink.

## Risks / Trade-offs

- [Horizontal card layout on small screens] → Collapses to vertical stacked layout below `md` breakpoint
- [Tag/archives counts in sidebar] → Computed client-side on every render; acceptable for ~100 posts
- [Sticky sorting] → Requires re-running `npm run build` to pick up changes to `sticky` front matter

## Migration Plan

No data migration needed. All changes are UI components and one build-script field addition. Run `npm run build` after changes to regenerate JSON with `sticky` field.
