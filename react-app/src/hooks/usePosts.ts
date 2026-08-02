import { useState, useEffect } from "react";
import type { PostMeta } from "../types";

let _cache: PostMeta[] | null = null;

export function usePosts() {
  const [posts, setPosts] = useState<PostMeta[]>(_cache ?? []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetch("/content/index.json")
      .then((r) => r.json())
      .then((data: PostMeta[]) => {
        _cache = data;
        setPosts(data);
        setLoading(false);
      });
  }, []);

  return { posts, loading };
}
