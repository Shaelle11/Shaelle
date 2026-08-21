// Pulls the latest Medium posts at build time and writes them to src/data/articles.json.
// Runs in Node (via `npm run fetch:articles`, wired into `prebuild`), so it never hits the
// browser CORS restrictions that block fetching Medium's RSS feed directly from the client.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Parser from "rss-parser";

const MEDIUM_HANDLE = "@Youtenstudio";
const FEED_URL = `https://medium.com/feed/${MEDIUM_HANDLE}`;
const MAX_ARTICLES = 6;

const OUT_FILE = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "data",
    "articles.json"
);

// Bento shapes cycle in this order so however many posts come back, the grid
// keeps the same curated mosaic look the design was built around.
const SHAPES = [
    { span: "col-span-3 row-span-2", text: "text-xl sm:text-2xl" },
    { span: "col-span-1 row-span-1", text: "text-sm" },
    { span: "col-span-1 row-span-1", text: "text-sm" },
    { span: "col-span-1 row-span-1", text: "text-sm" },
    { span: "col-span-2 row-span-1", text: "text-base sm:text-lg" },
    { span: "col-span-1 row-span-1", text: "text-sm" },
];

const ACRONYMS = new Set(["ai", "ui", "ux", "api", "css", "html", "llm", "llms", "ppd"]);

function formatTag(rawCategory) {
    if (!rawCategory) return "Article";
    return rawCategory
        .split("-")
        .map((word) => (ACRONYMS.has(word.toLowerCase()) ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
        .join(" ");
}

function cleanLink(link) {
    try {
        const url = new URL(link);
        return `${url.origin}${url.pathname}`;
    } catch {
        return link;
    }
}

async function main() {
    const parser = new Parser();
    const feed = await parser.parseURL(FEED_URL);

    const articles = feed.items.slice(0, MAX_ARTICLES).map((item, i) => {
        const shape = SHAPES[i % SHAPES.length];
        return {
            title: item.title?.trim() ?? "Untitled",
            tag: formatTag(item.categories?.[0]),
            link: cleanLink(item.link),
            pubDate: item.pubDate ?? null,
            span: shape.span,
            text: shape.text,
        };
    });

    await writeFile(OUT_FILE, JSON.stringify(articles, null, 2) + "\n", "utf-8");
    console.log(`Wrote ${articles.length} articles to ${OUT_FILE}`);
}

main().catch((err) => {
    console.error("Failed to fetch Medium feed:", err.message);
    process.exit(1);
});
