# Spec: image-loading-hints

## ADDED Requirements

### Requirement: Cover images defer loading and reserve space
文章卡片與 banner 的封面圖 SHALL 帶 `loading="lazy"`（首頁 hero 除外，那是首屏內容）與 `decoding="async"`，且容器 MUST 有固定高度或長寬比，使圖片載入時不造成版面位移。

#### Scenario: 首頁文章列表
- **WHEN** 使用者載入首頁並捲動到文章列表
- **THEN** 視窗外的封面圖尚未請求；容器在圖片載入前後高度不變

#### Scenario: 首屏 hero 圖
- **WHEN** 使用者載入首頁
- **THEN** hero banner 圖立即載入（不 lazy），避免首屏空白
