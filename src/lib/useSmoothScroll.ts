import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Single global Lenis instance — created once, shared across the app.
let lenisInstance: Lenis | null = null;

/**
 * Global smooth-scroll engine.
 *
 * Lenis is used ONLY for light wheel interpolation — a subtle iOS-style settle
 * when scrolling stops. It is intentionally NOT a heavy inertia layer: duration
 * is short and the easing snaps in quickly so wheel input feels immediate.
 *
 * Integration: Lenis drives the real scroll position (no transform wrapper, so
 * position:sticky keeps working), and we pipe its scroll event into
 * ScrollTrigger.update so GSAP stays in sync. Lenis's own rAF is driven by the
 * gsap ticker to keep a single clock for all motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (lenisInstance) return;

    const lenis = new Lenis({
      duration: 0.85,
      // easeOutCubic — settles fast, leaves only a hint of glide
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true,
    });
    lenisInstance = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
