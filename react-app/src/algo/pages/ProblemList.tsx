import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheck, FiRotateCw, FiSearch } from "react-icons/fi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CATEGORIES, CATEGORY_BY_ID, PROBLEMS } from "../catalog";
import { useProgress } from "../progress";
import { useLang } from "../lang";
import type { Difficulty } from "../types";

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];
const STATUSES = [
  { id: "todo", label: "未完成" },
  { id: "done", label: "已完成" },
  { id: "review", label: "待複習" },
];

export default function ProblemList() {
  usePageTitle("題庫 150 — Algo Lab");
  const { store, toggleDone } = useProgress();
  const { lang } = useLang();

  // Filters live in the URL so a view is shareable and Back restores it
  const [params, setParams] = useSearchParams();
  const cat = params.get("c");
  const diff = params.get("d");
  const status = params.get("s");
  const q = params.get("q") ?? "";

  function update(key: string, value: string | null) {
    const p = new URLSearchParams(params);
    if (value === null || value === "") p.delete(key);
    else p.set(key, value);
    setParams(p, { replace: true });
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PROBLEMS.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (diff && p.difficulty !== diff) return false;
      if (status === "done" && store[p.slug] !== "done") return false;
      if (status === "review" && store[p.slug] !== "review") return false;
      if (status === "todo" && store[p.slug] === "done") return false;
      if (needle) {
        const hay = `${p.id} ${p.title} ${p.titleZh}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [cat, diff, status, q, store]);

  const groups = CATEGORIES.map((c) => ({
    cat: c,
    items: filtered.filter((p) => p.category === c.id),
  })).filter((g) => g.items.length > 0);

  const doneTotal = PROBLEMS.filter((p) => store[p.slug] === "done").length;

  return (
    <>
      <div className="algo-section-head">
        <div>
          <div className="algo-eyebrow">Problems</div>
          <h1 className="algo-h1" style={{ fontSize: "2.1rem", marginTop: 6 }}>
            題庫 150
          </h1>
          <p>
            已完成 {doneTotal} / {PROBLEMS.length} 題 · 顯示 {filtered.length} 題
          </p>
        </div>
      </div>

      <div className="algo-list-layout">
        <aside className="algo-card algo-list-side">
          <button className={!cat ? "is-on" : ""} onClick={() => update("c", null)}>
            <span>全部主題</span>
            <span>{PROBLEMS.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const all = PROBLEMS.filter((p) => p.category === c.id);
            const done = all.filter((p) => store[p.slug] === "done").length;
            return (
              <button key={c.id} className={cat === c.id ? "is-on" : ""} onClick={() => update("c", c.id)}>
                <span>{c.nameZh}</span>
                <span>
                  {done}/{all.length}
                </span>
              </button>
            );
          })}
        </aside>

        <div>
          <div className="algo-filters">
            <label className="algo-search">
              <FiSearch />
              <input
                value={q}
                onChange={(e) => update("q", e.target.value)}
                placeholder="搜尋題號或標題…"
                aria-label="搜尋題目"
              />
            </label>
            <select
              className="algo-cat-select"
              value={cat ?? ""}
              onChange={(e) => update("c", e.target.value || null)}
              aria-label="主題"
            >
              <option value="">全部主題</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameZh}
                </option>
              ))}
            </select>
            {DIFFS.map((d) => (
              <button
                key={d}
                className={`algo-chip ${diff === d ? "is-on" : ""}`}
                onClick={() => update("d", diff === d ? null : d)}
              >
                {d}
                <b>{PROBLEMS.filter((p) => p.difficulty === d).length}</b>
              </button>
            ))}
            {STATUSES.map((s) => (
              <button
                key={s.id}
                className={`algo-chip ${status === s.id ? "is-on" : ""}`}
                onClick={() => update("s", status === s.id ? null : s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {groups.length === 0 && (
            <div className="algo-card algo-empty-state">
              沒有符合條件的題目 ·{" "}
              <button
                onClick={() => setParams({}, { replace: true })}
                style={{ color: "var(--accent)", background: "none", border: 0 }}
              >
                清除篩選
              </button>
            </div>
          )}

          {groups.map(({ cat: c, items }) => (
            <section key={c.id} className="algo-group">
              <div className="algo-group-head">
                <h2>{c.nameZh}</h2>
                <span>
                  {c.name} · {items.length} 題
                </span>
              </div>
              <div className="algo-card algo-rows">
                {items.map((p) => {
                  const st = store[p.slug];
                  return (
                    <div key={p.slug} className="algo-row">
                      <button
                        className={`algo-status ${st ? `is-${st}` : ""}`}
                        onClick={() => toggleDone(p.slug)}
                        aria-label={st === "done" ? "取消完成" : "標記為完成"}
                        title={st === "done" ? "已完成" : st === "review" ? "待複習" : "標記為完成"}
                      >
                        {st === "review" ? <FiRotateCw size={11} /> : <FiCheck size={12} />}
                      </button>
                      <span className="algo-row-no">#{p.id}</span>
                      <Link to={`/algo/p/${p.slug}`} className="algo-row-title">
                        <b>{lang === "en" ? p.title : p.titleZh}</b>
                        <small>{lang === "en" ? p.titleZh : p.title}</small>
                      </Link>
                      <span className={`algo-diff is-${p.difficulty}`}>{p.difficulty}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {cat && CATEGORY_BY_ID.get(cat) && groups.length > 0 && (
            <p style={{ fontSize: "0.84rem", color: "var(--muted)" }}>{CATEGORY_BY_ID.get(cat)!.blurb}</p>
          )}
        </div>
      </div>
    </>
  );
}
