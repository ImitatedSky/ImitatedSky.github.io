import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { HighlighterCore } from "shiki/core";

interface Token {
  content: string;
  style: CSSProperties;
}

let highlighterPromise: Promise<HighlighterCore> | null = null;

/** One shared highlighter, loaded on first use (python grammar + two themes only) */
function getHighlighter() {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, py, light, dark] =
      await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
        import("shiki/langs/python.mjs"),
        import("shiki/themes/github-light.mjs"),
        import("shiki/themes/one-dark-pro.mjs"),
      ]);
    return createHighlighterCore({
      langs: [py.default],
      themes: [light.default, dark.default],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighterPromise;
}

function toStyle(s: unknown): CSSProperties {
  if (!s) return {};
  if (typeof s === "object") return s as CSSProperties;
  const out: Record<string, string> = {};
  for (const decl of String(s).split(";")) {
    const i = decl.indexOf(":");
    if (i > 0) out[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
  }
  return out as CSSProperties;
}

export function useHighlighted(code: string): Token[][] {
  const plain = code.split("\n").map((l) => [{ content: l, style: {} }]);
  const [tokens, setTokens] = useState<{ code: string; lines: Token[][] } | null>(null);

  useEffect(() => {
    let alive = true;
    getHighlighter()
      .then((h) => {
        const res = h.codeToTokens(code, {
          lang: "python",
          themes: { light: "github-light", dark: "one-dark-pro" },
          defaultColor: false,
        });
        if (!alive) return;
        setTokens({
          code,
          lines: res.tokens.map((line) =>
            line.map((t) => ({ content: t.content, style: toStyle(t.htmlStyle) })),
          ),
        });
      })
      .catch(() => {
        /* plain text fallback is already on screen */
      });
    return () => {
      alive = false;
    };
  }, [code]);

  return tokens && tokens.code === code ? tokens.lines : plain;
}

export default function CodePanel({
  code,
  activeLines = [],
  maxHeight,
}: {
  code: string;
  activeLines?: number[];
  maxHeight?: number | string;
}) {
  const lines = useHighlighted(code);
  const boxRef = useRef<HTMLDivElement>(null);
  const first = activeLines[0];

  // Keep the executing line in view — scroll the panel only, never the page
  useEffect(() => {
    const box = boxRef.current;
    if (!box || first === undefined) return;
    const el = box.querySelector<HTMLElement>(`[data-line="${first}"]`);
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop + 24) box.scrollTo({ top: Math.max(0, top - 60), behavior: "smooth" });
    else if (bottom > box.scrollTop + box.clientHeight - 24)
      box.scrollTo({ top: bottom - box.clientHeight + 60, behavior: "smooth" });
  }, [first]);

  return (
    <div className="algo-codepanel" ref={boxRef} style={{ maxHeight }}>
      <pre>
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              data-line={i + 1}
              className={`algo-code-line ${activeLines.includes(i + 1) ? "is-active" : ""}`}
            >
              <span className="algo-code-no">{i + 1}</span>
              <span className="algo-code-text">
                {line.map((t, k) => (
                  <span key={k} style={t.style}>
                    {t.content}
                  </span>
                ))}
                {line.length === 0 && " "}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
