import type { ReactNode } from "react";

interface Props {
  src?: string;
  alt?: string;
  /** Tailwind classes for the overlay div, e.g. "bg-black/50" */
  overlay?: string;
  /** Fallback content shown when no src (e.g. a gradient div) */
  fallback?: ReactNode;
  /** Extra classes on the outer container */
  className?: string;
  /** Above-the-fold banners should load eagerly; off-screen covers lazily */
  loading?: "eager" | "lazy";
  children?: ReactNode;
}

export default function CoverImage({
  src,
  alt = "",
  overlay = "bg-black/50",
  fallback,
  className = "",
  loading = "eager",
  children,
}: Props) {
  return (
    <div className={`relative overflow-hidden bg-zinc-800 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        fallback ?? <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-700" />
      )}
      <div className={`absolute inset-0 ${overlay}`} />
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          {children}
        </div>
      )}
    </div>
  );
}
