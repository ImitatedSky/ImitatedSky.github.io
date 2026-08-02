import { useEffect, useRef, useState } from "react";
import { FiList, FiX } from "react-icons/fi";
import { parseHeadings, type Heading } from "./TOC";

/**
 * Floating TOC for viewports below xl where the sidebar (and its desktop TOC)
 * is hidden. Button sits above BackToTop; tapping opens a slide-up drawer.
 */
export default function MobileTOCButton({
  html,
  postTitle,
}: {
  html: string;
  postTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setHeadings(parseHeadings(html, postTitle));
    setOpen(false);
  }, [html, postTitle]);

  // Active heading tracking — same logic as desktop TOC
  useEffect(() => {
    if (headings.length === 0) return;
    observerRef.current?.disconnect();
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [headings]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (headings.length === 0) return null;

  return (
    <>
      <button
        aria-label="Table of contents"
        onClick={() => setOpen(true)}
        style={{ backgroundColor: "var(--color-primary)" }}
        className="xl:hidden fixed bottom-[5.25rem] right-6 z-[60] w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-80 transition-opacity"
      >
        <FiList size={18} />
      </button>

      <div className={`xl:hidden fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`}>
        {/* overlay */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        {/* slide-up drawer */}
        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[70vh] flex flex-col rounded-t-2xl bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Contents
            </p>
            <button
              aria-label="Close table of contents"
              onClick={() => setOpen(false)}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
          <ul className="overflow-y-auto px-5 pb-8 space-y-2">
            {headings.map((h) => (
              <li key={h.id} style={{ paddingLeft: h.level === 3 ? "0.75rem" : 0 }}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    setActive(h.id);
                    document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`block text-sm leading-snug py-0.5 transition-colors ${
                    active === h.id
                      ? "text-blue-500 dark:text-blue-400 font-medium"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
