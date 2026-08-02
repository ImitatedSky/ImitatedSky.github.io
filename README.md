# ImitatedSky.github.io

https://pochunyeh.com/

個人部落格 — **React SPA（Vite + React Router）**，文章為 `source/_posts/` 下的 Markdown。

## 架構

- `react-app/` — Vite + React 19 + React Router 7 + Tailwind CSS v4
- `react-app/scripts/build-content.ts` — build 時把 `source/_posts/` 轉成 JSON（含搜尋索引、sitemap、RSS）
- `source/_posts/` — Markdown 文章
- `source/_data/link.yml` — 友情連結
- `openspec/` — 變更規格與任務記錄

## 開發

```bash
cd react-app
npm install
npm run dev     # http://localhost:5173
npm run build   # 產出 react-app/dist/
```

## 部署

**自動（主要方式）**：push 到 `main`（動到 `react-app/**` 或 `source/**`）會觸發
[GitHub Actions](.github/workflows/deploy.yml) 自動 build 並發佈到 `gh-page` 分支，
GitHub Pages 從該分支供應網站（自訂網域 `pochunyeh.com`，CNAME 在 `react-app/public/`）。

也可以在 Actions 頁面手動觸發（workflow_dispatch）。

**手動（備用）**：

```bash
cd react-app && npm run deploy   # gh-pages -d dist -b gh-page
# 或互動式：python PushGit.py
```

## 發文流程

1. 在 `source/_posts/` 新增/編輯 Markdown（front matter：`title`、`date`、`tags`、`categories`、`cover`）
2. commit 並 push 到 `main`
3. Actions 自動部署，約 1–2 分鐘後生效
