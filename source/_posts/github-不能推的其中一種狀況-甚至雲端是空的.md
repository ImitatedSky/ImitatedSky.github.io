---
title: github 不能推的其中一種狀況 甚至雲端是空的
tags:
  - [git]
  - code
cover: /img/cover/cover02.jpg
date: 2024-03-27 16:15:02
---

```bash
To https://github.com/name/resp.git
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to 'https://github.com/name/resp.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Integrate the remote changes (e.g.
hint: 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

若是有東西 可以先pull下來，因為可能本機是舊檔

```bash
git pull origin main
```

再

```bash
git push origin main
```

## `再不行 甚至雲端是空的`

直接強推吧(不推薦)

```bash
git push -f origin main
```