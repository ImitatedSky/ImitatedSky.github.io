import { useEffect, useRef, useState } from "react";
import { FiPlay, FiRotateCcw } from "react-icons/fi";
import prelude from "../prelude.py?raw";
import { runPython, tidyError } from "../pyRunner";
import { loadTests } from "../registry";

type Output = { kind: "idle" | "busy" | "pass" | "fail"; text: string };

const draftKey = (slug: string) => `algo-draft-${slug}`;
/** Line number of the first line of user code inside the combined script */
const PRELUDE_LINES = prelude.split("\n").length;

/**
 * Write Python in the browser and run this problem's tests against it.
 * The draft is kept in localStorage per problem.
 */
export default function Practice({
  slug,
  starter,
  onPass,
}: {
  slug: string;
  starter: string;
  onPass: () => void;
}) {
  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem(draftKey(slug)) ?? starter;
    } catch {
      return starter;
    }
  });
  const [output, setOutput] = useState<Output>({
    kind: "idle",
    text: "按「執行測試」會在瀏覽器裡用 Pyodide 執行你的程式（第一次需要下載約 10 MB 的 Python 執行環境）。",
  });
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      if (code === starter) localStorage.removeItem(draftKey(slug));
      else localStorage.setItem(draftKey(slug), code);
    } catch {
      /* storage unavailable — the draft just won't persist */
    }
  }, [code, slug, starter]);

  async function run() {
    const tests = await loadTests(slug);
    if (!tests) {
      setOutput({ kind: "fail", text: "這一題還沒有測試。" });
      return;
    }
    setOutput({ kind: "busy", text: "載入 Python 執行環境中…" });
    const script = `${prelude}\n${code}\n\n${tests}\nprint(f"__PASSED__ {_checks}")\n`;
    const res = await runPython(script, (stage) =>
      setOutput({ kind: "busy", text: stage === "loading" ? "載入 Python 執行環境中…" : "執行中…" }),
    );
    const passed = /__PASSED__ (\d+)/.exec(res.out);
    const stdout = res.out.replace(/__PASSED__ \d+\n?/, "").trimEnd();
    if (res.ok && passed) {
      setOutput({
        kind: "pass",
        text: `✓ 全部 ${passed[1]} 個測試通過！${stdout ? `\n\n輸出：\n${stdout}` : ""}`,
      });
      onPass();
    } else {
      // Report line numbers relative to the editor, not the combined script
      const err = tidyError(res.error ?? "未知錯誤").replace(/line (\d+)/g, (_, n) => {
        const rel = Number(n) - PRELUDE_LINES;
        return rel >= 1 ? `第 ${rel} 行` : `line ${n}`;
      });
      setOutput({ kind: "fail", text: `✗ ${err}${stdout ? `\n\n輸出：\n${stdout}` : ""}` });
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end, value } = el;
    const put = (text: string, caret: number) => {
      e.preventDefault();
      // execCommand keeps the native undo stack intact
      el.setSelectionRange(s, end);
      if (!document.execCommand("insertText", false, text)) {
        setCode(value.slice(0, s) + text + value.slice(end));
        requestAnimationFrame(() => el.setSelectionRange(caret, caret));
      }
    };
    if (e.key === "Tab" && !e.shiftKey) put("    ", s + 4);
    else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void run();
    } else if (e.key === "Enter") {
      // Keep the current indentation; indent once more after a colon
      const line = value.slice(value.lastIndexOf("\n", s - 1) + 1, s);
      const indent = /^\s*/.exec(line)![0] + (line.trimEnd().endsWith(":") ? "    " : "");
      put("\n" + indent, s + 1 + indent.length);
    }
  }

  return (
    <div className="algo-card algo-practice">
      <div className="algo-practice-bar">
        <p>
          在這裡寫你的解法 · <code>Ctrl + Enter</code> 執行
        </p>
        <button
          className="algo-btn is-small"
          onClick={() => {
            setCode(starter);
            ref.current?.focus();
          }}
        >
          <FiRotateCcw /> 重設
        </button>
        <button className="algo-btn is-small is-primary" onClick={run} disabled={output.kind === "busy"}>
          <FiPlay /> 執行測試
        </button>
      </div>
      <textarea
        ref={ref}
        className="algo-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Python 程式碼編輯器"
      />
      <pre className={`algo-output ${output.kind === "pass" ? "is-pass" : output.kind === "fail" ? "is-fail" : ""}`}>
        {output.text}
      </pre>
    </div>
  );
}
