# Spec: prerendered-meta

## ADDED Requirements

### Requirement: Per-route static HTML with page-specific meta
Build SHALL 為每個已知路由產生實體 `index.html`，其 `<head>` 含該頁專屬的 `<title>`、`<meta name="description">`、`<link rel="canonical">`，以及 Open Graph 與 Twitter card 標籤。

#### Scenario: 文章路由
- **WHEN** build 完成後檢查 `dist/posts/Leetcode-100-Same-Tree/index.html`
- **THEN** `<title>` 為 `Leetcode#100. Same Tree | Imisky`，`og:title` 相同，`og:description` 為該文 excerpt，`og:image` 為該文 cover 的絕對網址，`og:type` 為 `article`，canonical 為 `https://pochunyeh.com/posts/Leetcode-100-Same-Tree/`

#### Scenario: 首頁
- **WHEN** 檢查 `dist/index.html`
- **THEN** `<title>` 為 `Imisky's Blog`，`og:type` 為 `website`，canonical 為 `https://pochunyeh.com/`

#### Scenario: 列表路由
- **WHEN** 檢查 `dist/archives/index.html` 與 `dist/tags/Leetcode/index.html`
- **THEN** 各自帶有對應的 title 與 canonical，且不與其他頁重複

#### Scenario: SPA 仍正常接手
- **WHEN** 瀏覽器載入任一 prerender 後的路由
- **THEN** React 正常掛載、頁面互動如常、console 無錯誤

### Requirement: Deep links resolve without redirect
已知路由 SHALL 由實體檔案直接供應，不經過 404.html 的 query-string 轉址。

#### Scenario: 直接開啟文章網址
- **WHEN** 使用者直接訪問 `https://pochunyeh.com/posts/<slug>`
- **THEN** 網址列不出現 `?/` 轉址中間態，頁面直接載入

### Requirement: Sitemap includes lastmod
sitemap.xml 的每個文章 entry SHALL 包含 `<lastmod>`，取該文 `updated ?? date`。

#### Scenario: 檢查 sitemap
- **WHEN** build 後讀取 `dist/sitemap.xml`
- **THEN** 文章 entry 含 `<lastmod>YYYY-MM-DD</lastmod>`
