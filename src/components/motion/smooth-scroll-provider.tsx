"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling, with reduced-motion treated as a hard constraint.
 *
 * When the visitor prefers reduced motion, Lenis is never constructed at all —
 * we fall back to the browser's native scrolling rather than running a
 * softened version of the animation. The preference is watched live, so
 * toggling it at the OS level takes effect without a reload.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let frame = 0;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        // Long, unhurried glide — the calm the design direction asks for.
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Never hijack horizontal or touch scrolling.
        smoothWheel: true,
        touchMultiplier: 1.6,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
    };

    const sync = () => (query.matches ? stop() : start());

    sync();
    query.addEventListener("change", sync);

    return () => {
      query.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <>{children}</>;
}
