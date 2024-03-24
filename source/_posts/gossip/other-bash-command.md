---
title: other bash command
date: 2023-07-10 09:00:41
tags:
- [bash]
- [gossip]

comments: false
---
紀錄一些指令
## set up

### Run server

``` bash
$ npm inatall --force
```

由於上傳未包含node_modules，因此下載後需要重新安裝

### 上傳至github

``` bash
$ pythone PushGit.py
```

自己寫的上傳程式，包括:`hexo generate` 、 `hexo deploy` 、 整包上傳repro/{填寫的分支}

`2023/7/18` 新增 _config.yml 的github_deploy，節省輸入的時間

``` bash
# _config.yml
github_deploy:
  type: git
  repo: https://github.com/ImitatedSky/ImitatedSky.github.io
  branch: main
  message: 'deploy'
  test: "test message"
```

``` python
# pip install pyyaml
# PushGit.py
import yaml
import os

# 讀取設定檔
with open("_config.yml", "r", encoding="utf-8") as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

github_url = config["github_deploy"]["repo"]
github_branch = config["github_deploy"]["branch"]

```


### 題外話-hexo deploy

``` bash
$ hexo deploy
```
``` bash
# _config.yml
# Deployment
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
  type: git
  repo: https://github.com/ImitatedSky/ImitatedSky.github.io # https://github.com/[你的 GitHub 帳號]/[你的 GitHub 帳號].github.io.git
  branch: gh-page # 在這邊我是使用 gp-page 當作主要分支
  message: 'deploy'
```

這邊我是上傳至 .io 的gh-pages分支，設定在 _config.yml
