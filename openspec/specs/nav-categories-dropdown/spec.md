# nav-categories-dropdown Specification

## Purpose
TBD - created by archiving change feature-parity-gap. Update Purpose after archive.
## Requirements
### Requirement: Categories dropdown menu
導覽列的 Categories 項目 SHALL 提供下拉子選單，內容為「All（連到 /categories）」加上各分類（連到 /categories/<分類>）；桌面版滑鼠 hover 或鍵盤 focus 時展開，手機版於漢堡選單內展開。

#### Scenario: 桌面 hover 展開
- **WHEN** 桌面使用者將滑鼠移到導覽列 Categories
- **THEN** 顯示子選單，含 All 與 Leetcode 等分類連結

#### Scenario: 點選子分類
- **WHEN** 使用者點選子選單中的 Leetcode
- **THEN** 導覽至 `/categories/Leetcode` 且子選單關閉

#### Scenario: 手機展開
- **WHEN** 手機使用者展開漢堡選單並點 Categories
- **THEN** 子分類以縮排列表顯示於選單內

