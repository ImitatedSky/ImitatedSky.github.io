## ADDED Requirements

### Requirement: Render friend links from link.yml
The system SHALL read `source/_data/link.yml` at build time and render a `/links/` page displaying each link as a card with name, avatar, and description grouped by `class_name`.

#### Scenario: Links page visit
- **WHEN** user navigates to `/links/`
- **THEN** system displays all link groups and cards as defined in `link.yml`

#### Scenario: Missing avatar image
- **WHEN** a link entry's avatar image path does not resolve
- **THEN** system displays a fallback placeholder image (`/img/friend_404.gif`)
