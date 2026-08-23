# system-theme-preference Specification

## Purpose
TBD - created by archiving change leetcode-index-and-nav. Update Purpose after archive.
## Requirements
### Requirement: Follow system colour scheme until user chooses
首次造訪（`localStorage.theme` 未設定）時，系統 SHALL 採用作業系統的 `prefers-color-scheme` 偏好。使用者手動切換後 MUST 記住該選擇並不再跟隨系統。首屏 MUST NOT 出現主題閃動。

#### Scenario: 系統為淺色、使用者首次造訪
- **WHEN** 系統偏好為 light 且使用者從未切換過主題
- **THEN** 網站以淺色模式載入，且首屏不出現深色閃動

#### Scenario: 使用者手動選擇後
- **WHEN** 使用者手動切到深色，之後把系統改為淺色並重新造訪
- **THEN** 網站維持深色（尊重使用者的明確選擇）

