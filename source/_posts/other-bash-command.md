---
title: other bash command
date: 2023-07-10 09:00:41
tags:
---
紀錄一些指令
## set up

### Run server

``` bash
$ npm inatall --force
```

由於上傳為包含node_modules，因此下載後需要重新安裝

### 上傳至github

``` bash
$ pythone PushGit.py
```

自己寫的上傳程式，包括:`hexo generate` 、 `hexo deploy` 、 整包上傳repro/{填寫的分支}

github_url = input(">>> Please input github url : ")

github_branch = input(">>> Please input github branch : ")
目前我的分支要填寫 `master:main`
因為我github預設分支已經改為main
另一點我這邊指令有加入`-f`，因此會強制上傳

github_commit_msg = input(">>> Please input commit msg : ")

### 題外話-hexo deploy

``` bash
$ hexo deploy
```

這邊我是上傳至 .io 的gh-pages分支，設定在 _config.yml
