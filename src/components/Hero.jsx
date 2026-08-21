import { useCallback, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useClampedTransform } from "../lib/scrollTransform";
import { useIsMobile } from "../lib/useIsMobile";

const DESKTOP_GRID = { columns: 12, rows: 8 };
const MOBILE_GRID = { columns: 5, rows: 10 };

const TAGLINE = "Think. Learn. Build. Improve.";
const HEADLINE = "Building Products People Need";
const PARAGRAPH =
    "A RESEARCHER, ENGINEER AND MANAGER, fast interactions, and thoughtful details, from the first sketch To The Final Product.";

function rectsIntersect(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function getNeighborIndices(index, columns, rows) {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < rows && c >= 0 && c < columns) neighbors.push(r * columns + c);
        }
    }
    return neighbors;
}

function HeroTile({ index, columns, scrollProgress, half, isAffected, tileRef, onHoverStart, onHoverEnd }) {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const colFraction = col / (columns - 1);
    const rowJitter = ((row * 53) % 40) - 20;

    const sweepStart = colFraction * 0.35 * half;
    const sweepEnd = Math.min(sweepStart + 0.65 * half, half);

    const x = useTransform(scrollProgress, [sweepStart, half], [0, 260]);
    const y = useTransform(scrollProgress, [sweepStart, half], [0, rowJitter]);
    const opacity = useClampedTransform(scrollProgress, [sweepStart, sweepEnd], [1, 0]);

    return (
        <motion.div
            ref={tileRef}
            className="relative border border-dark"
            style={{ x, y, opacity }}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
            animate={{
                backgroundColor: isAffected ? "rgba(4,42,43,1)" : "rgba(4,42,43,0)",
                scale: isAffected ? 1.08 : 1,
                boxShadow: isAffected ? "0px 15px 30px rgba(0,0,0,0.35)" : "0px 0px 0px rgba(0,0,0,0)",
                zIndex: isAffected ? 10 : 0,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1.2 }}
        />
    );
}

export default function Hero({ scrollProgress, pageCount = 2 }) {
    const isMobile = useIsMobile();
    const { columns, rows } = isMobile ? MOBILE_GRID : DESKTOP_GRID;
    const tiles = Array.from({ length: columns * rows });
    const half = 1 / (pageCount - 1);
    const tileRefs = useRef([]);
    const taglineRefs = useRef([]);
    const headlineRefs = useRef([]);
    const paragraphRefs = useRef([]);

    const [affected, setAffected] = useState(() => new Set());
    const [litTagline, setLitTagline] = useState(() => new Set());
    const [litHeadline, setLitHeadline] = useState(() => new Set());
    const [litParagraph, setLitParagraph] = useState(() => new Set());

    const litFor = (refsArray, rects) => {
        const lit = new Set();
        refsArray.current.forEach((el, i) => {
            if (el && rects.some((rect) => rectsIntersect(el.getBoundingClientRect(), rect))) lit.add(i);
        });
        return lit;
    };

    const handleHoverStart = useCallback(
        (index) => {
            const neighborIndices = getNeighborIndices(index, columns, rows);
            setAffected(new Set(neighborIndices));
            const rects = neighborIndices
                .map((i) => tileRefs.current[i]?.getBoundingClientRect())
                .filter(Boolean);
            setLitTagline(litFor(taglineRefs, rects));
            setLitHeadline(litFor(headlineRefs, rects));
            setLitParagraph(litFor(paragraphRefs, rects));
        },
        [columns, rows]
    );

    const handleHoverEnd = useCallback(() => {
        setAffected(new Set());
        setLitTagline(new Set());
        setLitHeadline(new Set());
        setLitParagraph(new Set());
    }, []);

    const renderChars = (text, refsArray, litSet, { wideSpace = false, baseColor = "text-dark" } = {}) =>
        text.split("").map((char, i) => {
            if (char === " ") {
                return wideSpace ? (
                    <span key={i} className="inline-block w-[0.3em]" aria-hidden="true" />
                ) : (
                    <span key={i}>{" "}</span>
                );
            }
            return (
                <span
                    key={i}
                    ref={(el) => (refsArray.current[i] = el)}
                    className={`transition-colors duration-500 ease-out ${
                        litSet.has(i) ? "text-light" : baseColor
                    }`}
                >
                    {char}
                </span>
            );
        });

    return (
        <section className="relative flex h-full w-screen shrink-0 snap-start items-center justify-center overflow-hidden">
            <div className="relative h-[90%] w-[90%] bg-light">
                <div
                    className="absolute inset-0 grid overflow-hidden"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                    }}
                >
                    {tiles.map((_, i) => (
                        <HeroTile
                            key={i}
                            index={i}
                            columns={columns}
                            scrollProgress={scrollProgress}
                            half={half}
                            isAffected={affected.has(i)}
                            tileRef={(el) => (tileRefs.current[i] = el)}
                            onHoverStart={() => handleHoverStart(i)}
                            onHoverEnd={handleHoverEnd}
                        />
                    ))}
                </div>

                <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between px-6 py-8 sm:py-10 md:px-12 md:py-14">
                    <div className="flex h-auto flex-col justify-end sm:h-3/4">
                        <span className="mb-2 font-display text-[10px] uppercase tracking-[0.15em] sm:mb-4 sm:text-sm sm:tracking-[0.3em]">
                            {renderChars(TAGLINE, taglineRefs, litTagline, { baseColor: "text-blue" })}
                        </span>
                        <h1 className="font-display text-2xl leading-loose sm:text-4xl md:text-5xl lg:text-6xl">
                            {renderChars(HEADLINE, headlineRefs, litHeadline, { wideSpace: true })}
                        </h1>
                    </div>

                    <div className="mt-6 flex h-auto flex-col items-start gap-4 sm:mt-0 sm:h-1/4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                        <p className="w-full text-sm sm:w-3/5 sm:text-base md:text-lg">
                            {renderChars(PARAGRAPH, paragraphRefs, litParagraph)}
                        </p>

                        <motion.a
                            href="https://calendar.app.google/M69bCdY4izEja62V6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pointer-events-auto shrink-0 rounded-none border-3 border-blue bg-transparent px-5 py-3 text-xs font-medium tracking-wide text-blue transition-colors duration-300 ease-out hover:bg-green hover:text-light sm:px-8 sm:py-4 sm:text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            Book a Chat
                        </motion.a>
                    </div>
                </div>
            </div>
        </section>
    );
}
