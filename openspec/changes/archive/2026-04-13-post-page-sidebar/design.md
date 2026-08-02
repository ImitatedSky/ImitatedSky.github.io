## Context

`PostPage.tsx` has a right sidebar column (`hidden xl:block w-72`). Originally it only contained `<TOC>`. The goal is to match the original pochunyeh.com sidebar which shows: Author card → 公告 → TOC → 最新文章 → 分類 → 標籤 → 歸檔.

## Goals / Non-Goals

**Goals:**
- Sidebar order: Author card → 公告 → TOC → 最新文章 → 分類 → 標籤 → 歸檔
- **Only TOC is sticky** (user requirement: "只有目錄要鎖住"). All other widgets (author card, announcement, recent posts, categories, tags) scroll normally with the page.
- No overflow scrollbars on the sidebar itself

**Non-Goals:**
- Making the whole sidebar sticky
- Changing the Aside component's core widgets

## Decisions

**`tocSlot` prop on Aside**: Aside renders the ordered list of widgets. A `tocSlot?: React.ReactNode` prop is inserted between the 公告 card and the 最新文章 section. `PostPage` passes `<div className="sticky top-20"><TOC html={...} /></div>` as the slot — so only the TOC wrapper is sticky.

**Sidebar outer div**: `self-stretch` (not `self-start`, not sticky itself). This makes the sidebar column span the full height of the flex row (= article height). This is required for `position: sticky` to have enough containing-block height to operate. Without `self-stretch`, the sidebar is only as tall as the Aside content and the sticky element may not work.

**Iteration history (what did NOT work):**
1. Whole sidebar `sticky + overflow-hidden + max-h` → clips Aside content, all widgets locked
2. Outer `self-stretch`, TOC first then Aside below (wrong order: TOC above author card)
3. `tocSlot` added (correct order) BUT outer sidebar made `sticky top-20 self-start` → all widgets locked again

**Correct approach:**
- Outer sidebar: `hidden xl:block w-72 shrink-0 self-stretch` (NOT sticky)
- tocSlot content: `<div className="sticky top-20"><TOC .../></div>`
- Aside: `sticky={false}` (outer Aside div not sticky)

## Risks / Trade-offs

- [TOC sticky boundary] Sticky is bounded by its containing block (Aside div). Once Aside fully scrolls past the viewport, TOC scrolls with it. This is acceptable — for long posts, Aside div is tall enough to keep TOC sticky throughout most of reading.
- [Sidebar shorter than viewport] On posts with no headings, TOC returns null; Aside content just flows normally. No issue.
