## Why

Links across the blog had inconsistent behavior: external links in post content opened in the same tab (breaking reading flow), internal relative links in post content navigated to wrong routes (404), and an inline `<script>` tag in one post ran arbitrary DOM manipulation on every link on the page. Clicking a link should either open a new tab (external) or navigate within the SPA without a full reload (internal).

## What Changes

**Already fixed (as of this audit):**
- `scripts/build-content.ts` — post-process generated HTML to:
  - Strip `<script>` tags from post content
  - Rewrite `../folder/slug` relative hrefs → `/posts/slug`
  - Add `target="_blank" rel="noopener noreferrer"` to all `href="https://..."` external links
- `src/pages/PostPage.tsx` — `useInternalLinks` hook intercepts clicks on internal `<a>` links in the prose div and routes via React Router `navigate()`, preventing full page reloads

**Remaining audit items to verify:**
- All component-level external links have correct `target` + `rel`
- All component-level internal links use `<Link>` (not plain `<a>`)
- `<Link>` components do NOT have `target="_blank"` unless intentionally external

## Capabilities

### New Capabilities

- `link-behavior`: Consistent link-click behavior — external opens new tab, internal uses SPA routing

### Modified Capabilities

## Impact

- `scripts/build-content.ts` — HTML post-processing (script strip, relative link rewrite, external link attributes)
- `src/pages/PostPage.tsx` — `useInternalLinks` hook (click delegation on prose div)
- No component changes needed (Aside, LinksPage, Nav, PostCard all already correct)
