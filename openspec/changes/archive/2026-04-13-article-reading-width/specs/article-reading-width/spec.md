## ADDED Requirements

### Requirement: Prose content constrained to reading width
The post article text (prose area) SHALL be constrained to a maximum width of approximately 672px (`max-w-2xl`) and centered within its card container, regardless of the card's own width.

#### Scenario: Prose width on wide viewport
- **WHEN** user views a post on a viewport wider than 1280px
- **THEN** the article text column is centered and no wider than ~672px

#### Scenario: Code blocks scroll horizontally
- **WHEN** a code block inside the article is wider than the prose column
- **THEN** the code block scrolls horizontally without breaking the page layout
