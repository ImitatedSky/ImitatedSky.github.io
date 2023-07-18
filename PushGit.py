# auto push github script

import os
import sys
import platform


# hexo generate
is_hexo_generate = True
url = "https://github.com/ImitatedSky/ImitatedSky.github.io"

if is_hexo_generate:
    # hexo generate
    hexo_generate = "hexo generate"
    print(">>> " + hexo_generate)
    os.system(hexo_generate)

# 是否 hexo deploy
is_hexo_deploy = input(">>> Is hexo deploy? (y/n) : ")
if is_hexo_deploy == "y" or is_hexo_deploy == "Y" or is_hexo_deploy == "yes" or is_hexo_deploy == "Yes" or is_hexo_deploy == "YES":
    # hexo deploy
    hexo_deploy = "hexo deploy"
    print(">>> " + hexo_deploy)
    os.system(hexo_deploy)


def GetTime():
    import time
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

commit_msg =f"update: {GetTime()}"

# 清空origin
os.system("git remote rm origin")

# 輸入github網址
# github_url = input(">>> Please input github url : ")
# ask for github url if true else input

is_github_url = input(f">>> Is github url? {url}(y/n) : ")
if is_github_url == "y" or is_github_url == "Y" or is_github_url == "yes" or is_github_url == "Yes" or is_github_url == "YES":
    github_url = url
else:
    github_url = input(">>> Please input github url : ")
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
