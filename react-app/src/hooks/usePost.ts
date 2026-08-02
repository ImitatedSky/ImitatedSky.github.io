import { useState, useEffect } from "react";
import type { Post } from "../types";

const _cache = new Map<string, Post>();

export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(_cache.get(slug) ?? null);
  const [loading, setLoading] = useState(!_cache.has(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (_cache.has(slug)) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/content/posts/${slug}.json`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data: Post | null) => {
        if (!data) return;
        _cache.set(slug, data);
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  return { post, loading, notFound };
}
