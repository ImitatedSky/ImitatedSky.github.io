---
title: python 螢幕、鏡頭錄製
tags:
  - [python]
  - [opencv]
  - [pyautogui]
  - [tips]
cover: /img/cover/code.jpg
date: 2023-09-21 16:56:47
---

# 使用pyautogui 、 openCV

pyautogui 用來抓螢幕寬高，及螢幕截圖

```python
import os
import pyautogui
import time
import cv2
import numpy as np

# 螢幕寬高
screen_width, screen_height = pyautogui.size()

# 設定視頻文件參數
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter('screen_recording.avi', fourcc, 20.0, (screen_width, screen_height))

# 錄製時間（秒）
duration = 5

# 開始錄製
start_time = time.time()

while (time.time() - start_time) < duration:
    # 截取當前螢幕畫面
    screenshot = pyautogui.screenshot()
    frame = np.array(screenshot)

    # 轉換BGR到RGB
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # 寫入視頻文件
    out.write(frame)

    # 顯示錄製的畫面
    # cv2.imshow('Recording', frame)

    if cv2.waitKey(1) == ord('q'):
        break

# 釋放資源
out.release()
cv2.destroyAllWindows()
```

## 改為設定指定目錄

```python
import os
import pyautogui
import time
import cv2
import numpy as np

# 螢幕寬高
screen_width, screen_height = pyautogui.size()

# 下載文件夾路徑
download_folder = os.path.expanduser("~/Downloads")

# 設定視頻文件參數
output_file = os.path.join(download_folder, 'screen_recording.avi')
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter(output_file, fourcc, 20.0, (screen_width, screen_height))

# 錄製時間（秒）
duration = 5

# 開始錄製
start_time = time.time()

while (time.time() - start_time) < duration:
    # 截取當前螢幕畫面
    screenshot = pyautogui.screenshot()
    frame = np.array(screenshot)

    # 轉換BGR到RGB
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # 寫入視頻文件
    out.write(frame)

    # 顯示錄製的畫面
    # cv2.imshow('Recording', frame)

    if cv2.waitKey(1) == ord('q'):
        break

# 釋放資源
out.release()
cv2.destroyAllWindows()

# 顯示保存的文件路徑
print(f"視頻文件已保存到：{output_file}")
```

# 儲存GIF

openCV 沒有內建的GIF 格式

改為放進一般List 進行 save

```python
frame[0].save("test.gif", save_all=True, append_images=output[1:], duration=150, loop=0, disposal=2)

# frame[0]：gif 動畫第一個影格
# 第一欄：儲存路徑
# save_all：設定 True 表示儲存所有影格，預設 False ，將會只儲存第一個影格
# append_images：要添加到 frame 影格的其他影格，串列格式，使用 frame[1:] 往後添加
# duration：影格間隔時間，預設 100
# loop：循環次數，預設 0，0 表示無限迴圈
# disposal：影格處理方式，預設 0，0 表示不處理，2 表示移除背景
```

```python
import pyautogui
import time
import cv2
import numpy as np
from PIL import Image,ImageSequence

# 螢幕寬高
screen_width, screen_height = pyautogui.size()

output = []                       # 建立輸出的空串列

# 錄製時間（秒）
duration = 3

# 開始錄製
start_time = time.time()

while (time.time() - start_time) < duration:
    # 截取當前螢幕畫面
    screenshot = pyautogui.screenshot()
    frame = np.array(screenshot)

    # 轉換BGR到RGB
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    gif = cv2.cvtColor(frame, cv2.COLOR_BGRA2RGBA)  # 轉換顏色
    gif = Image.fromarray(frame)                    # 轉換成 PIL 格式
    gif = gif.convert('RGB')                      # 轉換顏色
    output.append(gif)                            # 添加到 output

    # 顯示錄製的畫面
    # cv2.imshow('Recording', frame)

    if cv2.waitKey(1) == ord('q'):
        break

# 儲存 GIF
output[0].save("test.gif", save_all=True, append_images=output[1:], duration=150, loop=1, disposal=2)
cv2.destroyAllWindows()
```

# 使用 VideoCapture錄製

```python
import cv2

cap = cv2.VideoCapture(1)
# Define the codec and create VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter('output.avi', fourcc, 20.0, (640,  480))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break
    # 水平上下翻轉影像
    #frame = cv2.flip(frame, 0)
    # write the flipped frame
    out.write(frame)
    cv2.imshow('frame', frame)

    if cv2.waitKey(1) == ord('q') or cv2.waitKey(1) == 27 or  cv2.getWindowProperty('frame', cv2.WND_PROP_VISIBLE) < 1.0:
        break
# Release everything if job is finished
cap.release()
out.release()
cv2.destroyAllWindows()
```