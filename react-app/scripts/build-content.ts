import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import yaml from "js-yaml";

const ROOT = path.join(process.cwd(), "..");
const POSTS_DIR = path.join(ROOT, "source/_posts");
const LINKS_FILE = path.join(ROOT, "source/_data/link.yml");
const IMG_SRC = path.join(ROOT, "source/img");
const IMG_DEST = path.join(process.cwd(), "public/img");
const OUT_DIR = path.join(process.cwd(), "public/content");
const OUT_POSTS = path.join(OUT_DIR, "posts");
const BASE_URL = "https://pochunyeh.com";
const SITE_NAME = "Imisky";
const DEFAULT_DESC = "Coding · LeetCode · Life";
const PAGE_SIZE = 10; // keep in sync with Home.tsx

// ── helpers ──────────────────────────────────────────────────────────────────

function collectMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...collectMarkdownFiles(full));
    else if (e.isFile() && e.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function normalizeTag(tag: unknown): string {
  if (typeof tag !== "string") return String(tag ?? "");
  return tag.replace(/^\[|\]$/g, "").trim();
}

function normalizeTags(raw: unknown): string[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(normalizeTag).filter(Boolean);
}

function normalizeCategories(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return [String(raw)];
}

/** Convert Notion-style !https://... bare image lines to standard Markdown */
function preprocessContent(content: string): string {
  return content.replace(/^!(https?:\/\/\S+)$/gm, "![]($1)");
}

/** source/img is the single source of truth; top up public/img from it */
function copyImages(src: string, dest: string): number {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, e.name);
    const to = path.join(dest, e.name);
    if (e.isDirectory()) {
      n += copyImages(from, to);
    } else if (e.isFile()) {
      // skip if destination is already identical in size and not older
      const s = fs.statSync(from);
      if (fs.existsSync(to)) {
        const d = fs.statSync(to);
        if (d.size === s.size && d.mtimeMs >= s.mtimeMs) continue;
      }
      fs.copyFileSync(from, to);
      n++;
    }
  }
  return n;
}

function makeExcerpt(content: string): string {
  return content
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[*_~>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

// ── main ─────────────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_POSTS, { recursive: true });

const copied = copyImages(IMG_SRC, IMG_DEST);
console.log(`  ✓ img (${copied} copied from source/img)`);

const files = collectMarkdownFiles(POSTS_DIR);
console.log(`Processing ${files.length} posts…`);

interface PostMeta {
  slug: string; title: string; date: string; updated: string;
  tags: string[]; categories: string[]; cover: string; excerpt: string; sticky: number;
}
interface Post extends PostMeta { contentHtml: string; }

const allMeta: PostMeta[] = [];
const failures: string[] = [];
const searchIndex: { slug: string; title: string; tags: string[]; category: string; excerpt: string }[] = [];

for (const file of files) {
  const slug = path.basename(file, ".md");
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const { data, content: rawContent } = matter(raw);
    const content = preprocessContent(rawContent);

    const title = String(data.title ?? slug);
    const date = data.date ? new Date(data.date).toISOString().slice(0, 10) : "";
    const updated = data.updated ? new Date(data.updated).toISOString().slice(0, 10) : "";
    const tags = normalizeTags(data.tags);
    const categories = normalizeCategories(data.categories);
    const cover = String(data.cover ?? "/img/cover/cover02.jpg");
    const excerpt = makeExcerpt(content);
    const sticky = Number(data.sticky ?? 0);

    // render HTML
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: "wrap" })
      .use(rehypePrettyCode, { theme: "one-dark-pro", keepBackground: true, defaultLang: "text" })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(content);

    let contentHtml = String(result);
    // Strip <script> tags (e.g. inline scripts in source Markdown)
    contentHtml = contentHtml.replace(/<script[\s\S]*?<\/script>/gi, "");
    // Rewrite relative links like ../folder/slug → /posts/slug
    contentHtml = contentHtml.replace(
      /href="\.\.\/[^/"]+\/([^"?#]+)([^"]*)"/g,
      (_, slug, rest) => `href="/posts/${slug}${rest}"`
    );
    // Absolutise relative image sources. Post URLs are served with a trailing
    // slash, so "../img/x.png" or "x.png" would resolve under /posts/<slug>/
    // and 404 — images live at /img/… regardless of which post embeds them.
    contentHtml = contentHtml.replace(
      /src="(?!https?:|\/|data:)([^"]+)"/g,
      (_, rel: string) => {
        const cleaned = rel.replace(/^(?:\.\.?\/)+/, "");
        const abs = cleaned.startsWith("img/") ? `/${cleaned}` : `/img/${cleaned}`;
        return `src="${abs}"`;
      }
    );
    // Add target="_blank" rel="noopener noreferrer" to external links
    contentHtml = contentHtml.replace(
      /<a\s([^>]*href="https?:\/\/[^"]*"[^>]*)>/gi,
      (match, attrs) => {
        if (/target=/i.test(attrs)) return match; // already has target
        return `<a ${attrs} target="_blank" rel="noopener noreferrer">`;
      }
    );

    const post: Post = { slug, title, date, updated, tags, categories, cover, excerpt, sticky, contentHtml };
    fs.writeFileSync(path.join(OUT_POSTS, `${slug}.json`), JSON.stringify(post));

    allMeta.push({ slug, title, date, updated, tags, categories, cover, excerpt, sticky });
    searchIndex.push({ slug, title, date, tags, categories, excerpt });
  } catch (e) {
    // A swallowed error here silently removes a post from the site while the
    // build still succeeds — collect and fail loudly instead.
    failures.push(`${slug}: ${(e as Error).message}`);
  }
}

