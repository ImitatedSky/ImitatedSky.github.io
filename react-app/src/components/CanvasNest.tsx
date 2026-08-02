import { useEffect } from "react";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const COUNT = 88;
const MAX_DIST = 120;

/**
 * canvas-nest parity: animated particle web behind all content, matching the
 * original Butterfly site's background effect. Runs once at app root and
 * persists across SPA navigation (the CDN script it replaces only ran at HTML
 * parse time and failed to initialize under Vite).
 *
 * Disabled when prefers-reduced-motion is set, or via localStorage
 * "bg-effect" = "off".
 */
export default function CanvasNest() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (localStorage.getItem("bg-effect") === "off") return;

    const canvas = document.createElement("canvas");
    canvas.id = "canvas-nest";
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    // --color-primary (#9370db) → rgb components
    const hex = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    const [r, g, b] = m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [147, 112, 219];

    let dots: Dot[] = [];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for (const d of dots) {
        d.x = Math.min(d.x, canvas.width);
        d.y = Math.min(d.y, canvas.height);
      }
    }
    resize();
    dots = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
    }));
    window.addEventListener("resize", resize);

    let rafId: number | null = null;
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // dark mode: slightly stronger so it reads on near-black; light: subtle
      const base = document.documentElement.classList.contains("dark") ? 0.5 : 0.3;

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x <= 0 || d.x >= canvas.width) d.vx *= -1;
        if (d.y <= 0 || d.y >= canvas.height) d.vy *= -1;
        ctx.fillStyle = `rgba(${r},${g},${b},${base})`;
        ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= MAX_DIST) continue;
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dist / MAX_DIST) * base})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    // pause when the tab is hidden
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (rafId === null) {
        rafId = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, []);

  return null;
}
