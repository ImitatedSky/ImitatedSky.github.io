# Spec: comments-stability

## ADDED Requirements

### Requirement: Comments mount without console errors
Utterances Comments 元件 SHALL 在掛載（含 React StrictMode 雙掛載）與卸載過程中不產生任何 console error，且留言 iframe 正常載入一次、不重複。

#### Scenario: 進入文章頁
- **WHEN** 使用者開啟任一文章頁
- **THEN** console 無 `insertAdjacentHTML` 相關錯誤，且頁面上恰有一個 `iframe.utterances-frame`

#### Scenario: 快速切換文章
- **WHEN** 使用者在留言載入完成前導覽到另一篇文章
- **THEN** 不拋出錯誤，新頁面留言正常載入
