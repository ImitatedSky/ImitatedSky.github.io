---
title: 一些部落格配置adsense 域名
tags:
  - [adsense]
  - [domain]
  - [gossip]
cover: /img/cover/cover02.jpg
date: 2023-07-26 10:11:14
---

# hexo部落格配置adsense

## 1. 申請adsense

[https://www.google.com/adsense/start/](https://www.google.com/adsense/start/)

就照著申請帳號吧

## 2. ads.txt

回到hexo在source底下新增ads.txt

```
google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0
```





# 架設在github.io上的網站設置自己的域名


## 1. 設定custome domain

(假設已經有github.io的repo)

到github的setting/Pages

找到custom domain，並輸入自己的網域

## 2. hexo設定CNAME

在source底下新增CNAME

```
yourdomain.com
```

## 3. 設定DNS

到自己的買網域的地方，設定DNS

<!-- https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/ -->

可以參考官方文檔

[https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

