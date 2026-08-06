## ADDED Requirements

### Requirement: Floating TOC button on small viewports
The system SHALL display a floating circular button in the bottom-right corner of the viewport on PostPage when the viewport width is below the `xl` breakpoint (1280px). The button SHALL be hidden at `xl` and above. The button SHALL not render if the post has no headings.

#### Scenario: Button visible on small screen
- **WHEN** user opens a post page on a viewport narrower than 1280px
- **THEN** a circular floating button appears in the bottom-right corner

#### Scenario: Button hidden on large screen
- **WHEN** user opens a post page on a viewport 1280px or wider
- **THEN** no floating TOC button is visible

#### Scenario: No button when post has no headings
- **WHEN** user opens a post with no h2/h3 headings on a small viewport
- **THEN** the floating TOC button does not appear

### Requirement: TOC drawer opens and closes
Tapping the floating button SHALL open a slide-up drawer from the bottom of the viewport listing all h2/h3 headings in the post. Tapping the button again, tapping outside the drawer, or tapping a heading entry SHALL close the drawer.

#### Scenario: Open drawer
- **WHEN** user taps the floating TOC button
- **THEN** a drawer slides up from the bottom showing all post headings

#### Scenario: Close by tapping overlay
- **WHEN** drawer is open and user taps the darkened overlay outside the drawer
- **THEN** the drawer closes

#### Scenario: Close by tapping heading
- **WHEN** drawer is open and user taps a heading entry
- **THEN** the drawer closes and the page scrolls smoothly to that heading

### Requirement: Active heading highlight in drawer
The drawer SHALL highlight the currently-visible heading (the one nearest the top of the viewport) using the same IntersectionObserver approach as the desktop TOC.

#### Scenario: Active heading highlighted
- **WHEN** drawer is open while reading a post
- **THEN** the heading currently in view is highlighted in blue
