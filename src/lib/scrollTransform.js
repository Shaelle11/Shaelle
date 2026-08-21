import { useTransform } from "framer-motion";

// framer-motion 13's array-shorthand useTransform(value, input, output) fails to keep the
// DOM in sync once `value` moves outside `input` and the output needs to clamp (observed for
// opacity specifically). The function-callback form doesn't have this issue, so this wraps a
// clamped linear map through that form instead.
export function useClampedTransform(motionValue, [inStart, inEnd], [outStart, outEnd]) {
    return useTransform(() => {
        const value = motionValue.get();
        const t = Math.min(Math.max((value - inStart) / (inEnd - inStart), 0), 1);
        return outStart + t * (outEnd - outStart);
    });
}

// Each section occupies an equal 1/(pageCount-1) slice of the overall scroll progress.
// A section at `pageIndex` transitions in while scrolling from the previous page to this
// one — i.e. across [(pageIndex-1)*half, pageIndex*half] — regardless of how many pages
// come after it. `settleFraction` pulls the "fully settled" point in a bit early so minor
// scroll/snap rounding doesn't leave the animation stuck short of its end state.
export function getSectionWindow(pageIndex, pageCount, settleFraction = 0.9) {
    const half = 1 / (pageCount - 1);
    const start = Math.max(0, (pageIndex - 1) * half);
    const end = pageIndex * half;
    const settleEnd = start + (end - start) * settleFraction;
    return { half, start, end, settleEnd };
}
