import { useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

/**
 * activate_power_mode parity: colorful particles burst at the caret while
 * typing in any input/textarea. Desktop only; disabled with
 * prefers-reduced-motion (matches original site's mobile:false setting).
 */
export default function PowerMode() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:9999";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const measurer = document.createElement("canvas").getContext("2d")!;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let particles: Particle[] = [];
    let rafId: number | null = null;

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.life -= 0.03;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
      ctx.globalAlpha = 1;
      rafId = particles.length > 0 ? requestAnimationFrame(loop) : null;
    }

    function caretPoint(el: HTMLInputElement | HTMLTextAreaElement) {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      measurer.font = `${style.fontSize} ${style.fontFamily}`;
      const upToCaret = el.value.slice(0, el.selectionEnd ?? el.value.length);
      // textarea: measure only the last line
      const lastLine = upToCaret.slice(upToCaret.lastIndexOf("\n") + 1);
      const textW = measurer.measureText(lastLine).width;
      const padL = parseFloat(style.paddingLeft) || 0;
      return {
        x: Math.min(rect.left + padL + textW, rect.right - 6),
        y: rect.top + rect.height / 2,
      };
    }

    function onInput(e: Event) {
      const el = e.target;
      if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return;
      const { x, y } = caretPoint(el);
      for (let i = 0; i < 8; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2.5 - 0.5,
          life: 1,
          color: `hsl(${Math.floor(Math.random() * 360)},80%,60%)`,
        });
      }
      if (rafId === null) rafId = requestAnimationFrame(loop);
    }

    document.addEventListener("input", onInput, true);
    return () => {
      document.removeEventListener("input", onInput, true);
      window.removeEventListener("resize", resize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, []);

  return null;
}
