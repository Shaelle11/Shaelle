import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClampedTransform } from "../lib/scrollTransform";

const VISIBLE_ROWS = 4;

// TAN-SONGBIRD (the display font) has no glyph for "ọ" (o + dot-below) or the
// combining grave — the browser silently falls back to a plain serif for just
// that character, which renders far smaller than this font's bold glyphs.
// Scaling it up keeps the name legible without breaking the display font
// everywhere else.
function IleImoName() {
    return (
        <>
            Ilé-ìm<span className="font-serif text-[1.6em]" style={{ verticalAlign: "-0.3em", marginLeft: "-0.05em" }}>ọ̀</span>
        </>
    );
}

const PROJECTS = [
    {
        tech: ["React", "Supabase", "Gemini"],
        name: <IleImoName />,
        title: "Ask questions about your own material, get answers with citations",
        description:
            "Connect a GitHub repository and get a conversational answer that links back to the exact file and line range on GitHub.",
        link: "https://ile-imo.vercel.app",
    },
    {
        tech: ["React", "Recharts", "Gemini"],
        name: "Report Visualiser",
        title: "Turn a report into a chart without building anything",
        description:
            "Drop in a report and get a chart back. The chat-based version didn't make the deadline, but the structure is there to extend into that experience later.",
        link: "https://report-visualiser.vercel.app",
    },
    {
        tech: ["Next.js", "TypeScript", "MongoDB"],
        name: "Bloom After 🌸",
        title: "Postpartum care and support for Nigerian mothers",
        description:
            "Built as part of the Tabî Project by the TEE Foundation for International Women's Day 2026 — trusted information, verified care directories, and moderated community experiences.",
        link: "https://bloom-after-59wn.vercel.app/",
    },
];

const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

const DIVIDER_LEFT = "calc(60% - 0.75rem)";

const SETTLE_COLUMNS = 8;
const SETTLE_ROWS = 5;
const SETTLE_ACCENTS = ["var(--color-blue)", "var(--color-lilac)"];

