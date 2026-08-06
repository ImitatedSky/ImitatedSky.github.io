import { useState, useEffect } from "react";
import type { PostMeta } from "../types";

let _cache: PostMeta[] | null = null;

export function usePosts() {
  const [posts, setPosts] = useState<PostMeta[]>(_cache ?? []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetch("/content/index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`index.json ${r.status}`);
        return r.json();
      })
      .then((data: PostMeta[]) => {
        _cache = data;
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        // This list drives every page; without a catch a failed fetch leaves
        // the whole site on "Loading…" with an unhandled rejection.
        setLoading(false);
      });
  }, []);

  return { posts, loading };
}
