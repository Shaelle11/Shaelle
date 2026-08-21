import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sudoku from "./Sudoku";
import Skills from "./Skills";
import Contact from "./Contact";
import Footer from "./Footer";
import powerpuffMe from "../assets/Powerpuff me.jpg";

const GUTTER_COLUMNS = 12;
const GUTTER_ROWS = 20;

const PALETTE = [
    { name: "Evergreen", value: "var(--color-green)" },
    { name: "Blue", value: "var(--color-blue)" },
    { name: "Lilac", value: "var(--color-lilac)" },
    { name: "Dark", value: "var(--color-dark)" },
];

function ColorPalette({ activeColor, onPick }) {
    return (
        <div className="flex items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-[0.2em] text-dark/50">
                Color the grid
            </span>
            {PALETTE.map((c) => (
                <button
                    key={c.name}
                    type="button"
                    aria-label={c.name}
                    onClick={() => onPick(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        activeColor === c.value
                            ? "scale-110 border-dark"
                            : "border-transparent hover:scale-105"
                    }`}
                />
            ))}
            <button
                type="button"
                aria-label="Eraser"
                onClick={() => onPick(null)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-light text-xs text-dark/50 transition-transform ${
                    activeColor === null ? "scale-110 border-dark" : "border-dark/30 hover:scale-105"
                }`}
            >
                &times;
            </button>
        </div>
    );
}

function GutterGrid({ hovered, colors, onCellClick }) {
    const cells = Array.from({ length: GUTTER_COLUMNS * GUTTER_ROWS });
    return (
        <div
            className="absolute inset-0 z-0 grid"
            style={{
                gridTemplateColumns: `repeat(${GUTTER_COLUMNS}, 1fr)`,
                gridTemplateRows: `repeat(${GUTTER_ROWS}, 1fr)`,
            }}
        >
            {cells.map((_, i) => {
                const col = i % GUTTER_COLUMNS;
                const row = Math.floor(i / GUTTER_COLUMNS);
                const fill = colors[i];
                return (
                    <motion.button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={() => onCellClick(i)}
                        className="cursor-pointer border-b border-r border-dark/15"
                        style={{ backgroundColor: fill || "transparent" }}
                        initial={false}
                        animate={
                            fill
                                ? { opacity: 1, y: 0 }
                                : hovered
                                  ? { opacity: 1, y: [0, -5, 0, 5, 0] }
                                  : { opacity: 0, y: 0 }
                        }
                        transition={
                            !fill && hovered
                                ? {
                                      opacity: { duration: 0.5 },
                                      y: {
                                          duration: 3 + ((row + col) % 4) * 0.4,
                                          repeat: Infinity,
                                          ease: "easeInOut",
                                          delay: (row + col) * 0.05,
                                      },
                                  }
                                : { duration: 0.4 }
                        }
                    />
                );
            })}
        </div>
    );
}

export default function About() {
    const scrollRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [colors, setColors] = useState({});
    const [activeColor, setActiveColor] = useState(PALETTE[0].value);

    const handleCellClick = (i) => {
        setColors((prev) => {
            const next = { ...prev };
            if (!activeColor || next[i] === activeColor) {
                delete next[i];
            } else {
                next[i] = activeColor;
            }
            return next;
        });
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            const atTop = el.scrollTop <= 0;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            if (e.deltaY > 0 && !atBottom) {
                e.stopPropagation();
            } else if (e.deltaY < 0 && !atTop) {
                e.stopPropagation();
            }
        };

        el.addEventListener("wheel", handleWheel, { passive: true });
        return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <section className="relative flex h-full w-screen shrink-0 snap-start items-center justify-center overflow-hidden bg-light text-dark">
            <div
                ref={scrollRef}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="no-scrollbar relative h-[90%] w-[90%] overflow-y-auto"
            >
                <div className="relative">
                    <GutterGrid hovered={hovered} colors={colors} onCellClick={handleCellClick} />

                    <div className="pointer-events-none relative z-10 flex flex-col gap-16 py-4">
                        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dark/20 pb-4">
                            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl">About</h2>
                            <div className="pointer-events-auto">
                                <ColorPalette activeColor={activeColor} onPick={setActiveColor} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-20">
                            <div className="pointer-events-auto flex flex-col gap-6">
                                <p className="text-base leading-relaxed text-dark/80 md:text-lg">
                                    Building Solutions and products at the intersection of engineering and
                                    design, patient with the details, accessibility at the forefront, and drawn to
                                    real constraints.
                                </p>
                                <img
                                    src={powerpuffMe}
                                    alt="A stylized Powerpuff-style illustration of me at my desk"
                                    className="aspect-square max-w-[280px] border border-dark/15 object-cover sm:max-w-xs"
                                />
                            </div>

                            <div className="pointer-events-auto">
                                <Sudoku />
                            </div>
                        </div>

                        <Skills />
                        <Contact />
                        <Footer />
                    </div>
                </div>
            </div>
        </section>
    );
}
