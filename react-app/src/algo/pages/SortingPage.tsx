import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiShuffle } from "react-icons/fi";
import { usePageTitle } from "../../hooks/usePageTitle";
import Player from "../components/Player";
import { SORTS, SORT_BY_ID } from "../sorting";
import { rich } from "../views/shared";

const MAX_LEN = 20;
const DEFAULT_MAX = 99;

function randomArray(n: number, max: number): number[] {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * max));
}

function parse(text: string, max: number): { values?: number[]; error?: string } {
  const parts = text.split(/[\s,，、]+/).filter(Boolean);
  if (parts.length < 2) return { error: "至少輸入 2 個數字" };
  if (parts.length > MAX_LEN) return { error: `最多 ${MAX_LEN} 個數字` };
  const values = parts.map(Number);
  if (values.some((v) => !Number.isInteger(v) || v < 0 || v > max))
    return { error: `請輸入 0 ~ ${max} 的整數，以逗號或空白分隔` };
  return { values };
}

export default function SortingPage() {
  const { id } = useParams();
  const algo = (id && SORT_BY_ID.get(id)) || SORTS[0];
  usePageTitle(algo ? `${algo.nameZh} ${algo.name} — 排序視覺化` : "排序視覺化");

  const [text, setText] = useState("5, 2, 8, 3, 9, 1, 6, 4");
  const [values, setValues] = useState([5, 2, 8, 3, 9, 1, 6, 4]);
  const [size, setSize] = useState(8);
  const [run, setRun] = useState(0);
  const max = algo?.maxValue ?? DEFAULT_MAX;
  // Keep random bars readable, but let wide-range algorithms (radix) show every digit
  const randomMax = max > DEFAULT_MAX ? max : Math.min(max, 60);

  // An input typed for one algorithm may exceed another's value limit
  const safe = useMemo(() => values.map((v) => Math.min(v, max)), [values, max]);
  const frames = useMemo(() => (algo ? algo.trace(safe) : []), [algo, safe]);
  const parsed = parse(text, max);

  if (!algo) return <div className="algo-empty-state">排序演算法準備中…</div>;

  function apply(next: number[]) {
    setValues(next);
    setText(next.join(", "));
    setRun((r) => r + 1);
  }

  return (
    <>
      <div className="algo-section-head">
        <div>
          <div className="algo-eyebrow">Sorting Visualizer</div>
          <h1 className="algo-h1" style={{ fontSize: "2.1rem", marginTop: 6 }}>
            排序視覺化
          </h1>
          <p>選一種排序、給它一組數字，一步一步看它怎麼把東西排好。</p>
        </div>
      </div>

      <div className="algo-sort-tabs">
        {SORTS.map((s) => (
          <Link key={s.id} to={`/algo/sorting/${s.id}`} className={`algo-chip ${s.id === algo.id ? "is-on" : ""}`}>
            {s.nameZh}
          </Link>
        ))}
      </div>

      <Player
        key={`${algo.id}-${run}-${safe.join(",")}`}
        frames={frames}
        code={algo.code}
        toolbar={
          <form
            className="algo-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (parsed.values) apply(parsed.values);
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="要排序的數字"
              aria-invalid={!!parsed.error}
              placeholder="例如 5, 2, 8, 3"
            />
            <button type="submit" className="algo-btn is-small" disabled={!parsed.values}>
              套用
            </button>
            <button type="button" className="algo-btn is-small" onClick={() => apply(randomArray(size, randomMax))}>
              <FiShuffle /> 隨機
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.76rem", color: "var(--muted)" }}>
              數量 {size}
              <input
                type="range"
                min={4}
                max={MAX_LEN}
                value={size}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSize(n);
                  apply(randomArray(n, randomMax));
                }}
                style={{ width: 90, accentColor: "var(--accent)" }}
              />
            </label>
            {parsed.error && (
              <span style={{ flexBasis: "100%", fontSize: "0.76rem", color: "var(--t-bad)" }}>{parsed.error}</span>
            )}
          </form>
        }
      />

      <section className="algo-card algo-prose" style={{ marginTop: 18 }}>
        <h3>
          {algo.nameZh} · {algo.name}
        </h3>
        <p>{rich(algo.idea)}</p>
        <h3>步驟</h3>
        <ol>
          {algo.steps.map((s, i) => (
            <li key={i}>{rich(s)}</li>
          ))}
        </ol>
        <h3>複雜度</h3>
        <div className="algo-complexity">
          <div>
            <span>最佳</span>
            <b>{algo.complexity.best}</b>
          </div>
          <div>
            <span>平均</span>
            <b>{algo.complexity.avg}</b>
          </div>
          <div>
            <span>最差</span>
            <b>{algo.complexity.worst}</b>
          </div>
          <div>
            <span>額外空間</span>
            <b>{algo.complexity.space}</b>
          </div>
          <div>
            <span>穩定性</span>
            <b>{algo.complexity.stable ? "穩定" : "不穩定"}</b>
          </div>
        </div>
      </section>

      <div className="algo-section-head" style={{ marginTop: 40 }}>
        <div>
          <h2>排序演算法比較</h2>
          <p>n 為元素個數，k 為數值範圍或位數。</p>
        </div>
      </div>
      <div className="algo-card algo-table-wrap">
        <table className="algo-table">
          <thead>
            <tr>
              <th>演算法</th>
              <th>最佳</th>
              <th>平均</th>
              <th>最差</th>
              <th>空間</th>
              <th>穩定</th>
            </tr>
          </thead>
          <tbody>
            {SORTS.map((s) => (
              <tr key={s.id} className={s.id === algo.id ? "is-on" : ""}>
                <td>
                  <Link to={`/algo/sorting/${s.id}`}>
                    {s.nameZh} <span style={{ color: "var(--muted)", fontWeight: 400 }}>{s.name}</span>
                  </Link>
                </td>
                <td>{s.complexity.best}</td>
                <td>{s.complexity.avg}</td>
                <td>{s.complexity.worst}</td>
                <td>{s.complexity.space}</td>
                <td>{s.complexity.stable ? "✓" : "✗"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