if (failures.length > 0) {
  console.error(`\n  ✗ ${failures.length} post(s) failed to build:`);
  for (const f of failures) console.error(`      ${f}`);
  console.error("\n  Refusing to publish a site with missing posts.\n");
  process.exit(1);
}

// sort: sticky posts first (higher sticky value = higher priority), then date descending
allMeta.sort((a, b) => {
  if (b.sticky !== a.sticky) return b.sticky - a.sticky;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return b.date.localeCompare(a.date);
});

fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(allMeta));
fs.writeFileSync(path.join(OUT_DIR, "search-index.json"), JSON.stringify(searchIndex));
console.log(`  ✓ index.json (${allMeta.length} posts)`);
console.log(`  ✓ search-index.json`);

// ── links ─────────────────────────────────────────────────────────────────────
if (fs.existsSync(LINKS_FILE)) {
  const links = yaml.load(fs.readFileSync(LINKS_FILE, "utf-8"));
  fs.writeFileSync(path.join(OUT_DIR, "links.json"), JSON.stringify(links));
  console.log("  ✓ links.json");
}

// ── routes (drives both sitemap and prerender, so neither can drift) ─────────
interface Route {
  path: string;        // e.g. "/posts/foo" — no trailing slash except "/"
  title: string;       // full <title>
  description: string;
  image: string;       // absolute URL
  type: "website" | "article";
  lastmod?: string;
}

const DEFAULT_IMG = `${BASE_URL}/img/index_img.jpg`;
const abs = (p: string) => (p.startsWith("http") ? p : `${BASE_URL}${p}`);

const tagNames = Array.from(new Set(allMeta.flatMap((p) => p.tags)));
const catNames = Array.from(new Set(allMeta.flatMap((p) => p.categories)));
const pageCount = Math.ceil(allMeta.length / PAGE_SIZE);

const routes: Route[] = [
  { path: "/", title: "Imisky's Blog", description: DEFAULT_DESC, image: DEFAULT_IMG, type: "website" },
  ...Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => ({
    path: `/page/${i + 2}`,
    title: `第 ${i + 2} 頁 | ${SITE_NAME}`,
    description: DEFAULT_DESC,
    image: DEFAULT_IMG,
    type: "website" as const,
  })),
  { path: "/archives", title: `Archives | ${SITE_NAME}`, description: `全部 ${allMeta.length} 篇文章的時間軸`, image: DEFAULT_IMG, type: "website" },
  { path: "/tags", title: `Tags | ${SITE_NAME}`, description: `共 ${tagNames.length} 個標籤`, image: DEFAULT_IMG, type: "website" },
  { path: "/categories", title: `Categories | ${SITE_NAME}`, description: `共 ${catNames.length} 個分類`, image: DEFAULT_IMG, type: "website" },
  { path: "/links", title: `Links | ${SITE_NAME}`, description: "友情連結", image: DEFAULT_IMG, type: "website" },
  { path: "/messageboard", title: `留言板 | ${SITE_NAME}`, description: "歡迎留言交流", image: DEFAULT_IMG, type: "website" },
  ...tagNames.map((t) => ({
    path: `/tags/${encodeURIComponent(t)}`,
    title: `Tag: ${t} | ${SITE_NAME}`,
    description: `標記為 ${t} 的文章`,
    image: DEFAULT_IMG,
    type: "website" as const,
  })),
  ...catNames.map((c) => ({
    path: `/categories/${encodeURIComponent(c)}`,
    title: `${c} | ${SITE_NAME}`,
    description: `分類 ${c} 的文章`,
    image: DEFAULT_IMG,
    type: "website" as const,
  })),
  ...allMeta.map((p) => ({
    path: `/posts/${encodeURIComponent(p.slug)}`,
    title: `${p.title} | ${SITE_NAME}`,
    description: p.excerpt || DEFAULT_DESC,
    image: abs(p.cover),
    type: "article" as const,
    lastmod: p.updated || p.date || undefined,
  })),
];

fs.writeFileSync(path.join(OUT_DIR, "routes.json"), JSON.stringify(routes));
console.log(`  ✓ routes.json (${routes.length} routes)`);

// ── sitemap ──────────────────────────────────────────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((r) => {
    const loc = `${BASE_URL}${r.path === "/" ? "/" : `${r.path}/`}`;
    const lastmod = r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : "";
    return `  <url><loc>${loc}</loc>${lastmod}</url>`;
  })
  .join("\n")}
</urlset>`;
fs.writeFileSync(path.join(process.cwd(), "public/sitemap.xml"), sitemap);
console.log("  ✓ sitemap.xml");

// ── rss ───────────────────────────────────────────────────────────────────────
function esc(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
const recent = allMeta.filter(p => p.date).slice(0, 20);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PocHun's Blog</title>
    <link>${BASE_URL}</link>
    <description>Coding · LeetCode · Life</description>
    <language>zh-TW</language>
${recent.map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE_URL}/posts/${p.slug}/</link>
      <guid>${BASE_URL}/posts/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`).join("\n")}
  </channel>
</rss>`;
fs.writeFileSync(path.join(process.cwd(), "public/rss.xml"), rss);
console.log("  ✓ rss.xml");

console.log("Build content complete.");
