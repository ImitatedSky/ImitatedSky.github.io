/**
 * Post-build step: write a real index.html for every known route, with that
 * page's own <title>, description, canonical and Open Graph tags.
 *
 * Social scrapers (Facebook / X / LINE) never run JS, so without this every
 * shared link renders a blank card. Search engines get a real title too.
 * Only <head> is specialised — <body> stays the empty SPA root, so React
 * hydration is unaffected.
 */
import fs from "fs";
import path from "path";

const DIST = path.join(process.cwd(), "dist");
const TEMPLATE = path.join(DIST, "index.html");
const ROUTES = path.join(DIST, "content/routes.json");
const BASE_URL = "https://pochunyeh.com";

interface Route {
  path: string;
  title: string;
  description: string;
  image: string;
  type: "website" | "article";
  lastmod?: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function metaFor(r: Route): string {
  const url = `${BASE_URL}${r.path === "/" ? "/" : `${r.path}/`}`;
  const tags = [
    `<meta name="description" content="${esc(r.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="Imisky" />`,
    `<meta property="og:type" content="${r.type}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:image" content="${esc(r.image)}" />`,
    `<meta property="og:locale" content="zh_TW" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
    `<meta name="twitter:image" content="${esc(r.image)}" />`,
  ];
  if (r.type === "article" && r.lastmod) {
    tags.push(`<meta property="article:modified_time" content="${r.lastmod}" />`);
  }
  return tags.map((t) => `    ${t}`).join("\n");
}

const template = fs.readFileSync(TEMPLATE, "utf-8");
const routes: Route[] = JSON.parse(fs.readFileSync(ROUTES, "utf-8"));

// The template's <title> is the placeholder we swap per route.
const TITLE_RE = /<title>[\s\S]*?<\/title>/;
if (!TITLE_RE.test(template)) {
  throw new Error("prerender: no <title> in dist/index.html — cannot inject meta");
}

let written = 0;
for (const r of routes) {
  const html = template.replace(
    TITLE_RE,
    `<title>${esc(r.title)}</title>\n${metaFor(r)}`,
  );

  // "/" is dist/index.html itself; everything else gets its own directory
  const outFile =
    r.path === "/"
      ? TEMPLATE
      : path.join(DIST, decodeURIComponent(r.path).replace(/^\//, ""), "index.html");

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);
  written++;
}

console.log(`  ✓ prerendered ${written} routes with per-page meta`);
