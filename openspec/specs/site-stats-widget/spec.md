# site-stats-widget Specification

## Purpose
TBD - created by archiving change feature-parity-gap. Update Purpose after archive.
## Requirements
### Requirement: Site info card in aside
側欄 SHALL 顯示「網站資訊」卡片，內容至少包含：文章總數、最後更新日期（取全部文章 `updated ?? date` 的最大值，於 build 時計算）。

#### Scenario: 首頁側欄
- **WHEN** 使用者開啟首頁
- **THEN** 側欄出現網站資訊卡，文章總數等於 index.json 的文章數，最後更新日期為最新一篇的日期

#### Scenario: busuanzi 未啟用（預設）
- **WHEN** busuanzi 開關為關（預設值）
- **THEN** 卡片不顯示 UV/PV 欄位，也不載入 busuanzi script

