import { Link } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { usePageTitle } from "../hooks/usePageTitle";
import ContentWithAside from "../components/ContentWithAside";
import PageBanner from "../components/PageBanner";

export default function CategoriesPage() {
  const { posts, loading } = usePosts();
  usePageTitle("Categories");

  const catCounts = new Map<string, number>();
  for (const p of posts) {
    for (const c of p.categories) catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  }
  const categories = Array.from(catCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageBanner title="Categories" subtitle={`共 ${categories.length} 個分類`} />
      <ContentWithAside>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : (
          <ul className="space-y-2">
            {categories.map(([cat, count]) => (
              <li key={cat}>
                <Link
                  to={`/categories/${encodeURIComponent(cat)}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
                >
                  <span className="font-medium">{cat}</span>
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">{count} 篇</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ContentWithAside>
    </>
  );
}
