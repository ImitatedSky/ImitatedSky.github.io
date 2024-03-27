---
title: (Bug)git 推送問題 git add .
tags:
  - [Bug]
cover: /img/cover/cover02.jpg
date: 2024-03-27 17:14:46
---

使用 git add .

```bash
git add . fatal: will not add file alias 'public/tags/OpenCV/index.html' ('public/tags/opencv/index.html' already exists in index)
```

git commit -m “ ”

後面也出現一堆 modified…… 紅字

```bash
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .gitignore
        modified:
        .
        .
        .
```

## `原因`

這個錯誤是因為 Git 在 `Windows 上默認是不區分大小寫的`，所以 'public/tags/OpenCV/index.html' 和 'public/tags/opencv/index.html' 被視為同一個文件。這在 Unix-like 系統（如 Linux 或 MacOS）上不會發生，因為它們是區分大小寫的。

## `解決方法`

命令更改 Git 的配置

使其在window上也分大小寫

```bash
git config core.ignorecase false
```
