## Context

The current `index.html` has a `<script src="cdn.../canvas-nest.min.js" defer>` tag. The `canvas-nest` library auto-initializes by appending a `<canvas>` to `document.body` when it loads. With Vite's dev server this works at page load, but: (1) in a React SPA, if the component tree unmounts/remounts the canvas orphans, (2) the CDN script depends on network availability, (3) data-attributes for config (`data-color`, `data-count`) are read at script load time — if the script loads before React sets the dark class, color picking is wrong.

## Goals / Non-Goals

**Goals:**
- Reliable animated background that initializes correctly in a Vite React SPA
- Uses site's `--color-primary` purple color at low opacity
- Respects `prefers-reduced-motion` (skip animation entirely)
- Works correctly across SPA navigation (canvas persists, React doesn't destroy it)
- Subtle enough not to distract from content

**Non-Goals:**
- Replacing canvas-nest with a fundamentally different effect
- User toggle UI (just `prefers-reduced-motion` is enough)
- Mobile battery optimization (canvas-nest is lightweight; acceptable)

## Decisions

**Implementation: pure React `useEffect` instead of CDN script**

Write `CanvasNest.tsx` that implements the canvas-nest algorithm directly (~60 lines of canvas2d code). No external dependency. Advantages:
- No CDN network dependency
- Full control over color (use `getComputedStyle` to read `--color-primary`)
- Can re-read dark mode class if toggled
- React lifecycle = clean init/cleanup

Algorithm (canvas-nest core):
- Create `<canvas>` fixed fullscreen (`position:fixed; top:0; left:0; z-index:-1; pointer-events:none`)
- Generate N random particles with x, y, vx, vy
- Each frame: move particles, bounce off edges, draw lines between particles closer than `maxDist` (opacity proportional to distance), draw small circles at each particle
- Color from `--color-primary`, opacity ~0.4 in dark mode, ~0.25 in light mode

**Mount point:** Rendered in `App.tsx` as a sibling of `<Nav>`, before `<main>`. Lives outside React Router so it persists across all routes without remount.

**Reduced motion:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before starting the animation loop. If true, render nothing.

## Risks / Trade-offs

- [Canvas repaints on every frame] requestAnimationFrame loop runs continuously → Mitigation: pause when tab is hidden via `document.visibilitychange`; 80 particles at 60fps is negligible CPU on modern hardware
- [Canvas size on resize] Window resize leaves canvas at wrong size → Mitigation: `ResizeObserver` or `resize` event listener updates canvas width/height and resets particle positions
- [Remove CDN script from index.html] Must remember to remove `<script src="...canvas-nest...">` to avoid double-initialization → Covered in tasks
