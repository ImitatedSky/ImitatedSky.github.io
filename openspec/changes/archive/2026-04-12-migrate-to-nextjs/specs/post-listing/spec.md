## ADDED Requirements

### Requirement: Display paginated post list on home page
The system SHALL render a home page listing all published posts in reverse-chronological order, paginated at 10 posts per page.

#### Scenario: First page load
- **WHEN** user visits `/`
- **THEN** system displays the 10 most recent posts with cover image, title, date, category, and tag badges

#### Scenario: Navigate to next page
- **WHEN** user clicks the next-page control
- **THEN** system navigates to `/page/2/` and displays the next 10 posts

#### Scenario: Last page has fewer than 10 posts
- **WHEN** the final page contains fewer than 10 posts
- **THEN** system displays only the remaining posts without empty placeholders

### Requirement: Post card shows cover image
The system SHALL display the post's `cover` front matter value as the card thumbnail; if absent, the system SHALL use the default cover (`/img/cover/cover02.jpg`).

#### Scenario: Post with custom cover
- **WHEN** post front matter contains `cover: /img/cover/leetcode.jpg`
- **THEN** card displays that image as thumbnail

#### Scenario: Post without cover
- **WHEN** post front matter omits `cover`
- **THEN** card displays the default cover image
