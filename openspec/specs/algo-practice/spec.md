# algo-practice Specification

## Purpose
TBD - created by archiving change algo-practice. Update Purpose after archive.
## Requirements
### Requirement: LeetCode 150 練習區
系統 SHALL 在 `/algo` 提供 LeetCode Top Interview 150 全部題目，依官方 23 個分類組織。

#### Scenario: 瀏覽題目列表
- **WHEN** 使用者開啟 `/algo/problems`
- **THEN** 顯示 150 題，可依分類、難度、完成狀態篩選並以關鍵字搜尋

#### Scenario: 題目動畫圖解
- **WHEN** 使用者開啟 `/algo/p/<slug>`
- **THEN** 顯示題意摘要、Python 解法與動畫播放器
- **AND** 播放時每一步高亮對應的 Python 程式碼行並顯示中文說明

#### Scenario: 進度保存
- **WHEN** 使用者將題目標記為完成並重新整理
- **THEN** 完成狀態仍保留

### Requirement: 排序演算法視覺化
系統 SHALL 在 `/algo/sorting` 提供至少 10 種排序演算法的長條圖動畫與 Python 寫法。

#### Scenario: 自訂輸入
- **WHEN** 使用者輸入自訂陣列或按下隨機
- **THEN** 動畫以新輸入重新產生

### Requirement: 練習模式
題目頁 SHALL 允許使用者在瀏覽器內撰寫 Python 並執行測試。

#### Scenario: 執行測試
- **WHEN** 使用者按下執行
- **THEN** 顯示通過或失敗的訊息（含錯誤內容）

