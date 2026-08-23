import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { usePageTitle } from "../hooks/usePageTitle";
import ContentWithAside from "../components/ContentWithAside";
import PageBanner from "../components/PageBanner";
import {
  DIFFICULTIES,
  DIFFICULTY_STYLES,
  algoTags,
  difficulties,
  difficultyRank,
  isLeetcode,
  isWip,
  problemNumber,
  type Difficulty,
} from "../lib/leetcode";

type SortKey = "num" | "difficulty" | "date";

export default function LeetcodePage() {
  const { posts, loading } = usePosts();
  usePageTitle("LeetCode 題目索引");

  // Filters and sort live in the URL so a view like "hard + DP" is shareable
  // and the Back button restores it.
  const [params, setParams] = useSearchParams();
  const activeDiff = params.get("d") as Difficulty | null;
  const activeTag = params.get("t");
  const sortKey = (params.get("s") as SortKey) || "num";
  const desc = params.get("o") === "desc";

  function update(next: Record<string, string | null>) {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    setParams(p, { replace: true });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) update({ o: desc ? null : "desc" });
    else update({ s: key, o: null });
  }

  const problems = useMemo(() => posts.filter(isLeetcode), [posts]);

  const stats = useMemo(() => {
    const byDiff = Object.fromEntries(
      DIFFICULTIES.map((d) => [
        d,
        problems.filter((p) => difficulties(p).includes(d)).length,
      ]),
    ) as Record<Difficulty, number>;
    return { total: problems.length, byDiff, wip: problems.filter(isWip).length };
  }, [problems]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of problems) {
      for (const t of algoTags(p)) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [problems]);

  const rows = useMemo(() => {
    let list = problems;
    if (activeDiff) list = list.filter((p) => difficulties(p).includes(activeDiff));
    if (activeTag) list = list.filter((p) => algoTags(p).includes(activeTag));

    const sorted = [...list].sort((a, b) => {
      if (sortKey === "difficulty") {
        const d = difficultyRank(a) - difficultyRank(b);
        if (d !== 0) return d;
      } else if (sortKey === "date") {
        const d = (b.date || "").localeCompare(a.date || "");
        if (d !== 0) return d;
      }
      // problem number is the default order and the tie-breaker for the others
      const na = problemNumber(a);
      const nb = problemNumber(b);
      if (na === null) return 1;
      if (nb === null) return -1;
      return na - nb;
    });
    return desc ? sorted.reverse() : sorted;
  }, [problems, activeDiff, activeTag, sortKey, desc]);

  const th =
    "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500";
  const sortable = `${th} cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors`;
  const arrow = (key: SortKey) => (sortKey === key ? (desc ? " ↓" : " ↑") : "");
  const chipBase = "px-2.5 py-1 rounded-full text-xs font-medium transition-colors";
  const chipOn = "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900";

  return (
    <>
      <PageBanner
        title="LeetCode 題目索引"
        subtitle={`共 ${stats.total} 題 · easy ${stats.byDiff.easy} · medium ${stats.byDiff.medium} · hard ${stats.byDiff.hard}`}
      />
      <ContentWithAside>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : (
          <>
            <div className="mb-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">難度</span>
                <button
                  onClick={() => update({ d: null })}
                  className={`${chipBase} ${
                    !activeDiff
                      ? chipOn
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  全部
                </button>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => update({ d: activeDiff === d ? null : d })}
                    className={`${chipBase} ${
                      activeDiff === d ? chipOn : DIFFICULTY_STYLES[d]
                    }`}
                  >
                    {d} {stats.byDiff[d]}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">演算法</span>
                <select
                  value={activeTag ?? ""}
                  onChange={(e) => update({ t: e.target.value || null })}
                  aria-label="依演算法篩選"
                  className="px-2 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">全部（{allTags.length} 種）</option>
                  {allTags.map(([t, n]) => (
                    <option key={t} value={t}>
                      {t} ({n})
                    </option>
                  ))}
                </select>
                {(activeDiff || activeTag) && (
                  <button
                    onClick={() => update({ d: null, t: null })}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    清除篩選
                  </button>
                )}
                <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                  顯示 {rows.length} / {stats.total}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className={sortable} onClick={() => toggleSort("num")}>
                      #{arrow("num")}
                    </th>
                    <th className={th}>題目</th>
                    <th className={sortable} onClick={() => toggleSort("difficulty")}>
                      難度{arrow("difficulty")}
                    </th>
                    <th className={`${th} hidden md:table-cell`}>演算法</th>
                    <th
                      className={`${sortable} hidden sm:table-cell`}
                      onClick={() => toggleSort("date")}
                    >
                      日期{arrow("date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr
                      key={p.slug}
                      className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-3 py-2 tabular-nums text-zinc-400 dark:text-zinc-500 align-top">
                        {problemNumber(p) ?? "—"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <Link
                          to={`/posts/${p.slug}`}
                          className="font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        >
                          {p.title.replace(/^leetcode[#\s_-]*\d+\.?\s*/i, "") || p.title}
                        </Link>
                        {isWip(p) && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[0.65rem] bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 align-middle">
                            施工中
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        {difficulties(p).map((d) => (
                          <span
                            key={d}
                            className={`inline-block px-1.5 py-0.5 rounded text-[0.7rem] font-medium mr-1 ${DIFFICULTY_STYLES[d]}`}
                          >
                            {d}
                          </span>
                        ))}
                      </td>
                      <td className="px-3 py-2 align-top hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {algoTags(p).map((t) => (
                            <button
                              key={t}
                              onClick={() => update({ t })}
                              className="px-1.5 py-0.5 rounded text-[0.7rem] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top hidden sm:table-cell text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {p.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-zinc-400">
                  沒有符合條件的題目
                </p>
              )}
            </div>
          </>
        )}
      </ContentWithAside>
    </>
  );
}
