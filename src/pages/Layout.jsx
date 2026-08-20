import { useEffect, useRef, useState } from "react"
import { useScroll } from "framer-motion"
import Hero from "../components/Hero"
import Nav from "../components/Nav"
import Projects from "../components/Projects"

const PAGE_COUNT = 2

export default function Layout(){
    const trackRef = useRef(null)
    const { scrollXProgress } = useScroll({ container: trackRef })
    const [page, setPage] = useState(0)

    useEffect(() => {
        const unsubscribe = scrollXProgress.on("change", (v) => {
            setPage(Math.round(v * (PAGE_COUNT - 1)))
        })
        return unsubscribe
    }, [scrollXProgress])

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        const handleWheel = (e) => {
            if (e.deltaY === 0) return
            e.preventDefault()
            track.scrollLeft += e.deltaY
        }

        track.addEventListener("wheel", handleWheel, { passive: false })
        return () => track.removeEventListener("wheel", handleWheel)
    }, [])

    const goToPage = (index) => {
        const track = trackRef.current
        if (!track) return
        track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" })
    }

    const isDark = page === 1

    return(
        <div className="flex h-screen flex-col overflow-hidden">
            <Nav/>
            <div className="relative flex-1 overflow-hidden">
                <div
                    ref={trackRef}
                    className="no-scrollbar flex h-full overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory"
                >
                    <Hero scrollProgress={scrollXProgress}/>
                    <Projects scrollProgress={scrollXProgress}/>
                </div>

                <div
                    className={`pointer-events-none absolute bottom-6 right-6 z-20 flex gap-3 rounded-full px-3 py-2 transition-colors duration-500 ${
                        isDark ? "bg-light/10" : "bg-dark/5"
                    }`}
                >
                    {Array.from({ length: PAGE_COUNT }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Go to section ${i + 1}`}
                            onClick={() => goToPage(i)}
                            className={`pointer-events-auto h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                                page === i
                                    ? isDark
                                        ? "bg-light"
                                        : "bg-green"
                                    : isDark
                                      ? "bg-light/30 hover:bg-light/50"
                                      : "bg-dark/20 hover:bg-dark/40"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
