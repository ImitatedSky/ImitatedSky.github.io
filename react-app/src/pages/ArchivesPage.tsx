import { Link } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { usePageTitle } from "../hooks/usePageTitle";
import ContentWithAside from "../components/ContentWithAside";
import PageBanner from "../components/PageBanner";

export default function ArchivesPage() {
  const { posts, loading } = usePosts();
  usePageTitle("Archives");

  // Group by year only
  const grouped = new Map<string, typeof posts>();
  for (const p of posts) {
    const year = p.date?.slice(0, 4) ?? "Unknown";
    if (!grouped.has(year)) grouped.set(year, []);
    grouped.get(year)!.push(p);
  }
  const years = Array.from(grouped.keys()).sort((a, b) => Number(b) - Number(a));

  return (
    <>
      <PageBanner title="Archives" subtitle={`共 ${posts.length} 篇文章`} />
      <ContentWithAside>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : (
          <div className="space-y-8">
            {years.map(year => (
              <section key={year}>
                <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  {year}
                </h2>
                <div className="space-y-3">
                  {grouped.get(year)!.map(post => (
                    <Link key={post.slug} to={`/posts/${post.slug}`}
                      className="flex items-center gap-4 group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg p-2 -mx-2 transition-colors">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                        <img src={post.cover} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{post.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </ContentWithAside>
    </>
  );
}
