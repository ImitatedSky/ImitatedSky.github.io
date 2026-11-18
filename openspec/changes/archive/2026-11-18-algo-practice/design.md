# Design: algo-practice

## 核心：trace 驅動的動畫

每題一個模組 `src/algo/problems/<slug>.ts`，匯出 `Problem`：
中文摘要、範例、思路、複雜度、Python `code`、`starter`、`presets`，以及 `trace(input): Frame[]`。

`Frame = { line, note, views, vars, result? }`。`views` 是資料結構快照（discriminated union）：
`array`（可顯示為長條圖）、`grid`、`map`、`stack`、`queue`、`list`（鏈結串列）、`tree`（n 元，含 trie／遞迴樹）、`graph`、`intervals`。
共用的 `Player` 負責播放／單步／拖曳／速度／鍵盤操作，並與 Python 程式碼逐行高亮同步。

選這個做法（而非每題手寫動畫元件）：150 題共用同一組經過驗證的視圖元件，品質一致、新增題目只需寫資料。

## 資料載入

- `catalog.ts`：150 題的 meta（題號、slug、標題、難度、分類）—— 列表頁只載這個
- 題目模組以 `import.meta.glob` 逐題 lazy load
- 測試 `src/algo/tests/<slug>.py`（assert）—— `verify-algo` 與瀏覽器練習模式共用

## 驗證

`npm run verify:algo [slug…]`：檢查 trace（frame 數、行號範圍、視圖合法、最後一格 `result` 等於 preset 的 `expected`），
並實際以 python 執行 `prelude + code + tests`。

## 主題

沿用全站 `.dark` class 與 `localStorage.theme`；練習區自己的色票以 CSS 變數定義在 `.algo` 範圍內。
