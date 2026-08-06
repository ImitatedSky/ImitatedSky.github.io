# newest-comments-widget Specification

## Purpose
TBD - created by archiving change feature-parity-gap. Update Purpose after archive.
## Requirements
### Requirement: Newest comments card in aside
側欄 SHALL 顯示「最新留言」卡片：透過 GitHub REST API 讀取 `ImitatedSky/blog-utterances` repo 最近 6 則 issue comments，顯示留言者頭像、名稱、留言摘要與時間；結果以 localStorage 快取 5 分鐘；API 失敗或無留言時整張卡片隱藏且不報錯。

#### Scenario: 正常載入
- **WHEN** 側欄渲染且 GitHub API 回應成功
- **THEN** 卡片顯示最多 6 則最新留言，點擊導向對應 issue

#### Scenario: API 失敗
- **WHEN** GitHub API 回傳錯誤或逾時
- **THEN** 卡片不渲染，console 無未攔截錯誤

#### Scenario: 五分鐘內重複瀏覽
- **WHEN** 使用者於 5 分鐘內再次載入頁面
- **THEN** 使用 localStorage 快取，不再次呼叫 API

