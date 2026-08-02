## ADDED Requirements

### Requirement: Highlight code blocks in post body
The system SHALL apply syntax highlighting to all fenced code blocks using `rehype-pretty-code` with the `shiki` transformer, supporting at minimum: Python, JavaScript, TypeScript, Bash, C#, Go, Java, JSON, YAML, Markdown.

#### Scenario: Fenced code block with language hint
- **WHEN** Markdown contains ` ```python ` fenced block
- **THEN** rendered HTML contains tokenized, colored code using the configured theme

#### Scenario: Fenced code block without language hint
- **WHEN** Markdown contains ` ``` ` with no language identifier
- **THEN** rendered HTML displays the code in a monospace block without color tokens

### Requirement: Display line numbers
The system SHALL render line numbers alongside code blocks.

#### Scenario: Multi-line code block
- **WHEN** a code block contains more than one line
- **THEN** each line is prefixed with its line number in the rendered output
