import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";

const VISIBLE_ROWS = 4;

const PROJECTS = [
    {
        tech: ["React", "Node", "PostgreSQL"],
        name: "Commerce Redesign",
        title: "Rebuilding checkout for scale",
        description: "Cut cart abandonment by streamlining a five-step checkout into one page.",
        link: "#commerce-redesign",
    },
    {
        tech: ["Next.js", "Sanity", "Vercel"],
        name: "Portfolio CMS",
        title: "A headless CMS for design portfolios",
        description: "Gave independent designers a fast, editable site without touching code.",
        link: "#portfolio-cms",
    },
    {
        tech: ["D3", "WebSockets", "Go"],
        name: "Realtime Dashboard",
        title: "Live metrics for operations teams",
        description: "Streamed live infrastructure metrics into a dashboard built for on-call engineers.",
        link: "#realtime-dashboard",
    },
    {
        tech: ["Swift", "Figma", "Plaid"],
        name: "Mobile Banking UI",
        title: "Rethinking everyday banking",
        description: "Designed a mobile banking flow that made balances and transfers feel instant.",
        link: "#mobile-banking-ui",
    },
    {
        tech: ["Rust", "gRPC", "Kubernetes"],
        name: "API Gateway",
        title: "A gateway built for scale",
        description: "Replaced a monolith's routing layer with a low-latency gateway across services.",
        link: "#api-gateway",
    },
    {
        tech: ["Figma", "Storybook", "Tailwind"],
        name: "Design System",
        title: "One system, every product",
        description: "Unified components and tokens across four product teams into a single library.",
        link: "#design-system",
    },
    {
        tech: ["React Native", "Stripe", "Firebase"],
        name: "Booking Platform",
        title: "Scheduling without the back-and-forth",
        description: "Built a booking flow that handled availability, payments, and reminders end to end.",
        link: "#booking-platform",
    },
    {
        tech: ["Python", "Airflow", "BigQuery"],
        name: "Analytics Suite",
        title: "Turning raw events into answers",
        description: "Piped product events through a pipeline that powered weekly growth reviews.",
        link: "#analytics-suite",
    },
];

const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

function ShowcaseRow({ project, isActive, scrollProgress, positionInView, onMouseMove }) {
    const fallDistance = 260 + positionInView * 50;
    const startRotate = positionInView % 2 === 0 ? -4 : 4;
    const rawY = useTransform(scrollProgress, [0, 1], [-fallDistance, 0]);
    const rawRotate = useTransform(scrollProgress, [0, 1], [startRotate, 0]);
    const y = useSpring(rawY, { stiffness: 260, damping: 18, mass: 0.8 });
    const rotate = useSpring(rawRotate, { stiffness: 260, damping: 18, mass: 0.8 });

    return (
        <motion.a
            href={project.link}
            layout
            variants={rowVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ y, rotate }}
            onMouseMove={onMouseMove}
            className={`flex flex-col gap-3 border-b border-light/20 py-6 transition-colors duration-300 ${
                isActive ? "text-light" : "text-blue"
            }`}
        >
            <div className="grid grid-cols-[1fr_2fr] items-stretch gap-6">
                <span className="border-r border-light/40 pr-6 text-xs uppercase tracking-[0.2em]">
                    {project.tech.join(" · ")}
                </span>
                <span className="font-display text-right text-2xl sm:text-3xl">{project.name}</span>
            </div>
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
        </motion.a>
    );
}

export default function Projects({ scrollProgress }) {
    const contentOpacity = useTransform(scrollProgress, [0, 1], [0, 1]);

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
                if (project) window.location.href = project.link;
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
                <div className="mb-10 flex items-end justify-between gap-10 border-b border-light/40 pb-6">
                    <h2 className="font-display text-2xl text-light sm:text-3xl md:text-4xl">Showcase</h2>
                    <p className="max-w-sm text-right text-sm text-light/70 sm:text-base">
                        A selection of recent work — scroll or use the arrow keys to browse, press enter
                        to open.
                    </p>
                </div>

                <div className="flex flex-1 flex-col">
                    <AnimatePresence initial={false} mode="popLayout">
                        {visible.map((project, i) => {
                            const globalIndex = windowStart + i;
                            const isActive = globalIndex === activeIndex;
                            return (
                                <ShowcaseRow
                                    key={project.name}
                                    project={project}
                                    isActive={isActive}
                                    scrollProgress={scrollProgress}
                                    positionInView={i}
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
