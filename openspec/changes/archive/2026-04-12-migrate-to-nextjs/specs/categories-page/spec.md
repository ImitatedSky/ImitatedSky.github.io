## ADDED Requirements

### Requirement: Display all categories
The system SHALL render a `/categories/` page listing every unique category with post count.

#### Scenario: Categories page visit
- **WHEN** user navigates to `/categories/`
- **THEN** system displays all categories with post counts

### Requirement: Category filtered post list
The system SHALL render a `/categories/:category/` page listing all posts in that category, in reverse-chronological order.

#### Scenario: Clicking a category
- **WHEN** user clicks category "Leetcode"
- **THEN** system navigates to `/categories/Leetcode/` and lists all posts in that category
