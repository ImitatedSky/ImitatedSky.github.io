# Spec: route-code-splitting

## ADDED Requirements

### Requirement: Low-traffic routes load on demand
Archives / Tags / TagPage / Categories / CategoryPage / Links / MessageBoard SHALL 以 `React.lazy` 延遲載入，Home 與 PostPage 保留在主 bundle。切換時 MUST 有 fallback 且不出現錯誤。

#### Scenario: 首次進入首頁
- **WHEN** 使用者載入 `/`
- **THEN** 初始 JS bundle 小於改動前（332 KB），首頁正常渲染

#### Scenario: 切換到延遲載入的頁面
- **WHEN** 使用者點擊導覽列 Archives
- **THEN** 對應 chunk 載入後頁面正常顯示，過程中不出現空白錯誤畫面

### Requirement: Search library loads on first open
`fuse.js` SHALL 僅在搜尋首次開啟時動態載入，不進入初始 bundle。

#### Scenario: 未開啟搜尋
- **WHEN** 使用者載入首頁但未開啟搜尋
- **THEN** 初始載入的 JS 不含 fuse.js

#### Scenario: 開啟搜尋並輸入
- **WHEN** 使用者按 `/` 開啟搜尋並輸入關鍵字
- **THEN** fuse.js 載入完成後正常回傳搜尋結果
