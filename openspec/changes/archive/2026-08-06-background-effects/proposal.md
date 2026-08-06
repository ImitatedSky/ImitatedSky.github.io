## Why

The current rebuild has a plain solid background (`bg-zinc-50` / `bg-zinc-950`). The original pochunyeh.com runs `canvas-nest.min.js` which draws a dynamic particle-and-line web across the entire viewport, making the site feel alive rather than static. A CDN script tag was already added to `index.html` in an earlier session but it may not be initializing correctly as a Vite SPA (the script runs once at HTML parse time, before React mounts, and doesn't re-run after SPA navigation). This change audits the current state and produces a reliable, toggleable background effect.

## What Changes

- Audit whether the existing `canvas-nest` CDN script in `index.html` is actually rendering (it may silently fail in Vite dev or after navigation)
- If broken: replace CDN approach with a React component (`CanvasNest.tsx`) that creates and manages the canvas imperatively inside a `useEffect` — initializes once on mount, cleans up on unmount
- The effect should: draw animated lines/particles across the full viewport, sit at `z-index: -1` behind all content, use `--color-primary` (#9370db purple) at low opacity so it's subtle not distracting
- Dark mode: slightly higher opacity; light mode: lower opacity (content stays readable)
- Option to disable via `localStorage` key `"bg-effect"` for users who prefer reduced motion (respect `prefers-reduced-motion` media query)

## Capabilities

### New Capabilities

- `background-effects`: Animated canvas particle-web background across the full site

### Modified Capabilities

## Impact

- `src/components/CanvasNest.tsx` — new React component managing canvas lifecycle
- `src/App.tsx` — render `<CanvasNest />` at root level
- `index.html` — remove existing CDN script tag (replaced by React component)
- `src/index.css` — ensure `canvas#background` has correct fixed positioning
