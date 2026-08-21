import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIZE = 4;
const BASE_SOLUTION = [
    1, 2, 3, 4,
    3, 4, 1, 2,
    2, 1, 4, 3,
    4, 3, 2, 1,
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function swapRows(grid, r1, r2) {
    const next = [...grid];
    for (let c = 0; c < SIZE; c++) {
        [next[r1 * SIZE + c], next[r2 * SIZE + c]] = [next[r2 * SIZE + c], next[r1 * SIZE + c]];
    }
    return next;
}

function swapCols(grid, c1, c2) {
    const next = [...grid];
    for (let r = 0; r < SIZE; r++) {
        [next[r * SIZE + c1], next[r * SIZE + c2]] = [next[r * SIZE + c2], next[r * SIZE + c1]];
    }
    return next;
}

function generateSolution() {
    const digitMap = shuffle([1, 2, 3, 4]);
    let grid = BASE_SOLUTION.map((n) => digitMap[n - 1]);

    if (Math.random() < 0.5) grid = swapRows(grid, 0, 1);
    if (Math.random() < 0.5) grid = swapRows(grid, 2, 3);
    if (Math.random() < 0.5) {
        grid = swapRows(grid, 0, 2);
        grid = swapRows(grid, 1, 3);
    }
    if (Math.random() < 0.5) grid = swapCols(grid, 0, 1);
    if (Math.random() < 0.5) grid = swapCols(grid, 2, 3);
    if (Math.random() < 0.5) {
        grid = swapCols(grid, 0, 2);
        grid = swapCols(grid, 1, 3);
    }

    return grid;
}

function makePuzzle() {
    const solution = generateSolution();
    const blanks = new Set(shuffle([...Array(16).keys()]).slice(0, 7));
    const puzzle = solution.map((n, i) => (blanks.has(i) ? null : n));
    return {
        solution,
        given: puzzle,
        current: [...puzzle],
    };
}

function hasConflict(grid, index, value) {
    if (!value) return false;
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 2) * 2;

    for (let c = 0; c < SIZE; c++) {
        const i = row * SIZE + c;
        if (i !== index && grid[i] === value) return true;
    }
    for (let r = 0; r < SIZE; r++) {
        const i = r * SIZE + col;
        if (i !== index && grid[i] === value) return true;
    }
    for (let r = boxRow; r < boxRow + 2; r++) {
        for (let c = boxCol; c < boxCol + 2; c++) {
            const i = r * SIZE + c;
            if (i !== index && grid[i] === value) return true;
        }
    }
    return false;
}

export default function Sudoku() {
    const [puzzle, setPuzzle] = useState(() => makePuzzle());

    const conflicts = useMemo(() => {
        const set = new Set();
        puzzle.current.forEach((value, i) => {
            if (hasConflict(puzzle.current, i, value)) set.add(i);
        });
        return set;
    }, [puzzle.current]);

    const isSolved = puzzle.current.every((v) => v !== null) && conflicts.size === 0;

    const cycleCell = (index) => {
        if (puzzle.given[index] !== null) return;
        setPuzzle((prev) => {
            const next = [...prev.current];
            next[index] = next[index] === null ? 1 : next[index] === 4 ? null : next[index] + 1;
            return { ...prev, current: next };
        });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-center">
                <span className="text-xs uppercase tracking-[0.2em] text-blue">
                    A small detour, play my favourite game
                    <br/>
                     mini sudoku
                </span>
            </div>

            <div className="grid grid-cols-4 gap-[2px] border-2 border-dark bg-dark">
                {puzzle.current.map((value, i) => {
                    const isGiven = puzzle.given[i] !== null;
                    const isConflict = conflicts.has(i);
                    const row = Math.floor(i / SIZE);
                    const col = i % SIZE;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => cycleCell(i)}
                            disabled={isGiven}
                            className={`flex h-14 w-14 items-center justify-center bg-light font-display text-xl transition-colors duration-150 sm:h-16 sm:w-16 sm:text-2xl ${
                                isGiven ? "font-bold text-dark" : "text-blue hover:bg-blue/10"
                            } ${isConflict ? "!bg-green/20 !text-green" : ""} ${
                                col === 1 ? "mr-[2px]" : ""
                            } ${row === 1 ? "mb-[2px]" : ""}`}
                        >
                            {value ?? ""}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => setPuzzle(makePuzzle())}
                    className="rounded-none border border-dark/40 px-4 py-2 text-sm font-medium text-dark/70 transition-colors hover:border-dark hover:text-dark"
                >
                    New puzzle
                </button>
                <AnimatePresence>
                    {isSolved && (
                        <motion.span
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="font-display text-lg text-green"
                        >
                            Solved!
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
