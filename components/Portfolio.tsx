"use client";

import { useEffect, useState } from "react";
import { NavPill } from "./NavPill";
import { About } from "./About";
import { Skills } from "./Skills";
import { Projects } from "./Projects";
import { Experience } from "./Experience";
import { Contact } from "./Contact";
import { Footer } from "./Footer";

const SECTIONS = ["about", "skills", "projects", "experience", "contact"];

export function Portfolio() {
  const [active, setActive] = useState("about");

  // which section is in the upper part of the viewport (drives aria-current in the menu)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <div className="portfolio">
      <a className="skip-link" href="#main">Skip to content</a>
      <NavPill activeTab={active} />
      <main id="main">
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
