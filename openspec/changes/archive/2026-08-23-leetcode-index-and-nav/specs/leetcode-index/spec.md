# Spec: leetcode-index

## ADDED Requirements

### Requirement: Problem index page
系統 SHALL 提供 `/leetcode` 頁面，以表格列出所有 Leetcode 分類的文章，每列包含題號、標題（連向該文）、難度、演算法標籤。頁首 MUST 顯示題目總數與各難度數量。

#### Scenario: 開啟索引頁
- **WHEN** 使用者造訪 `/leetcode`
- **THEN** 顯示 84 列題目，頁首顯示總數 84 與 easy/medium/hard 的各自數量

#### Scenario: 題號解析失敗
- **WHEN** 某篇 Leetcode 文章標題不含可解析的題號
- **THEN** 該列仍然列出，題號欄顯示 `—`，不影響其他列

### Requirement: Filter by difficulty and algorithm tag
索引頁 SHALL 支援依難度與演算法標籤篩選，且篩選狀態 MUST 反映在 URL query string，使其可被分享與加入書籤。

#### Scenario: 篩選 hard
- **WHEN** 使用者點選難度 `hard`
- **THEN** 只顯示標記 hard 的題目，URL 含 `d=hard`

#### Scenario: 難度與標籤組合篩選
- **WHEN** 使用者同時選 `hard` 與 `Dynamic Programming`
- **THEN** 只顯示同時符合的題目，URL 同時含兩個參數

#### Scenario: 直接開啟帶參數的網址
- **WHEN** 使用者開啟 `/leetcode?d=easy`
- **THEN** 頁面載入即為已篩選狀態

#### Scenario: 同時標記兩種難度的題目
- **WHEN** 某題同時標記 medium 與 hard
- **THEN** 篩選 medium 或 hard 時該題都會出現

### Requirement: Sort by problem number, difficulty or date
索引頁 SHALL 支援依題號、難度、日期排序，並可切換升降序。預設 MUST 為題號升序。

#### Scenario: 預設排序
- **WHEN** 使用者開啟索引頁且未指定排序
- **THEN** 題目依題號由小到大排列

#### Scenario: 切換排序欄位
- **WHEN** 使用者點擊「難度」欄位標頭
- **THEN** 依 easy → medium → hard 排序；再次點擊反轉為降序
