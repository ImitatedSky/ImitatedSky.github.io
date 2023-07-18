---
title: 改變git推送人與信箱
tags:
  - [Git]
cover: /img/cover/code.jpg
date: 2023-07-18 09:15:59
categories:
---

當你需要更改 Git 中的使用者名稱和電子郵件地址時，可以按照以下步驟執行：

1. 使用以下命令檢視當前的 Git 設定：

```
luaCopy code
git config --list

```

這將顯示當前的 Git 設定列表。

2. 使用以下命令設定新的使用者名稱：

```
arduinoCopy code
git config --global user.name "Name"

```

將 "Name" 替換為你要設定的新使用者名稱。

3. 使用以下命令設定新的電子郵件地址：

```
arduinoCopy code
git config --global user.email "email@example.com"

```