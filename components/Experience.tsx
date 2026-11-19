"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { journey } from "@/lib/content";
import { Counted } from "./CountUp";

/** Timeline whose dashed road connects the markers; an ink line draws itself on scroll-in. */
export function Experience() {
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [road, setRoad] = useState({ d: "", width: 1, height: 1 });

  useEffect(() => {
    const roadmap = roadmapRef.current;
    if (!roadmap) return;
    let dead = false;
    const build = () => {
      if (dead) return;
      const box = roadmap.getBoundingClientRect();
      const pts = Array.from(roadmap.querySelectorAll(".journey-stop-marker")).map((m) => {
        const r = m.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      if (pts.length < 2) return;
      const vertical = matchMedia("(max-width: 1000px)").matches;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if (vertical) {
          const my = (a.y + b.y) / 2;
          d += ` C ${a.x + 28} ${my}, ${b.x - 20} ${my}, ${b.x} ${b.y}`;
        } else {
          const mx = (a.x + b.x) / 2;
          d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
        }
      }
      setRoad({ d, width: box.width, height: box.height });
    };
    const ro = new ResizeObserver(build);
    ro.observe(roadmap);
    roadmap.querySelectorAll(".journey-stop").forEach((s) => ro.observe(s));
    const io = new IntersectionObserver(([e]) => { roadmap.dataset.drawn = String(e.isIntersecting); }, { threshold: 0.2 });
    io.observe(roadmap);
    build();
    document.fonts.ready.then(build);
    return () => { dead = true; ro.disconnect(); io.disconnect(); };
  }, []);

  return (
    <section id="experience" className="experience-section section-pad">
      <div className="wrap">
        <div className="experience-heading">
          <h2>Experience.</h2>
          <p>Current work.<br /> Back to the foundations.</p>
        </div>
        <div ref={roadmapRef} className="journey-roadmap" data-drawn="false">
          <svg className="journey-road" viewBox={`0 0 ${road.width} ${road.height}`} preserveAspectRatio="none" aria-hidden="true">
            <path className="journey-road-base" d={road.d} />
            <path key={road.d} className="journey-road-ink" d={road.d} pathLength={1} />
          </svg>
          {journey.map((j) => (
            <article key={j.id} className={`journey-stop ${j.cls}`} aria-labelledby={`${j.id}-title`}>
              <span className="journey-stop-marker" aria-hidden="true"><span /></span>
              <div className="journey-stop-content">
                <p className="journey-date">
                  {j.pill && <span className="journey-current"><Counted text={j.pill} count={"pillCount" in j ? j.pillCount : undefined} /></span>}
                  {j.date}
                </p>
                <h3 id={`${j.id}-title`}>
                  {j.title.map((t, i) => <Fragment key={t}>{i > 0 && <br />}{t}</Fragment>)}
                </h3>
                <p className="journey-place">{j.place}<span>{j.sub}</span></p>
                <p className="journey-description">
                  {j.description.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
