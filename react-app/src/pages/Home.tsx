import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import ContentWithAside from "../components/ContentWithAside";
import { FaAngleDown } from "react-icons/fa";
import Typed from "typed.js";
import { usePageTitle } from "../hooks/usePageTitle";
import { SITE } from "../config/site";

const PAGE_SIZE = 10;

export default function Home() {
  const { n } = useParams<{ n?: string }>();
  const page = Math.max(1, parseInt(n ?? "1") || 1);
  const { posts, loading } = usePosts();
  usePageTitle(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);

  const total = Math.ceil(posts.length / PAGE_SIZE);
  const slice = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!subtitleRef.current) return;
    const typed = new Typed(subtitleRef.current, {
      strings: [...SITE.typedStrings],
      typeSpeed: 150,
      backSpeed: 50,
      loop: true,
      showCursor: true,
      cursorChar: "|",
    });
    return () => typed.destroy();
  }, []);

  function scrollToContent() {
    document.getElementById("post-list")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* Full-viewport hero */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* LCP element — hint the browser to fetch it first */}
        <img
          src="/img/index_img.jpg"
          alt="banner"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl font-bold tracking-tight drop-shadow-lg">{SITE.name}</h1>
          <p className="mt-3 text-white/80 text-lg drop-shadow min-h-[2em]">
            <span ref={subtitleRef} />
          </p>
        </div>
        <button
          onClick={scrollToContent}
          aria-label="Scroll to posts"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors animate-bounce"
        >
          <FaAngleDown size={32} />
        </button>
      </div>

      <div id="post-list">
        <ContentWithAside>
          {loading ? (
            <div className="flex justify-center py-20 text-zinc-400">Loading…</div>
          ) : (
            <>
              <div className="flex flex-col gap-6">
                {slice.map((post, i) => (
                  <PostCard key={post.slug} post={post} index={(page - 1) * PAGE_SIZE + i} />
                ))}
              </div>
              <Pagination current={page} total={total} />
            </>
          )}
        </ContentWithAside>
      </div>
    </>
  );
}
