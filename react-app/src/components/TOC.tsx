import { useEffect, useRef, useState } from "react";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function parseHeadings(html: string, postTitle?: string): Heading[] {
  const div = document.createElement("div");
  div.innerHTML = html;
  const nodes = div.querySelectorAll("h2, h3");
  const headings = Array.from(nodes).map((el) => ({
    id: el.id,
    text: el.textContent ?? "",
    level: parseInt(el.tagName[1]),
  }));
  if (postTitle?.trim()) {
    headings.unshift({
      id: "post-top",
      text: postTitle.trim(),
      level: 1,
    });
  }
  return headings;
}

export default function TOC({ html, postTitle }: { html: string; postTitle?: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const parsed = parseHeadings(html, postTitle);
    setHeadings(parsed);
  }, [html, postTitle]);

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
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach(el => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="max-h-[calc(50vh)] overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
        Contents
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? "0.75rem" : 0 }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                setActive(h.id);
              }}
              className={`block text-sm leading-snug transition-colors ${
                active === h.id
                  ? "text-blue-500 dark:text-blue-400 font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
