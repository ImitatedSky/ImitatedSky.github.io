import { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import mediumZoom from "medium-zoom";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { usePost } from "../hooks/usePost";
import { usePosts } from "../hooks/usePosts";
import { usePageTitle } from "../hooks/usePageTitle";
import TOC from "../components/TOC";
import MobileTOCButton from "../components/MobileTOCButton";
import Aside from "../components/Aside";
import TagPill from "../components/TagPill";
import CoverImage from "../components/CoverImage";
import Comments from "../components/Comments";
import { SITE, SHARE_URLS } from "../config/site";
import type { PostMeta } from "../types";

/** Intercept clicks on internal <a> links inside rendered post HTML so React Router
 *  handles them (no full-page reload). External links and anchors are left alone. */
function useInternalLinks(
  proseRef: React.RefObject<HTMLDivElement | null>,
  dep: string,
) {
  const navigate = useNavigate();
  useEffect(() => {
    const div = proseRef.current;
    if (!div) return;
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // Leave external, mailto, tel, and same-page anchors to the browser
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      )
        return;
      e.preventDefault();
      navigate(href);
    }
    div.addEventListener("click", handleClick);
    return () => div.removeEventListener("click", handleClick);
  }, [dep, navigate]);
}

/** Reading progress bar — fixed 3px bar at top of viewport, scoped to PostPage mount */
function useReadingProgress() {
  useEffect(() => {
    const bar = document.createElement("div");
    bar.id = "reading-progress";
    bar.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "z-index:200",
      "height:3px",
      "width:0%",
      "background:var(--color-primary)",
      "transition:width 0.1s linear",
      "pointer-events:none",
    ].join(";");
    document.body.appendChild(bar);

    let rafId: number | null = null;
    function updateProgress() {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      bar.style.width =
        total > 0 ? `${Math.min(100, (scrolled / total) * 100)}%` : "0%";
      rafId = null;
    }
    function onScroll() {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateProgress);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      bar.remove();
    };
  }, []);
}

/** Estimate reading time: strip tags, count words (CJK chars count individually), 200wpm */
function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) ?? []).length;
  const words = (text.match(/[a-zA-Z0-9]+/g) ?? []).length;
  return Math.max(1, Math.ceil((cjk + words) / 200));
}

/** Every <pre> gets a copy button — including raw-HTML blocks the rehype
 *  pipeline didn't wrap. Bare pres are wrapped in an equivalent figure at
 *  runtime so the shared styles (copy button, language label) apply. */
function useCopyButtons(
  proseRef: React.RefObject<HTMLDivElement | null>,
  dep: string,
) {
  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];
    root.querySelectorAll("pre").forEach((pre) => {
      let fig = pre.closest<HTMLElement>("[data-rehype-pretty-code-figure]");
      if (!fig) {
        fig = document.createElement("figure");
        fig.setAttribute("data-rehype-pretty-code-figure", "");
        pre.parentNode?.insertBefore(fig, pre);
        fig.appendChild(pre);
      }
      if (!pre.dataset.language) pre.dataset.language = "text";
      if (fig.querySelector(".copy-code-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-code-btn";
      btn.textContent = "Copy";
      fig.appendChild(btn);
      const handler = async () => {
        const code = pre.innerText;
        await navigator.clipboard.writeText(code).catch(() => {});
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      };
      btn.addEventListener("click", handler);
      cleanups.push(() => btn.removeEventListener("click", handler));
    });
    return () => cleanups.forEach((fn) => fn());
  }, [dep, proseRef]);
}

/** Butterfly copy.copyright parity: copying more than 100 chars from the
 *  article body appends an attribution notice to the clipboard text. The
 *  code-block Copy button uses navigator.clipboard directly and is unaffected. */
