# ImitatedSky.github.io

https://pochunyeh.com/

blog : Hexo

theme : butterfly

push : 
```bash
python pushgit.py
```
新增_config.yml 的github_deploy，節省輸入的時間
~~可以一直按ENTER~~，還是要確認一下

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

# PushGit.py
import yaml
import os

# 讀取設定檔
with open("_config.yml", "r", encoding="utf-8") as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

github_url = config["github_deploy"]["repo"]
github_branch = config["github_deploy"]["branch"]

```
