import { useParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import { usePageTitle } from "../hooks/usePageTitle";
import PostCard from "../components/PostCard";
import ContentWithAside from "../components/ContentWithAside";
import PageBanner from "../components/PageBanner";

export default function CategoryPage() {
  const { cat = "" } = useParams<{ cat: string }>();
  const decoded = decodeURIComponent(cat);
  const { posts, loading } = usePosts();
  usePageTitle(decoded);

  const filtered = posts.filter(p => p.categories.includes(decoded));

  return (
    <>
      <PageBanner title={decoded} subtitle={`${filtered.length} 篇文章`} />
      <ContentWithAside>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        )}
      </ContentWithAside>
    </>
  );
}
