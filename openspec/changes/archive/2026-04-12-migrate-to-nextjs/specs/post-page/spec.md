## ADDED Requirements

### Requirement: Render individual post at permalink
The system SHALL render each post at `/posts/:title/` where `:title` matches the post filename (slug), with full Markdown body, front matter metadata, and cover image banner.

#### Scenario: Valid post slug
- **WHEN** user navigates to `/posts/Leetcode-100-Same-Tree/`
- **THEN** system displays the post title, date, category, tags, cover image, and rendered Markdown body

#### Scenario: Unknown slug
- **WHEN** user navigates to a slug that does not match any post
- **THEN** system returns a 404 page

### Requirement: Front matter tag normalization
The system SHALL normalize post tags that use the `- [tagname]` bracket syntax into plain strings at build time.

#### Scenario: Bracket-wrapped tag
- **WHEN** front matter contains `- [Leetcode]`
- **THEN** the parsed tag value is the string `Leetcode` without brackets

### Requirement: Display post metadata
The system SHALL show publish date, category, and tag list below the post title.

#### Scenario: Post with all metadata
- **WHEN** post has title, date, category, and tags
- **THEN** all four fields are rendered in the post header area
