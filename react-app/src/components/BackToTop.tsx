import { useEffect, useState } from "react";
import { FaAngleUp } from "react-icons/fa";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    function update() {
      setVisible(window.scrollY > 300);
      const total = document.body.scrollHeight - window.innerHeight;
      setPercent(
        total > 0 ? Math.min(99, Math.round((window.scrollY / total) * 100)) : 0,
      );
      rafId = null;
    }
    function onScroll() {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{ backgroundColor: "var(--color-primary)" }}
      className="group fixed bottom-8 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-80 transition-opacity"
    >
      {/* scroll percent by default; arrow on hover (Butterfly rightside_scroll_percent) */}
      <span className="group-hover:hidden text-xs font-bold leading-none">{percent}</span>
      <FaAngleUp size={20} className="hidden group-hover:block" />
    </button>
  );
}
