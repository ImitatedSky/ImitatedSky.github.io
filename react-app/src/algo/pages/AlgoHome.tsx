import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2 } from "react-icons/fi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CATEGORIES, PROBLEMS, TAGS } from "../catalog";
import TagChip from "../components/TagChip";
import { useLang } from "../lang";
import { useProgress } from "../progress";
import { SORTS, SORT_BY_ID } from "../sorting";
import type { Difficulty } from "../types";
import { ViewRenderer } from "../views";
import { rich } from "../views/shared";

const DEMO_INPUT = [5, 2, 8, 3, 9, 1, 6, 4];
const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

/** A small self-playing sort in the hero — the product, shown rather than described */
function HeroDemo() {
  const algo = SORT_BY_ID.get("quick") ?? SORTS[0];
  const frames = useMemo(() => (algo ? algo.trace(DEMO_INPUT) : []), [algo]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (frames.length === 0) return;
    const atEnd = i >= frames.length - 1;
    const t = setTimeout(() => setI(atEnd ? 0 : i + 1), atEnd ? 2600 : 620);
    return () => clearTimeout(t);
  }, [i, frames.length]);

  const frame = frames[i];
  if (!algo || !frame) return null;
  return (
    <Link to={`/algo/sorting/${algo.id}`} className="algo-card algo-hero-demo" aria-label={`${algo.nameZh} 示範`}>
      <div className="algo-hero-demo-head">
        <span>
          {algo.name} · {algo.nameZh}
        </span>
        <span>
          {String(i + 1).padStart(2, "0")} / {frames.length}
        </span>
      </div>
      <ViewRenderer view={{ ...frame.views[0], label: undefined } as typeof frame.views[0]} />
      <p className="algo-hero-demo-note">{rich(frame.note)}</p>
    </Link>
  );
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  return (
    <div className="algo-ring">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <defs>
          <linearGradient id="algo-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle className="track" cx="56" cy="56" r={r} />
        <circle
          className="value"
          cx="56"
          cy="56"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - (total ? done / total : 0))}
        />
      </svg>
      <div className="algo-ring-label">
        <b>{done}</b>
        <span>/ {total}</span>
      </div>
    </div>
  );
}

export default function AlgoHome() {
  usePageTitle("Algo Lab — LeetCode 150 動畫圖解");
  const { store } = useProgress();
  const { lang } = useLang();

  const doneCount = PROBLEMS.filter((p) => store[p.slug] === "done").length;
  const next = PROBLEMS.find((p) => store[p.slug] !== "done") ?? PROBLEMS[0];
  const reviewCount = PROBLEMS.filter((p) => store[p.slug] === "review").length;

  return (
    <>
      <section className="algo-hero">
        <div>
          <div className="algo-eyebrow">LeetCode Top Interview 150</div>
          <h1 className="algo-h1">
            看得見的
            <br />
            <em>演算法練習室</em>
          </h1>
          <p className="algo-hero-lead">
            150 題經典面試題，每一題都有逐步動畫圖解、與動畫同步的 Python 程式碼、思路拆解，還能直接在瀏覽器裡寫
            Python 跑測試。不用背，看懂它。
          </p>
          <div className="algo-hero-cta">
            <Link to={`/algo/p/${next.slug}`} className="algo-btn is-primary">
              {doneCount > 0 ? "繼續練習" : "開始練習"}：{next.titleZh} <FiArrowRight />
            </Link>
            <Link to="/algo/sorting" className="algo-btn">
              <FiBarChart2 /> 排序視覺化
            </Link>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section className="algo-card algo-stats">
        <Ring done={doneCount} total={PROBLEMS.length} />
        <div>
          <div className="algo-stats-bars">
            {DIFFS.map((d) => {
              const all = PROBLEMS.filter((p) => p.difficulty === d);
              const done = all.filter((p) => store[p.slug] === "done").length;
              return (
                <div key={d}>
                  <h4>
                    <span className={`algo-diff is-${d}`}>{d}</span>
                    <span>
                      {done}/{all.length}
                    </span>
                  </h4>
                  <div
                    className="algo-progressbar"
                    style={{ "--c1": `var(--${d.toLowerCase()})`, "--c2": `var(--${d.toLowerCase()})` } as React.CSSProperties}
                  >
                    <i style={{ width: `${(done / all.length) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {reviewCount > 0 && (
            <p style={{ marginTop: 14, fontSize: "0.84rem", color: "var(--muted)" }}>
              有 {reviewCount} 題標記為待複習 ·{" "}
              <Link to="/algo/problems?s=review" style={{ color: "var(--accent)" }}>
                去複習
              </Link>
            </p>
          )}
        </div>
      </section>

      <div className="algo-section-head">
        <div>
          <h2>23 個主題</h2>
          <p>依官方學習計畫的順序排列，由淺入深。</p>
        </div>
        <Link to="/algo/problems">全部題目 →</Link>
      </div>
      <div className="algo-cat-grid">
        {CATEGORIES.map((c, i) => {
          const all = PROBLEMS.filter((p) => p.category === c.id);
          const done = all.filter((p) => store[p.slug] === "done").length;
          return (
            <Link
              key={c.id}
              to={`/algo/problems?c=${c.id}`}
              className="algo-card algo-cat"
              style={{ "--hue": c.hue } as React.CSSProperties}
            >
              <span className="algo-cat-no">{String(i + 1).padStart(2, "0")}</span>
              <h3>
                {c.nameZh}
                <small>{c.name}</small>
              </h3>
              <p>{c.blurb}</p>
              <div className="algo-cat-foot">
                <div className="algo-progressbar">
                  <i style={{ width: `${(done / all.length) * 100}%` }} />
                </div>
                {done}/{all.length}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="algo-section-head">
        <div>
          <h2>依技巧複習</h2>
          <p>同一個技巧會出現在不同主題裡，點標籤把它們一次找出來。</p>
        </div>
      </div>
      <div className="algo-tagbar" style={{ margin: "0 0 52px" }}>
        {[...TAGS]
          .map((t) => ({ t, n: PROBLEMS.filter((p) => p.tags.includes(t.id)).length }))
          .sort((a, b) => b.n - a.n)
          .map(({ t, n }) => (
            <TagChip key={t.id} id={t.id} lang={lang} count={n} />
          ))}
      </div>

      <div className="algo-section-head">
        <div>
          <h2>排序演算法</h2>
          <p>{SORTS.length} 種排序的長條圖動畫，可自訂輸入、逐步觀察。</p>
        </div>
        <Link to="/algo/sorting">全部排序 →</Link>
      </div>
      <div className="algo-sort-strip">
        {SORTS.map((s, k) => (
          <Link key={s.id} to={`/algo/sorting/${s.id}`} className="algo-card algo-sort-tile">
            <div className="algo-mini-bars" aria-hidden>
              {DEMO_INPUT.map((_, j) => (
                <i key={j} style={{ height: `${(DEMO_INPUT[(j + k * 3) % DEMO_INPUT.length] / 9) * 100}%` }} />
              ))}
            </div>
            <h3>{s.nameZh}</h3>
            <small>
              {s.name} · {s.complexity.avg}
            </small>
          </Link>
        ))}
      </div>
    </>
  );
}
