/** Lazy per-problem loading — each problem body is its own chunk */
import type { AnyProblem } from "./types";

const modules = import.meta.glob<{ default: AnyProblem }>("./problems/*.ts");
const tests = import.meta.glob<string>("./tests/*.py", { query: "?raw", import: "default" });

export const hasProblem = (slug: string) => `./problems/${slug}.ts` in modules;

export async function loadProblem(slug: string): Promise<AnyProblem | null> {
  const load = modules[`./problems/${slug}.ts`];
  return load ? (await load()).default : null;
}

export async function loadTests(slug: string): Promise<string | null> {
  const load = tests[`./tests/${slug}.py`];
  return load ? load() : null;
}
