import { useEffect, useRef, useState } from "react";

interface Props {
  /** Used as the utterances issue-term (slug or "messageboard") */
  issueTerm: string;
}

export default function Comments({ issueTerm }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Defer injection one tick: StrictMode's immediate unmount cancels the
    // timer, so the utterances script is never appended twice (appending and
    // removing it mid-load throws "insertAdjacentHTML: element has no parent").
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || !container.isConnected) return;
      if (container.querySelector("iframe.utterances-frame")) return;
      container.innerHTML = "";

      const isDark = document.documentElement.classList.contains("dark");
      const theme = isDark ? "github-dark" : "github-light";

      const script = document.createElement("script");
      script.src = "https://utteranc.es/client.js";
      script.setAttribute("repo", "ImitatedSky/blog-utterances");
      script.setAttribute("issue-term", issueTerm);
      script.setAttribute("label", "Utterances");
      script.setAttribute("theme", theme);
      script.setAttribute("crossorigin", "anonymous");
      script.async = true;
      container.appendChild(script);
    }, 0);

    // Utterances posts a message when it has resized (i.e. loaded)
    function onMessage(e: MessageEvent) {
      if (e.origin !== "https://utteranc.es") return;
      setLoaded(true);
    }
    window.addEventListener("message", onMessage);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      container.innerHTML = "";
    };
  }, [issueTerm]);

  return (
    <div className="mt-2">
      {!loaded && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 py-4 text-center">
          Loading comments…
        </p>
      )}
      <div ref={containerRef} />
    </div>
  );
}
