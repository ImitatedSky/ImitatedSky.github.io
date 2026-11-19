import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheck, FiCode, FiExternalLink, FiFilm, FiRotateCw, FiZap } from "react-icons/fi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { BY_SLUG, CATEGORY_BY_ID, PROBLEMS, leetcodeUrl } from "../catalog";
import CodePanel from "../components/CodePanel";
import Player from "../components/Player";
import Practice from "../components/Practice";
import { setStatus, useProgress } from "../progress";
import { loadProblem } from "../registry";
import type { AnyProblem, Frame } from "../types";
import { rich } from "../views/shared";
import { useLang } from "../lang";
import type { Lang } from "../lang";

type Tab = "visual" | "idea" | "practice";
type Loaded = { slug: string; problem: AnyProblem | null };

export default function ProblemPage() {
  const { slug = "" } = useParams();
  const meta = BY_SLUG.get(slug);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [tab, setTab] = useState<Tab>("visual");
  const [presetIdx, setPresetIdx] = useState(0);
  const { status, toggleDone, toggleReview } = useProgress();
  const { lang, setLang } = useLang();

  usePageTitle(meta ? `${meta.id}. ${meta.titleZh} — Algo Lab` : "找不到題目");

  useEffect(() => {
    let alive = true;
    setPresetIdx(0);
    setTab("visual");
    loadProblem(slug)
      .then((problem) => alive && setLoaded({ slug, problem }))
      .catch(() => alive && setLoaded({ slug, problem: null }));
    return () => {
      alive = false;
    };
  }, [slug]);

  const problem = loaded?.slug === slug ? loaded.problem : undefined;
  const preset = problem?.presets[Math.min(presetIdx, problem.presets.length - 1)];

  const traced = useMemo<{ frames: Frame[]; error?: string }>(() => {
    if (!problem || !preset) return { frames: [] };
    try {
      return { frames: problem.trace(preset.input) };
    } catch (e) {
      return { frames: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [problem, preset]);

  if (!meta) {
    return (
      <div className="algo-empty-state">
        找不到這一題 ·{" "}
        <Link to="/algo/problems" style={{ color: "var(--accent)" }}>
          回題庫
        </Link>
      </div>
    );
  }

  const cat = CATEGORY_BY_ID.get(meta.category)!;
  const at = PROBLEMS.findIndex((p) => p.slug === slug);
  const prev = PROBLEMS[at - 1];
  const next = PROBLEMS[at + 1];
  const st = status(slug);

  return (
    <>
      <nav className="algo-crumbs" aria-label="麵包屑">
        <Link to="/algo">總覽</Link>
        <span>/</span>
        <Link to={`/algo/problems?c=${cat.id}`}>{cat.nameZh}</Link>
        <span>/</span>
        <span>#{meta.id}</span>
      </nav>

      <header className="algo-problem-head">
        <div>
          <h1 className="algo-h1">
            <span>{meta.id}.</span>
            {lang === "en" ? meta.title : meta.titleZh}
          </h1>
          <div className="algo-problem-sub">
            <span className={`algo-diff is-${meta.difficulty}`}>{meta.difficulty}</span>
            <span>{lang === "en" ? meta.titleZh : meta.title}</span>
            <a href={leetcodeUrl(slug)} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
              LeetCode 原題 <FiExternalLink style={{ display: "inline", verticalAlign: "-2px" }} />
            </a>
          </div>
        </div>
        <div className="algo-problem-actions">
          <button className={`algo-btn is-small ${st === "review" ? "is-review" : ""}`} onClick={() => toggleReview(slug)}>
            <FiRotateCw /> {st === "review" ? "待複習" : "稍後複習"}
          </button>
          <button className={`algo-btn is-small ${st === "done" ? "is-done" : ""}`} onClick={() => toggleDone(slug)}>
            <FiCheck /> {st === "done" ? "已完成" : "標記完成"}
          </button>
        </div>
      </header>

      {problem === undefined && <div className="algo-card algo-empty-state">載入中…</div>}
      {problem === null && (
        <div className="algo-card algo-empty-state">
          這一題的圖解還在施工中，可以先到{" "}
          <a href={leetcodeUrl(slug)} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            LeetCode
          </a>{" "}
          看原題。
        </div>
      )}

      {problem && (
        <>
          <Statement problem={problem} lang={lang} onLang={setLang} />

          <div className="algo-tabs" role="tablist">
            <button role="tab" aria-selected={tab === "visual"} className={tab === "visual" ? "is-on" : ""} onClick={() => setTab("visual")}>
              <FiFilm /> 動畫圖解
            </button>
            <button role="tab" aria-selected={tab === "idea"} className={tab === "idea" ? "is-on" : ""} onClick={() => setTab("idea")}>
              <FiZap /> 思路解析
            </button>
            <button role="tab" aria-selected={tab === "practice"} className={tab === "practice" ? "is-on" : ""} onClick={() => setTab("practice")}>
              <FiCode /> 動手練習
            </button>
          </div>

          {tab === "visual" &&
            (traced.error ? (
              <div className="algo-card algo-empty-state">動畫產生失敗：{traced.error}</div>
            ) : (
              <Player
                key={`${slug}-${presetIdx}`}
                frames={traced.frames}
                code={problem.code}
                toolbar={
                  <>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>輸入</span>
                    {problem.presets.map((p, i) => (
                      <button
                        key={i}
                        className={`algo-chip ${i === presetIdx ? "is-on" : ""}`}
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem" }}
                        onClick={() => setPresetIdx(i)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </>
                }
              />
            ))}

          {tab === "idea" && (
            <section className="algo-card algo-prose">
              <h3>核心想法</h3>
              <p>{rich(problem.idea)}</p>
              <h3>步驟</h3>
              <ol>
                {problem.steps.map((s, i) => (
                  <li key={i}>{rich(s)}</li>
                ))}
              </ol>
              {problem.pitfalls && problem.pitfalls.length > 0 && (
                <>
                  <h3>容易踩的坑</h3>
                  <ul>
                    {problem.pitfalls.map((s, i) => (
                      <li key={i}>{rich(s)}</li>
                    ))}
                  </ul>
                </>
              )}
              <h3>複雜度</h3>
              <div className="algo-complexity">
                <div>
                  <span>時間</span>
                  <b>{problem.complexity.time}</b>
                </div>
                <div>
                  <span>空間</span>
                  <b>{problem.complexity.space}</b>
                </div>
              </div>
              <h3>Python 解法</h3>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-2)", overflow: "hidden" }}>
                <CodePanel code={problem.code} />
              </div>
            </section>
          )}

          {tab === "practice" && (
            <Practice key={slug} slug={slug} starter={problem.starter} onPass={() => setStatus(slug, "done")} />
          )}
        </>
      )}

      <nav className="algo-pager">
        {prev ? (
          <Link to={`/algo/p/${prev.slug}`} className="algo-card">
            <small>← 上一題</small>
            <b>
              {prev.id}. {prev.titleZh}
            </b>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/algo/p/${next.slug}`} className="algo-card">
            <small>下一題 →</small>
            <b>
              {next.id}. {next.titleZh}
            </b>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}

const STATEMENT_TEXT = {
  en: { heading: "Problem", more: "Examples & constraints", input: "Input", output: "Output", constraints: "Constraints" },
  zh: { heading: "題目", more: "範例與限制", input: "輸入", output: "輸出", constraints: "限制" },
};

/** Problem statement with an EN / 中文 switch. Falls back to 中文 where no English text exists yet. */
function Statement({ problem, lang, onLang }: { problem: AnyProblem; lang: Lang; onLang: (l: Lang) => void }) {
  const en = lang === "en" && !!problem.summaryEn;
  const t = STATEMENT_TEXT[en ? "en" : "zh"];
  const summary = en ? problem.summaryEn! : problem.summary;
  const constraints = en && problem.constraintsEn?.length ? problem.constraintsEn : problem.constraints;

  return (
    <section className="algo-card algo-prose" style={{ marginBottom: 18 }} lang={en ? "en" : "zh-Hant"}>
      <div className="algo-statement-head">
        <h3>{t.heading}</h3>
        <div className="algo-lang" role="group" aria-label="Language / 語言">
          <button className={lang === "en" ? "is-on" : ""} aria-pressed={lang === "en"} onClick={() => onLang("en")}>
            EN
          </button>
          <button className={lang === "zh" ? "is-on" : ""} aria-pressed={lang === "zh"} onClick={() => onLang("zh")}>
            中文
          </button>
        </div>
      </div>
      {lang === "en" && !problem.summaryEn && <p className="algo-lang-note">English version coming soon — showing 中文.</p>}
      {summary.split(/\n\s*\n/).map((para, i) => (
        <p key={i}>{rich(para)}</p>
      ))}
      <details className="algo-details">
        <summary>{t.more}</summary>
        {problem.examples.map((ex, i) => {
          const note = en ? (ex.noteEn ?? ex.note) : ex.note;
          return (
            <div key={i} className="algo-example">
              <p>
                <i>{t.input}</i>
                {ex.input}
              </p>
              <p>
                <i>{t.output}</i>
                {ex.output}
              </p>
              {note && <p className="note">{rich(note)}</p>}
            </div>
          );
        })}
        {constraints && constraints.length > 0 && (
          <>
            <h4>{t.constraints}</h4>
            <ul>
              {constraints.map((c, i) => (
                <li key={i}>{rich(c)}</li>
              ))}
            </ul>
          </>
        )}
      </details>
    </section>
  );
}
