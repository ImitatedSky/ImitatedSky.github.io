## ADDED Requirements

### Requirement: Render sticky TOC sidebar on post pages
The system SHALL extract all `##` and `###` headings from a post's Markdown and render them as a clickable, sticky sidebar Table of Contents on desktop viewports.

#### Scenario: Post with multiple headings
- **WHEN** post body contains `##` and `###` headings
- **THEN** TOC sidebar lists each heading as an anchor link in document order

#### Scenario: TOC hidden on mobile
- **WHEN** viewport width is below 1024px
- **THEN** TOC sidebar is hidden (not rendered or display:none)

### Requirement: Active heading highlight
The system SHALL highlight the TOC entry corresponding to the heading currently in the viewport during scroll.

#### Scenario: Scrolling past a heading
- **WHEN** user scrolls and a heading enters the viewport
- **THEN** the corresponding TOC item receives the active visual style
