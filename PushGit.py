# auto push github script

import os
import sys

def GetTime():
    import time
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

commit_msg =f"update: {GetTime()}"

# 清空origin
os.system("git remote rm origin")

# 輸入github網址
github_url = input(">>> Please input github url : ")
github_branch = input(">>> Please input github branch : ")
set_o  = "git remote add origin " + github_url


comd_0  = "git init"
comd_1  = "git add ."
comd_2  = "git commit -m \" " + commit_msg + " \""
comd_3  = "git push origin " + github_branch 
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
