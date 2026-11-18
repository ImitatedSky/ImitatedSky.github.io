/**
 * Runs Python in the browser with Pyodide, inside a Web Worker so an infinite
 * loop in the user's code can be killed instead of freezing the tab.
 * Pyodide (~10 MB) is only fetched the first time `runPython` is called.
 */
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const TIMEOUT_MS = 10_000;

const WORKER_SRC = `
importScripts("${PYODIDE}pyodide.js");
const ready = loadPyodide({ indexURL: "${PYODIDE}" });
ready.then(() => postMessage({ type: "ready" }), (e) => postMessage({ type: "fatal", error: String(e) }));
onmessage = async (e) => {
  const py = await ready;
  const out = [];
  py.setStdout({ batched: (s) => out.push(s) });
  py.setStderr({ batched: (s) => out.push(s) });
  const ns = py.globals.get("dict")();
  try {
    await py.runPythonAsync(e.data.code, { globals: ns });
    postMessage({ type: "done", ok: true, out: out.join("\\n") });
  } catch (err) {
    postMessage({ type: "done", ok: false, out: out.join("\\n"), error: String((err && err.message) || err) });
  } finally {
    ns.destroy();
  }
};
`;

export interface RunResult {
  ok: boolean;
  /** Captured stdout / stderr */
  out: string;
  error?: string;
}

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let busy = false;

function boot(): Promise<void> {
  if (ready) return ready;
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
  const w = new Worker(url);
  worker = w;
  ready = new Promise<void>((resolve, reject) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data.type === "ready") {
        w.removeEventListener("message", onMsg);
        resolve();
      } else if (e.data.type === "fatal") {
        reject(new Error(e.data.error));
      }
    };
    w.addEventListener("message", onMsg);
    w.addEventListener("error", () => reject(new Error("無法載入 Python 執行環境（請確認網路連線）")));
  });
  ready.catch(reset);
  return ready;
}

function reset() {
  worker?.terminate();
  worker = null;
  ready = null;
  busy = false;
}

export async function runPython(code: string, onStage?: (stage: "loading" | "running") => void): Promise<RunResult> {
  if (busy) return { ok: false, out: "", error: "上一次執行尚未結束" };
  busy = true;
  try {
    onStage?.("loading");
    await boot();
    onStage?.("running");
    const w = worker!;
    return await new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        reset();
        resolve({ ok: false, out: "", error: `執行超過 ${TIMEOUT_MS / 1000} 秒，已中止（是不是有無窮迴圈？）` });
      }, TIMEOUT_MS);
      const onMsg = (e: MessageEvent) => {
        if (e.data.type !== "done") return;
        clearTimeout(timer);
        w.removeEventListener("message", onMsg);
        resolve({ ok: e.data.ok, out: e.data.out, error: e.data.error });
      };
      w.addEventListener("message", onMsg);
      w.postMessage({ code });
    });
  } catch (e) {
    return { ok: false, out: "", error: e instanceof Error ? e.message : String(e) };
  } finally {
    busy = false;
  }
}

/** Keep the part of a Pyodide traceback that points at the user's code */
export function tidyError(error: string): string {
  const lines = error.trimEnd().split("\n");
  const at = lines.findLastIndex((l) => l.includes('File "<exec>"'));
  const tail = at >= 0 ? lines.slice(at) : lines.slice(-4);
  return tail.join("\n").replace(/File "<exec>", /g, "");
}
