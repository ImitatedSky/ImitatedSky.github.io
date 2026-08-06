# Spec: page-titles

## ADDED Requirements

### Requirement: Per-page document title
系統 SHALL 於每次路由切換後更新 `document.title`：文章頁為 `<文章標題> | Imisky`，列表頁（Archives / Tags / Categories / Links / 留言板 / 標籤頁 / 分類頁）為 `<頁面名稱> | Imisky`，首頁為 `Imisky's Blog`。

#### Scenario: 進入文章頁
- **WHEN** 使用者導覽至 `/posts/Leetcode-100-Same-Tree`
- **THEN** `document.title` 為 `Leetcode#100. Same Tree | Imisky`

#### Scenario: 返回首頁
- **WHEN** 使用者從文章頁導覽回 `/`
- **THEN** `document.title` 恢復為 `Imisky's Blog`

#### Scenario: 404 頁
- **WHEN** 使用者導覽至不存在的路徑
- **THEN** `document.title` 為 `404 | Imisky`
