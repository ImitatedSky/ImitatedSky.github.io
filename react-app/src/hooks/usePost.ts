import { useState, useEffect } from "react";
import type { Post } from "../types";

const _cache = new Map<string, Post>();

export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(_cache.get(slug) ?? null);
  const [loading, setLoading] = useState(!_cache.has(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Cache hit must still sync state — PostPage stays mounted when only the
    // slug changes (prev/next links), so an early return here would leave the
    // previous post on screen.
    const cached = _cache.get(slug);
    if (cached) {
      setPost(cached);
      setLoading(false);
      setNotFound(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetch(`/content/posts/${slug}.json`)
      .then((r) => {
        if (cancelled) return null;
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data: Post | null) => {
        if (!data) return;
        _cache.set(slug, data);
        if (cancelled) return;
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        // Without this a network error or malformed JSON leaves the page
        // stuck on "Loading…" forever with an unhandled rejection.
        if (cancelled) return;
        setNotFound(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading, notFound };
}
