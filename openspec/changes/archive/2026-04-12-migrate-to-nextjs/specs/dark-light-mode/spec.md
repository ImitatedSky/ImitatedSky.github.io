## ADDED Requirements

### Requirement: Toggle between dark and light themes
The system SHALL provide a toggle button in the nav that switches between dark and light color themes site-wide.

#### Scenario: Default theme on first visit
- **WHEN** user visits the site for the first time with no localStorage entry
- **THEN** system applies dark theme by default

#### Scenario: Toggle to light mode
- **WHEN** user clicks the theme toggle button
- **THEN** system switches to light theme and persists the choice in localStorage

#### Scenario: Returning visitor
- **WHEN** user revisits the site and localStorage contains `theme: light`
- **THEN** system applies light theme without flash (applied before first paint via script in `<head>`)
