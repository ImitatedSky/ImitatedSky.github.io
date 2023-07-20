---
title: ReactWeb-deploy-command
date: 2023-07-10 09:54:28
tags:
- [React]
- [gossip]

comments: false
---
我Resume 是使用React (在codesandbox)，紀錄上傳至github的步驟

## set up

### 前置作業

#### 安裝gh-pages


``` bash
$ npm install gh-pages --save-dev
```
可以看 dependencies 中有沒有，沒有的話再安裝一次，因為我有遇過安裝後沒有出現在 dependencies 中，若確定安裝成功，則可在
package.json 中看到

``` json / dependencies
    "gh-pages": "^5.0.0"
```
不然就手動加入...


#### 加入deploy指令

package.json

``` json / scripts
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
```

#### 設定deploy的分支

package.json

``` json / 
    "homepage": "https://{username}.github.io/{repro-name}/",
```

#### 執行deploy

``` bash
$ npm run deploy
```