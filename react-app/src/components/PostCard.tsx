import { Link } from "react-router-dom";
import { FaThumbtack } from "react-icons/fa";
import TagPill from "./TagPill";
import type { PostMeta } from "../types";

interface Props {
  post: PostMeta;
  index?: number;
}

export default function PostCard({ post, index = 0 }: Props) {
  const imageRight = index % 2 === 1;

  return (
    <article className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`flex flex-col md:flex-row ${imageRight ? "md:flex-row-reverse" : ""}`}>
        {/* Cover image */}
        <Link to={`/posts/${post.slug}`} className="md:w-2/5 shrink-0">
          <div className="h-48 md:h-full min-h-[11rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <img
              src={post.cover}
              alt={post.title}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-center">
          {post.categories.length > 0 && (
            <Link
              to={`/categories/${encodeURIComponent(post.categories[0])}`}
              className="text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wide hover:underline"
            >
              {post.categories[0]}
            </Link>
          )}

          <Link to={`/posts/${post.slug}`}>
            <h2 className="mt-1 text-base font-bold leading-snug text-zinc-900 dark:text-zinc-50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors line-clamp-2">
              {post.sticky > 0 && (
                <FaThumbtack className="inline-block mr-1.5 text-blue-500 dark:text-blue-400 text-sm -rotate-45" />
              )}
              {post.title}
            </h2>
          </Link>

          {post.excerpt && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
            <span>發表於 {post.date}</span>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map(tag => (
                  <TagPill key={tag} tag={tag} variant="default" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
