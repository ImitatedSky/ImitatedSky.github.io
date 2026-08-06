# Tasks: background-effects

> 2026-08-02 完成。實測確認原 CDN script 完全沒有渲染（0 canvas + 每頁 `getAttribute` console error），已改為 React 元件。

## 1. Cleanup

- [x] 1.1 Remove the `<script src="...canvas-nest.min.js" ...>` tag from `index.html` (replaced by React component)

## 2. CanvasNest Component

- [x] 2.1 Create `src/components/CanvasNest.tsx`:
  - Skip rendering if `prefers-reduced-motion` is set
  - Skip if `localStorage["bg-effect"] === "off"`（proposal 的停用開關）
  - Append a fixed fullscreen `<canvas id="canvas-nest">` (position:fixed, top:0, left:0, width:100vw, height:100vh, z-index:-1, pointer-events:none)
  - Generate 88 particles with random position and velocity
  - Run `requestAnimationFrame` loop: move particles, bounce edges, draw lines between nearby particles (maxDist 120px, opacity by distance), draw 2px squares
  - Read particle color from `--color-primary`（#9370db）; dark mode opacity 0.5 / light 0.3（每幀讀 `.dark` class，切換即時生效）
  - Pause loop when `document.visibilityState === 'hidden'`; resume on `visibilitychange`
  - Handle window resize: update canvas size, clamp particle positions
  - Cleanup: cancel animation frame, remove canvas, remove listeners on unmount
- [x] 2.2 Render `<CanvasNest />` in `App.tsx` before `<Nav>` (renders once, persists across all routes)

## 3. Verification

- [x] 3.1 Run `npm run build` — no TypeScript errors
- [x] 3.2 Verify background particle web is visible on home page in both dark and light mode（Playwright 截圖 + 像素取樣：兩幀不同 → 動畫中）
- [x] 3.3 Verify canvas stays visible and animated across SPA navigation (home → post → archives)（實測三頁均存在）
- [x] 3.4 Verify no visual interference with content (z-index -1、pointer-events:none、卡片正常覆蓋)
- [x] 3.5 Verify no double-canvas（CDN script 已移除；頁上 canvas 為 canvas-nest + PowerMode 特效各一，canvas-nest 僅一個；console error 歸零，原每頁 9 件 `getAttribute` 錯誤消失）
