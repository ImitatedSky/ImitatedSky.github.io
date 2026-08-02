import { useEffect } from "react";
import { SITE } from "../config/site";

const DEFAULT_TITLE = "Imisky's Blog";

/**
 * Set document.title for the current page.
 * - string    → "<title> | Imisky"
 * - null      → default "Imisky's Blog" (home)
 * - undefined → leave unchanged (data still loading)
 */
export function usePageTitle(title?: string | null) {
  useEffect(() => {
    if (title === undefined) return;
    document.title = title === null ? DEFAULT_TITLE : `${title} | ${SITE.name}`;
  }, [title]);
}