// Deterministic hash so the accent-square pattern is stable across renders without Math.random.
function seededFraction(i, salt) {
    const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

function SettleSquare({ index, scrollProgress, half }) {
    const col = index % SETTLE_COLUMNS;
    const row = Math.floor(index / SETTLE_COLUMNS);
    const colFraction = col / (SETTLE_COLUMNS - 1);

    const fallStart = (colFraction * 0.3 + (row % 3) * 0.03) * half;
    const landAt = Math.min(fallStart + 0.35 * half, half);
    const fadeEnd = Math.min(landAt + 0.15 * half, half);

    const y = useClampedTransform(scrollProgress, [fallStart, landAt], [-180 - row * 14, 0]);
    const opacity = useClampedTransform(scrollProgress, [landAt, fadeEnd], [1, 0]);

    const isAccent = seededFraction(index, 5) < 0.12;
    const accentColor = SETTLE_ACCENTS[Math.floor(seededFraction(index, 6) * SETTLE_ACCENTS.length)];

    return (
        <motion.div
            className="border border-dark/10"
            style={{ y, opacity, backgroundColor: isAccent ? accentColor : "var(--color-light)" }}
        />
    );
}

function SettleGrid({ scrollProgress, half }) {
    const cells = Array.from({ length: SETTLE_COLUMNS * SETTLE_ROWS });

    return (
        <div
            className="pointer-events-none absolute inset-0 z-20 grid"
            style={{
                gridTemplateColumns: `repeat(${SETTLE_COLUMNS}, 1fr)`,
                gridTemplateRows: `repeat(${SETTLE_ROWS}, 1fr)`,
            }}
        >
            {cells.map((_, i) => (
                <SettleSquare key={i} index={i} scrollProgress={scrollProgress} half={half} />
            ))}
        </div>
    );
}

function ShowcaseRow({ project, number, isActive, onMouseMove }) {
    return (
        <motion.a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            layout
            variants={rowVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onMouseMove={onMouseMove}
            className={`relative block border-b border-light/20 py-4 transition-colors duration-300 ${
                isActive ? "text-light" : "text-blue"
            }`}
        >
            <span
                className="pointer-events-none absolute inset-y-0 hidden w-px bg-light/40 sm:block"
                style={{ left: DIVIDER_LEFT }}
                aria-hidden="true"
            />

            <span
                className="absolute z-10 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-light/40 bg-green text-xs sm:flex"
                style={{ left: DIVIDER_LEFT, top: 0 }}
            >
                {String(number).padStart(2, "0")}
            </span>

            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[3fr_2fr] sm:gap-6">
                <div className="order-2 flex flex-col gap-3 sm:order-1">
                    <span className="text-xs uppercase tracking-[0.2em]">
                        {project.tech.join(" · ")}
                    </span>
                    <div className="flex items-start gap-3 text-sm sm:text-base">
                        <motion.span
                            animate={{ x: isActive ? 6 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            &rarr;
                        </motion.span>
                        <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="opacity-70">{project.description}</p>
                        </div>
                    </div>
                </div>
                <span className="order-1 flex items-center gap-2 font-display text-lg sm:order-2 sm:justify-end sm:text-right sm:text-xl">
                    <span className="text-xs sm:hidden">{String(number).padStart(2, "0")}</span>
                    {project.name}
                </span>
            </div>
        </motion.a>
    );
}

export default function Projects({ scrollProgress, pageCount = 2 }) {
    const half = 1 / (pageCount - 1);
    const contentOpacity = useClampedTransform(scrollProgress, [0, half], [0, 1]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [windowStart, setWindowStart] = useState(0);
    const sectionRef = useRef(null);
    const isPagingRef = useRef(false);

    const total = PROJECTS.length;

    const moveActive = useCallback(
        (delta) => {
            setActiveIndex((prev) => {
                const next = Math.min(Math.max(prev + delta, 0), total - 1);
                setWindowStart((ws) => {
                    if (next < ws) return next;
                    if (next >= ws + VISIBLE_ROWS) return next - VISIBLE_ROWS + 1;
                    return ws;
                });
                return next;
            });
        },
        [total]
    );

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            if (e.deltaY > 10) {
                if (activeIndex >= total - 1) return;
                e.preventDefault();
                e.stopPropagation();
                if (isPagingRef.current) return;
                isPagingRef.current = true;
                moveActive(1);
                setTimeout(() => {
                    isPagingRef.current = false;
                }, 150);
            } else if (e.deltaY < -10) {
                if (activeIndex <= 0) return;
                e.preventDefault();
                e.stopPropagation();
                if (isPagingRef.current) return;
                isPagingRef.current = true;
                moveActive(-1);
                setTimeout(() => {
                    isPagingRef.current = false;
                }, 150);
            }
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [activeIndex, total, moveActive]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                moveActive(1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                moveActive(-1);
            } else if (e.key === "Enter") {
                const project = PROJECTS[activeIndex];
                if (project) window.open(project.link, "_blank", "noopener,noreferrer");
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [activeIndex, moveActive]);

    const visible = PROJECTS.slice(windowStart, windowStart + VISIBLE_ROWS);

    return (
        <section
            ref={sectionRef}
            className="relative flex h-full w-screen shrink-0 snap-start items-center justify-center overflow-hidden bg-green text-blue"
        >
            <motion.div
                style={{ opacity: contentOpacity }}
                className="relative flex h-[90%] w-[90%] flex-col"
            >
                <div className="mb-6 flex items-end justify-between gap-10 border-b border-light/40 pb-4">
                    <h2 className="font-display text-2xl text-light sm:text-3xl md:text-4xl">Showcase</h2>
                    <p className="hidden max-w-sm text-right text-sm text-light/70 sm:block sm:text-base">
                        A selection of recent work — scroll or use the arrow keys to browse, press enter
                        to open.
                    </p>
                </div>

                <div className="relative flex flex-1 flex-col">
                    <SettleGrid scrollProgress={scrollProgress} half={half} />
                    <AnimatePresence initial={false} mode="popLayout">
                        {visible.map((project, i) => {
                            const globalIndex = windowStart + i;
                            const isActive = globalIndex === activeIndex;
                            return (
                                <ShowcaseRow
                                    key={project.link}
                                    project={project}
                                    number={globalIndex + 1}
                                    isActive={isActive}
                                    onMouseMove={() => setActiveIndex(globalIndex)}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.div>
        </section>
    );
}
