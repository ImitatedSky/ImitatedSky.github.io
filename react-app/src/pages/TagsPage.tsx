import { Link } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { usePageTitle } from "../hooks/usePageTitle";
import ContentWithAside from "../components/ContentWithAside";
import PageBanner from "../components/PageBanner";

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const s = 45 + (Math.abs(hash >> 8) % 30); // 45–75%
  const l = 35 + (Math.abs(hash >> 16) % 25); // 35–60%
  return `hsl(${h},${s}%,${l}%)`;
}

export default function TagsPage() {
  const { posts, loading } = usePosts();
  usePageTitle("Tags");

  const tagCounts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const tags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]);
  const maxCount = tags[0]?.[1] ?? 1;

  return (
    <>
      <PageBanner title="Tags" subtitle={`共 ${tags.length} 個標籤`} />
      <ContentWithAside>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center py-4">
            {tags.map(([tag, count]) => {
              const ratio = count / maxCount;
              const em = 1.0 + ratio * 1.2; // 1.0em – 2.2em
              return (
                <Link
                  key={tag}
                  to={`/tags/${encodeURIComponent(tag)}`}
                  style={{ fontSize: `${em.toFixed(2)}em`, color: hashColor(tag) }}
                  className="hover:opacity-75 transition-opacity"
                >
                  {tag}
                  <sup className="text-[0.6em] ml-0.5 opacity-70">{count}</sup>
                </Link>
              );
            })}
          </div>
        )}
      </ContentWithAside>
    </>
  );
}
