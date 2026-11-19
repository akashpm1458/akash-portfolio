"use client";

import { useEffect } from "react";

/** Sections below the fold fade in (opacity only) the first time they scroll into view. */
export function SectionFade() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".portfolio");
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(
      ".bio-introduction, .bio-description, #skills, #projects, #experience, #contact, .footer-top",
    ));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<HTMLElement>();
    const running = new Map<HTMLElement, Animation>();
    let io: IntersectionObserver | null = null;
    let dead = false;

    const setup = () => {
      io?.disconnect();
      running.forEach((a) => a.cancel());
      running.clear();
      targets.forEach((t) => t.style.removeProperty("opacity"));
      root.dataset.textMotion = reduce.matches ? "static" : "section-fade";
      if (reduce.matches) return;
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (!e.isIntersecting || seen.has(el)) return;
          seen.add(el);
          io?.unobserve(el);
          if (el.contains(document.activeElement)) { el.style.removeProperty("opacity"); el.dataset.textReveal = "done"; return; }
          el.dataset.textReveal = "playing";
          const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1400, easing: "cubic-bezier(.33,0,.2,1)", fill: "both" });
          running.set(el, anim);
          anim.onfinish = () => {
            running.delete(el);
            el.style.removeProperty("opacity");
            if (!dead) el.dataset.textReveal = "done";
            anim.cancel();
          };
        });
      }, { threshold: 0, rootMargin: "0px 0px 48px 0px" });
      targets.forEach((el) => {
        if (seen.has(el)) return;
        if (el.getBoundingClientRect().top < innerHeight) { seen.add(el); el.dataset.textReveal = "done"; return; }
        el.style.opacity = "0";
        io!.observe(el);
      });
    };
    // keyboard users never land on invisible content
    const onFocusIn = (e: FocusEvent) => {
      running.forEach((a, el) => { if (e.target instanceof Node && el.contains(e.target)) a.finish(); });
      targets.forEach((el) => {
        if (e.target instanceof Node && el.contains(e.target)) { el.style.removeProperty("opacity"); seen.add(el); io?.unobserve(el); }
      });
    };
    setup();
    reduce.addEventListener("change", setup);
    root.addEventListener("focusin", onFocusIn);
    return () => {
      dead = true;
      io?.disconnect();
      running.forEach((a) => a.cancel());
      reduce.removeEventListener("change", setup);
      root.removeEventListener("focusin", onFocusIn);
      targets.forEach((t) => { t.style.removeProperty("opacity"); delete t.dataset.textReveal; });
      delete root.dataset.textMotion;
    };
  }, []);
  return null;
}
