# back-to-top-percent Specification

## Purpose
TBD - created by archiving change feature-parity-gap. Update Purpose after archive.
## Requirements
### Requirement: Scroll percentage in back-to-top button
Back-to-top 按鈕於頁面捲動超過 300px 顯示時，SHALL 顯示目前捲動百分比（0–99 的整數）；滑鼠 hover 時切換為向上箭頭；點擊行為維持平滑捲動至頂。

#### Scenario: 捲動至頁面中段
- **WHEN** 使用者捲動至頁面約 50% 位置
- **THEN** 按鈕顯示約 `50` 的百分比數字

#### Scenario: hover 顯示箭頭
- **WHEN** 使用者將滑鼠移到按鈕上
- **THEN** 按鈕改顯示向上箭頭，點擊後平滑回到頂部

