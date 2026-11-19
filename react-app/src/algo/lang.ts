import { useSyncExternalStore } from "react";

/** Language of problem statements and titles. English by default, 繁中 on request. */
export type Lang = "en" | "zh";

const KEY = "algo-lang";
const listeners = new Set<() => void>();

function read(): Lang {
  try {
    return localStorage.getItem(KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode — the choice just won't persist */
  }
  listeners.forEach((l) => l());
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, read, () => "en" as Lang);
  return { lang, setLang };
}
