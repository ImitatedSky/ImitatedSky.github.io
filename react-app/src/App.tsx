import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import PostPage from "./pages/PostPage";
import TagsPage from "./pages/TagsPage";
import TagPage from "./pages/TagPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import ArchivesPage from "./pages/ArchivesPage";
import LinksPage from "./pages/LinksPage";
import MessageBoardPage from "./pages/MessageBoardPage";
import Search from "./components/Search";
import BackToTop from "./components/BackToTop";
import PowerMode from "./components/PowerMode";
import CanvasNest from "./components/CanvasNest";
import { useState, useEffect } from "react";
import { usePageTitle } from "./hooks/usePageTitle";
import { SITE } from "./config/site";

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  // SPA route changes keep the scroll position; jump to top like a full page
  // load would (otherwise prev/next at the bottom of a post looks like a no-op)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Global search keyboard shortcut: / or Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key === "k")) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <CanvasNest />
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BackToTop />
      <PowerMode />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page/:n" element={<Home />} />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tags/:tag" element={<TagPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:cat" element={<CategoryPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/messageboard" element={<MessageBoardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-800">
        ©{SITE.copyrightFrom} – {new Date().getFullYear()} By {SITE.author}
      </footer>
    </div>
  );
}

function NotFound() {
  usePageTitle("404");
  return (
    <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
      <p className="text-6xl font-bold mb-4">404</p>
      <p className="text-lg">Page not found</p>
    </div>
  );
}
