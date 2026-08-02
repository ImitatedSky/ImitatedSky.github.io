import { useEffect, useState } from "react";

interface GhComment {
  id: number;
  body: string;
  created_at: string;
  html_url: string;
  user: { login: string; avatar_url: string };
}

const API =
  "https://api.github.com/repos/ImitatedSky/blog-utterances/issues/comments?sort=created&direction=desc&per_page=6";
const CACHE_KEY = "newest-comments-v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 min, same as original Butterfly setting

function stripMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[#>*_~|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

export default function NewestComments() {
  const [comments, setComments] = useState<GhComment[] | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { t, data } = JSON.parse(cached);
        if (Date.now() - t < CACHE_TTL && Array.isArray(data)) {
          setComments(data);
          return;
        }
      }
    } catch {
      /* corrupted cache — refetch */
    }

    let cancelled = false;
    fetch(API)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: GhComment[]) => {
        if (cancelled) return;
        const slim = data.map((c) => ({
          id: c.id,
          body: c.body,
          created_at: c.created_at,
          html_url: c.html_url,
          user: { login: c.user.login, avatar_url: c.user.avatar_url },
        }));
        setComments(slim);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: slim }));
        } catch {
          /* storage full — ignore */
        }
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!comments || comments.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
        最新留言
      </h3>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id}>
            <a
              href={c.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2.5 group"
            >
              <img
                src={c.user.avatar_url}
                alt={c.user.login}
                className="w-8 h-8 rounded-full shrink-0 bg-zinc-100 dark:bg-zinc-800"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-xs leading-snug line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  {stripMarkdown(c.body) || "（附件留言）"}
                </p>
                <p className="text-[0.7rem] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {c.user.login} · {c.created_at.slice(0, 10)}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
