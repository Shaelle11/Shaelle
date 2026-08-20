import { useCallback, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";

const COLUMNS = 12;
const ROWS = 8;

const TAGLINE = "Think. Learn. Build. Improve.";
const HEADLINE = "I build products people actually want to use.";
const PARAGRAPH =
    "A developer-designer hybrid crafting clean interfaces, fast interactions, and thoughtful details — from first sketch to shipped code.";

function rectsIntersect(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function getNeighborIndices(index) {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS) neighbors.push(r * COLUMNS + c);
        }
    }
    return neighbors;
}

function HeroTile({ index, scrollProgress, isAffected, tileRef, onHoverStart, onHoverEnd }) {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    const dirX = (col - (COLUMNS - 1) / 2) / ((COLUMNS - 1) / 2);
    const dirY = (row - (ROWS - 1) / 2) / ((ROWS - 1) / 2);
    const spread = 60 + ((index * 37) % 90);

    const x = useTransform(scrollProgress, [0, 1], [0, 120 + dirX * spread]);
    const y = useTransform(scrollProgress, [0, 1], [0, dirY * spread * 0.6]);
    const rotate = useTransform(scrollProgress, [0, 1], [0, dirX * 20]);
    const opacity = useTransform(scrollProgress, [0, 1], [1, 0]);

    return (
        <motion.div
            ref={tileRef}
            className="relative border border-dark"
            style={{ x, y, rotate, opacity }}
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

export default function Hero({ scrollProgress }) {
    const tiles = Array.from({ length: COLUMNS * ROWS });
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

    const handleHoverStart = useCallback((index) => {
        const neighborIndices = getNeighborIndices(index);
        setAffected(new Set(neighborIndices));
        const rects = neighborIndices
            .map((i) => tileRefs.current[i]?.getBoundingClientRect())
            .filter(Boolean);
        setLitTagline(litFor(taglineRefs, rects));
        setLitHeadline(litFor(headlineRefs, rects));
        setLitParagraph(litFor(paragraphRefs, rects));
    }, []);

    const handleHoverEnd = useCallback(() => {
        setAffected(new Set());
        setLitTagline(new Set());
        setLitHeadline(new Set());
        setLitParagraph(new Set());
    }, []);

    const renderChars = (text, refsArray, litSet, { wideSpace = false } = {}) =>
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
                        litSet.has(i) ? "text-light" : "text-dark"
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
                    className="absolute inset-0 grid"
                    style={{
                        gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    }}
                >
                    {tiles.map((_, i) => (
                        <HeroTile
                            key={i}
                            index={i}
                            scrollProgress={scrollProgress}
                            isAffected={affected.has(i)}
                            tileRef={(el) => (tileRefs.current[i] = el)}
                            onHoverStart={() => handleHoverStart(i)}
                            onHoverEnd={handleHoverEnd}
                        />
                    ))}
                </div>

                <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between px-6 py-10 md:px-12 md:py-14">
                    <div className="flex h-3/4 flex-col justify-end">
                        <span className="mb-4 text-sm uppercase tracking-[0.3em]">
                            {renderChars(TAGLINE, taglineRefs, litTagline)}
                        </span>
                        <h1 className="font-display text-4xl leading-[1.4] sm:text-5xl md:text-6xl lg:text-7xl">
                            {renderChars(HEADLINE, headlineRefs, litHeadline, { wideSpace: true })}
                        </h1>
                    </div>

                    <div className="flex h-1/4 items-end justify-between gap-8">
                        <p className="w-3/5 text-base md:text-lg">
                            {renderChars(PARAGRAPH, paragraphRefs, litParagraph)}
                        </p>

                        <motion.a
                            href="#contact"
                            className="pointer-events-auto shrink-0 rounded-none border-4 border-green bg-transparent px-8 py-4 text-sm font-medium tracking-wide text-green transition-colors duration-300 hover:bg-green hover:text-light"
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
