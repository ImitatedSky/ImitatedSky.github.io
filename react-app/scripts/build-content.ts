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
const OUT_DIR = path.join(process.cwd(), "public/content");
const OUT_POSTS = path.join(OUT_DIR, "posts");
const BASE_URL = "https://pochunyeh.com";

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

const files = collectMarkdownFiles(POSTS_DIR);
console.log(`Processing ${files.length} posts…`);

interface PostMeta {
  slug: string; title: string; date: string; updated: string;
  tags: string[]; categories: string[]; cover: string; excerpt: string; sticky: number;
}
interface Post extends PostMeta { contentHtml: string; }

const allMeta: PostMeta[] = [];
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
    console.warn(`  WARN: skipping ${slug}: ${(e as Error).message}`);
  }
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

// ── sitemap ──────────────────────────────────────────────────────────────────
const urls = [
  "/", "/archives/", "/tags/", "/categories/", "/links/",
  ...allMeta.map((p) => `/posts/${p.slug}/`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${BASE_URL}${u}</loc></url>`).join("\n")}
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
