import { Link } from "react-router-dom";
import { tagLabel } from "../tags";
import type { Lang } from "../lang";

/**
 * A technique tag. With `onClick` it is a filter button; otherwise it links to
 * the problem list filtered by this tag.
 */
export default function TagChip({
  id,
  lang,
  active = false,
  small = false,
  count,
  onClick,
}: {
  id: string;
  lang: Lang;
  active?: boolean;
  small?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  const className = `algo-skill ${small ? "is-small" : ""} ${active ? "is-on" : ""}`;
  const body = (
    <>
      <span aria-hidden>#</span>
      {tagLabel(id, lang)}
      {count !== undefined && <b>{count}</b>}
    </>
  );
  if (onClick)
    return (
      <button type="button" className={className} onClick={onClick} aria-pressed={active}>
        {body}
      </button>
    );
  return (
    <Link to={`/algo/problems?t=${id}`} className={className}>
      {body}
    </Link>
  );
}
