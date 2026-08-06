## Why

The React/Vite blog rebuild is functionally complete but missing several UX features that exist on the original pochunyeh.com (Butterfly/Hexo) site. These features improve reader experience (comments, image zoom, reading time) and site polish (back-to-top, progress bar, keyboard shortcuts).

## What Changes

- Add floating back-to-top button (round, purple #9370db) that appears after scrolling 300px
- Add reading progress bar at the top of the viewport on PostPage, tracking scroll position through the article
- Add Utterances GitHub-issue-based comments to PostPage (repo: ImitatedSky/blog-utterances)
- Add estimated reading time ("X 分鐘閱讀") in the PostPage banner meta, computed from contentHtml word count
- Add image zoom/lightbox to prose images using `medium-zoom` npm package
- Add Message Board page at `/messageboard` with PageBanner + Utterances embed; add nav link
- Add keyboard shortcut: press `/` or `Ctrl+K` anywhere to open search modal

## Capabilities

### New Capabilities

- `back-to-top`: Floating scroll-to-top button shown globally after 300px scroll
- `reading-progress`: Thin progress bar fixed at top of viewport, visible only on PostPage
- `comments`: Utterances iframe embed for GitHub-issue-based comments on PostPage and MessageBoardPage
- `reading-time`: Estimated reading time computed from post word count, shown in PostPage banner
- `image-zoom`: medium-zoom lightbox applied to all prose images in PostPage
- `messageboard-page`: New route `/messageboard` with banner and comments section
- `search-shortcut`: Global keydown handler opening search modal on `/` or `Ctrl+K`

### Modified Capabilities

## Impact

- `src/App.tsx`: add search shortcut keydown listener, add `/messageboard` route, add nav link
- `src/components/Nav.tsx`: add MessageBoard link (FaCommentDots icon)
- `src/pages/PostPage.tsx`: add progress bar, reading time, Utterances embed, medium-zoom init
- `src/pages/MessageBoardPage.tsx`: new file
- `src/components/BackToTop.tsx`: new component, rendered in App.tsx
- `src/components/Comments.tsx`: new reusable Utterances component
- `react-app/package.json`: add `medium-zoom`
