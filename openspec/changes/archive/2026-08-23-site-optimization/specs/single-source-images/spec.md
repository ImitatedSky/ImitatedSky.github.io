# Spec: single-source-images

## ADDED Requirements

### Requirement: Images have one source of truth
`source/img/` SHALL 是圖片的唯一來源；build 時複製到 `react-app/public/img/`。`public/img` MUST 不再被 git 追蹤，避免兩份副本不同步。

#### Scenario: 新增圖片
- **WHEN** 作者把新圖放入 `source/img/foo.png` 後執行 build
- **THEN** `react-app/public/img/foo.png` 存在，文章可用 `/img/foo.png` 引用

#### Scenario: 既有圖片不遺失
- **WHEN** build 完成
- **THEN** 原有 18 個圖片檔全部存在於 `public/img`，文章引用的所有路徑都可解析
