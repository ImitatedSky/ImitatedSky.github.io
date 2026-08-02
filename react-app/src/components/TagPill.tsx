import { Link } from "react-router-dom";

interface Props {
  tag: string;
  /** "default" — light bg for cards/listings; "overlay" — translucent white for dark banners */
  variant?: "default" | "overlay";
  className?: string;
}

export default function TagPill({ tag, variant = "default", className = "" }: Props) {
  const base = "px-2 py-0.5 rounded-full text-xs transition-colors";
  const styles =
    variant === "overlay"
      ? `${base} bg-white/10 hover:bg-white/20 text-white/80 hover:text-white`
      : `${base} bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400`;

  return (
    <Link to={`/tags/${encodeURIComponent(tag)}`} className={`${styles} ${className}`}>
      #{tag}
    </Link>
  );
}
