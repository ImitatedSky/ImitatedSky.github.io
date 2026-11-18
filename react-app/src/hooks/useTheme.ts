import { useSyncExternalStore } from "react";

/**
 * Site-wide dark/light theme. The source of truth is the `dark` class on
 * <html> (set before first paint by the inline script in index.html), so every
 * component using this hook stays in sync.
 */
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const isDark = () => document.documentElement.classList.contains("dark");

export function setDark(next: boolean) {
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("theme", next ? "dark" : "light");
  listeners.forEach((l) => l());
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark, () => true);
  return { dark, toggle: () => setDark(!dark) };
}
