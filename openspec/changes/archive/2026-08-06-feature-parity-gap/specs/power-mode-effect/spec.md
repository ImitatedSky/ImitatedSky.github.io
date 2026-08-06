# Spec: power-mode-effect

## ADDED Requirements

### Requirement: Typing particle effect
於桌面裝置的輸入框（搜尋、留言）輸入文字時，系統 SHALL 在游標位置產生短暫彩色粒子特效；`prefers-reduced-motion: reduce` 或行動裝置時 MUST 停用；特效 MUST 不影響輸入行為與效能（不掉字、不卡頓）。

#### Scenario: 桌面輸入
- **WHEN** 桌面使用者在搜尋框輸入字元
- **THEN** 游標附近出現粒子動畫並於 1 秒內消失

#### Scenario: 減少動態偏好
- **WHEN** 使用者系統設定 prefers-reduced-motion
- **THEN** 輸入時無任何粒子特效
