import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
    { label: "Showcase", index: 1 },
    { label: "Blog", index: 2 },
    { label: "About", index: 3 },
];

const GRID_COLUMNS = 6;
const GRID_ROWS = 14;
const FLIP_COLORS = ["var(--color-blue)", "var(--color-lilac)", "var(--color-green)"];
const FLIP_RATIO = 0.18;

// Deterministic hash so the flip pattern is stable across renders without using Math.random.
function seededFraction(i, salt) {
    const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

const FLIP_CELLS = (() => {
    const total = GRID_COLUMNS * GRID_ROWS;
    const cells = new Map();
    for (let i = 0; i < total; i++) {
        if (seededFraction(i, 1) < FLIP_RATIO) {
            cells.set(i, {
                color: FLIP_COLORS[Math.floor(seededFraction(i, 2) * FLIP_COLORS.length)],
                delay: seededFraction(i, 3) * 4,
                repeatDelay: 1.5 + seededFraction(i, 4) * 3,
            });
        }
    }
    return cells;
})();

function FlipTile({ flip }) {
    if (!flip) return <div className="relative border border-dark/10" />;

    return (
        <div className="relative border border-dark/10" style={{ perspective: 600 }}>
            <motion.div
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: [0, 0, 180, 180, 0] }}
                transition={{
                    duration: 5.5,
                    times: [0, 0.15, 0.5, 0.85, 1],
                    repeat: Infinity,
                    repeatDelay: flip.repeatDelay,
                    delay: flip.delay,
                    ease: "easeInOut",
                }}
            >
                <div className="absolute inset-0 bg-light" style={{ backfaceVisibility: "hidden" }} />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: flip.color,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                />
            </motion.div>
        </div>
    );
}

function SidebarGrid() {
    const cells = Array.from({ length: GRID_COLUMNS * GRID_ROWS });

    return (
        <div
            className="absolute inset-0 z-0 grid"
            style={{
                gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
        >
            {cells.map((_, i) => (
                <FlipTile key={i} flip={FLIP_CELLS.get(i)} />
            ))}
        </div>
    );
}

const BUTTON_CLASS =
    "shrink-0 rounded-none border-3 border-blue bg-transparent px-8 py-4 text-sm font-medium tracking-wide text-blue transition-colors duration-300 ease-out hover:bg-green hover:text-light";

export default function Nav({ page = 0, onNavigate }) {
    const [open, setOpen] = useState(false);

    const handleNavigate = (index) => {
        onNavigate?.(index);
        setOpen(false);
    };

    return (
        <>
            <nav className="flex shrink-0 items-center justify-between border-b p-4 m-4">
                <button
                    type="button"
                    onClick={() => handleNavigate(0)}
                    className="font-display text-base tracking-wide text-dark transition-colors hover:text-blue sm:text-lg"
                >
                    The Shaelle
                </button>

                <motion.button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={BUTTON_CLASS}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    Menu
                </motion.button>
            </nav>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 z-40 bg-dark/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />
                        <motion.aside
                            key="sidebar"
                            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col overflow-hidden bg-light p-8 text-dark sm:w-80"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 32 }}
                        >
                            <SidebarGrid />

                            <div className="relative z-10 flex items-center justify-between">
                                <span className="font-display text-lg">The Shaelle</span>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close menu"
                                    className="text-2xl leading-none text-dark/60 transition-colors hover:text-dark"
                                >
                                    &times;
                                </button>
                            </div>

                            <ul className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12">
                                {LINKS.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            type="button"
                                            onClick={() => handleNavigate(link.index)}
                                            className={`font-display text-lg tracking-wide transition-colors ${
                                                page === link.index ? "text-blue" : "text-dark hover:text-blue"
                                            }`}
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
