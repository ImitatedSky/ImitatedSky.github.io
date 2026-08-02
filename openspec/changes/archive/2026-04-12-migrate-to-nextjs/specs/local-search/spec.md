## ADDED Requirements

### Requirement: Build-time search index generation
The system SHALL generate a `search-index.json` file at build time containing each post's slug, title, tags, category, and a plain-text excerpt (first 200 characters of body).

#### Scenario: Build completes
- **WHEN** `next build` finishes
- **THEN** `out/search-index.json` exists and contains one entry per post

### Requirement: Client-side fuzzy search
The system SHALL provide a search UI that uses `fuse.js` to fuzzy-search the index across title, tags, category, and excerpt fields.

#### Scenario: User types a query
- **WHEN** user types "binary tree" in the search input
- **THEN** system displays matching post titles in real time with no page reload

#### Scenario: No results
- **WHEN** user types a query with no matches
- **THEN** system displays a "no results found" message
