import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiSearch, FiMenu, FiX, FiSun, FiMoon, FiChevronDown } from "react-icons/fi";
import { usePosts } from "../hooks/usePosts";
import { SITE, NAV_LINKS } from "../config/site";

export default function Nav({ onSearchOpen }: { onSearchOpen: () => void }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const { posts } = usePosts();

  // Categories for the dropdown, sorted by post count desc
  const catCounts = new Map<string, number>();
  for (const p of posts) {
    for (const c of p.categories) catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  }
  const categories = Array.from(catCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === null ? true : stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function isActive(to: string) {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  }

  function linkClass(to: string, extra = "") {
    return `flex items-center gap-1.5 ${extra} ${isActive(to)
      ? "text-blue-500 dark:text-blue-400"
      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"}`;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
          {SITE.name}
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map(({ to, label, icon: Icon }) =>
            to === "/categories" ? (
              /* Categories: hover/focus dropdown with All + each category */
              <li key={to} className="relative group">
                <Link to={to} className={linkClass(to)}>
                  <Icon size={13} />
                  {label}
                  <FiChevronDown size={12} className="transition-transform group-hover:rotate-180" />
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block group-focus-within:block">
                  <div className="min-w-36 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                    <Link to="/categories"
                      className="block px-4 py-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      📑 All
                    </Link>
                    {categories.map(cat => (
                      <Link key={cat} to={`/categories/${encodeURIComponent(cat)}`}
                        className="block px-4 py-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ) : (
              <li key={to}>
                <Link to={to} className={linkClass(to)}>
                  <Icon size={13} />
                  {label}
                </Link>
              </li>
            )
          )}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={onSearchOpen} aria-label="Search"
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
            <FiSearch size={18} />
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme"
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button className="md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
          <ul className="flex flex-col gap-3 text-sm font-medium">
            {NAV_LINKS.map(({ to, label, icon: Icon }) =>
              to === "/categories" ? (
                <li key={to}>
                  <div className="flex items-center justify-between">
                    <Link to={to} onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 ${isActive(to) ? "text-blue-500 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                      <Icon size={13} />
                      {label}
                    </Link>
                    <button onClick={() => setMobileCatsOpen(v => !v)} aria-label="Expand categories"
                      className="p-1 text-zinc-500 dark:text-zinc-400">
                      <FiChevronDown size={14} className={`transition-transform ${mobileCatsOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {mobileCatsOpen && (
                    <ul className="mt-2 ml-6 flex flex-col gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                      <li>
                        <Link to="/categories" onClick={() => setMenuOpen(false)}
                          className="text-zinc-500 dark:text-zinc-400">📑 All</Link>
                      </li>
                      {categories.map(cat => (
                        <li key={cat}>
                          <Link to={`/categories/${encodeURIComponent(cat)}`} onClick={() => setMenuOpen(false)}
                            className="text-zinc-500 dark:text-zinc-400">{cat}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={to}>
                  <Link to={to} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 ${isActive(to) ? "text-blue-500 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                    <Icon size={13} />
                    {label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
