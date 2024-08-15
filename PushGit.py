# auto push github script

import os
import sys
import platform
import yaml

# push github的步驟
# 1. git init
# 2. git add .
# 3. git commit -m "123"
# 3.# git remote add origin <倉庫URL>
# 4. git push origin master # 通常git庫的分支是master

# 讀取設定檔
with open("_config.yml", "r", encoding="utf-8") as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

url = config["github_deploy"]["repo"]
branch = config["github_deploy"]["branch"]

# hexo generate
is_hexo_generate = True


if is_hexo_generate:
    # hexo clean  # 清除public，清除cache
    # hexo generate # 產生public靜態檔案
    hexo_clean = "hexo clean"
    hexo_generate = "hexo generate"
    print(">>> " + hexo_clean)
    print(">>> " + hexo_generate)
    os.system(hexo_generate)

# 是否 hexo deploy
is_hexo_deploy = input(">>> Is hexo deploy? (y/n) : ")
if is_hexo_deploy == "y" or is_hexo_deploy == "Y" or is_hexo_deploy == "yes" or is_hexo_deploy == "Yes" or is_hexo_deploy == "YES" or is_hexo_deploy == "":
    # hexo deploy
    hexo_deploy = "hexo deploy"
    print(">>> " + hexo_deploy)
    os.system(hexo_deploy) 


def GetTime():
    import time
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

commit_msg =f"update: {GetTime()}"



'''
###這邊開始為push git的部分
'''

# 清空origin
os.system("git remote rm origin")

# 輸入github網址
is_github_url = input(f">>> Is github url? {url}(y/n) : ")
if is_github_url == "y" or is_github_url == "Y" or is_github_url == "yes" or is_github_url == "Yes" or is_github_url == "YES" or is_github_url == "":
    github_url = url
else:
    github_url = input(">>> Please input github url : ")

# 輸入github分支
is_github_branch = input(f">>> Is github branch? {branch}(y/n) : ")
if is_github_branch == "y" or is_github_branch == "Y" or is_github_branch == "yes" or is_github_branch == "Yes" or is_github_branch == "YES" or is_github_branch == "":
    github_branch = branch
else:
    github_branch = input(">>> Please input github branch : ")


github_commit_msg = input(">>> Please input commit msg : ")
# 如果沒有輸入 github_url  branch 停止程式
if github_url == "" or github_branch == "":
    print(">>> Error: github_url or github_branch is empty")
    os.system("pause")
    sys.exit()

# 如果沒有輸入 commit msg 就用預設的
if github_commit_msg != "":
    commit_msg = github_commit_msg

set_o  = "git remote add origin " + github_url


comd_0  = "git init"
comd_1  = "git add ."
comd_2  = "git commit -m \" " + commit_msg + " \""
comd_3  = "git push origin " + github_branch  # + " -f"
comd_4  = "git status"


print(">>> " + set_o)
os.system(set_o)
print(">>> " + comd_0)
os.system(comd_0)
print(">>> " + comd_1)
os.system(comd_1)
print(">>> " + comd_2)
os.system(comd_2)
print(">>> " + comd_3)
os.system(comd_3)
print(">>> " + comd_4)
os.system(comd_4)

print(">>> Done!")




# 點擊後自動關閉
os.system("pause")


