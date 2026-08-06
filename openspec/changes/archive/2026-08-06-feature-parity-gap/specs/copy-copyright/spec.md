# Spec: copy-copyright

## ADDED Requirements

### Requirement: Append copyright on long copy
使用者於文章內文（prose 區域）複製文字且選取內容超過 100 字時，系統 SHALL 在剪貼簿內容之後附加版權宣告（作者、原文連結、授權說明）；100 字以內則不附加。code block 的 Copy 按鈕 MUST 不受影響（複製純程式碼）。

#### Scenario: 複製長段落
- **WHEN** 使用者選取 150 字的內文並按 Ctrl+C
- **THEN** 剪貼簿內容為選取文字 + 換行 + 版權宣告（含作者與文章連結）

#### Scenario: 複製短句
- **WHEN** 使用者選取 20 字並複製
- **THEN** 剪貼簿內容僅為選取文字

#### Scenario: 使用 code block Copy 按鈕
- **WHEN** 使用者點擊任一 code block 的 Copy 按鈕
- **THEN** 剪貼簿內容僅為程式碼本身，無版權附加
