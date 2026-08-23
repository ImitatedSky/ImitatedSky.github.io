# full-content-rss Specification

## Purpose
TBD - created by archiving change leetcode-index-and-nav. Update Purpose after archive.
## Requirements
### Requirement: RSS carries full post content
`rss.xml` 的每個 item SHALL 包含文章全文 HTML（置於 CDATA 中），而非僅摘要，使訂閱者無需點回網站即可閱讀。

#### Scenario: 檢查 RSS 內容
- **WHEN** build 後讀取 `rss.xml`
- **THEN** 每個 item 的內容長度明顯大於 200 字摘要，且 XML 可被正常解析

#### Scenario: 含程式碼的文章
- **WHEN** 文章含 code block
- **THEN** RSS 中該文內容包含 code block 的 HTML，且不破壞 XML 結構

