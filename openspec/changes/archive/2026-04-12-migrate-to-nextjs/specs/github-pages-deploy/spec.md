## ADDED Requirements

### Requirement: Static export produces deployable output
The system SHALL produce a fully static `react-app/out/` directory via `next build` with `output: 'export'` configured, containing all HTML, CSS, JS, and asset files.

#### Scenario: Build completes
- **WHEN** `npm run build` runs inside `react-app/`
- **THEN** `react-app/out/` directory exists with `index.html` and all static page files

### Requirement: Deploy to gh-page branch
The system SHALL push the contents of `react-app/out/` to the `gh-page` branch of the GitHub repository using the `gh-pages` npm package.

#### Scenario: Deploy command
- **WHEN** `npm run deploy` runs inside `react-app/`
- **THEN** `out/` is pushed to the `gh-page` branch and the live site at `pochunyeh.com` updates
