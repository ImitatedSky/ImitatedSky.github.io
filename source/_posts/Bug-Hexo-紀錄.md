---
title: (Bug)Hexo 紀錄
tags:
  - [Bug]
cover: /img/cover/cover02.jpg
date: 2024-03-21 21:21:50
---

```bash
node:internal/fs/promises:862
  const result = await binding.readdir(
                               ^

Error: ENOENT: no such file or directory, scandir
```

換新電腦想說久違看一下我的部落格

結果跳BUG，不能使用，找不到資料夾甚麼的

紀錄一下

*結論 版本太高

![Untitled](/img/202401/20240321_1.png)

![Untitled](/img/202401/20240321_2.png)

後面用的nodejs 版本是 20.11.1

hexo 資源版本是18.17以下

重新安裝低版本nodejs.exe 就可