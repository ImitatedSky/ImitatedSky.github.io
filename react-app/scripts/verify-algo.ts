/**
 * Verifies /algo content.
 *
 *   npx tsx scripts/verify-algo.ts                 every problem + every sort
 *   npx tsx scripts/verify-algo.ts two-sum 3sum    just these problems
 *   npx tsx scripts/verify-algo.ts --sorting       just the sorting algorithms
 *   npx tsx scripts/verify-algo.ts --strict        also fail if any of the 150 is missing or lacks English
 *   npx tsx scripts/verify-algo.ts --en <slug>     require the English statement for these problems
 *
 * For each problem it checks the trace (frame shape, line numbers, view
 * references, last frame's `result` === preset `expected`) and actually runs
 * `prelude.py + code + tests/<slug>.py` with python.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BY_SLUG, PROBLEMS } from "../src/algo/catalog";
import { ViewRenderer } from "../src/algo/views";
import type { AnyProblem, Frame, SortAlgo, View } from "../src/algo/types";

// tsx compiles the views with the classic JSX transform, which expects a global React
(globalThis as { React?: unknown }).React = React;

const ALGO = path.join(process.cwd(), "src/algo");
const PRELUDE = fs.readFileSync(path.join(ALGO, "prelude.py"), "utf-8");
const MAX_FRAMES = 220;
const MIN_CHECKS = 5;

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const requireEn = strict || args.includes("--en");
const sortingOnly = args.includes("--sorting");
const wanted = args.filter((a) => !a.startsWith("--"));

function checkView(v: View, where: string, errs: string[]) {
  const bad = (msg: string) => errs.push(`${where} ${v.type}${v.label ? `(${v.label})` : ""}: ${msg}`);
  switch (v.type) {
    case "array": {
      const n = v.values.length;
      for (const k of Object.keys(v.marks ?? {})) if (+k < 0 || +k >= n) bad(`mark index ${k} out of range (len ${n})`);
      for (const [name, i] of Object.entries(v.pointers ?? {}))
        if (!Number.isInteger(i) || i < -1 || i > n) bad(`pointer ${name}=${i} out of range (len ${n})`);
      for (const r of v.ranges ?? [])
        if (r.from < 0 || r.to >= n || r.from > r.to + 1) bad(`range ${r.from}..${r.to} out of range (len ${n})`);
      if (v.ids && v.ids.length !== n) bad("ids length differs from values");
      if (v.ids && new Set(v.ids).size !== n) bad("ids are not unique");
      if (v.bars && v.values.some((x) => typeof x !== "number" || x < 0)) bad("bars need non-negative numbers");
      if (n > 40) bad(`array too long to draw (${n} > 40)`);
      break;
    }
    case "grid": {
      const rows = v.cells.length;
      const cols = Math.max(0, ...v.cells.map((r) => r.length));
      const inRange = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols;
      for (const k of Object.keys(v.marks ?? {})) {
        const [r, c] = k.split(",").map(Number);
        if (!inRange(r, c)) bad(`mark "${k}" out of range (${rows}x${cols})`);
      }
      for (const [name, [r, c]] of Object.entries(v.pointers ?? {}))
        if (!inRange(r, c)) bad(`pointer ${name}=[${r},${c}] out of range (${rows}x${cols})`);
      if (cols > 24 || rows > 24) bad(`grid too large to draw (${rows}x${cols})`);
      break;
    }
    case "map": {
      const keys = v.entries.map(([k]) => String(k));
      if (new Set(keys).size !== keys.length) bad("duplicate keys");
      for (const k of Object.keys(v.marks ?? {})) if (!keys.includes(k)) bad(`mark for missing key "${k}"`);
      break;
    }
    case "stack":
    case "queue":
      for (const k of Object.keys(v.marks ?? {})) if (+k < 0 || +k >= v.items.length) bad(`mark index ${k} out of range`);
      break;
    case "list": {
      const ids = new Set(v.nodes.map((n) => n.id));
      if (ids.size !== v.nodes.length) bad("duplicate node ids");
      for (const n of v.nodes) {
        if (n.next && !ids.has(n.next)) bad(`node ${n.id}.next → unknown "${n.next}"`);
        if (n.random && !ids.has(n.random)) bad(`node ${n.id}.random → unknown "${n.random}"`);
      }
      for (const k of Object.keys(v.marks ?? {})) if (!ids.has(k)) bad(`mark for unknown node "${k}"`);
      for (const [name, id] of Object.entries(v.pointers ?? {}))
        if (id !== null && !ids.has(id)) bad(`pointer ${name} → unknown node "${id}"`);
      if (v.nodes.length > 14) bad(`list too long to draw (${v.nodes.length} > 14)`);
      break;
    }
    case "tree": {
      const ids = new Set(v.nodes.map((n) => n.id));
      if (ids.size !== v.nodes.length) bad("duplicate node ids");
      if (v.root !== null && !ids.has(v.root)) bad(`root "${v.root}" is not a node`);
      for (const n of v.nodes)
        for (const c of n.children ?? []) if (c !== null && !ids.has(c)) bad(`node ${n.id} → unknown child "${c}"`);
      for (const k of Object.keys(v.marks ?? {})) if (!ids.has(k)) bad(`mark for unknown node "${k}"`);
      for (const [name, id] of Object.entries(v.pointers ?? {}))
        if (id !== null && !ids.has(id)) bad(`pointer ${name} → unknown node "${id}"`);
      for (const k of [...Object.keys(v.edgeMarks ?? {}), ...Object.keys(v.edgeLabels ?? {})]) {
        const [a, b] = k.split(">");
        if (!ids.has(a) || !ids.has(b)) bad(`edge key "${k}" references unknown node`);
      }
      for (const l of v.links ?? []) if (!ids.has(l.from) || !ids.has(l.to)) bad("link references unknown node");
      if (v.nodes.length > 40) bad(`tree too large to draw (${v.nodes.length} > 40 nodes)`);
      break;
    }
    case "graph": {
      const ids = new Set(v.nodes.map((n) => n.id));
      if (ids.size !== v.nodes.length) bad("duplicate node ids");
      for (const e of v.edges) if (!ids.has(e.from) || !ids.has(e.to)) bad(`edge ${e.from}>${e.to} references unknown node`);
      for (const k of Object.keys(v.marks ?? {})) if (!ids.has(k)) bad(`mark for unknown node "${k}"`);
      for (const [name, id] of Object.entries(v.pointers ?? {}))
        if (id !== null && !ids.has(id)) bad(`pointer ${name} → unknown node "${id}"`);
      if (v.nodes.length > 14) bad(`graph too large to draw (${v.nodes.length} > 14 nodes)`);
      break;
    }
    case "intervals":
      for (const it of v.items) if (it.start > it.end) bad(`interval [${it.start}, ${it.end}] is reversed`);
      break;
    default:
      errs.push(`${where}: unknown view type ${(v as { type: string }).type}`);
  }
}

function checkFrames(frames: Frame[], codeLines: number, where: string, errs: string[]) {
  if (!Array.isArray(frames) || frames.length === 0) {
    errs.push(`${where}: trace returned no frames`);
    return;
  }
  if (frames.length > MAX_FRAMES) errs.push(`${where}: ${frames.length} frames (max ${MAX_FRAMES}) — use a smaller input`);
  frames.forEach((f, i) => {
    const at = `${where} frame ${i + 1}`;
    if (!f.note?.trim()) errs.push(`${at}: empty note`);
    const lines = f.line === undefined ? [] : Array.isArray(f.line) ? f.line : [f.line];
    for (const l of lines)
      if (!Number.isInteger(l) || l < 1 || l > codeLines) errs.push(`${at}: line ${l} outside code (1..${codeLines})`);
    if (!Array.isArray(f.views) || f.views.length === 0) errs.push(`${at}: no views`);
    else {
      const labels = f.views.map((v) => `${v.type}-${v.label ?? ""}`);
      if (new Set(labels).size !== labels.length) errs.push(`${at}: two views share the same type + label`);
      f.views.forEach((v) => {
        const before = errs.length;
        checkView(v, at, errs);
        if (errs.length !== before) return;
        // Actually render it — catches anything the structural checks miss
        try {
          const html = renderToStaticMarkup(createElement(ViewRenderer, { view: v }));
          if (/NaN|undefined/.test(html.replace(/>[^<]*</g, "><"))) errs.push(`${at} ${v.type}: rendered markup contains NaN/undefined`);
        } catch (e) {
          errs.push(`${at} ${v.type}: render threw ${e instanceof Error ? e.message : e}`);
        }
      });
    }
    if (f.result !== undefined && i !== frames.length - 1) errs.push(`${at}: only the last frame may set result`);
  });
  if (frames[frames.length - 1].result === undefined) errs.push(`${where}: last frame has no result`);
}

function runPython(slug: string, code: string, errs: string[]) {
  const testFile = path.join(ALGO, "tests", `${slug}.py`);
  if (!fs.existsSync(testFile)) {
    errs.push(`missing tests/${slug}.py`);
    return;
  }
  const tests = fs.readFileSync(testFile, "utf-8");
  const script = `${PRELUDE}\n${code}\n\n${tests}\nprint(f"__PASSED__ {_checks}")\n`;
  const tmp = path.join(os.tmpdir(), `verify-algo-${process.pid}-${slug}.py`);
  fs.writeFileSync(tmp, script);
  const res = spawnSync("python", [tmp], {
    encoding: "utf-8",
    timeout: 20_000,
    env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
  });
  fs.rmSync(tmp, { force: true });
  if (res.error) return void errs.push(`python: ${res.error.message}`);
  if (res.status !== 0) return void errs.push(`python tests failed:\n${(res.stderr || res.stdout).trim().split("\n").slice(-6).join("\n")}`);
  const m = /__PASSED__ (\d+)/.exec(res.stdout);
  if (!m) errs.push("python: tests did not finish");
  else if (+m[1] < MIN_CHECKS) errs.push(`only ${m[1]} check() calls — write at least ${MIN_CHECKS}`);
}

async function verifyProblem(slug: string): Promise<string[]> {
  const errs: string[] = [];
  const meta = BY_SLUG.get(slug);
  if (!meta) return [`"${slug}" is not in catalog.ts`];
  const file = path.join(ALGO, "problems", `${slug}.ts`);
  if (!fs.existsSync(file)) return [`missing problems/${slug}.ts`];

  let p: AnyProblem;
  try {
    p = (await import(pathToFileURL(file).href)).default;
  } catch (e) {
    return [`import failed: ${e instanceof Error ? e.message : e}`];
  }
  if (!p || typeof p.trace !== "function") return ["default export is not a Problem"];

  if (p.id !== meta.id) errs.push(`id ${p.id} does not match catalog (${meta.id})`);
  for (const key of ["summary", "idea", "code", "starter"] as const)
    if (typeof p[key] !== "string" || !p[key].trim()) errs.push(`${key} is empty`);
  if (!p.examples?.length) errs.push("no examples");
  if (!p.steps?.length) errs.push("no steps");
  if (!p.complexity?.time || !p.complexity?.space) errs.push("complexity missing");
  if (p.code?.includes("\t")) errs.push("code contains tabs — use 4 spaces");
  if (p.starter?.trim() === p.code?.trim()) errs.push("starter must be a stub, not the solution");
  if (/[一-鿿]/.test(p.summary ?? "") === false) errs.push("summary should be written in 繁體中文");
  if (!p.summaryEn?.trim()) {
    if (requireEn) errs.push("summaryEn missing");
  } else {
    if (/[一-鿿]/.test(p.summaryEn)) errs.push("summaryEn contains CJK characters");
    if ((p.constraints?.length ?? 0) !== (p.constraintsEn?.length ?? 0))
      errs.push(`constraintsEn has ${p.constraintsEn?.length ?? 0} items, constraints has ${p.constraints?.length ?? 0}`);
    for (const [i, ex] of (p.examples ?? []).entries())
      if (ex.note && !ex.noteEn?.trim()) errs.push(`example ${i + 1} has a note but no noteEn`);
    for (const t of [...(p.constraintsEn ?? []), ...(p.examples ?? []).map((e) => e.noteEn ?? "")])
      if (/[一-鿿]/.test(t)) errs.push(`English text contains CJK: ${t.slice(0, 40)}`);
  }

  const codeLines = (p.code ?? "").split("\n").length;
  if (!p.presets?.length) errs.push("no presets");
  let longest = 0;
  for (const [i, preset] of (p.presets ?? []).entries()) {
    const where = `preset ${i + 1} "${preset.label}"`;
    let frames: Frame[];
    try {
      const snapshot = JSON.stringify(preset.input);
      frames = p.trace(preset.input);
      if (JSON.stringify(preset.input) !== snapshot) errs.push(`${where}: trace mutated its input`);
    } catch (e) {
      errs.push(`${where}: trace threw ${e instanceof Error ? e.stack?.split("\n").slice(0, 3).join(" | ") : e}`);
      continue;
    }
    checkFrames(frames, codeLines, where, errs);
    longest = Math.max(longest, frames.length);
    const result = frames[frames.length - 1]?.result;
    if (result !== undefined && result !== preset.expected)
      errs.push(`${where}: last frame result ${JSON.stringify(result)} !== expected ${JSON.stringify(preset.expected)}`);
  }
  if (p.presets?.length && longest < 5) errs.push(`longest trace has only ${longest} frames — show more of the algorithm`);

  if (p.code) runPython(slug, p.code, errs);
  return errs;
}

async function verifySorting(): Promise<number> {
  const dir = path.join(ALGO, "sorting/algos");
  const inputs = [[5, 2, 8, 3, 9, 1, 6, 4], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [3, 3, 1, 3, 2, 1], [7, 0, 12, 7, 30, 2, 9, 9, 15, 4, 21, 1]];
  let failed = 0;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
    const errs: string[] = [];
    try {
      const a: SortAlgo = (await import(pathToFileURL(path.join(dir, f)).href)).default;
      if (a.id !== f.replace(/\.ts$/, "")) errs.push(`id "${a.id}" should match the file name`);
      const codeLines = a.code.split("\n").length;
      for (const raw of inputs) {
        // Algorithms with a value limit (counting / bucket / radix) get clamped input, like the page does
        const input = raw.map((v) => Math.min(v, a.maxValue ?? 99));
        const copy = [...input];
        const frames = a.trace(copy);
        const where = `[${input}]`;
        if (copy.join() !== input.join()) errs.push(`${where}: trace mutated its input`);
        checkFrames(frames, codeLines, where, errs);
        const want = `[${[...input].sort((x, y) => x - y).join(", ")}]`;
        const got = frames[frames.length - 1]?.result;
        if (got !== want) errs.push(`${where}: result ${got} !== ${want}`);
      }
    } catch (e) {
      errs.push(`threw ${e instanceof Error ? e.stack?.split("\n").slice(0, 3).join(" | ") : e}`);
    }
    if (errs.length) failed++;
    console.log(`${errs.length ? "✗" : "✓"} sorting/${f}`);
    for (const e of errs.slice(0, 12)) console.log(`    ${e}`);
  }
  return failed;
}

const existing = fs
  .readdirSync(path.join(ALGO, "problems"))
  .filter((f) => f.endsWith(".ts"))
  .map((f) => f.replace(/\.ts$/, ""));

let failed = 0;
if (!sortingOnly) {
  const slugs = wanted.length ? wanted : existing.sort();
  for (const slug of slugs) {
    const errs = await verifyProblem(slug);
    if (errs.length) failed++;
    console.log(`${errs.length ? "✗" : "✓"} ${slug}`);
    for (const e of errs.slice(0, 12)) console.log(`    ${e}`);
    if (errs.length > 12) console.log(`    … and ${errs.length - 12} more`);
  }
  if (!wanted.length) {
    const missing = PROBLEMS.filter((p) => !existing.includes(p.slug));
    console.log(`\n${existing.length}/${PROBLEMS.length} problems present, ${failed} failing`);
    if (missing.length) {
      console.log(`missing (${missing.length}): ${missing.map((p) => p.slug).join(", ")}`);
      if (strict) failed += missing.length;
    }
  }
}
if (sortingOnly || !wanted.length) failed += await verifySorting();

process.exit(failed ? 1 : 0);
