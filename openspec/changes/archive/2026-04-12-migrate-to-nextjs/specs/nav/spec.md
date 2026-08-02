## ADDED Requirements

### Requirement: Persistent top navigation bar
The system SHALL render a top navigation bar visible on all pages containing links to: Home, Archives, Tags, Categories, Links, and a Search trigger.

#### Scenario: Nav renders on all pages
- **WHEN** user visits any page (post, home, tags, etc.)
- **THEN** the navigation bar is visible at the top of the page

### Requirement: Responsive mobile navigation
The system SHALL collapse the nav links into a hamburger menu on viewports below 768px.

#### Scenario: Mobile viewport
- **WHEN** viewport width is below 768px
- **THEN** nav links are hidden and a hamburger icon is shown

#### Scenario: Hamburger menu open
- **WHEN** user taps the hamburger icon
- **THEN** nav links slide in as a drawer or dropdown

### Requirement: Active page highlight
The system SHALL visually distinguish the nav link corresponding to the current page.

#### Scenario: Visiting Tags page
- **WHEN** user is on `/tags/`
- **THEN** the Tags nav link receives the active style
