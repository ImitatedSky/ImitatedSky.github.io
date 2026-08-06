import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type Fuse from "fuse.js";
import { FiSearch, FiX } from "react-icons/fi";
import type { SearchEntry } from "../types";

// fuse.js is only needed once search is actually opened — keep it out of the
// initial bundle alongside the already-lazy search index. The promise is
// memoised so concurrent keystrokes during the first search share one import
// and one index fetch instead of racing.
let _fusePromise: Promise<Fuse<SearchEntry>> | null = null;

function getFuse(): Promise<Fuse<SearchEntry>> {
  if (!_fusePromise) {
    _fusePromise = Promise.all([
      import("fuse.js"),
      fetch("/content/search-index.json").then((r) => {
        if (!r.ok) throw new Error(`search index ${r.status}`);
        return r.json() as Promise<SearchEntry[]>;
      }),
    ])
      .then(([{ default: FuseCtor }, index]) =>
        new FuseCtor(index, {
          keys: ["title", "tags", "categories", "excerpt"],
          threshold: 0.35,
          includeScore: true,
        }),
      )
      .catch((e) => {
        _fusePromise = null; // let the next keystroke retry
        throw e;
      });
  }
  return _fusePromise;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Search({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    // Without the guard, results from a slower earlier keystroke (or from a
    // query the user already cleared) land after a newer one and win.
    let cancelled = false;
    getFuse()
      .then(fuse => {
        if (cancelled) return;
        setResults(fuse.search(query).slice(0, 10).map(r => r.item));
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => { cancelled = true; };
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <FiSearch size={18} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:text-zinc-50"
          />
          <button onClick={onClose} aria-label="Close search" className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <FiX size={18} />
          </button>
        </div>

        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map(r => (
              <li key={r.slug}>
                <Link
                  to={`/posts/${r.slug}`}
                  onClick={onClose}
                  className="flex flex-col gap-0.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.title}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{r.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query.trim() && results.length === 0 && (
          <p className="px-4 py-6 text-sm text-center text-zinc-400">No results for "{query}"</p>
        )}
      </div>
    </div>
  );
}
