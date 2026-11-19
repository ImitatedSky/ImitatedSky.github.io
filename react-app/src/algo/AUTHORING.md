# Authoring problems for /algo

Each LeetCode problem is **two files**:

| File | What |
|---|---|
| `src/algo/problems/<slug>.ts` | `export default defineProblem<Input>({...})` — text, Python solution, and `trace()` that produces the animation |
| `src/algo/tests/<slug>.py` | `check(...)` calls run against the Python solution (by `verify-algo` and by the in-browser practice mode) |

`<slug>` is the LeetCode slug and must already exist in `src/algo/catalog.ts` (do not edit the catalog).

**Read these first — they are the spec:**

- `src/algo/types.ts` — `Problem`, `Frame`, every `View` type and `Tone`
- `src/algo/trace.ts` — `V.*` view constructors, `tracer()`, `buildTree` / `treeSpec` / `treeFromLevel` / `heapSpec`, `py()`
- `src/algo/prelude.py` — what Python code and tests can rely on (`ListNode`, `TreeNode`, `build_list`, `list_vals`, `build_tree`, `tree_vals`, `check`, typing / collections / heapq imports)
- Worked examples: `problems/two-sum.ts` (array + map), `problems/reverse-linked-list-ii.ts` (linked list with pointers being rewired), `problems/binary-tree-level-order-traversal.ts` (tree + queue), and their files in `tests/`
- Sorting: `sorting/algos/bubble.ts`, `sorting/algos/quick.ts`

## How the animation works

`trace(input)` runs the algorithm **in TypeScript** and returns `Frame[]`. Each frame is a full snapshot:

```ts
t.push({
  line: [4, 5],            // 1-based line(s) of `code` executing now (line 1 = first line of the string)
  note: "看 `nums[2] = 7`…", // 繁體中文, 1–2 sentences, supports `code` and **bold**
  views: [V.array("nums", nums, { pointers: { i }, marks: { [i]: "active" } }), V.map("seen", seen)],
  vars: { i, need },       // small variable watch (optional)
});
```

The last frame must set `result` — the returned value formatted like Python (`py([0, 1])` → `"[0, 1]"`, `py(true)` → `"True"`, `py("ab")` → `"\"ab\""`). It must equal the preset's `expected`.

The trace must **mirror the Python `code`**: same algorithm, same variable names, and `line` pointing at the lines that correspond to what the frame shows. Someone stepping through should be able to read the highlighted Python and see it happen.

## Rules

1. **Own words, two languages.** `summary` is a short 繁體中文 paraphrase of the task (2–5 sentences) and `summaryEn` is the same in English; the page shows English by default with a 中文 switch. Also give `constraintsEn` (same order as `constraints`) and `noteEn` on every example that has a `note`. Never copy LeetCode's statement text in either language — write it fresh, plainly, as you would explain it to a colleague. Examples are just input/output values (language-neutral).
2. **繁體中文（台灣用語）** for all prose: 陣列、字串、指標、佇列、堆疊、雜湊表、鏈結串列、遞迴、迴圈、節點、走訪. Keep identifiers and English terms of art as they are.
3. **Notes explain why**, not just what. "`7 < 9`，左邊太小，只有移動 `l` 才可能變大" beats "移動 l".
4. **Python**: LeetCode-style `class Solution` (or the class the problem asks you to design), Python 3, 4-space indent, no tabs, no `import` lines needed (see prelude). Pick the standard optimal interview solution — the one worth memorising — and keep it short and clean. A few short 繁中 comments are welcome.
5. **`starter`**: the signature only (for design problems: every method with `pass`). Must not contain the solution.
6. **Presets**: 2–3 small inputs. First one is the most illustrative; include one edge-ish case. Aim for roughly 8–60 frames each (hard max 220). Keep structures small enough to draw: arrays ≤ 40, linked lists ≤ 14 nodes, trees ≤ 40 nodes, graphs ≤ 14 nodes, grids ≤ 24×24 (practically: much smaller reads better).
7. **Never mutate `input`** inside `trace` — copy first.
8. **View labels** must be unique per frame (per view type) and stay the same across frames, so elements animate instead of remounting.
9. **Tones are semantic** — use them consistently: `active` (being processed), `compare` (candidate / being compared), `good` (settled / part of answer), `bad` (rejected / conflict), `muted` (out of play), `alt` (a second role), `visited` (seen before).
10. **Tests**: at least 5 `check(got, expected, "label")` calls including edge cases. They must be deterministic and fast (< 1 s), and work when the *user's* solution replaces the reference one — so test behaviour, not implementation details (sort the output first when order is unspecified). If the problem needs a special `Node` class (random pointer, `next` pointer, graph, quad tree), define it at the top of the test file.
11. Only create/edit your own `problems/<slug>.ts` and `tests/<slug>.py`. Shared files (`types.ts`, `trace.ts`, `views/`, `catalog.ts`, CSS…) are off limits — if you believe one has a bug or is missing something you truly need, work around it and say so in your final report.

## Picking views

| Situation | View |
|---|---|
| Array / string with indices and pointers | `V.array` / `V.chars`, `pointers`, `marks`, `ranges` for windows and subarrays. Pass `pointers: {}` / `ranges: []` on frames without them so the rows stay reserved and the layout doesn't jump |
| Heights, amounts, values worth comparing by size | `V.bars` (non-negative numbers), `fill` for stacked extras like trapped water |
| Swapping / moving elements | pass `ids` so cells slide to their new position |
| Hash map / set / counter | `V.map` / `V.set` |
| Stack, call stack of a recursion, monotonic stack | `V.stack` |
| BFS queue, deque | `V.queue` |
| Linked list | `V.list` — give explicit node specs with `next` when pointers are rewired; draw nodes in their current chain order |
| Binary tree, heap, trie, recursion / decision tree | `V.tree` (`treeFromLevel`, `heapSpec`, or build `{nodes, root}` yourself; `edgeLabels` for trie letters / choices) |
| Graph | `V.graph` (`directed`, optional `x`/`y` in 0…1 for a hand-placed layout) |
| Matrix, board, DP table | `V.grid` (`rowLabels` / `colLabels` for DP axes) |
| Intervals on a number line | `V.intervals` |

Show the *state the algorithm reasons about*: for DP show the table being filled; for backtracking show the current path plus the decision tree or board; for recursion show the call stack; for two heaps show both heaps.

## Verify (required before you finish)

From `react-app/`:

```bash
npx tsx scripts/verify-algo.ts <slug> [<slug>…]     # trace checks + runs the Python tests for real
npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep -E "<slug>|<slug>"   # type errors in your files only
```

`verify-algo` must print `✓` for every one of your slugs and `tsc` must report nothing for your files (the config has `noUnusedLocals` / `noUnusedParameters`; `erasableSyntaxOnly` means no `enum`, no parameter properties). Ignore type errors in files that are not yours — other people are writing theirs at the same time. Do not run `npm run build`, do not start a dev server, and do not commit.