function useCopyCopyright(
  proseRef: React.RefObject<HTMLDivElement | null>,
  slug: string | undefined,
) {
  useEffect(() => {
    const div = proseRef.current;
    if (!div || !slug) return;
    function onCopy(e: ClipboardEvent) {
      const sel = window.getSelection()?.toString() ?? "";
      if (sel.length <= 100 || !e.clipboardData) return;
      e.preventDefault();
      const url = `${SITE.baseUrl}/posts/${slug}/`;
      e.clipboardData.setData(
        "text/plain",
        `${sel}\n\n---\n作者：${SITE.author}\n連結：${url}\n來源：${SITE.name}\n著作權歸作者所有。商業轉載請聯絡作者獲得授權，非商業轉載請註明出處。`,
      );
    }
    div.addEventListener("copy", onCopy);
    return () => div.removeEventListener("copy", onCopy);
  }, [slug, proseRef]);
}

export default function PostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { post, loading, notFound } = usePost(slug);
  const { posts } = usePosts();
  const proseRef = useRef<HTMLDivElement>(null);
  usePageTitle(notFound ? "404" : post?.title);
  useCopyButtons(proseRef, post?.contentHtml ?? "");
  useCopyCopyright(proseRef, post?.slug);
  useInternalLinks(proseRef, post?.contentHtml ?? "");
  useReadingProgress();

  // Image zoom
  useEffect(() => {
    if (!proseRef.current) return;
    const imgs = Array.from(
      proseRef.current.querySelectorAll<HTMLImageElement>("img"),
    );
    imgs.forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
      img.style.willChange = "transform";
    });
    const zoomTargets = imgs.filter((img) => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      return Math.max(w, h) > 120;
    });
    if (zoomTargets.length === 0) return;
    const zoom = mediumZoom(zoomTargets, {
      margin: 24,
      background: "rgba(0,0,0,0.85)",
    });
    return () => {
      zoom.detach();
    };
  }, [post?.contentHtml]);

  if (loading) {
    return (
      <div className="flex justify-center py-32 text-zinc-400">Loading…</div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
        <p className="text-5xl font-bold mb-4">404</p>
        <p className="text-lg">Post not found</p>
        <Link to="/" className="mt-6 text-blue-500 hover:underline text-sm">
          ← Back home
        </Link>
      </div>
    );
  }

  // Prev / Next (posts are sorted newest-first, so "prev" = older = higher index)
  const idx = posts.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? posts[idx - 1] : null; // 下一篇 (newer)
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null; // 上一篇 (older)

  // Related: same category or shared tags, exclude self, top 3 by overlap score
  const related: PostMeta[] = posts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const catScore = p.categories.some((c) => post.categories.includes(c))
        ? 2
        : 0;
      const tagScore = p.tags.filter((t) => post.tags.includes(t)).length;
      return { ...p, _score: catScore + tagScore };
    })
    .filter((p: any) => p._score > 0)
    .sort((a: any, b: any) => b._score - a._score)
    .slice(0, 3);

  return (
    <>
      {/* Cover banner with title overlay */}
      <CoverImage
        src={post.cover}
        alt={post.title}
        overlay="bg-black/45"
        fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-700" />
        }
        className="w-full h-64 md:h-80"
      >
        <div className="flex flex-col items-center gap-3 w-full">
          {post.categories.length > 0 && (
            <div className="flex gap-2">
              {post.categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/categories/${encodeURIComponent(cat)}`}
                  className="text-xs font-medium uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
          <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-lg">
            {post.title}
          </h1>
          <div className="flex flex-col items-center gap-2 text-sm text-white/70">
            <div className="flex items-center gap-3">
              <span>發表於 {post.date}</span>
              {post.updated && post.updated !== post.date && (
                <span>| 更新於 {post.updated}</span>
              )}
              <span>| {readingTime(post.contentHtml)} 分鐘閱讀</span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {post.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} variant="overlay" />
                ))}
              </div>
            )}
          </div>
        </div>
      </CoverImage>

      <div className="mx-auto max-w-[104rem] px-4 py-8">
        <div className="flex gap-7 items-start">
          {/* Main content card */}
          <div className="min-w-0 flex-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              {/* Prose */}
              <div
                id="post-top"
                ref={proseRef}
                className="px-5 md:px-6 py-8 prose prose-zinc dark:prose-invert max-w-none
                  prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
                  prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-transparent prose-pre:p-0
                  [&_:not(pre)>code]:text-[#ff7242] [&_:not(pre)>code]:bg-[rgba(255,114,66,0.1)]"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />

              {/* Copyright notice */}
              <div className="mx-5 md:mx-6 mb-6 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <p>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    作者：
                  </span>
                  {SITE.author}
                </p>
                <p>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    連結：
                  </span>
                  <a
                    href={`${SITE.baseUrl}/posts/${post.slug}/`}
                    className="text-blue-500 hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${SITE.baseUrl}/posts/${post.slug}/`}
                  </a>
                </p>
                <p>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    來源：
                  </span>
                  {SITE.name}
                </p>
                <p className="pt-1 text-zinc-400 dark:text-zinc-500">
                  著作權歸作者所有。商業轉載請聯絡作者獲得授權，非商業轉載請註明出處。
                </p>
                {/* Share buttons — plain share URLs, no third-party scripts */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-zinc-400 dark:text-zinc-500">分享：</span>
                  <button
                    aria-label="Share to Facebook"
                    onClick={() =>
                      window.open(
                        SHARE_URLS.facebook(`${SITE.baseUrl}/posts/${post.slug}/`),
                        "_blank",
                        "noopener,noreferrer,width=600,height=540",
                      )
                    }
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-[#1877f2] hover:text-white transition-colors"
                  >
                    <FaFacebookF size={12} />
                  </button>
                  <button
                    aria-label="Share to X"
                    onClick={() =>
                      window.open(
                        SHARE_URLS.x(`${SITE.baseUrl}/posts/${post.slug}/`, post.title),
                        "_blank",
                        "noopener,noreferrer,width=600,height=540",
                      )
                    }
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-black hover:text-white transition-colors"
                  >
                    <FaXTwitter size={12} />
                  </button>
                  <button
                    aria-label="Share to LINE"
                    onClick={() =>
                      window.open(
                        SHARE_URLS.line(`${SITE.baseUrl}/posts/${post.slug}/`),
                        "_blank",
                        "noopener,noreferrer,width=600,height=540",
                      )
                    }
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-[#06c755] hover:text-white transition-colors"
                  >
                    <FaLine size={13} />
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="px-5 md:px-6 pb-8">
                <Comments issueTerm={post.slug} />
              </div>
            </div>

            {/* Prev / Next */}
            {(older || newer) && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  {older && (
                    <Link
                      to={`/posts/${older.slug}`}
                      className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                    >
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        ← 上一篇
                      </span>
                      <span className="text-sm font-medium line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {older.title}
                      </span>
                    </Link>
                  )}
                </div>
                <div>
                  {newer && (
                    <Link
                      to={`/posts/${newer.slug}`}
                      className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group text-right"
                    >
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        下一篇 →
                      </span>
                      <span className="text-sm font-medium line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {newer.title}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <div className="mt-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
                  相關推薦
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {related.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/posts/${p.slug}`}
                      className="group flex flex-col gap-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="h-24 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <img
                          src={p.cover}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="px-3 pb-3 text-xs font-medium leading-snug line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {p.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: self-stretch so sticky inner block spans article height */}
          <div className="hidden xl:block w-72 2xl:w-80 shrink-0 self-stretch">
            <Aside splitSticky tocSlot={<TOC html={post.contentHtml} postTitle={post.title} />} />
          </div>
        </div>
      </div>

      {/* Floating TOC for <xl viewports where the sidebar is hidden */}
      <MobileTOCButton html={post.contentHtml} postTitle={post.title} />
    </>
  );
}
