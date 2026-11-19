"use client";

import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { NavPill } from "./NavPill";
import { About } from "./About";
import { Skills } from "./Skills";
import { Projects } from "./Projects";
import { Experience } from "./Experience";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { SectionFade } from "./SectionFade";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

/** If the chat ever crashes, hide it instead of breaking the page. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const SECTIONS = ["about", "skills", "projects", "experience", "contact"];

export function Portfolio() {
  const [active, setActive] = useState("about");
  const [chatOpen, setChatOpen] = useState(false);
  const open = useCallback(() => setChatOpen(true), []);
  const close = useCallback(() => setChatOpen(false), []);

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
      <SectionFade />
      <Quiet>
        <ChatWidget isOpen={chatOpen} onOpen={open} onClose={close} mountDelay={1.2} />
      </Quiet>
    </div>
  );
}
