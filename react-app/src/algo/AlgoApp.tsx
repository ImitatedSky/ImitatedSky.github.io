import { useEffect } from "react";
import { Link, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../hooks/useTheme";
import { usePageTitle } from "../hooks/usePageTitle";
import "./algo.css";
import "./board.css";
import AlgoHome from "./pages/AlgoHome";
import ProblemList from "./pages/ProblemList";
import ProblemPage from "./pages/ProblemPage";
import SortingPage from "./pages/SortingPage";

const FONTS =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Caveat:wght@500;700&display=swap";

function Layout() {
  const { dark, toggle } = useTheme();

  // Web fonts are only needed inside the practice area
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS;
    document.head.appendChild(link);
  }, []);

  return (
    <div className="algo">
      <header className="algo-topbar">
        <div className="algo-topbar-inner">
          <Link to="/algo" className="algo-brand" aria-label="Algo Lab 首頁">
            <div className="algo-brand-mark" aria-hidden>
              <i style={{ height: 6 }} />
              <i style={{ height: 11 }} />
              <i style={{ height: 16 }} />
            </div>
            <span>Algo Lab</span>
          </Link>
          <nav className="algo-nav">
            <NavLink to="/algo" end className={({ isActive }) => (isActive ? "is-active" : "")}>
              總覽
            </NavLink>
            <NavLink to="/algo/problems" className={({ isActive }) => (isActive ? "is-active" : "")}>
              題庫 150
            </NavLink>
            <NavLink to="/algo/sorting" className={({ isActive }) => (isActive ? "is-active" : "")}>
              排序視覺化
            </NavLink>
          </nav>
          <div className="algo-topbar-actions">
            <Link to="/" className="algo-back-blog">
              ← 回部落格
            </Link>
            <button className="algo-icon-btn" onClick={toggle} aria-label="切換深淺色主題">
              {dark ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>
          </div>
        </div>
      </header>
      <main className="algo-main">
        <Outlet />
      </main>
      <footer className="algo-footer">
        Algo Lab · 題目敘述為自行改寫的摘要，原題版權屬於{" "}
        <a href="https://leetcode.com/studyplan/top-interview-150/" target="_blank" rel="noreferrer">
          LeetCode
        </a>
        {" · "}
        <Link to="/">Imisky's Blog</Link>
      </footer>
    </div>
  );
}

function NotFound() {
  usePageTitle("404");
  return (
    <div className="algo-empty-state">
      <p className="algo-h1" style={{ fontSize: "3rem" }}>
        404
      </p>
      <p>
        找不到這個頁面，<Link to="/algo" style={{ color: "var(--accent)" }}>回總覽</Link>
      </p>
    </div>
  );
}

export default function AlgoApp() {
  return (
    <Routes>
      <Route path="/algo" element={<Layout />}>
        <Route index element={<AlgoHome />} />
        <Route path="problems" element={<ProblemList />} />
        <Route path="p/:slug" element={<ProblemPage />} />
        <Route path="sorting" element={<SortingPage />} />
        <Route path="sorting/:id" element={<SortingPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
