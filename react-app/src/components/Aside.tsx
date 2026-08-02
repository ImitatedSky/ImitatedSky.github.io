import React from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiMail } from "react-icons/fi";
import { FaLinkedinIn } from "react-icons/fa";
import { usePosts } from "../hooks/usePosts";
import NewestComments from "./NewestComments";
import { SITE } from "../config/site";

interface AsideProps {
  /** Wrap the whole Aside in sticky top-20 (default, for non-post pages) */
  sticky?: boolean;
  /**
   * PostPage mode: author card + announcement scroll normally;
   * TOC + recent posts + categories + tags + archives are in a sticky top-20 block.
   * Requires the parent sidebar column to be self-stretch so sticky has enough height.
   */
  splitSticky?: boolean;
  /** Injected between announcement and recent posts (PostPage only) */
  tocSlot?: React.ReactNode;
}

export default function Aside({ sticky = true, splitSticky = false, tocSlot }: AsideProps) {
  const { posts } = usePosts();
  const recent = posts.slice(0, 5);

  const tagSet = new Set(posts.flatMap(p => p.tags));
  const catSet = new Set(posts.flatMap(p => p.categories));

  const catCounts = new Map<string, number>();
  for (const p of posts) {
    for (const c of p.categories) catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  }
  const categories = Array.from(catCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const tagCounts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const tags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 30);
  const maxTagCount = tags[0]?.[1] ?? 1;

  const yearCounts = new Map<string, number>();
  for (const p of posts) {
    const y = p.date?.slice(0, 4);
    if (y) yearCounts.set(y, (yearCounts.get(y) ?? 0) + 1);
  }
  const archives = Array.from(yearCounts.entries()).sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 5);

  // Site info (Butterfly card_webinfo): last updated = newest `updated ?? date`
  const lastUpdated = posts.reduce((max, p) => {
    const d = p.updated || p.date || "";
    return d > max ? d : max;
  }, "");

  const authorCard = (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="h-20 bg-gradient-to-br from-blue-500 to-violet-600" />
      <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-900 bg-zinc-200">
          <img src="/img/MyAvatar.jpg" alt={SITE.author} className="w-full h-full object-cover" />
        </div>
        <h2 className="mt-3 font-bold text-base">{SITE.author}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{SITE.tagline}</p>
        <div className="mt-3 flex items-center gap-0 w-full border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Link to="/archives" className="flex-1 flex flex-col items-center hover:text-blue-500 transition-colors">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">{posts.length}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">文章</span>
          </Link>
          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
          <Link to="/tags" className="flex-1 flex flex-col items-center hover:text-blue-500 transition-colors">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">{tagSet.size}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">標籤</span>
          </Link>
          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
          <Link to="/categories" className="flex-1 flex flex-col items-center hover:text-blue-500 transition-colors">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">{catSet.size}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">分類</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <a href={SITE.github} target="_blank" rel="noopener noreferrer"
            aria-label="GitHub" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <FiGithub size={16} />
          </a>
          <a href={`mailto:${SITE.email}`} aria-label="Email"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <FiMail size={16} />
          </a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer"
            aria-label="LinkedIn" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <FaLinkedinIn size={16} />
          </a>
        </div>
        <a href={SITE.github} target="_blank" rel="noopener noreferrer"
          className="mt-4 w-full text-center text-xs font-medium py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-80 transition-opacity">
          Follow Me
        </a>
      </div>
    </div>
  );

  const announcement = (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
        📢 公告
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        如果在使用中遇到問題，可以到{" "}
        <a href={SITE.announcementLink} target="_blank" rel="noopener noreferrer"
          className="text-blue-500 hover:underline">Github Issues</a>{" "}
        進行反饋。
      </p>
    </div>
  );

  const widgets = (
    <>
      {/* TOC slot — card-wrapped */}
      {tocSlot && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          {tocSlot}
        </div>
      )}

      {/* Recent posts */}
      {recent.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">最新文章</h3>
          <ul className="space-y-3">
            {recent.map(p => (
              <li key={p.slug}>
                <Link to={`/posts/${p.slug}`} className="flex gap-3 group">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="text-xs leading-snug line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{p.title}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{p.date}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">分類</h3>
          <ul className="space-y-1.5">
            {categories.map(([cat, count]) => (
              <li key={cat}>
                <Link to={`/categories/${encodeURIComponent(cat)}`}
                  className="flex justify-between items-center text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <span>{cat}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags cloud */}
      {tags.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">標籤</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(([tag, count]) => {
              const ratio = count / maxTagCount;
              const size = ratio > 0.6 ? "text-sm" : ratio > 0.3 ? "text-xs" : "text-[0.7rem]";
              return (
                <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}
                  className={`${size} px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}>
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Archives */}
      {archives.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">歸檔</h3>
          <ul className="space-y-1.5">
            {archives.map(([year, count]) => (
              <li key={year}>
                <Link to="/archives"
                  className="flex justify-between items-center text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <span>{year}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{count} 篇</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Newest comments (Butterfly newest_comments) */}
      <NewestComments />

      {/* Site info (Butterfly card_webinfo) */}
      {posts.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">網站資訊</h3>
          <ul className="space-y-1.5 text-sm">
            <li className="flex justify-between items-center">
              <span>文章總數</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{posts.length}</span>
            </li>
            {lastUpdated && (
              <li className="flex justify-between items-center">
                <span>最後更新</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{lastUpdated}</span>
              </li>
            )}
            {SITE.busuanzi && (
              <li className="flex justify-between items-center">
                <span>訪問人數</span>
                <span id="busuanzi_value_site_uv" className="text-xs text-zinc-400 dark:text-zinc-500" />
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );

  /* splitSticky: author card + announcement scroll; TOC + widgets are sticky */
  if (splitSticky) {
    return (
      <div className="h-full flex flex-col gap-4">
        {authorCard}
        {announcement}
        <div className="sticky top-20 flex flex-col gap-4">
          {widgets}
        </div>
      </div>
    );
  }

  /* Default: whole aside optionally sticky (for non-post pages) */
  return (
    <div className={`${sticky ? "sticky top-20 " : ""}flex flex-col gap-4`}>
      {authorCard}
      {announcement}
      {widgets}
    </div>
  );
}
