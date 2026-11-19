"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type Count = { match: string; from: number; decimals: number; duration?: number };

/**
 * Animates a number from `from` to the value in `match` the first time it scrolls into view.
 * Server/no-JS/reduced-motion users just see the final value.
 */
export function CountUp({ count }: { count: Count }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = parseFloat(count.match);
    const format = (v: number) => v.toFixed(count.decimals);
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const state = { v: count.from };
      el.textContent = format(count.from);
      tween = gsap.to(state, {
        v: to,
        duration: count.duration ?? 1.6,
        ease: "power3.out",
        onUpdate: () => { el.textContent = format(state.v); },
        onComplete: () => { el.textContent = count.match; },
      });
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); tween?.kill(); el.textContent = count.match; };
  }, [count]);

  return (
    <span className="count-up">
      <span className="sr-only">{count.match}</span>
      <span ref={ref} aria-hidden="true">{count.match}</span>
    </span>
  );
}

/** Renders `text`, replacing the first occurrence of count.match with an animated counter. */
export function Counted({ text, count }: { text: string; count?: Count }) {
  if (!count) return <>{text}</>;
  const i = text.indexOf(count.match);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <CountUp count={count} />
      {text.slice(i + count.match.length)}
    </>
  );
}
