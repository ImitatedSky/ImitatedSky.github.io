# Tasks: algo-practice

> 2026-11-19 實作完成。`verify:algo --strict`：150/150 題 + 10 種排序全數通過（trace 檢查、逐格實際渲染、python 實跑測試）；瀏覽器逐題逐格掃描 150 題無執行錯誤。

## 1. 核心框架
- [x] 1.1 `src/algo/types.ts`、`catalog.ts`（150 題 meta、23 分類）
- [x] 1.2 視圖元件：array / grid / map / stack / queue / list / tree / graph / intervals
- [x] 1.3 `Player`（播放、單步、拖曳、速度、鍵盤）+ Python 程式碼逐行高亮
- [x] 1.4 版面 `AlgoLayout`、主題、進度 store（localStorage）
- [x] 1.5 `scripts/verify-algo.ts`

## 2. 頁面
- [x] 2.1 `/algo` 首頁
- [x] 2.2 `/algo/problems` 列表（篩選／搜尋）
- [x] 2.3 `/algo/p/:slug` 題目頁
- [x] 2.4 `/algo/sorting` 排序視覺化（10 種）
- [x] 2.5 練習模式（Pyodide）

## 3. 內容
- [x] 3.1 150 題：摘要、思路、Python、trace、tests

## 4. 整合與驗證
- [x] 4.1 `App.tsx` 路由、Nav 入口、`build-content.ts` routes
- [x] 4.2 `verify:algo` 全數通過、`npm run build` 通過
- [x] 4.3 瀏覽器截圖驗證（深／淺色、手機寬度）

## 5. 實作中追加
- [x] 5.1 `verify-algo` 以 react-dom/server 實際渲染每一格（抓出結構檢查漏掉的問題）
- [x] 5.2 陣列格子依舞台寬度自動縮放；長字串自動加寬；指標出界時不再整列晃動
- [x] 5.3 樹／圖／map／stack／queue 可並排，降低舞台高度；說明列與播放控制 sticky
- [x] 5.4 樹節點長文字改畫膠囊；DP 表未填格用虛線樣式
