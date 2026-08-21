import { useEffect, useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { useClampedTransform, getSectionWindow } from "../lib/scrollTransform";
import ARTICLES from "../data/articles.json";

const PAGE_INDEX = 2;

function ArticleTile({ article, index, scrollProgress, windowStart, windowEnd, settleEnd }) {
    const windowWidth = windowEnd - windowStart;
    const enterStart = windowStart + windowWidth * 0.55 + (index % 3) * 0.03 * windowWidth;
    const y = useTransform(scrollProgress, [enterStart, settleEnd], [26, 0]);
    const opacity = useClampedTransform(scrollProgress, [enterStart, settleEnd], [0.55, 1]);
    const scale = useTransform(scrollProgress, [enterStart, settleEnd], [0.96, 1]);

    return (
        <motion.a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ y, opacity, scale }}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={`group relative flex h-[60vh] w-full shrink-0 snap-center flex-col justify-between overflow-hidden bg-light p-6 text-dark shadow-lg sm:h-auto sm:w-auto sm:shrink ${article.span}`}
        >
            <span className="text-xs uppercase tracking-[0.2em] text-blue">{article.tag}</span>
            <div className="flex flex-col gap-3">
                <h3 className={`line-clamp-4 px-2 py-1 font-display leading-relaxed ${article.text}`}>
                    {article.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-dark/70 transition-colors group-hover:text-green">
                    Read article <span aria-hidden="true">&rarr;</span>
                </span>
            </div>
        </motion.a>
    );
}

export default function Articles({ scrollProgress, pageCount = 3 }) {
    const { start: windowStart, end: windowEnd, settleEnd } = getSectionWindow(PAGE_INDEX, pageCount);
    const headerOpacity = useClampedTransform(scrollProgress, [windowStart, settleEnd], [0, 1]);
    const scrollRef = useRef(null);

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
        <section className="relative flex h-full w-screen shrink-0 snap-start items-center justify-center overflow-hidden bg-green">
            <motion.div style={{ opacity: headerOpacity }} className="relative flex h-[90%] w-[90%] flex-col">
                <div className="mb-6 flex items-end justify-between gap-10 border-b border-light/40 pb-4">
                    <h2 className="font-display text-2xl text-light sm:text-3xl md:text-4xl">Articles</h2>
                    <p className="hidden max-w-sm text-right text-sm text-light/70 sm:block sm:text-base">
                        Writing on process, product, and the occasional opinion.
                    </p>
                </div>

                <div
                    ref={scrollRef}
                    className="no-scrollbar flex flex-1 flex-col justify-center overflow-y-auto overflow-x-visible sm:justify-start"
                >
                    <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto py-2 sm:grid sm:auto-rows-[minmax(175px,1fr)] sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-2">
                        {ARTICLES.map((article, i) => (
                            <ArticleTile
                                key={article.link}
                                article={article}
                                index={i}
                                scrollProgress={scrollProgress}
                                windowStart={windowStart}
                                windowEnd={windowEnd}
                                settleEnd={settleEnd}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
