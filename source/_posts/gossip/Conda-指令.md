---
title: Conda 指令
tags:
  - [conda]
  - [python]
  - [gossip]
cover: /img/cover/cover02.jpg
date: 2023-09-19 16:47:10
---

# 配置Conda環境

`以下都是在Anaconda prompt下執行`

## conda版本

```python
conda update conda
```

## **列出和刪除環境、package**

```python
# 查看已建置環境
conda env list

# 刪除整個envName的環境
conda env remove --name envName

# 刪除envName中pandas 的package
conda remove --name envName pandas 
```

## **創建新環境**

```python
# 建置名為envName的環境
conda create --name envName python=3.10
```

## **激活和退出環境**

```python
# 激活環境
conda activate  envName

# 退出環境
conda deactivate  envName
```

## 安裝、升級package

假定已經在(envName)想要設定的環境底下

```python
# 安裝 matplotlib numpy tensorflow pandas opencv-python 
conda install matplotlib numpy tensorflow pandas opencv-python 

# update
conda update numpy

# 列出已安裝的軟體包
conda list
```

## 一些雜七雜八

```python
# 查看軟體包之間的依賴關係樹
conda list --tree   

# 查找可用軟體包
conda search

# 當前環境配置導出到YAML文件
conda env export > environment.yml

# clone
conda create --name newEnv --clone envName

```
