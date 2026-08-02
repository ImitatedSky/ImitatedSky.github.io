import { Link } from "react-router-dom";

interface Props {
  current: number;
  total: number;
  basePath?: string; // e.g. "/page" → /page/2, /page/3
}

export default function Pagination({ current, total, basePath = "/page" }: Props) {
  if (total <= 1) return null;

  function href(n: number) {
    return n === 1 ? "/" : `${basePath}/${n}`;
  }

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {current > 1 && (
        <Link
          to={href(current - 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          ←
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-zinc-400">…</span>
        ) : (
          <Link
            key={p}
            to={href(p)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              p === current
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {current < total && (
        <Link
          to={href(current + 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          →
        </Link>
      )}
    </nav>
  );
}
