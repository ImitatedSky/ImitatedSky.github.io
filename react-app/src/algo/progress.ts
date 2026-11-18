import { useSyncExternalStore } from "react";

/** Per-problem study status, persisted in localStorage */
export type Status = "done" | "review";
type Store = Record<string, Status>;

const KEY = "algo-progress-v1";
const listeners = new Set<() => void>();
let cache: Store | null = null;

function read(): Store {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    cache = {};
  }
  return cache;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Another tab changed it
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function setStatus(slug: string, status: Status | null) {
  const next = { ...read() };
  if (status) next[slug] = status;
  else delete next[slug];
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode — keep the in-memory copy */
  }
  listeners.forEach((l) => l());
}

const EMPTY: Store = {};

export function useProgress() {
  const store = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    store,
    status: (slug: string): Status | undefined => store[slug],
    toggleDone: (slug: string) => setStatus(slug, store[slug] === "done" ? null : "done"),
    toggleReview: (slug: string) => setStatus(slug, store[slug] === "review" ? null : "review"),
  };
}
