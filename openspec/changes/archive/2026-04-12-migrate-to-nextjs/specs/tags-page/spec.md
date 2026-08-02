## ADDED Requirements

### Requirement: Display all tags with post counts
The system SHALL render a `/tags/` page listing every unique tag across all posts, each showing the number of posts with that tag.

#### Scenario: Tags page visit
- **WHEN** user navigates to `/tags/`
- **THEN** system displays all tags as a cloud or list with per-tag post counts

### Requirement: Tag filtered post list
The system SHALL render a `/tags/:tag/` page listing all posts that have the given tag, in reverse-chronological order.

#### Scenario: Clicking a tag
- **WHEN** user clicks tag "Leetcode"
- **THEN** system navigates to `/tags/Leetcode/` and lists all Leetcode-tagged posts
