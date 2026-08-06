# Spec: share-buttons

## ADDED Requirements

### Requirement: Post share buttons
文章頁 SHALL 提供 Facebook、Twitter(X)、LINE 三個分享按鈕，點擊時以新視窗開啟各平台的 share URL，帶入文章正式網址（`https://pochunyeh.com/posts/<slug>/`）與標題；不載入任何第三方分享 script。

#### Scenario: 分享到 LINE
- **WHEN** 使用者在文章頁點擊 LINE 分享按鈕
- **THEN** 開新視窗至 `social-plugins.line.me/lineit/share?url=<文章網址>`

#### Scenario: 無第三方 script
- **WHEN** 文章頁載入完成
- **THEN** 網路請求中不含 addtoany 或其他分享服務的 script
