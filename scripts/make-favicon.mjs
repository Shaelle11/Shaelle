// Renders "TS" in the site's header font (TAN-SONGBIRD) as vector paths and writes
// public/favicon.svg. Paths are used instead of an embedded @font-face + <text> because
// favicon rendering contexts (browser tabs, bookmarks) don't reliably load embedded webfonts.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import opentype from "opentype.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONT_PATH = path.join(HERE, "..", "src", "assets", "fonts", "TAN-SONGBIRD.otf");
const OUT_PATH = path.join(HERE, "..", "public", "favicon.svg");

const SIZE = 64;
const PADDING_FACTOR = 0.6; // fraction of SIZE the glyphs should fill
const BG_COLOR = "#042a2b"; // --color-green
const TEXT_COLOR = "#F2F1EB"; // --color-light
const TEXT = "TS";
// Keep this at or below ~60 — opentype.js hits a NaN bug rendering this font's
// curves at larger sizes (reproduced independently of this script).
const REFERENCE_SIZE = 44;

async function main() {
    const buffer = await readFile(FONT_PATH);
    const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

    // First pass at a reference size just to measure this font's actual glyph
    // extents — TAN-SONGBIRD's swashes make it much wider than its nominal size.
    const measurePath = font.getPath(TEXT, 0, 0, REFERENCE_SIZE);
    const measureBox = measurePath.getBoundingBox();
    const measureWidth = measureBox.x2 - measureBox.x1;
    const measureHeight = measureBox.y2 - measureBox.y1;

    const target = SIZE * PADDING_FACTOR;
    const scale = Math.min(target / measureWidth, target / measureHeight);
    const fontSize = REFERENCE_SIZE * scale;

    const glyphPath = font.getPath(TEXT, 0, 0, fontSize);
    const bbox = glyphPath.getBoundingBox();
    const glyphWidth = bbox.x2 - bbox.x1;
    const glyphHeight = bbox.y2 - bbox.y1;

    const x = (SIZE - glyphWidth) / 2 - bbox.x1;
    const y = (SIZE - glyphHeight) / 2 - bbox.y1;

    const centeredPath = font.getPath(TEXT, x, y, fontSize);
    const d = centeredPath.toPathData(2);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${BG_COLOR}"/>
  <path d="${d}" fill="${TEXT_COLOR}"/>
</svg>
`;

    await writeFile(OUT_PATH, svg, "utf-8");
    console.log(`Wrote favicon to ${OUT_PATH}`);
}

main().catch((err) => {
    console.error("Failed to generate favicon:", err.message);
    process.exit(1);
});
