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

const distRoot = path.resolve(DIST);
const seen = new Map<string, string>(); // lower-cased outFile → route path
let written = 0;

for (const r of routes) {
  // Replacement must be a function: as a string, `$&`, `` $` `` and `$'` in a
  // title or excerpt would be treated as replacement patterns and splice parts
  // of the document into the attribute.
  const html = template.replace(
    TITLE_RE,
    () => `<title>${esc(r.title)}</title>\n${metaFor(r)}`,
  );

  // "/" is dist/index.html itself; everything else gets its own directory
  const outFile =
    r.path === "/"
      ? TEMPLATE
      : path.join(DIST, decodeURIComponent(r.path).replace(/^\//, ""), "index.html");

  // encodeURIComponent leaves "." untouched, so a tag named ".." would escape
  // dist/ and overwrite files outside the build output.
  const resolved = path.resolve(outFile);
  if (resolved !== path.resolve(TEMPLATE) && !resolved.startsWith(distRoot + path.sep)) {
    throw new Error(
      `prerender: route "${r.path}" resolves outside dist/ (${resolved}) — rename the tag/category/slug`,
    );
  }

  // Windows and macOS are case-insensitive, so tags differing only by case
  // (e.g. "python" vs "Python") would silently overwrite each other and ship
  // one tag's meta under the other's URL.
  const key = resolved.toLowerCase();
  const clash = seen.get(key);
  if (clash) {
    throw new Error(
      `prerender: routes "${clash}" and "${r.path}" map to the same file on a ` +
        `case-insensitive filesystem — merge the duplicate tag/category names`,
    );
  }
  seen.set(key, r.path);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);
  written++;
}

// routes.json is a build-time input only — no client code fetches it, so drop
// it from the published output rather than shipping 60 kB of dead weight.
fs.rmSync(ROUTES, { force: true });

console.log(`  ✓ prerendered ${written} routes with per-page meta`);
