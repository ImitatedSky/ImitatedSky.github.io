# sibling-post-nav Specification

## Purpose
TBD - created by archiving change leetcode-index-and-nav. Update Purpose after archive.
## Requirements
### Requirement: Prev/next navigates within the same category
文章頁的上／下一篇 SHALL 指向**同分類**的相鄰文章。Leetcode 分類 MUST 依題號排序，其他分類依日期排序。當該分類內沒有其他文章時，MUST 退回全站日期排序，使導覽不會消失。

#### Scenario: Leetcode 題目間導覽
- **WHEN** 使用者在 `Leetcode#100. Same Tree` 頁面
- **THEN** 上／下一篇指向題號相鄰的 Leetcode 題目，而非日期相鄰的任意文章

#### Scenario: 非 Leetcode 文章
- **WHEN** 使用者在 `~algo` 分類的文章頁
- **THEN** 上／下一篇指向同分類內日期相鄰的文章

#### Scenario: 分類內只有一篇
- **WHEN** 文章所屬分類僅有該篇
- **THEN** 退回全站日期排序，仍顯示可用的上／下一篇

