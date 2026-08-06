# code-block-parity Specification

## Purpose
TBD - created by archiving change feature-parity-gap. Update Purpose after archive.
## Requirements
### Requirement: Copy button on every code block
文章頁中每一個 code block（含未標註語言者）SHALL 顯示複製按鈕；點擊後將該區塊完整原始碼寫入剪貼簿，按鈕文字短暫顯示 `Copied!`。

#### Scenario: 未標註語言的 code block
- **WHEN** 文章含 ``` 開頭（無語言）的 code block 並渲染完成
- **THEN** 該區塊右上角出現 Copy 按鈕，點擊後剪貼簿內容等於區塊內文字

#### Scenario: 已標註語言的 code block（現有行為不退步）
- **WHEN** 文章含 ```python code block
- **THEN** Copy 按鈕行為與現況一致

### Requirement: Language label on code blocks
每個 code block SHALL 顯示語言標籤；未標註語言者顯示 `text`。

#### Scenario: Python 區塊
- **WHEN** ```python 區塊渲染完成
- **THEN** 區塊上顯示 `python` 標籤

#### Scenario: 無語言區塊
- **WHEN** 無語言標註區塊渲染完成
- **THEN** 區塊上顯示 `text` 標籤

