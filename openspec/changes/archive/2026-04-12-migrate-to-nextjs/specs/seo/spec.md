## ADDED Requirements

### Requirement: Per-page meta tags and Open Graph
The system SHALL generate `<title>`, `<meta name="description">`, and Open Graph tags for every page using Next.js `generateMetadata`.

#### Scenario: Post page metadata
- **WHEN** search engine crawls a post page
- **THEN** `<title>` is `{post title} | Imisky` and `og:image` is the post's cover image

#### Scenario: Home page metadata
- **WHEN** search engine crawls `/`
- **THEN** `<title>` is `Imisky` and `<meta name="description">` reflects the site description

### Requirement: Sitemap generation
The system SHALL output `sitemap.xml` in the static export containing URLs for all posts, tag pages, category pages, and static pages.

#### Scenario: Build output
- **WHEN** `next build` completes
- **THEN** `out/sitemap.xml` exists and lists all public page URLs

### Requirement: RSS feed
The system SHALL output `rss.xml` in the static export listing the 20 most recent posts with title, link, and publish date.

#### Scenario: Feed access
- **WHEN** user or feed reader fetches `/rss.xml`
- **THEN** valid RSS 2.0 XML is returned with recent post entries
