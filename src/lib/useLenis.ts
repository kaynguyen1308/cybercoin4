import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Global smooth-scrolling engine. Lenis owns the page scroll and drives
// ScrollTrigger so pinned/scrubbed animations stay perfectly in sync with
// the inertial wheel/touch movement. Configured for a heavy, premium feel
// (Apple / Porsche style): momentum and inertia without sluggishness.
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time);
    };

    // Drive Lenis from GSAP's ticker so ScrollTrigger and Lenis share one
    // rAF loop — no double rAF, no drift.
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}
